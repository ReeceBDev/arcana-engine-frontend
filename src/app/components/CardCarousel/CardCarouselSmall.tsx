import { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useGSAP } from '@gsap/react';
import CardFace from '../ArcanaCard/CardFace';
import { ArcanaIdentities, type ArcanaIdentity } from '../../constants/arcana-identities';
import './CardCarouselSmall.css';
import type { CarouselDraggableSnapHandle } from './CardCarouselDraggableSnapHandle';
import { reverseCustomEasePath } from '../../utilities/reverse-ease';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase);

const cardIds: ArcanaIdentity[] = Object.keys(ArcanaIdentities).filter(id => id !== 'BACK') as ArcanaIdentity[];

interface CardCarouselSmallProps {
    onIndexChange?: (index: number) => void;
    cardWidth: number;
    cardHeight: number;
    cardGapInPx: number;
    onDragStart?: (direction: 1 | -1) => void;
    onDragComplete?: (index: number) => void;
    animations?: { property: string; peak: number; trough: number, ease?: string }[];
}

const CardCarouselSmall = forwardRef<CarouselDraggableSnapHandle, CardCarouselSmallProps>(
    function CarouselDraggableSnapTest({ onIndexChange, cardHeight, cardWidth, cardGapInPx, onDragStart, onDragComplete, animations = [] }, ref) {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const loopRef = useRef<any>(null);
        const onIndexChangeRef = useRef(onIndexChange);
        onIndexChangeRef.current = onIndexChange;

        const onDragStartRef = useRef(onDragStart);
        onDragStartRef.current = onDragStart;

        const onDragCompleteRef = useRef(onDragComplete);
        onDragCompleteRef.current = onDragComplete;

        const next = useCallback(() => {
            loopRef.current?.next({ duration: 0.4, ease: "power1.inOut" });
            const idx = loopRef.current?.current() ?? 0;
            onIndexChangeRef.current?.(idx);
        }, []);

        const previous = useCallback(() => {
            loopRef.current?.previous({ duration: 0.4, ease: "power1.inOut" });
            const idx = loopRef.current?.current() ?? 0;
            onIndexChangeRef.current?.(idx);
        }, []);

        const toggleOverflow = useCallback(() => {
            wrapperRef.current?.classList.toggle("show-overflow");
        }, []);

        const toIndex = useCallback((index: number) => {
            loopRef.current?.toIndex(index, { duration: 0.4, ease: "power1.inOut" });
        }, []);

        const current = useCallback(() => {
            return loopRef.current?.current() ?? 0;
        }, []);

        useImperativeHandle(ref, () => ({
            next,
            previous,
            toggleOverflow,
            toIndex,
            current,
        }), [next, previous, toggleOverflow, toIndex, current]);

        useGSAP(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".card");
            if (!cards.length) return;

            gsap.set(cards, { width: cardWidth, height: cardHeight });

            const middleCard = cards[Math.floor(cards.length / 2)] as HTMLElement;
            const offset = middleCard.offsetLeft + middleCard.offsetWidth / 2;

            wrapperRef.current!.style.transform = `translateX(calc(50vw - ${offset}px))`;

            const centreIndex = Math.floor(cards.length / 2);
            const centreOffset = centreIndex / cards.length;
            const loop = horizontalLoop(cards, {
                paused: true,
                draggable: true,
                paddingRight: cardGapInPx,
                startIndex: centreIndex,
                onIndexChange: (idx: number) => onIndexChangeRef.current?.(idx),
                onDragStart: (direction: 1 | -1) => onDragStartRef.current?.(direction),
                onDragComplete: (idx: number) => onDragCompleteRef.current?.(idx),
            });
            // Animate each card as it moves across its own relative centre point of the screen.
            const totalDuration = loop.duration();

            // Capture BEFORE mutation
            const peakProgresses = cards.map((_: HTMLElement, i: number) => loop.times[i] / totalDuration);

            loop.times.forEach((_: number, i: number) => {
                loop.times[i] = gsap.utils.wrap(0, loop.duration(), loop.times[i] + centreOffset * loop.duration());
            });
            loop.progress(centreOffset, true);

            // After building the loop, build a separate scale timeline
            const cardTls: { tl: gsap.core.Timeline; peakProgress: number }[] = [];

            const reverseEase = (e: string): string => {
                if (e === 'none') return 'none';
                if (e.endsWith('.out')) return e.replace('.out', '.in');
                if (e.endsWith('.in')) return e.replace('.in', '.out');
                if (e.startsWith('M')) return reverseCustomEasePath(e);
                throw new Error(`Invalid ease: "${e}". Must end in '.in' or '.out' (e.g. 'power2.in') or be a CustomEase SVG path as a string starting with 'M'.`);
            };

            cards.forEach((card: HTMLElement, i: number) => {
                const peakProgress = loop.times[i] / totalDuration;
                const cardTl = gsap.timeline({ paused: true });

                animations.forEach(({ property, peak, trough, ease = 'none' }: { property: string; peak: number; trough: number; ease?: string }) => {
                    const forwardEase = ease.startsWith('M') ? CustomEase.create(`ease_fwd_${i}`, ease) : ease;
                    const reversedEase = ease.startsWith('M') ? CustomEase.create(`ease_rev_${i}`, reverseCustomEasePath(ease)) : reverseEase(ease);

                    cardTl.to(card, {
                        keyframes: {
                            "0%": { [property]: trough },
                            "50%": { [property]: peak, ease: forwardEase },
                            "100%": { [property]: trough, ease: reversedEase },
                        },
                        duration: 1,
                        ease: 'none',
                        immediateRender: false,
                    }, 0);
                });

                cardTls.push({ tl: cardTl, peakProgress });
            });

            const syncScales = () => {
                const p = loop.progress();
                cardTls.forEach(({ tl }, i) => {
                    tl.progress(gsap.utils.wrap(0, 1, p - centreOffset - peakProgresses[i] + 0.5));
                });
            };

            loop.eventCallback("onUpdate", syncScales);
            syncScales();

            loop.progress(centreOffset, true);
            loopRef.current = loop;

            cards.forEach((card, i) =>
                card.addEventListener("click", () => {
                    console.log(`Carousel was Clicked by user - Heading to card ${i}`);
                    loop.toIndex(i, { duration: 0.4, ease: 'none' }); //0.8, ease: "power1.inOut" });
                })
            );


        }, { scope: wrapperRef });

        return (
            <div ref={wrapperRef} className="wrapper">
                {cardIds.map((cardId, index) => (
                    <div key={index} className="card" style={{ marginRight: cardGapInPx }}>
                        <CardFace cardId={ArcanaIdentities[cardId]} cardWidth={cardWidth} cardHeight={cardHeight} />
                    </div>
                ))}
            </div>
        );
    });

