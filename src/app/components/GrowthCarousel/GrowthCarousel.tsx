import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useGSAP } from '@gsap/react';
import CardFace from '../ArcanaCard/CardFace';
import type { ArcanaIdentity } from '../../constants/arcana-identities';
import './GrowthCarousel.css';

gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * GrowthCarousel — a NON-LOOPING, dynamically-growing horizontal carousel.
 *
 * Unlike CardCarousel (which builds a fixed, seamless-loop GSAP timeline), this
 * carousel renders a sliding WINDOW of years and grows that window as the user
 * approaches either edge: new year-cards are spawned on the near side and old
 * ones dispelled off the far side, so it can scroll indefinitely in both
 * directions without ever wrapping. Each year's arcana is provided by the pure
 * `getArcanaForYear` callback (client-side math — see utilities/growth-cards),
 * so growing the window costs zero backend calls.
 *
 * Each item is a grouped element: the card face with its year label beneath,
 * so the years move with the cards as a single unit.
 */

const EDGE_PAD = 6;       // when within this many items of an edge, extend the window
const EXTEND_BY = 10;     // how many years to add when extending
const MAX_WINDOW = 60;    // hard cap on rendered items; trim the far side beyond this

interface GrowthCarouselProps {
    /** Pure fn: year → arcana identity. Drives every spawned card. */
    getArcanaForYear: (year: number) => ArcanaIdentity | null;
    /** Year initially centered. */
    centerYear: number;
    cardWidth: number;
    cardHeight: number;
    cardGap?: number;
    /** Called with the newly-centered year (integer) as the user slides. */
    onYearChange?: (year: number) => void;
}

