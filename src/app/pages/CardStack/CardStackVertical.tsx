import './CardStackVertical.css';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import cerebus from 'url:../../../assets/images/cerebus.webp';
import arrow from 'url:../../../assets/images/arrow.webp';
import { TopNavBarVertical } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardStack from '../../components/CardStack/CardStack';
import type { CardData } from '../../../types/card-data';
import { ROLE_DESCRIPTORS, type RoleDescriptor } from '../../constants/data/role-descriptors';
import { ARCHETYPE_DATA } from '../../constants/data/archetype-data';
import { textfill } from '../../utilities/textfill';

export default function CardStackVertical({ cards, onHome, onNext, onBack: _onBack = undefined }: {
    cards: CardData[];
    onHome: () => void;
    onNext: () => void;
    onBack?: () => void;
}) {
    const FINISH_FADE_MS = 240;
    const arcana = cards.map(c => c.card);
    console.debug('CardStackVertical: cards received', cards.length, cards);
    const [cardIndex, setCardIndex] = useState(0);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [isPillTextOpen, setIsPillTextOpen] = useState(false);
    const [dismissTopCardTrigger, setDismissTopCardTrigger] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const topCardFlipped = flippedCards.includes(cardIndex);
    const hasNextCard = cardIndex < arcana.length - 1;

    const stackRegionRef = useRef<HTMLDivElement>(null);
    const [cardSize, setCardSize] = useState<{ width: number; height: number }>(() => {
        const width = Math.min(window.innerWidth * 0.54, 260);
        return { width, height: Math.round(width * 1.5) };
    });

    // .stack-region is a flex-grow box that fills all the vertical space above
    // the descriptor text. We measure it directly and size the card to fill its
    // height (preserving the 1.5 aspect ratio), so the card occupies the region
    // edge-to-edge with no gaps. The region's size comes from flex layout and is
    // independent of the card, so there's no feedback loop.
    useLayoutEffect(() => {
        const region = stackRegionRef.current;
        if (!region) return;

        const recompute = () => {
            const availHeight = region.clientHeight;
            const availWidth = region.clientWidth;
            const width = Math.max(0, Math.min(availWidth, availHeight / 1.5));
            setCardSize({ width: Math.round(width), height: Math.round(width * 1.5) });
        };

        recompute();
        const ro = new ResizeObserver(recompute);
        ro.observe(region);
        return () => ro.disconnect();
    }, []);

    const cardWidth = cardSize.width;
    const cardHeight = cardSize.height;

    const astroRef = useRef<HTMLDivElement>(null);
    const archetypeButtonRef = useRef<HTMLButtonElement>(null);
    const archetypeRef = useRef<HTMLDivElement>(null);
    const firstPillToggleRef = useRef(true);
    const isAnimatingPillRef = useRef(false);
    const pillUnfoldRef = useRef(false);
    const pillFadeInRef = useRef(false);

    const prevFlipped = useRef(false);
    const prevIndex = useRef(cardIndex);

    // When a new card comes to the top, reset to pre-flip state instantly.
    // If the target card was already flipped (e.g. navigating back), keep the
    // archetype pill active instead of resetting it to the grey/disabled state.
    useEffect(() => {
        if (prevIndex.current !== cardIndex) {
            prevIndex.current = cardIndex;
            const newCardAlreadyFlipped = flippedCards.includes(cardIndex);
            prevFlipped.current = newCardAlreadyFlipped;
            firstPillToggleRef.current = true;
            setIsPillTextOpen(false);
            isAnimatingPillRef.current = false;
            if (astroRef.current) gsap.set(astroRef.current, { opacity: 1, y: 0, scaleY: 1 });
            if (archetypeButtonRef.current) {
                gsap.set(archetypeButtonRef.current, {
                    opacity: newCardAlreadyFlipped ? 1 : 0.5,
                    scale: 1,
                });
            }
            if (archetypeRef.current) gsap.set(archetypeRef.current, { opacity: 1, y: 0 });
        }
    }, [cardIndex]);

    // When topCardFlipped becomes true, run the pill animation
    useEffect(() => {
        if (topCardFlipped && !prevFlipped.current) {
            prevFlipped.current = true;
            runRevealAnimation();
        }
    }, [topCardFlipped]);

    function runRevealAnimation() {
        const text = archetypeRef.current;
        const archetypeButton = archetypeButtonRef.current;
        if (!text || !archetypeButton) return;

        const tl = gsap.timeline();

        tl.to(archetypeButton, {
            opacity: 1,
            scale: 1.08,
            duration: 0.18,
            ease: 'power2.out',
        });
        tl.to(archetypeButton, {
            scale: 1,
            duration: 0.28,
            ease: 'power2.out',
        });

        tl.fromTo(text, {
            opacity: 0,
            y: 10,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.32,
            ease: 'power2.out',
        }, '-=0.1');
    }

    // Descriptor lines unfold FROM pill — useLayoutEffect runs before paint, no flash
    useLayoutEffect(() => {
        if (!isPillTextOpen || !pillUnfoldRef.current) return;
        pillUnfoldRef.current = false;
        const el = archetypeRef.current;
        if (!el) return;
        gsap.fromTo(el,
            { opacity: 0, y: -28 },
            { opacity: 1, y: 0, duration: 0.36, ease: 'power2.out' }
        );
    }, [isPillTextOpen]);

    // Fade in new content after descriptor lines folded into pill
    useLayoutEffect(() => {
        if (isPillTextOpen || !pillFadeInRef.current) return;
        pillFadeInRef.current = false;
        isAnimatingPillRef.current = false;
        const el = archetypeRef.current;
        if (!el) return;
        gsap.fromTo(el,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' }
        );
    }, [isPillTextOpen]);

    const isLastCard = cardIndex >= arcana.length - 1;
    const canGoBack = cardIndex > 0 && !isFinishing;
    const canGoForward = !isFinishing;

    const handleNextCard = () => {
        if (isFinishing) return;

        if (topCardFlipped && isLastCard) {
            setDismissTopCardTrigger((prev) => prev + 1);
        } else if (topCardFlipped && hasNextCard) {
            setCardIndex(cardIndex + 1);
        } else if (!topCardFlipped) {
            setFlippedCards([...flippedCards, cardIndex]);
        }
    };

    const handlePreviousCard = () => {
        if (cardIndex > 0) {
            setCardIndex(cardIndex - 1);
        }
    };

    const currentRole = cards[cardIndex]?.role;
    const currentCardIdentity = cards[cardIndex]?.card;
    const fallbackDescriptor: RoleDescriptor = { label: 'Card Stack', lines: [] };
    const currentAstro = currentRole ? ROLE_DESCRIPTORS[currentRole] : fallbackDescriptor;
    const currentArchetype = currentCardIdentity ? ARCHETYPE_DATA[currentCardIdentity] : undefined;
    const showingAstroText = !topCardFlipped || isPillTextOpen;
    const compactRoleLabel = currentAstro.label.replace(/^Your\s+/i, '');

    // Fit text within its box. Re-run whenever the content changes, the
    // archetype pill toggles open/closed, or the window is resized.
    useLayoutEffect(() => {
        textfill(astroRef.current, { maxFontSize: 26 });
    }, [cardIndex, showingAstroText, isPillTextOpen, currentAstro, currentArchetype]);

    useEffect(() => {
        const onResize = () => textfill(astroRef.current, { maxFontSize: 26 });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div className={`card-stack-vertical${isFinishing ? ' is-finishing' : ''}`}>
            <CardSequenceBackground />
            <div className="top-wrapper">
                <TopNavBarVertical onHome={onHome} />
                <div className="top-right-action-row">
                    <button
                        className={`archetype-toggle-button${topCardFlipped ? ' is-active' : ''}${isPillTextOpen ? ' is-open' : ''}`}
                        ref={archetypeButtonRef}
                        onClick={() => {
                            if (!topCardFlipped || isAnimatingPillRef.current) return;

                            if (isPillTextOpen && archetypeRef.current && archetypeButtonRef.current) {
                                // Fold descriptor lines INTO the pill
                                isAnimatingPillRef.current = true;

                                gsap.to(archetypeRef.current, {
                                    opacity: 0, y: -28,
                                    duration: 0.28, ease: 'power3.in',
                                    onComplete: () => {
                                        // Wipe all GSAP inline styles so no residual transform
                                        gsap.set(archetypeRef.current!, { clearProps: 'all' });
                                        pillFadeInRef.current = true;
                                        setIsPillTextOpen(false);
                                    }
                                });
                            } else {
                                // useLayoutEffect will snap to start position before paint
                                pillUnfoldRef.current = true;
                                setIsPillTextOpen(true);
                            }
                        }}
                    >
                        Archetype
                    </button>
                </div>

                <div className="content">
                    <div className="stack-stage">
                        <p className="card-role-label">{compactRoleLabel}</p>
                        {/* Card stack */}
                        <div className="stack-region" ref={stackRegionRef}>
                            <CardStack
                                arcana={arcana}
                                selectedArcanaIndex={cardIndex}
                                flippedCards={flippedCards}
                                cardWidth={cardWidth}
                                cardHeight={cardHeight}
                                dismissTopCardTrigger={dismissTopCardTrigger}
                                onTopCardTap={handleNextCard}
                                onTopCardSwipeDismiss={() => {
                                    if (isLastCard) {
                                        setIsFinishing(true);
                                        window.setTimeout(() => onNext(), FINISH_FADE_MS);
                                    } else if (hasNextCard) {
                                        setCardIndex(cardIndex + 1);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="text-stage" ref={archetypeRef}>
                        <div className="astro-text-block" ref={astroRef}>
                            {showingAstroText
                                ? currentAstro.lines.map((line, i) => (
                                    <p className="astro-body-text" key={`astro-${i}`}>{line}</p>
                                ))
                                : <p className="archetype-body">{currentArchetype?.body ?? ''}</p>}
                        </div>
                    </div>

                </div>

                {/* Bottom controls */}
                <div className="bottom-controls">
                    <button
                        className={`icon-nav-button icon-nav-left${canGoBack ? '' : ' is-hidden'}`}
                        onClick={handlePreviousCard}
                        aria-label="Previous Card"
                        disabled={!canGoBack}
                    >
                        <img src={arrow} alt="Previous" />
                    </button>
                    <button
                        className="view-card-info-link"
                        onClick={() => {
                            if (isFinishing) return;
                            if (isLastCard && topCardFlipped) {
                                setDismissTopCardTrigger((prev) => prev + 1);
                                return;
                            }
                            onNext();
                        }}
                    >
                        View card info
                    </button>
                    <button
                        className={`icon-nav-button icon-nav-right${canGoForward ? '' : ' is-hidden'}`}
                        onClick={handleNextCard}
                        aria-label="Next Card"
                        disabled={!canGoForward}
                    >
                        <img src={arrow} alt="Next" />
                    </button>
                </div>

                <img src={cerebus} className="bottom-image" />
            </div>
        </div>
    );
}
