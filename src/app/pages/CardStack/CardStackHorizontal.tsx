import './CardStackHorizontal.css';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CardSequenceBackground } from '../../components/CardSequenceBackground/CardSequenceBackground';
import cerebus from 'url:../../../assets/images/cerebus.webp';
import arrow from 'url:../../../assets/images/arrow.webp';
import { TopNavBarHorizontal } from '../../components/CardSequenceBottomNavBar/TopNavBar';
import CardStack from '../../components/CardStack/CardStack';
import { CompletionRing } from '../../components/CompletionRing/CompletionRing';
import type { CardData } from '../../../types/card-data';
import type { ArcanaIdentity } from '../../constants/arcana-identities';
import { ROLE_DESCRIPTORS } from '../../constants/data/role-descriptors';
import { getArcanaDescription } from '../../constants/data/arcana-descriptions';
import { textfill } from '../../utilities/textfill';

export default function CardStackHorizontal({ cards, onHome, onNext, onInspect }: {
    cards: CardData[];
    onHome: () => void;
    onNext: () => void;
    onBack?: () => void;
    onInspect?: (arcana: ArcanaIdentity) => void;
}) {
    const RING_DRAW_MS = 1200;
    const RING_HOLD_MS = 300;
    const arcana = cards.map(c => c.card);
    console.debug('CardStackHorizontal: cards received', cards.length, cards);
    const [cardIndex, setCardIndex] = useState(0);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [dismissTopCardTrigger, setDismissTopCardTrigger] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const finishTimeoutRef = useRef<number | null>(null);
    const topCardFlipped = flippedCards.includes(cardIndex);

    const cardWidth = useMemo(() => Math.min(window.innerWidth * 0.24, 260), []);
    const cardHeight = useMemo(() => Math.round(cardWidth * 1.5), [cardWidth]);

    const typeTitleRef = useRef<HTMLDivElement>(null);
    const typeBodyRef = useRef<HTMLDivElement>(null);
    const archetypeTitleRef = useRef<HTMLDivElement>(null);
    const archetypeBodyRef = useRef<HTMLDivElement>(null);

    const isLastCard = cardIndex >= arcana.length - 1;
    const canGoBack = cardIndex > 0 && !isFinishing;
    const canGoForward = !isFinishing;

    const handleNextCard = () => {
        if (isFinishing) return;

        if (topCardFlipped && isLastCard) {
            setDismissTopCardTrigger((prev) => prev + 1);
        } else if (topCardFlipped && cardIndex < arcana.length - 1) {
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
    const currentDescriptor = currentRole ? ROLE_DESCRIPTORS[currentRole] : { label: 'Card Stack', lines: [] as string[] };
    const currentArchetype = currentCardIdentity ? getArcanaDescription(currentCardIdentity) : undefined;
    const compactRoleLabel = currentDescriptor.label.replace(/^Your\s+/i, '');

    // Fit each panel's title and body text within its box. Re-run whenever the
    // displayed content changes (card change / flip) or the window is resized.
    useLayoutEffect(() => {
        textfill(typeTitleRef.current, { maxFontSize: 60 });
        textfill(typeBodyRef.current, { maxFontSize: 26 });
        textfill(archetypeTitleRef.current, { maxFontSize: 60 });
        textfill(archetypeBodyRef.current, { maxFontSize: 26 });
    }, [cardIndex, topCardFlipped, currentDescriptor, currentArchetype]);

    useEffect(() => {
        const onResize = () => {
            textfill(typeTitleRef.current, { maxFontSize: 60 });
            textfill(typeBodyRef.current, { maxFontSize: 26 });
            textfill(archetypeTitleRef.current, { maxFontSize: 60 });
            textfill(archetypeBodyRef.current, { maxFontSize: 26 });
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // If the user navigates away (e.g. Home) while the completion ring is
    // playing, cancel the pending screen switch so it can't fire post-unmount.
    useEffect(() => () => {
        if (finishTimeoutRef.current !== null) window.clearTimeout(finishTimeoutRef.current);
    }, []);

    // Start the finish sequence: play the completion ring, then switch screens
    // once it has fully drawn. Guarded by the ref so the early off-screen
    // callback and the later dismiss callback can't both schedule navigation
    // (their closures may each see stale state).
    const beginFinish = () => {
        if (finishTimeoutRef.current !== null) return;
        setIsFinishing(true);
        finishTimeoutRef.current = window.setTimeout(() => onNext(), RING_DRAW_MS + RING_HOLD_MS);
    };

    return (
        <div className={`card-stack-horizontal${isFinishing ? ' is-finishing' : ''}`}>
            <CardSequenceBackground objectPosition="center" />
            {isFinishing && <CompletionRing durationMs={RING_DRAW_MS} />}
            <div className="top-wrapper">
                <TopNavBarHorizontal onHome={onHome} />
                <div className="content">
                    <div className="stack-info-layout">
                        <div className="type-info-panel">
                            <div className="panel-title-box" ref={typeTitleRef}>
                                <p className="panel-title">{compactRoleLabel}</p>
                            </div>
                            <div className="panel-body-box" ref={typeBodyRef}>
                                {currentDescriptor.lines.map((line, i) => (
                                    <p key={`type-line-${i}`} className="panel-body">{line}</p>
                                ))}
                            </div>
                        </div>

                        <div className="stack-region" style={{ width: cardWidth, height: cardHeight + 24 }}>
                            <CardStack
                                arcana={arcana}
                                selectedArcanaIndex={cardIndex}
                                flippedCards={flippedCards}
                                cardWidth={cardWidth}
                                cardHeight={cardHeight}
                                dismissTopCardTrigger={dismissTopCardTrigger}
                                onTopCardTap={handleNextCard}
                                onTopCardOffScreen={() => {
                                    if (isLastCard) beginFinish();
                                }}
                                onTopCardSwipeDismiss={() => {
                                    if (isLastCard) {
                                        beginFinish();
                                    } else if (cardIndex < arcana.length - 1) {
                                        setCardIndex(cardIndex + 1);
                                    }
                                }}
                            />
                        </div>

                        <div className="archetype-info-panel">
                            <div className="panel-title-box" ref={archetypeTitleRef}>
                                <p className="panel-title">
                                    {topCardFlipped
                                        ? (currentArchetype?.title ?? '')
                                        : ''}
                                </p>
                            </div>
                            <div className="panel-body-box" ref={archetypeBodyRef}>
                                <p className="panel-body">
                                    {topCardFlipped
                                        ? (currentArchetype?.body ?? 'No archetype data for this card.')
                                        : 'Flip the current card to reveal archetype details.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="control-row arrow-control-row">
                        <button
                            className={`arrow-button${canGoBack ? '' : ' is-hidden'}`}
                            onClick={handlePreviousCard}
                            aria-label="Previous Card"
                            disabled={!canGoBack}
                        >
                            <img src={arrow} alt="Previous" className="left" />
                        </button>
                        <button
                            className={`card-stack-inspect-link${topCardFlipped ? '' : ' is-disabled'}`}
                            onClick={() => {
                                if (!topCardFlipped || isFinishing) return;
                                const topCard = arcana[cardIndex];
                                if (topCard) onInspect?.(topCard);
                            }}
                        >
                            Inspect card
                        </button>
                        <button
                            className={`arrow-button${canGoForward ? '' : ' is-hidden'}`}
                            onClick={handleNextCard}
                            aria-label="Next Card"
                            disabled={!canGoForward}
                        >
                            <img src={arrow} alt="Next" />
                        </button>
                    </div>
                </div>
                <img src={cerebus} className="bottom-image" />
            </div>
        </div>
    );
}