export default function GrowthCarousel({
    getArcanaForYear,
    centerYear,
    cardWidth,
    cardHeight,
    cardGap = 10,
    onYearChange,
}: GrowthCarouselProps) {
    const itemWidth = cardWidth + cardGap;

    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Rendered window of years (inclusive).
    const [firstYear, setFirstYear] = useState(centerYear - 8);
    const [lastYear, setLastYear] = useState(centerYear + 8);

    // Refs mirroring state for use inside GSAP/Draggable callbacks (which close
    // over stale values otherwise).
    const firstYearRef = useRef(firstYear);
    const lastYearRef = useRef(lastYear);
    firstYearRef.current = firstYear;
    lastYearRef.current = lastYear;

    const draggableRef = useRef<Draggable | null>(null);
    const viewportCenterRef = useRef(0);
    const onYearChangeRef = useRef(onYearChange);
    onYearChangeRef.current = onYearChange;
    const lastNotifiedYearRef = useRef(centerYear);

    const years: number[] = [];
    for (let y = firstYear; y <= lastYear; y++) years.push(y);

    /** Focused logical index (float) within the current window, from current x. */
    const focusIndexFloat = useCallback(() => {
        const d = draggableRef.current;
        const x = d ? d.x : 0;
        const c = viewportCenterRef.current;
        return (c - itemWidth / 2 - x) / itemWidth;
    }, [itemWidth]);

    /** Snap target: nearest item index, clamped to the live window. */
    const snapX = useCallback((endX: number) => {
        const c = viewportCenterRef.current;
        const count = lastYearRef.current - firstYearRef.current + 1;
        const i = Math.round((c - itemWidth / 2 - endX) / itemWidth);
        const clamped = Math.max(0, Math.min(count - 1, i));
        return c - (clamped * itemWidth + itemWidth / 2);
    }, [itemWidth]);

    /** Grow the window if the focus is near an edge; trim the far side if too big. */
    const maybeGrowWindow = useCallback(() => {
        const focus = focusIndexFloat();
        const count = lastYearRef.current - firstYearRef.current + 1;

        if (focus < EDGE_PAD) {
            const k = EXTEND_BY;
            firstYearRef.current -= k;
            setFirstYear(firstYearRef.current);
            // Prepended items push existing ones right by k*itemWidth in track
            // coords; subtract the same from x so nothing visually jumps.
            const d = draggableRef.current;
            if (d) { d.x -= k * itemWidth; d.update(); }
        } else if (count - 1 - focus < EDGE_PAD) {
            lastYearRef.current += EXTEND_BY;
            setLastYear(lastYearRef.current);
        }

        const newCount = lastYearRef.current - firstYearRef.current + 1;
        if (newCount > MAX_WINDOW) {
            // Trim whichever side is farther from the focus.
            const focusNow = focusIndexFloat();
            const fromLeft = focusNow;
            const fromRight = newCount - 1 - focusNow;
            if (fromLeft >= fromRight) {
                const k = newCount - MAX_WINDOW;
                firstYearRef.current += k;
                setFirstYear(firstYearRef.current);
                const d = draggableRef.current;
                if (d) { d.x += k * itemWidth; d.update(); }
            } else {
                lastYearRef.current -= (newCount - MAX_WINDOW);
                setLastYear(lastYearRef.current);
            }
        }
    }, [focusIndexFloat, itemWidth]);

    /** Notify the current centered year if it changed. */
    const notifyYear = useCallback(() => {
        const idx = Math.round(focusIndexFloat());
        const year = firstYearRef.current + idx;
        if (year !== lastNotifiedYearRef.current) {
            lastNotifiedYearRef.current = year;
            onYearChangeRef.current?.(year);
        }
    }, [focusIndexFloat]);

    useGSAP(() => {
        const container = containerRef.current!;
        const track = trackRef.current!;

        const measure = () => {
            viewportCenterRef.current = container.getBoundingClientRect().left + container.clientWidth / 2;
        };
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(container);

        // Center `centerYear` on mount.
        const startIndex = centerYear - firstYearRef.current;
        const startX = viewportCenterRef.current - (startIndex * itemWidth + itemWidth / 2);
        gsap.set(track, { x: startX });

        const renderTransforms = () => {
            const c = viewportCenterRef.current;
            const items = track.querySelectorAll<HTMLElement>('.growth-item');
            items.forEach((el) => {
                const r = el.getBoundingClientRect();
                const center = r.left + r.width / 2;
                const d = center - c;                                  // px from viewport center
                const signed = Math.max(-1, Math.min(1, d / (itemWidth * 2)));
                const t = Math.max(0, 1 - Math.abs(d) / (itemWidth * 3)); // 1 at center → 0 far
                const scale = 0.82 + 0.23 * t;
                const rotY = -22 * signed;
                const rotZ = 3 * signed;
                const tz = 60 * t;
                el.style.transform = `translateZ(${tz}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
                el.classList.toggle('is-centered', t > 0.85);
            });
        };

        const ticker = gsap.ticker.add(renderTransforms);

        const inst = Draggable.create(track, {
            type: 'x',
            inertia: true,
            dragResistance: 0.16,
            edgeResistance: 0.65,
            zIndexBoost: false,
            allowNativeTouchScrolling: false,
            snap: { x: snapX },
            onDrag() { maybeGrowWindow(); notifyYear(); },
            onThrowUpdate() { maybeGrowWindow(); notifyYear(); },
            onDragEnd: notifyYear,
            onThrowComplete() { maybeGrowWindow(); notifyYear(); },
        })[0];
        draggableRef.current = inst;

        return () => {
            gsap.ticker.remove(ticker);
            ro.disconnect();
            inst.kill();
            draggableRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // After the rendered window changes (grow/trim), keep the track transform in
    // sync with the (possibly adjusted) Draggable x and refresh its bounds.
    useLayoutEffect(() => {
        const d = draggableRef.current;
        const track = trackRef.current;
        if (d && track) {
            gsap.set(track, { x: d.x });
            d.update(true);
        }
    }, [firstYear, lastYear]);

    return (
        <div className="growth-carousel" ref={containerRef}>
            <div className="growth-carousel-stage">
                <div className="growth-carousel-track" ref={trackRef}>
                    {years.map((year) => {
                        const arcana = getArcanaForYear(year);
                        return (
                            <div
                                className="growth-item"
                                key={year}
                                style={{ width: cardWidth, marginRight: cardGap }}
                            >
                                <div className="growth-card-wrap" style={{ width: cardWidth, height: cardHeight }}>
                                    {arcana ? (
                                        <CardFace
                                            cardId={arcana}
                                            cardWidth={cardWidth}
                                            cardHeight={cardHeight}
                                            isOptimised
                                        />
                                    ) : null}
                                </div>
                                <div className="growth-year-label">{year}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
