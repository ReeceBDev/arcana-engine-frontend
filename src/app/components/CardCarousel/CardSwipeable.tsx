import { useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import CardFace from '../ArcanaCard/CardFace';
import { ArcanaIdentities, type ArcanaIdentity } from '../../constants/arcana-identities';
import './CardSwipeable.css';
import type { CarouselDraggableSnapHandle } from './CardCarouselDraggableSnapHandle';

gsap.registerPlugin(useGSAP, Draggable);

const cardIds: ArcanaIdentity[] = Object.keys(ArcanaIdentities).filter(id => id !== 'BACK') as ArcanaIdentity[];

const SWIPE_THRESHOLD = 80; // Swipe threshold in pixels. Drags past this point will trigger card switch in that direction.
const MAX_ROTATION = 15; // Max rotation in degrees at full drag

interface CardSwipeableProps {
    onIndexChange?: (index: number) => void;
}

const CardSwipeable = forwardRef<CarouselDraggableSnapHandle, CardSwipeableProps>(function CardCarouselSwipeable({ onIndexChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [curIndex, setCurIndex] = useState(0);
    const indexRef = useRef(0);
    const isAnimating = useRef(false);
    const onIndexChangeRef = useRef(onIndexChange);
    const exitDirectionRef = useRef<1 | -1>(1);
    const wrap = gsap.utils.wrap(0, cardIds.length);
    const pendingIndexRef = useRef<number | null>(null);
    const intendedIndexRef = useRef(0); // tracks where we're heading

    onIndexChangeRef.current = onIndexChange;

    const animateSwitch = useCallback((targetIndex: number) => {
        if (isAnimating.current) {
            pendingIndexRef.current = targetIndex;
            return;
        }

        const target = wrap(targetIndex);
        if (target === indexRef.current) {
            onIndexChangeRef.current?.(target);
            return;
        }
        if (isAnimating.current) return;
        isAnimating.current = true;
        const card = cardRef.current;
        if (!card) return;

        let diff = targetIndex - indexRef.current;
        if (Math.abs(diff) > cardIds.length / 2) {
            diff -= Math.sign(diff) * cardIds.length;
        }
        const direction = diff > 0 ? 1 : -1;
        const exitX = -direction * window.innerWidth;
        const exitRotation = -direction * MAX_ROTATION;

        gsap.to(card, {
            x: exitX,
            rotation: exitRotation,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                indexRef.current = target;
                console.log(`intendedIndexRef set to ${intendedIndexRef.current} (onComplete)`);

                setCurIndex(target);
                onIndexChangeRef.current?.(target);

                gsap.set(card, { x: direction * window.innerWidth * 0.5, rotation: direction * MAX_ROTATION * 0.5 });

                gsap.to(card, {
                    x: 0,
                    rotation: 0,
                    duration: 0.35,
                    ease: 'power2.out',
                    onComplete: () => {
                        isAnimating.current = false;
                        if (pendingIndexRef.current !== null) {
                            const pending = pendingIndexRef.current;
                            pendingIndexRef.current = null;
                            animateSwitch(pending);
                        }
                    }
                });
            }
        });

}, [wrap]);


const next = useCallback(() => {
    console.log(`Next pressed (next) - intendedIndex: ${intendedIndexRef.current} → ${intendedIndexRef.current + 1}`);
    intendedIndexRef.current = intendedIndexRef.current + 1;
    console.log(`intendedIndexRef set to ${intendedIndexRef.current} (next)`);
    animateSwitch(intendedIndexRef.current);
}, [animateSwitch]);

const previous = useCallback(() => {
    console.log(`Previous pressed (previous) - intendedIndex: ${intendedIndexRef.current} → ${intendedIndexRef.current - 1}`);
    intendedIndexRef.current = intendedIndexRef.current - 1;
    console.log(`intendedIndexRef set to ${intendedIndexRef.current} (previous)`);
    animateSwitch(intendedIndexRef.current);
}, [animateSwitch]);

const toIndex = useCallback((index: number) => {
    intendedIndexRef.current = index;
    pendingIndexRef.current = null;
    animateSwitch(index);
}, [animateSwitch]);

const toggleOverflow = useCallback(() => { }, []);
const current = useCallback(() => indexRef.current, []);

const beginExit = useCallback((direction: 1 | -1) => {
    if (isAnimating.current) return;
    const card = cardRef.current;
    if (!card) return;

    exitDirectionRef.current = direction;
    gsap.to(card, {
        x: -direction * window.innerWidth,
        rotation: -direction * MAX_ROTATION * 0.5,
        duration: 0.2,
        ease: 'power2.in',
    });
}, []);

const completeEntry = useCallback((targetIndex: number) => {
    const card = cardRef.current;
    if (!card) return;

    const target = wrap(targetIndex);
    const direction = exitDirectionRef.current;

    indexRef.current = target;
    setCurIndex(target);

    gsap.set(card, { x: direction * window.innerWidth * 0.5, rotation: direction * MAX_ROTATION * 0.5 });

    gsap.to(card, {
        x: 0,
        rotation: 0,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => { isAnimating.current = false; }
    });
}, [wrap]);

useImperativeHandle(ref, () => ({
    next,
    previous,
    toggleOverflow,
    toIndex,
    current,
    beginExit,
    completeEntry,
}), [next, previous, toggleOverflow, toIndex, current, beginExit, completeEntry]);

useGSAP(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const proxy = document.createElement("div");

    Draggable.create(proxy, {
        type: 'x',
        trigger: container.parentElement,
        edgeResistance: 0.5,
        onDrag() {
            const x = this.x;
            const progress = Math.min(Math.abs(x) / SWIPE_THRESHOLD, 1);
            const direction = x > 0 ? 1 : -1;
            gsap.set(card, { x: this.x, rotation: direction * progress * MAX_ROTATION });

            const peekLeft = container.querySelector('.peek-left');
            const peekRight = container.querySelector('.peek-right');
            gsap.set(peekLeft, { opacity: 0 });
            gsap.set(peekRight, { opacity: 0 });
            gsap.set(peekLeft, { opacity: x > 0 ? 1 : 0 });
            gsap.set(peekRight, { opacity: x < 0 ? 1 : 0 });
        },
        onRelease() {
            const peekLeft = container.querySelector('.peek-left');
            const peekRight = container.querySelector('.peek-right');

            const x = this.x;
            gsap.set(proxy, { x: 0 });
            if (Math.abs(x) >= SWIPE_THRESHOLD && !isAnimating.current) {
                const direction = x > 0 ? -1 : 1;
                const exitDirection = x > 0 ? 1 : -1;
                isAnimating.current = true;

                const revealedPeek = exitDirection > 0 ? peekLeft : peekRight;
                const hiddenPeek = exitDirection > 0 ? peekRight : peekLeft;
                const clonedPeek = (revealedPeek as Element).cloneNode(true) as HTMLElement;
                clonedPeek.classList.add('cloned-peek');
                container.appendChild(clonedPeek);
                gsap.set(clonedPeek, { filter: 'brightness(0.7)' });

                gsap.set(hiddenPeek, { opacity: 0 });
                const newIndex = wrap(indexRef.current + direction);

                gsap.to(card, {
                    x: exitDirection * window.innerWidth,
                    rotation: exitDirection * MAX_ROTATION,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        gsap.set(card, { opacity: 0 });

                        indexRef.current = newIndex;
                        setCurIndex(newIndex);
                        onIndexChangeRef.current?.(newIndex);

                        isAnimating.current = false;

                        // Clean up peeks. Note: The cloned peek will still be present until fade in is complete. (Don't worry)
                        gsap.set(peekLeft, { opacity: 0 });
                        gsap.set(peekRight, { opacity: 0 });

                        gsap.to(clonedPeek, {
                            filter: 'brightness(1)',
                            duration: 0.1,
                            onComplete: () => {
                                gsap.to(card, {
                                    opacity: 1, duration: 0, onComplete: () => {
                                        gsap.set(card, { x: 0, rotation: 0 });
                                        container.querySelectorAll('.cloned-peek').forEach(el => el.remove());
                                    }
                                });

                            }
                        });
                    }
                });
            } else {
                container.querySelectorAll('.cloned-peek').forEach(el => el.remove());

                gsap.set(peekLeft, { opacity: 0 });
                gsap.set(peekRight, { opacity: 0 });

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

export default CardSwipeable;