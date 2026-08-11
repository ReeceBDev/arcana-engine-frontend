import { useEffect, useState } from 'react';
import type { ArcanaIdentity } from '../../constants/arcana-identities';
import type { CardAnimationConfig } from '../../../types/card-animation-config';
import { FlickSnap } from '../../animations/useCardAnimation';
import FlippableCard from './FlippableCard';
import './CardStack.css';

type CardStackProps = {
    arcana: ArcanaIdentity[];
    selectedArcanaIndex: number;
    flippedCards: number[];
    cardWidth?: number;
    cardHeight?: number;
    animationConfig?: CardAnimationConfig;
    onTopCardTap?: () => void;
    onTopCardSwipeDismiss?: (direction: { x: number; y: number }) => void;
    dismissTopCardTrigger?: number;
};

const SWIPE_THRESHOLD = 58;
const MAX_ROTATION = 15;
const TAP_THRESHOLD = 6;
const ENTRY_EASE = 'cubic-bezier(0.33, 0, 0.2, 1)';
const RELAXED_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TOSS_EASE = 'cubic-bezier(0.2, 0.85, 0.22, 1)';
const RELAXED_STACK_DURATION_MS = 820;
const TOSS_DURATION_MS = 760;

// Natural hand-shuffled look for cards resting behind the top card.
const STACK_STAGGER_STEP = 5;    // px each card peeks down behind the top card
const STACK_X_DRIFT = 1.5;       // px of horizontal fan per depth step
const STACK_TWIST_DEG = 1.1;     // deg of rotation twist per depth step
const STACK_MAX_DEPTH = 3;       // cap so deep cards don't drift too far

