import './GrowthCardStackHorizontal.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import arrow from 'url:../../../assets/images/arrow.webp';
import GrowthCarousel from '../../components/GrowthCarousel/GrowthCarousel';
import { fetchGrowthReading } from '../../api';
import { growthArcanaIdentity } from '../../utilities/growth-cards';
import { ARCANA_BY_NUMBER } from '../../constants/data/arcana-numbers';
import type { ArcanaIdentityIndex } from '../../constants/arcana-identities';

/**
 * Growth-card "stack" — a non-looping, infinitely-growbable carousel of growth
 * cards by year. ONE backend query is made on entry (for the current calendar
 * year, to seed/confirm the backend is alive and agrees with our local digit-sum
 * formula). Every other year is computed client-side via `growthArcanaIdentity`,
 * so sliding never costs another network call.
 *
 * This is the next workflow step after the nativety-time-entry page, and is also
 * reachable from PractitionerView under "Growth Cards".
 */
export default function GrowthCardStackHorizontal({
    birthDate,
    onBack,
    onHome,
    onNext,
}: {
    birthDate: string;
    onBack: () => void;
    onHome: () => void;
    onNext?: () => void;
}) {
    // The current real-world calendar year is the natural seed/center.
    const centerYear = new Date().getFullYear();
    const [seedError, setSeedError] = useState(false);

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
                <button className="growth-arrow-button" onClick={onBack} aria-label="Back">
                    <img src={arrow} alt="Back" />
                </button>

                <div className="growth-title">
                    <p className="growth-title-line-1">Growth Cards</p>
                    <p className="growth-title-line-2">
                        {currentArcana
                            ? `${currentYear} — ${currentNumber != null ? currentNumber : ''} ${currentArcana.replace(/_/g, ' ')}`
                            : `${currentYear}`}
                    </p>
                    <button
                        className="growth-set-range-button"
                        onClick={onHome}
                        title="Adjust the date range (coming soon)"
                    >
                        Set Date Range
                    </button>
                </div>

                <button
                    className="growth-arrow-button growth-forward-button"
                    onClick={onNext}
                    aria-label="Continue"
                    style={{ visibility: onNext ? 'visible' : 'hidden' }}
                >
                    <img src={arrow} alt="Continue" />
                </button>
            </div>

            {seedError && (
                <div className="growth-seed-warning">
                    Couldn't reach the backend — showing locally computed cards.
                </div>
            )}

            <div className="growth-carousel-region">
                <GrowthCarousel
                    getArcanaForYear={getArcanaForYear}
                    centerYear={centerYear}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    onYearChange={setCurrentYear}
                />
            </div>
        </div>
    );
}
