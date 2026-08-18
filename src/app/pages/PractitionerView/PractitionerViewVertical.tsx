import './PractitionerViewVertical.css';
import { useMemo, useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { TopNavBarVertical } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardFace from '../../components/ArcanaCard/CardFace';
import CardSplay from '../../components/CardSplay/CardSplay';
import { ArcanaIdentities } from '../../constants/arcana-identities';
import { buildNatalHouseCards } from '../../constants/data/astrological-houses';
import type { FullReading, FullReadingStatus } from '../../utilities/astro/natal';
import type { CardData } from '../../../types/card-data';
import type { PageIdentity } from '../../../types/page-identity';

type CardCategory = {
    label: string;
    editLabel: string;
    cards: CardData[];
    stackPage: PageIdentity;
    editPage: PageIdentity;
    /** Overrides the default hasCards ? stackPage : editPage rule. */
    resolveTarget?: () => PageIdentity;
};

export default function PractitionerViewVertical({
    birthTime,
    birthLocation,
    birthdateCards,
    nameCards,
    growthCards,
    fullReading,
    fullReadingStatus,
    onHome,
    navigate,
}: {
    birthTime: string;
    birthLocation: string;
    birthdateCards: CardData[];
    nameCards: CardData[];
    growthCards: CardData[];
    /** Natal houses + correspondences from POST /reading/full (null until fetched). */
    fullReading: FullReading | null;
    /** Lifecycle of the App-level full-reading fetch. */
    fullReadingStatus: FullReadingStatus;
    onHome: () => void;
    navigate: (page: PageIdentity) => void;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const dragStartX = useRef(0);
    const isDragging = useRef(false);

    const cardWidth = useMemo(() => Math.min(window.innerWidth * 0.52, 240), []);
    const cardHeight = useMemo(() => Math.round(cardWidth * 1.5), [cardWidth]);

    const categories: CardCategory[] = useMemo(() => [
        {
            label: 'Date Cards',
            editLabel: 'Edit Date',
            cards: birthdateCards,
            stackPage: 'birthdate-card-stack',
            editPage: 'date-selector',
        },
        {
            label: 'Name Cards',
            editLabel: 'Edit Name',
            cards: nameCards,
            stackPage: 'name-card-stack',
            editPage: 'name-entry',
        },
        {
            label: 'Astrological Houses',
            editLabel: 'Edit Time',
            // Only front the house cards once the full natal details are in —
            // the houses reading needs BOTH birth time and birth location —
            // AND the full reading itself has landed. Until then the panel
            // shows the placeholder face (no fan), and resolveTarget below
            // routes the tap to the missing workflow step.
            cards: birthTime && birthLocation && fullReadingStatus === 'ready' && fullReading
                ? buildNatalHouseCards(fullReading.houses)
                : [],
            stackPage: 'astrological-houses',
            editPage: 'nativety-time-entry',
            // Resume the workflow at the step after the last completed one:
            //   birthLocation set  -> astrological houses
            //   birthTime set      -> birth-location-entry
            //   neither            -> nativety-time-entry
            resolveTarget: () => birthLocation
                ? 'astrological-houses'
                : birthTime
                    ? 'birth-location-entry'
                    : 'nativety-time-entry',
        },
        {
            label: 'Growth Cards',
            editLabel: 'Edit Date',
            cards: growthCards,
            stackPage: 'growth-card-carousel',
            editPage: 'date-selector',
        },
    ], [birthdateCards, nameCards, growthCards, birthTime, birthLocation, fullReading, fullReadingStatus]);

    const goTo = useCallback((index: number) => {
        const clamped = Math.max(0, Math.min(index, categories.length - 1));
        setActiveIndex(clamped);
    }, [categories.length]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        dragStartX.current = e.clientX;
        isDragging.current = true;
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const dx = e.clientX - dragStartX.current;
        const threshold = 50;
        if (dx < -threshold) goTo(activeIndex + 1);
        else if (dx > threshold) goTo(activeIndex - 1);
    }, [activeIndex, goTo]);

    // Animate active card on index change
    const animateCard = useCallback((el: HTMLDivElement | null) => {
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

    return (
        <div className="practitioner-view-vertical">
            <CardSequenceBackground />
            <div className="top-wrapper">
                <TopNavBarVertical onHome={onHome} />
                <div className="content">
                    <p className="click-to-view">Click to view</p>

                    <div
                        className="card-carousel-region"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={() => { isDragging.current = false; }}
                    >
                        <div className="carousel-viewport">
                            <div
                                className="carousel-track"
                                ref={trackRef}
                                style={{
                                    transform: `translateX(${((categories.length - 1) / 2 - activeIndex) * (cardWidth + window.innerWidth * 0.04)}px)`,
                                }}
                            >
                                {categories.map((cat, i) => {
                                    const lastCard = cat.cards.length > 0
                                        ? cat.cards[cat.cards.length - 1]
                                        : null;
                                    const isActive = i === activeIndex;

                                    const hasCards = cat.cards.length > 0;

                                    return (
                                        <div
                                            className={`card-option ${isActive ? 'active' : 'inactive'}`}
                                            key={cat.label}
                                            ref={isActive ? animateCard : undefined}
                                        >
                                            <p className="card-label">{cat.label}</p>

                                            <div
                                                className="card-preview-wrap"
                                                onClick={() => navigate(cat.resolveTarget
                                                    ? cat.resolveTarget()
                                                    : (hasCards ? cat.stackPage : cat.editPage))}
                                            >
                                                <CardSplay
                                                    count={cat.cards.length - 1}
                                                    cardWidth={cardWidth}
                                                    cardHeight={cardHeight}
                                                />
                                                <div className={`card-preview${hasCards ? '' : ' needs-data'}`}>
                                                    <div className="card-overlay-label">
                                                        <span>{cat.label}</span>
                                                    </div>
                                                    <CardFace
                                                        cardId={lastCard ? ArcanaIdentities[lastCard.card] : ArcanaIdentities.THELEMA}
                                                        cardWidth={cardWidth}
                                                        cardHeight={cardHeight}
                                                        isOptimised
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                className="edit-link"
                                                onClick={() => navigate(cat.editPage)}
                                            >
                                                {cat.editLabel}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="carousel-dots">
                        {categories.map((_, i) => (
                            <button
                                key={i}
                                className={`dot ${i === activeIndex ? 'active' : ''}`}
                                onClick={() => goTo(i)}
                            />
                        ))}
                    </div>

                    <div className="carousel-nav-row">
                        <button
                            className="nav-arrow"
                            onClick={() => goTo(activeIndex - 1)}
                        >
                            ‹ Prev
                        </button>
                        <button
                            className="nav-arrow"
                            onClick={() => goTo(activeIndex + 1)}
                        >
                            Next ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