export default CardCarouselSmall;

function setMiddle(boxes: HTMLElement[], mid: number) {
    boxes.forEach((box) => box.classList.remove("middle-item"));
    const wrap = gsap.utils.wrap(0, boxes.length);
    boxes[wrap(mid)].classList.add("middle-item");
}

function horizontalLoop(items: any, config: any) {
    let externalNavActive = false;
    items = gsap.utils.toArray(items);
    config = config || {};
    let hasFiredDragStart = false;
    let tl: any = gsap.timeline({
        repeat: config.repeat,
        paused: config.paused,
        defaults: { ease: "none" },
        onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
    }),
        length = items.length,
        startX = items[0].offsetLeft,
        times: number[] = [],
        widths: number[] = [],
        xPercents: number[] = [],
        curIndex = 0,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1),
        populateWidths = () =>
            items.forEach((el: HTMLElement, i: number) => {
                widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
                xPercents[i] = snap(
                    (parseFloat(gsap.getProperty(el, "x", "px") as string) / widths[i]) * 100 +
                    (gsap.getProperty(el, "xPercent") as number)
                );
            }),
        getTotalWidth = () =>
            items[length - 1].offsetLeft +
            (xPercents[length - 1] / 100) * widths[length - 1] -
            startX +
            items[length - 1].offsetWidth *
            (gsap.getProperty(items[length - 1], "scaleX") as number) +
            (parseFloat(config.paddingRight) || 0),
        totalWidth: number,
        curX: number,
        distanceToStart: number,
        distanceToLoop: number,
        item: HTMLElement,
        i: number;

    populateWidths();
    gsap.set(items, { xPercent: (i: number) => xPercents[i] });
    gsap.set(items, { x: 0 });
    totalWidth = getTotalWidth();

    for (i = 0; i < length; i++) {
        item = items[i];
        curX = (xPercents[i] / 100) * widths[i];
        distanceToStart = item.offsetLeft + curX - startX;
        distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);
        tl.to(item, {
            xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
            duration: distanceToLoop / pixelsPerSecond
        }, 0)
            .fromTo(item, {
                xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
            }, {
                xPercent: xPercents[i],
                duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false
            }, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
    }

    let navGeneration = 0;

    function toIndex(index: number, vars: any) {
        vars = vars || {};
        Math.abs(index - curIndex) > length / 2 &&
            (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (newIndex === curIndex) return; // guard first
        externalNavActive = true;         // only set if we're actually navigating
        if (time > tl.time() !== index > curIndex) {
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        const generation = ++navGeneration;
        vars.onComplete = () => {
            if (navGeneration !== generation) return;
            console.log(`Carousel movement complete (toIndex.onComplete). Landed on index ${curIndex}`);
            config.onIndexChange?.(curIndex);
        };
        return tl.tweenTo(time, vars);
    }

    tl.next = (vars: any) => { toIndex(curIndex + 1, vars) && setMiddle(items, tl.current() + 2); };
    tl.previous = (vars: any) => { toIndex(curIndex - 1, vars) && setMiddle(items, tl.current() + 2); };
    tl.current = () => curIndex;
    tl.toIndex = (index: number, vars: any) => toIndex(index, vars);
    tl.updateIndex = () => (curIndex = gsap.utils.wrap(0, length, Math.round((tl.progress() - ((config.startIndex || 0) / length)) * length)));
    tl.times = times;
    tl.progress(1, true).progress(0, true);

    if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
    }

    if (config.draggable && typeof Draggable === "function") {
        let proxy = document.createElement("div"),
            wrap = gsap.utils.wrap(0, 1),
            ratio: number,
            startProgress: number,
            draggable: any,
            dragSnap: number,
            roundFactor: number,
            align = () => {
                if (externalNavActive) return;
                tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
            },
            syncIndex = () => tl.updateIndex();

        typeof InertiaPlugin === "undefined" &&
            console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");

        draggable = Draggable.create(proxy, {
            trigger: items[0].parentNode,
            type: "x",
            onPress() {
                if (draggable.isThrowing) draggable.endDrag();
                externalNavActive = false;
                hasFiredDragStart = false;
                tl.pause()
                startProgress = tl.progress();
                totalWidth = getTotalWidth();
                ratio = 1 / totalWidth;
                dragSnap = totalWidth / items.length;
                roundFactor = Math.pow(10, ((dragSnap + "").split(".")[1] || "").length);
            },
            onDrag() {
                if (!hasFiredDragStart) {
                    hasFiredDragStart = true;
                    const direction = draggable.deltaX < 0 ? 1 : -1;
                    config.onDragStart?.(direction);
                }
                align();
            },
            onThrowUpdate: align,
            inertia: true,
            snap: (value: number) => {
                const startOffset = ((config.startIndex || 0) / length) * totalWidth;
                let n = Math.round((parseFloat(value as any) - startOffset) / dragSnap) * dragSnap * roundFactor;
                return (n - (n % 1)) / roundFactor + startOffset;
            },
            onRelease: syncIndex,
            onThrowComplete: () => {
                console.log(`Carousel stopped moving towards a destination. (onThrowComplete has fired) - externalNavActive: ${externalNavActive}`);
                gsap.set(proxy, { x: 0 });
                const wasExternal = externalNavActive;
                externalNavActive = false;
                if (wasExternal) return;
                syncIndex();
                setMiddle(items, tl.current() + 2);
                config.onDragComplete?.(tl.current());
            }
        })[0];

        tl.draggable = draggable;
    }

    return tl;
}
