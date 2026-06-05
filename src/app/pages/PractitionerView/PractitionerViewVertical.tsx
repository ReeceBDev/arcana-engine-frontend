import './PractitionerViewVertical.css';
import { useMemo, useState, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import { TopNavBarVertical } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardFace from '../../components/ArcanaCard/CardFace';
import { ArcanaIdentities } from '../../constants/arcana-identities';
import type { CardData } from '../../../types/card-data';
import type { PageIdentity } from '../../../types/page-identity';

type CardCategory = {
    label: string;
    editLabel: string;
    cards: CardData[];
    stackPage: PageIdentity;
    editPage: PageIdentity;
};

export default function PractitionerViewVertical({
    birthdateCards,
    nameCards,
    growthCards,
    onHome,
    navigate,
}: {
    birthdateCards: CardData[];
    nameCards: CardData[];
    growthCards: CardData[];
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
            label: 'Growth Cards',
            editLabel: 'Edit Time',
            cards: growthCards,
            stackPage: 'growth-card-stack',
            editPage: 'nativety-time-entry',
        },
    ], [birthdateCards, nameCards, growthCards]);

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
                                    transform: `translateX(${-activeIndex * (cardWidth + window.innerWidth * 0.04)}px)`,
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
                                                className="card-preview"
                                                onClick={() => navigate(hasCards ? cat.stackPage : cat.editPage)}
                                            >
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