export default function CardStack({
    arcana,
    selectedArcanaIndex,
    flippedCards,
    cardWidth = 200,
    cardHeight = 300,
    animationConfig = FlickSnap,
    onTopCardTap,
    onTopCardSwipeDismiss,
    dismissTopCardTrigger = 0,
}: CardStackProps) {
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
    const [initialAnimationDone, setInitialAnimationDone] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [dragX, setDragX] = useState(0);
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [pointerStartX, setPointerStartX] = useState<number | null>(null);
    const [pointerStartY, setPointerStartY] = useState<number | null>(null);
    const [tossOffset, setTossOffset] = useState<{ x: number; y: number } | null>(null);
    const [tossRotation, setTossRotation] = useState(0);
    const [isTossing, setIsTossing] = useState(false);
    const [tossingIndex, setTossingIndex] = useState<number | null>(null);
    const [swipeVectorsByIndex, setSwipeVectorsByIndex] = useState<Record<number, { x: number; y: number }>>({});

    const tossTopCard = (unitX: number, unitY: number) => {
        const throwDistance = Math.max(screenWidth, screenHeight) * 1.4;
        const targetX = unitX * throwDistance;
        const targetY = unitY * throwDistance;

        setIsTossing(true);
        setTossingIndex(selectedArcanaIndex);
        setTossOffset({ x: targetX, y: targetY });
        setTossRotation(unitX * (MAX_ROTATION * 1.6));
        setSwipeVectorsByIndex((prev) => ({
            ...prev,
            [selectedArcanaIndex]: { x: unitX, y: unitY },
        }));

        window.setTimeout(() => {
            onTopCardSwipeDismiss?.({ x: unitX, y: unitY });

            requestAnimationFrame(() => {
                setIsTossing(false);
                setTossingIndex(null);
                setTossOffset(null);
                setTossRotation(0);
                setDragX(0);
                setDragY(0);
            });
        }, TOSS_DURATION_MS);
    };

    useEffect(() => {
        if (!isTossing) return;

        setIsTossing(false);
        setTossingIndex(null);
        setTossOffset(null);
        setTossRotation(0);
        setDragX(0);
        setDragY(0);
    }, [selectedArcanaIndex]);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setHasAnimatedIn(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const maxDelay = (arcana.length - 1) * 400;
        const timer = setTimeout(() => setInitialAnimationDone(true), maxDelay + 900);
        return () => clearTimeout(timer);
    }, [arcana.length]);

    useEffect(() => {
        const onResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (dismissTopCardTrigger <= 0) return;
        if (selectedArcanaIndex >= arcana.length) return;
        if (!flippedCards.includes(selectedArcanaIndex)) return;
        if (isTossing || dragging) return;

        tossTopCard(1, -0.18);
    }, [dismissTopCardTrigger]);

    return (
        <div
            className="card-stack"
            style={{
                width: cardWidth,
                height: cardHeight,
            }}
        >
            {arcana.map((card, index) => {
                let translateX = -screenWidth * 0.4;
                let translateY = screenHeight * 1.3;
                let rotateDeg = 40;

                if (hasAnimatedIn) {
                    if (index < selectedArcanaIndex) {
                        const swipeVector = swipeVectorsByIndex[index];
                        if (swipeVector) {
                            const pastDistance = Math.max(screenWidth, screenHeight) * 1.4;
                            translateX = swipeVector.x * pastDistance;
                            translateY = swipeVector.y * pastDistance;
                            rotateDeg = swipeVector.x * (MAX_ROTATION * 1.6);
                        } else {
                            translateX = screenWidth;
                            translateY = -screenHeight * 0.3;
                            rotateDeg = 0;
                        }
                    } else {
                        // Cards resting in the stack behind the top card get a
                        // subtle, deterministic stagger/twist so they read as a
                        // natural shuffled deck rather than a single flat card.
                        const depthFromTop = index - selectedArcanaIndex;
                        const magnitude = Math.min(depthFromTop, STACK_MAX_DEPTH);
                        const twistSign = depthFromTop % 2 === 0 ? 1 : -1;

                        translateX = twistSign * magnitude * STACK_X_DRIFT;
                        translateY = magnitude * STACK_STAGGER_STEP;
                        rotateDeg = twistSign * magnitude * STACK_TWIST_DEG;
                    }
                }

                const isTopCard = index === selectedArcanaIndex;
                const isTopCardFlipped = flippedCards.includes(selectedArcanaIndex);

                if (isTopCard && dragging) {
                    translateX += dragX;
                    translateY += dragY;

                    const radialProgress = Math.min(Math.hypot(dragX, dragY) / SWIPE_THRESHOLD, 1);
                    const dragAngle = Math.atan2(dragY, dragX);
                    rotateDeg += Math.cos(dragAngle) * radialProgress * MAX_ROTATION;
                }

                const isTossCard = tossingIndex === index;

                if (isTossCard && tossOffset) {
                    translateX += tossOffset.x;
                    translateY += tossOffset.y;
                    rotateDeg += tossRotation;
                }

                const transitionDurationMs = isTopCard && dragging
                    ? 0
                    : (isTossCard && isTossing ? TOSS_DURATION_MS : (initialAnimationDone ? RELAXED_STACK_DURATION_MS : 900));
                const transitionDelayMs = initialAnimationDone ? 0 : (arcana.length - 1 - index) * 400;
                const transitionEasing = isTossCard && isTossing
                    ? TOSS_EASE
                    : (initialAnimationDone ? RELAXED_EASE : ENTRY_EASE);

                // Depth-based drop shadow: the top card casts onto the cards
                // behind, and each deeper card gains a touch more separation.
                const shadowDepth = Math.min(Math.max(index - selectedArcanaIndex, 0), STACK_MAX_DEPTH);
                const shadowOffsetY = 4 + shadowDepth * 2;
                const shadowBlur = 8 + shadowDepth * 5;
                const shadowAlpha = Math.min(0.4 + shadowDepth * 0.06, 0.6);
                const dropShadow = `drop-shadow(0 ${shadowOffsetY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha.toFixed(2)}))`;

                return (
                    <FlippableCard
                        key={`${card}-${index}`}
                        arcana={card}
                        cardWidth={cardWidth}
                        cardHeight={cardHeight}
                        isBackUp={!flippedCards.includes(index)}
                        translateX={translateX}
                        translateY={translateY}
                        rotateDeg={rotateDeg}
                        zIndex={arcana.length - index}
                        dropShadow={dropShadow}
                        transitionDurationMs={transitionDurationMs}
                        transitionDelayMs={transitionDelayMs}
                        transitionEasing={transitionEasing}
                        animationConfig={animationConfig}
                        onPointerDown={isTopCard ? (e) => {
                            if (isTossing) return;
                            setPointerStartX(e.clientX);
                            setPointerStartY(e.clientY);
                            setDragging(true);
                            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                        } : undefined}
                        onPointerMove={isTopCard ? (e) => {
                            if (!dragging || pointerStartX === null || pointerStartY === null) return;
                            setDragX(e.clientX - pointerStartX);
                            setDragY(e.clientY - pointerStartY);
                        } : undefined}
                        onPointerUp={isTopCard ? () => {
                            const distance = Math.hypot(dragX, dragY);

                            setDragging(false);
                            setPointerStartX(null);
                            setPointerStartY(null);

                            if (distance >= SWIPE_THRESHOLD && isTopCardFlipped) {
                                const safeDistance = Math.max(distance, 1);
                                const unitX = dragX / safeDistance;
                                const unitY = dragY / safeDistance;
                                tossTopCard(unitX, unitY);
                                return;
                            }

                            setDragX(0);
                            setDragY(0);

                            if (distance <= TAP_THRESHOLD) {
                                onTopCardTap?.();
                            }
                        } : undefined}
                        onPointerCancel={isTopCard ? () => {
                            setDragging(false);
                            setPointerStartX(null);
                            setPointerStartY(null);
                            setDragX(0);
                            setDragY(0);
                        } : undefined}
                    />
                );
            })}
        </div>
    );
}
