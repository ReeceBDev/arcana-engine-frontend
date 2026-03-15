import { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useGSAP } from '@gsap/react';
import CardFace from '../ArcanaCard/CardFace';
import { ArcanaIdentities, type ArcanaIdentity } from '../../constants/arcana-identities';
import './CardCarouselSmall.css';
import type { CarouselDraggableSnapHandle } from './CardCarouselDraggableSnapHandle';

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

const cardIds: ArcanaIdentity[] = Object.keys(ArcanaIdentities).filter(id => id !== 'BACK') as ArcanaIdentity[];
const CARD_GAP_IN_PX = 10;

interface CardCarouselSmallProps {
    onIndexChange?: (index: number) => void;
    cardWidth?: number;
    cardHeight?: number;
    onDragStart?: (direction: 1 | -1) => void;
    onDragComplete?: (index: number) => void;
}

const CardCarouselSmall = forwardRef<CarouselDraggableSnapHandle, CardCarouselSmallProps>(
    function CarouselDraggableSnapTest({ onIndexChange, cardHeight, cardWidth, onDragStart, onDragComplete }, ref) {
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
            loopRef.current?.toIndex(index, { duration: 0.8, ease: "power1.inOut" });
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

            const loop = horizontalLoop(cards, {
                paused: true,
                draggable: true,
                paddingRight: CARD_GAP_IN_PX,
                startIndex: centreIndex,
                onIndexChange: (idx: number) => onIndexChangeRef.current?.(idx),
                onDragStart: (direction: 1 | -1) => onDragStartRef.current?.(direction),
                onDragComplete: (idx: number) => onDragCompleteRef.current?.(idx),
            });

            const centreOffset = centreIndex / cards.length;

            loop.times.forEach((_: number, i: number) => {
                loop.times[i] = gsap.utils.wrap(0, loop.duration(), loop.times[i] + centreOffset * loop.duration());
            });
            loop.progress(centreOffset, true);

            loopRef.current = loop;

            cards.forEach((card, i) =>
                card.addEventListener("click", () => {
                    loop.toIndex(i, { duration: 0.8, ease: "power1.inOut" });
                    //onIndexChangeRef.current?.(i);
                })
            );

        }, { scope: wrapperRef });

        return (
            <div ref={wrapperRef} className="wrapper">
                {cardIds.map((cardId, index) => (
                    <div key={index} className="card" style={{ marginRight: CARD_GAP_IN_PX }}>
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
                xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100)
            }, {
                xPercent: xPercents[i],
                duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false
            }, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
    }

    /*function toIndex(index: number, vars: any) {
        vars = vars || {};
        Math.abs(index - curIndex) > length / 2 &&
            (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (time > tl.time() !== index > curIndex) {
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        return tl.tweenTo(time, vars);
    }*/

    function toIndex(index: number, vars: any) {
        vars = vars || {};
        Math.abs(index - curIndex) > length / 2 &&
            (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (newIndex === curIndex) return;
        if (time > tl.time() !== index > curIndex) {
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        vars.onComplete = () => config.onIndexChange?.(curIndex);
        //config.onIndexChange?.(curIndex);
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
            align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
            syncIndex = () => tl.updateIndex();

        typeof InertiaPlugin === "undefined" &&
            console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");

        draggable = Draggable.create(proxy, {
            trigger: items[0].parentNode,
            type: "x",
            onPress() {
                hasFiredDragStart = false;
                tl.pause()
                startProgress = tl.progress();
                //tl.progress(0);
                //populateWidths();
                totalWidth = getTotalWidth();
                ratio = 1 / totalWidth;
                dragSnap = totalWidth / items.length;
                roundFactor = Math.pow(10, ((dragSnap + "").split(".")[1] || "").length);
                //tl.progress(startProgress);
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
            /*snap: (value: number) => {
                let n = Math.round(parseFloat(value as any) / dragSnap) * dragSnap * roundFactor;
                return (n - (n % 1)) / roundFactor;
            },*/
            snap: (value: number) => {
                const startOffset = ((config.startIndex || 0) / length) * totalWidth;
                let n = Math.round((parseFloat(value as any) - startOffset) / dragSnap) * dragSnap * roundFactor;
                return (n - (n % 1)) / roundFactor + startOffset;
            },
            onRelease: syncIndex,
            onThrowComplete: () => {
                gsap.set(proxy, { x: 0 });
                syncIndex();
                setMiddle(items, tl.current() + 2);
                config.onDragComplete?.(tl.current());
            }
        })[0];

        tl.draggable = draggable;
    }

    return tl;
}
