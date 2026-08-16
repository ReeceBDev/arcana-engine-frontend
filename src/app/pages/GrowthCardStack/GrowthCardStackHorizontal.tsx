import './GrowthCardStackHorizontal.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import arrow from 'url:../../../assets/images/arrow.webp';
import GrowthCarousel, { type GrowthCarouselHandle } from '../../components/GrowthCarousel/GrowthCarousel';
import { fetchGrowthReading } from '../../api';
import { growthArcanaIdentity } from '../../utilities/growth-cards';
import { ARCANA_BY_NUMBER } from '../../constants/data/arcana-numbers';
import type { ArcanaIdentityIndex } from '../../constants/arcana-identities';

/** Hard cap on how far into the future growth cards are shown (years after birth). */
const MAX_LIFESPAN = 125;

/**
 * Growth-card "stack" — a non-looping, infinitely-growbable carousel of growth
 * cards by year. ONE backend query is made on entry (for the current calendar
 * year, to seed/confirm the backend is alive and agrees with our local digit-sum
 * formula). Every other year is computed client-side via `growthArcanaIdentity`,
 * so sliding never costs another network call.
 *
 * The top-bar arrows step the centered year (−1 / +1, clamped to the life
 * range); the "Home" pill exits to the main menu. Also reachable from
 * PractitionerView under "Growth Cards".
 */
export default function GrowthCardStackHorizontal({
    birthDate,
    onHome,
    onBackToPractitioner,
}: {
    birthDate: string;
    onHome: () => void;
    onBackToPractitioner: () => void;
}) {
    // The current real-world calendar year is the natural seed/center.
    const centerYear = new Date().getFullYear();
    const [seedError, setSeedError] = useState(false);

    // Clamp scrollable years to a plausible life span: birth year (year 0 of
    // life) through birth year + MAX_LIFESPAN.
    const birthYear = useMemo(() => {
        if (!birthDate) return null;
        const y = Number(birthDate.split('-')[0]);
        return Number.isFinite(y) ? y : null;
    }, [birthDate]);
    const minYear = birthYear ?? undefined;
    const maxYear = birthYear != null ? birthYear + MAX_LIFESPAN : undefined;

    // ONE seed query: confirm backend + that our local formula matches it.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const reading = await fetchGrowthReading(birthDate, centerYear, 0, 0);
                if (cancelled) return;
                const seed = reading.cards.find((c) => c.year === centerYear)?.card;
                const local = growthArcanaIdentity(birthDate, centerYear);
                if (seed?.card && local && seed.card !== local) {
                    console.warn(
                        `[GrowthCardStack] Seed mismatch for ${centerYear}: backend=${seed.card}, local=${local}. Falling back to backend value.`,
                    );
                }
                setSeedError(false);
            } catch (e) {
                console.error('[GrowthCardStack] Seed growth query failed; continuing with local formula.', e);
                if (!cancelled) setSeedError(true);
            }
        })();
        return () => { cancelled = true; };
    }, [birthDate, centerYear]);

    // Pure client-side year → arcana. Drives every spawned carousel card.
    const getArcanaForYear = useCallback((year: number) => {
        return growthArcanaIdentity(birthDate, year);
    }, [birthDate]);

    const [currentYear, setCurrentYear] = useState(centerYear);
    const carouselRef = useRef<GrowthCarouselHandle>(null);

    // Tap target for the arrow buttons. Kept in a ref (synced from onYearChange)
    // because `currentYear` state only settles when the scroll tween completes —
    // reading it mid-animation would re-target a stale year and swallow rapid taps.
    const targetYearRef = useRef(centerYear);

    /** Animate the carousel to `year` (clamped to the life range), tracking it as
     *  the new tap target so consecutive arrow taps accumulate correctly. */
    const animateToYear = useCallback((year: number) => {
        let y = year;
        if (minYear != null && y < minYear) y = minYear;
        if (maxYear != null && y > maxYear) y = maxYear;
        targetYearRef.current = y;
        carouselRef.current?.scrollToYear(y);
    }, [minYear, maxYear]);

    /** Step the centered year by `delta` (±1 from the top-bar arrows). */
    const stepYear = useCallback((delta: number) => {
        animateToYear(targetYearRef.current + delta);
    }, [animateToYear]);

    // Year-change sink for drags/inertia/snap-backs: re-syncs the tap target so
    // arrows always step from wherever the carousel actually is.
    const handleYearChange = useCallback((year: number) => {
        targetYearRef.current = year;
        setCurrentYear(year);
    }, []);

    // Sizing — scale with viewport height (per repo vh convention).
    const cardHeight = useMemo(() => Math.min(window.innerHeight * 0.6, 520), []);
    const cardWidth = useMemo(() => Math.round(cardHeight / 1.5), [cardHeight]);

    // Pretty label for the currently-centered card.
    const currentArcana = growthArcanaIdentity(birthDate, currentYear);
    const currentNumber = useMemo(() => {
        if (!currentArcana) return null;
        const entry = Object.entries(ARCANA_BY_NUMBER).find(([, name]) => name === currentArcana);
        return entry ? (Number(entry[0]) as ArcanaIdentityIndex) : null;
    }, [currentArcana]);

    return (
        <div className="growth-card-stack-horizontal">
            <CardSequenceBackground objectPosition="center" />

            <div className="growth-top-bar">
                <button className="growth-arrow-button growth-back-button" onClick={() => stepYear(-1)} aria-label="Previous year">
                    <img src={arrow} alt="Previous year" />
                </button>

                <div className="growth-title">
                    <p className="growth-title-line-1">Growth Cards</p>
                    <p className="growth-title-line-2">
                        {currentArcana
                            ? `${currentYear} — ${currentNumber != null ? currentNumber : ''} ${currentArcana.replace(/_/g, ' ')}`
                            : `${currentYear}`}
                    </p>
                    <div className="growth-title-buttons">
                        <div className="growth-title-buttons-row">
                            <button className="growth-home-button" onClick={onHome}>
                                Home
                            </button>
                            <button className="growth-home-button" onClick={onBackToPractitioner}>
                                Back to Practitioner View
                            </button>
                        </div>
                        <button
                            className="growth-set-range-button"
                            onClick={() => animateToYear(centerYear)}
                            disabled={currentYear === centerYear}
                            title={currentYear === centerYear ? 'Already on this year' : 'Snap back to this year'}
                        >
                            Back to this Year
                        </button>
                    </div>
                </div>

                <button
                    className="growth-arrow-button growth-forward-button"
                    onClick={() => stepYear(1)}
                    aria-label="Next year"
                >
                    <img src={arrow} alt="Next year" />
                </button>
            </div>

            {seedError && (
                <div className="growth-seed-warning">
                    Couldn't reach the backend — showing locally computed cards. - SO WHAT BRO? This doesn't even matter, ALL cards should be computed locally!!
                </div>
            )}

            <div className="growth-carousel-region">
                <GrowthCarousel
                    ref={carouselRef}
                    getArcanaForYear={getArcanaForYear}
                    centerYear={centerYear}
                    minYear={minYear}
                    maxYear={maxYear}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    onYearChange={handleYearChange}
                />
            </div>
        </div>
    );
}
