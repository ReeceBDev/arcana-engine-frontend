import './GrowthCardStackVertical.css';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import arrow from 'url:../../../assets/images/arrow.webp';
import CardFace from '../../components/ArcanaCard/CardFace';
import { ArcanaIdentities } from '../../constants/arcana-identities';
import { fetchGrowthReading } from '../../api';
import { growthArcanaIdentity } from '../../utilities/growth-cards';
import { ARCANA_BY_NUMBER } from '../../constants/data/arcana-numbers';
import type { ArcanaIdentityIndex } from '../../constants/arcana-identities';

/** Hard cap on how far into the future growth cards are shown (years after birth). */
const MAX_LIFESPAN = 125;

/** Drag distance (px) before a swipe registers as a one-year step. */
const SWIPE_THRESHOLD = 50;

/**
 * Portrait counterpart of GrowthCardStackHorizontal.
 *
 * Shares the same SHELL as the horizontal page (seed backend query, client-side
 * year → arcana math, live title + current year, year-stepping arrows /
 * Home / Back-to-this-Year top bar, seed warning) but swaps the fling+inertia
 * carousel for a
 * discrete swipe-and-snap interaction modelled on PractitionerViewVertical:
 * drag past a threshold → step EXACTLY one year → GSAP pop to settle.
 *
 * Crucially, only a TINY window of years is ever in the DOM — the centered
 * (current) card plus at most one peeking neighbor on each side (3 slots total,
 * reserved for layout stability). It never builds the ~125-card track that the
 * horizontal page's infinite-grow carousel does.
 */
