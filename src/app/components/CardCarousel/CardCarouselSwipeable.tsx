import { useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import CardFace from '../ArcanaCard/CardFace';
import { ArcanaIdentities, type ArcanaIdentity } from '../../constants/arcana-identities';
import './CardCarouselSwipeable.css';
import type { CarouselDraggableSnapHandle } from './CardCarouselDraggableSnapHandle';

gsap.registerPlugin(useGSAP, Draggable);

const cardIds: ArcanaIdentity[] = Object.keys(ArcanaIdentities).filter(id => id !== 'BACK') as ArcanaIdentity[];

/** Swipe threshold in pixels — drag past this to trigger card switch */
const SWIPE_THRESHOLD = 80;
/** Max rotation in degrees at full drag */
const MAX_ROTATION = 15;

interface CardCarouselSwipeableProps {
    onIndexChange?: (index: number) => void;
}

const CardCarouselSwipeable = forwardRef<CarouselDraggableSnapHandle, CardCarouselSwipeableProps>(function CardCarouselSwipeable({ onIndexChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [curIndex, setCurIndex] = useState(0);
    const indexRef = useRef(0);
    const isAnimating = useRef(false);
    const onIndexChangeRef = useRef(onIndexChange);
    onIndexChangeRef.current = onIndexChange;

    const wrap = gsap.utils.wrap(0, cardIds.length);

    const animateSwitch = useCallback((direction: 1 | -1) => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        const card = cardRef.current;
        if (!card) return;

        const exitX = -direction * window.innerWidth;
        const exitRotation = -direction * MAX_ROTATION;

        // Animate card off-screen
        gsap.to(card, {
            x: exitX,
            rotation: exitRotation,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                // Update index
                const newIndex = wrap(indexRef.current + direction);
                indexRef.current = newIndex;
                setCurIndex(newIndex);
                onIndexChangeRef.current?.(newIndex);

                // Reset position to opposite side (off-screen) instantly
                gsap.set(card, { x: direction * window.innerWidth * 0.5, rotation: direction * MAX_ROTATION * 0.5 });

                // Animate new card in from the other side
                gsap.to(card, {
                    x: 0,
                    rotation: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                    onComplete: () => { isAnimating.current = false; }
                });
            }
        });
    }, [wrap]);

    const next = useCallback(() => animateSwitch(1), [animateSwitch]);
    const previous = useCallback(() => animateSwitch(-1), [animateSwitch]);
    const toggleOverflow = useCallback(() => {}, []);

    const toIndex = useCallback((index: number) => {
        const target = wrap(index);
        indexRef.current = target;
        setCurIndex(target);
        //onIndexChangeRef.current?.(target);
        if (cardRef.current) {
            gsap.set(cardRef.current, { x: 0, rotation: 0 });
        }
    }, [wrap]);

    const current = useCallback(() => indexRef.current, []);

    useImperativeHandle(ref, () => ({
        next,
        previous,
        toggleOverflow,
        toIndex,
        current,
    }), [next, previous, toggleOverflow, toIndex, current]);

    useGSAP(() => {
        const card = cardRef.current;
        const container = containerRef.current;
        if (!card || !container) return;

        Draggable.create(card, {
            type: 'x',
            trigger: container.parentElement,
            edgeResistance: 0.5,
            onDrag() {
                const x = this.x;
                const progress = Math.min(Math.abs(x) / SWIPE_THRESHOLD, 1);
                const direction = x > 0 ? 1 : -1;
                gsap.set(card, { rotation: direction * progress * MAX_ROTATION });
            },
            onRelease() {
                const x = this.x;
                if (Math.abs(x) >= SWIPE_THRESHOLD && !isAnimating.current) {
                    // Passed threshold — trigger switch
                    const direction = x > 0 ? -1 : 1; // swipe right = previous, swipe left = next
                    const exitDirection = x > 0 ? 1 : -1;
                    isAnimating.current = true;

                    gsap.to(card, {
                        x: exitDirection * window.innerWidth,
                        rotation: exitDirection * MAX_ROTATION,
                        duration: 0.25,
                        ease: 'power2.in',
                        onComplete: () => {
                            const newIndex = wrap(indexRef.current + direction);
                            indexRef.current = newIndex;
                            setCurIndex(newIndex);
                            onIndexChangeRef.current?.(newIndex);

                            gsap.set(card, {
                                x: -exitDirection * window.innerWidth * 0.5,
                                rotation: -exitDirection * MAX_ROTATION * 0.5
                            });

                            gsap.to(card, {
                                x: 0,
                                rotation: 0,
                                duration: 0.35,
                                ease: 'power2.out',
                                onComplete: () => { isAnimating.current = false; }
                            });
                        }
                    });
                } else {
                    // Snap back to center
                    gsap.to(card, {
                        x: 0,
                        rotation: 0,
                        duration: 0.4,
                        ease: 'elastic.out(1, 0.5)'
                    });
                }
            }
        });
    }, { scope: containerRef });

    const cardId = cardIds[curIndex];
    const prevId = cardIds[wrap(curIndex - 1)];
    const nextId = cardIds[wrap(curIndex + 1)];

    return (
        <div ref={containerRef} className="swipe-container">
            <div className="swipe-card peek-card peek-left">
                <CardFace cardId={ArcanaIdentities[prevId]} />
            </div>
            <div ref={cardRef} className="swipe-card">
                <CardFace cardId={ArcanaIdentities[cardId]} />
            </div>
            <div className="swipe-card peek-card peek-right">
                <CardFace cardId={ArcanaIdentities[nextId]} />
            </div>
        </div>
    );
});

export default CardCarouselSwipeable;
