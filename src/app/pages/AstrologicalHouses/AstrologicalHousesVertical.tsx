import './AstrologicalHousesVertical.css';
import { useCallback, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import arrow from 'url:../../../assets/images/arrow.webp';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { TopNavBarVertical } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardFace from '../../components/ArcanaCard/CardFace';
import CorrespondenceGrid from '../../components/CorrespondenceGrid/CorrespondenceGrid';
import { buildNatalHouses } from '../../constants/data/astrological-houses';
import type { ArcanaIdentityIndex } from '../../constants/arcana-identities';
import type { FullReadingStatus, NatalHouse } from '../../utilities/astro/natal';
import HouseNumberStrip from '../../components/HouseNumberStrip/HouseNumberStrip';

/** Minimum horizontal travel before a swipe counts as a step (see PractitionerViewVertical). */
const SWIPE_THRESHOLD_PX = 50;

export default function AstrologicalHousesVertical({ onHome, onInspect, onBackToPractitioner, natalHouses, fullReadingStatus, fullReadingError, onRetryFullReading }: {
    onHome: () => void;
    onInspect: (cardId: ArcanaIdentityIndex) => void;
    /** Optional "Back to Practitioner View" action for the top bar. */
    onBackToPractitioner?: () => void;
    /** The practitioner's natal houses (POST /reading/full); empty until ready. */
    natalHouses: NatalHouse[];
    /** Lifecycle of the App-level full-reading fetch. */
    fullReadingStatus: FullReadingStatus;
    /** Backend guidance (invalidNameError) or transport error, shown verbatim. */
    fullReadingError: string | null;
    /** Re-runs the last full-reading request after a failure. */
    onRetryFullReading: () => void;
}) {
    // Whole-sign natal houses from the Ascendant; chips follow each CUSP SIGN.
    const houses = useMemo(() => buildNatalHouses(natalHouses), [natalHouses]);
    const houseCount = houses.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const house = houses[activeIndex];

    const dragStartX = useRef(0);
    const isDragging = useRef(false);
    /** Swallow the click that follows a >threshold swipe so it cannot also open Inspect. */
    const suppressClick = useRef(false);

    // Portrait sizing: scale off viewport width, capped by available height so
    // the name / correspondence / description / strip regions always fit.
    const cardSize = useMemo(() => {
        const byWidth = Math.min(window.innerWidth * 0.5, 280);
        const height = Math.min(byWidth * 1.5, window.innerHeight * 0.44);
        return { width: Math.round(height / 1.5), height: Math.round(height) };
    }, []);

    /** Must mirror the CSS `gap` on .houses-track (4vw). */
    const cardGapPx = useMemo(() => window.innerWidth * 0.04, []);

    /** Clamped selection — the carousel itself never loops (only the arrows wrap). */
    const goTo = useCallback((index: number) => {
        setActiveIndex(Math.max(0, Math.min(index, houseCount - 1)));
    }, [houseCount]);

    /** Wrapping step used by the arrows: past the end flips to the opposite side. */
    const step = useCallback((delta: number) => {
        setActiveIndex(prev => (prev + delta + houseCount) % houseCount);
    }, [houseCount]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        dragStartX.current = e.clientX;
        isDragging.current = true;
        suppressClick.current = false;
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const dx = e.clientX - dragStartX.current;
        if (dx < -SWIPE_THRESHOLD_PX) { goTo(activeIndex + 1); suppressClick.current = true; }
        else if (dx > SWIPE_THRESHOLD_PX) { goTo(activeIndex - 1); suppressClick.current = true; }
    }, [activeIndex, goTo]);

    const handleCardClick = useCallback((index: number, cardId: ArcanaIdentityIndex, isActive: boolean) => {
        if (suppressClick.current) {
            suppressClick.current = false;
            return;
        }
        if (isActive) onInspect(cardId);
        else goTo(index);
    }, [goTo, onInspect]);

    // GSAP "pop" on the card that becomes active. The cleanup tweens the
    // inline styles back to the inactive values so they never override the
    // .inactive CSS class (same recipe as PractitionerViewVertical).
    const animateActiveCard = useCallback((el: HTMLDivElement | null) => {
        if (!el) return;
        gsap.fromTo(el, { scale: 0.92, opacity: 0.6 }, {
            scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out'
        });
        return () => {
            gsap.to(el, {
                scale: 0.82, opacity: 0.45, duration: 0.35, ease: 'power2.out'
            });
        };
    }, []);

    const leftArrowRef = useRef<HTMLImageElement>(null);
    const rightArrowRef = useRef<HTMLImageElement>(null);
    const pulse = (ref: React.RefObject<HTMLImageElement | null>) => {
        if (!ref.current) return;
        gsap.fromTo(ref.current, { scale: 1 },
            { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, ease: 'none' });
    };

    // No natal data yet — keep the page chrome and show a notice instead of
    // the natural-house fallback (the same cards for everyone was the bug
    // this screen shipped with). Loading: casting; idle: nativity incomplete;
    // error: backend guidance verbatim + retry.
    if (!house) {
        return (
            <div className="astrological-houses-vertical">
                <CardSequenceBackground />
                <div className="top-wrapper">
                    <TopNavBarVertical onHome={onHome} onBack={onBackToPractitioner} backLabel="Back to Practitioner View" />
                    <div className="content">
                        <p className="house-notice">
                            {fullReadingStatus === 'loading' ? 'Casting the houses…'
                                : fullReadingStatus === 'error' ? (fullReadingError ?? 'The full reading could not be fetched.')
                                    : 'The houses are cast from the full nativity — birth date, time, and place are needed.'}
                        </p>
                        {fullReadingStatus === 'error' && (
                            <button className="house-retry" onClick={onRetryFullReading}>Retry</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="astrological-houses-vertical">
            <CardSequenceBackground />
            <div className="top-wrapper">
                <TopNavBarVertical onHome={onHome} onBack={onBackToPractitioner} backLabel="Back to Practitioner View" />
                <div className="content">
                    {/* No key here: the h2 and .house-info below used to carry the
                        same key={house.number}, and duplicate keys among siblings
                        made React orphan the old nodes — titles stacked up. */}
                    <h2 className="house-name">{house.name}</h2>

                    <div
                        className="houses-carousel-region"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={() => { isDragging.current = false; }}
                    >
                        <button
                            className="house-arrow house-arrow-left"
                            onClick={() => { pulse(leftArrowRef); step(-1); }}
                            aria-label="Previous house"
                        >
                            <img ref={leftArrowRef} src={arrow} alt="Previous" />
                        </button>

                        <div className="houses-carousel-viewport">
                            <div
                                className="houses-track"
                                style={{
                                    transform: `translateX(${((houseCount - 1) / 2 - activeIndex) * (cardSize.width + cardGapPx)}px)`,
                                }}
                            >
                                {houses.map((h, i) => {
                                    const isActive = i === activeIndex;
                                    return (
                                        <div
                                            key={h.number}
                                            className={`house-card ${isActive ? 'active' : 'inactive'}`}
                                            ref={isActive ? animateActiveCard : undefined}
                                            onClick={() => handleCardClick(i, h.cardId, isActive)}
                                        >
                                            <CardFace
                                                cardId={h.cardId}
                                                cardWidth={cardSize.width}
                                                cardHeight={cardSize.height}
                                                isOptimised
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            className="house-arrow house-arrow-right"
                            onClick={() => { pulse(rightArrowRef); step(1); }}
                            aria-label="Next house"
                        >
                            <img ref={rightArrowRef} src={arrow} alt="Next" />
                        </button>
                    </div>

                    <div className="house-info">
                        <CorrespondenceGrid correspondences={house.correspondences} />
                        <p className="house-description">{house.description}</p>
                    </div>

                    <HouseNumberStrip selected={activeIndex} onSelect={goTo} />
                </div>
            </div>
        </div>
    );
}