export default function GrowthCardStackVertical({
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

    const [currentYear, setCurrentYear] = useState(centerYear);

    // Sizing — scale with viewport WIDTH (portrait is width-constrained; per
    // repo convention vertical variants size off the short axis so peeking
    // neighbours have room alongside the centered card).
    const cardWidth = useMemo(() => Math.min(window.innerWidth * 0.58, 300), []);
    const cardHeight = useMemo(() => Math.round(cardWidth * 1.5), [cardWidth]);

    /** Step to `year`, clamped to the allowed life range [minYear, maxYear]. */
    const goToYear = useCallback((year: number) => {
        let y = year;
        if (minYear != null && y < minYear) y = minYear;
        if (maxYear != null && y > maxYear) y = maxYear;
        setCurrentYear(y);
    }, [minYear, maxYear]);

    /** Step the centered year by `delta` (±1 from the top-bar arrows). Functional
     *  setState so rapid taps accumulate before React re-renders. */
    const stepYear = useCallback((delta: number) => {
        setCurrentYear((y) => {
            let next = y + delta;
            if (minYear != null && next < minYear) next = minYear;
            if (maxYear != null && next > maxYear) next = maxYear;
            return next;
        });
    }, [minYear, maxYear]);

    // --- Swipe handling (no inertia: a single discrete step per gesture). ---
    const dragStartX = useRef(0);
    const isDragging = useRef(false);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        dragStartX.current = e.clientX;
        isDragging.current = true;
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const dx = e.clientX - dragStartX.current;
        if (dx < -SWIPE_THRESHOLD) goToYear(currentYear + 1);
        else if (dx > SWIPE_THRESHOLD) goToYear(currentYear - 1);
    }, [currentYear, goToYear]);

    // --- Year-transition animation -----------------------------------------
    // ±1 year steps (arrows + swipes) SLIDE the whole track, mirroring the
    // horizontal carousel's gsap feel: after the re-render the old current
    // card sits in the adjacent slot, so starting the track offset by one
    // stride recreates the previous layout, and tweening back to x:0 slides
    // the cards into their new places. Multi-year jumps ("Back to this Year")
    // keep the original scale/opacity pop instead.
    const trackRef = useRef<HTMLDivElement | null>(null);
    const prevYearRef = useRef(centerYear);
    const lastDeltaRef = useRef(0);

    useLayoutEffect(() => {
        const delta = currentYear - prevYearRef.current;
        prevYearRef.current = currentYear;
        lastDeltaRef.current = delta;
        if (delta === 0) return;
        const track = trackRef.current;
        if (!track || Math.abs(delta) !== 1) return;
        const slots = track.querySelectorAll<HTMLDivElement>('.growth-snap-slot');
        if (slots.length < 3) return;
        // Slots are always reserved (even when empty at a life-span boundary),
        // so the centre-to-edge offset difference is a stable stride.
        const stride = slots[2].offsetLeft - slots[1].offsetLeft;
        if (stride <= 0) return;
        gsap.killTweensOf(track);
        gsap.fromTo(track,
            { x: delta * stride },
            { x: 0, duration: 0.6, ease: 'power3.out' },
        );
    }, [currentYear]);

    // Pop on the centered card for multi-year jumps only (±1 gets the slide).
    const activeCardRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (Math.abs(lastDeltaRef.current) === 1) return;
        const el = activeCardRef.current;
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.fromTo(el,
            { scale: 0.92, opacity: 0.6 },
            { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' },
        );
    }, [currentYear]);

    // Peek neighbours exist only when the adjacent year is within the life span.
    const showPrev = minYear == null ? true : currentYear - 1 >= minYear;
    const showNext = maxYear == null ? true : currentYear + 1 <= maxYear;

    const prevArcana = growthArcanaIdentity(birthDate, currentYear - 1);
    const currentArcana = growthArcanaIdentity(birthDate, currentYear);
    const nextArcana = growthArcanaIdentity(birthDate, currentYear + 1);

    // Pretty label for the currently-centered card.
    const currentNumber = useMemo(() => {
        if (!currentArcana) return null;
        const entry = Object.entries(ARCANA_BY_NUMBER).find(([, name]) => name === currentArcana);
        return entry ? (Number(entry[0]) as ArcanaIdentityIndex) : null;
    }, [currentArcana]);

    return (
        <div className="growth-card-stack-vertical">
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
                            onClick={() => goToYear(centerYear)}
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

            <div
                className="growth-snap-region"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => { isDragging.current = false; }}
            >
                <div
                    className="growth-snap-track"
                    ref={trackRef}
                    style={{
                        ['--growth-card-w' as string]: `${cardWidth}px`,
                        ['--growth-card-h' as string]: `${cardHeight}px`,
                    }}
                >
                    {/* prev slot — reserved for layout stability; card only when in range */}
                    <div className="growth-snap-slot">
                        {showPrev && prevArcana && (
                            <div
                                className="growth-card-option inactive"
                                onClick={() => goToYear(currentYear - 1)}
                            >
                                <CardFace
                                    cardId={ArcanaIdentities[prevArcana]}
                                    cardWidth={cardWidth}
                                    cardHeight={cardHeight}
                                    isOptimised
                                />
                                <div className="growth-year-label">{currentYear - 1}</div>
                            </div>
                        )}
                    </div>

                    {/* current slot — always the centered, active card */}
                    <div className="growth-snap-slot">
                        {currentArcana && (
                            <div className="growth-card-option active" ref={activeCardRef}>
                                <CardFace
                                    cardId={ArcanaIdentities[currentArcana]}
                                    cardWidth={cardWidth}
                                    cardHeight={cardHeight}
                                    isOptimised
                                />
                                <div className="growth-year-label">{currentYear}</div>
                            </div>
                        )}
                    </div>

                    {/* next slot — reserved for layout stability; card only when in range */}
                    <div className="growth-snap-slot">
                        {showNext && nextArcana && (
                            <div
                                className="growth-card-option inactive"
                                onClick={() => goToYear(currentYear + 1)}
                            >
                                <CardFace
                                    cardId={ArcanaIdentities[nextArcana]}
                                    cardWidth={cardWidth}
                                    cardHeight={cardHeight}
                                    isOptimised
                                />
                                <div className="growth-year-label">{currentYear + 1}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
