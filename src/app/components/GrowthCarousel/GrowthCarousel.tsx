import { useRef, useState, useLayoutEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useGSAP } from '@gsap/react';
import CardFace from '../ArcanaCard/CardFace';
import { ArcanaIdentities, type ArcanaIdentity } from '../../constants/arcana-identities';
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
const EXTEND_BY = 5;      // how many years to add when extending (smaller = smoother growth)
const MAX_WINDOW = 60;    // hard cap on rendered items; trim the far side beyond this
const INIT_HALF = 12;     // initial rendered window = effectiveCenter ± INIT_HALF
const LEFT_PAD = 1;       // non-selectable left edge marker occupies 1 item slot

export interface GrowthCarouselHandle {
    /** Smoothly animate the carousel so that `year` becomes centered. */
    scrollToYear: (year: number) => void;
}

interface GrowthCarouselProps {
    /** Pure fn: year → arcana identity. Drives every spawned card. */
    getArcanaForYear: (year: number) => ArcanaIdentity | null;
    /** Year initially centered. */
    centerYear: number;
    /** Inclusive lower bound on scrollable years (e.g. birth year). */
    minYear?: number;
    /** Inclusive upper bound on scrollable years (e.g. birth year + max lifespan). */
    maxYear?: number;
    cardWidth: number;
    cardHeight: number;
    cardGap?: number;
    /** Called with the newly-centered year (integer) as the user slides. */
    onYearChange?: (year: number) => void;
}

const GrowthCarousel = forwardRef<GrowthCarouselHandle, GrowthCarouselProps>(function GrowthCarousel({
    getArcanaForYear,
    centerYear,
    minYear,
    maxYear,
    cardWidth,
    cardHeight,
    cardGap = 10,
    onYearChange,
}, ref) {
    const itemWidth = cardWidth + cardGap;

    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Effective centered year, clamped to the allowed life range [minYear, maxYear].
    const effectiveCenter = (() => {
        let y = centerYear;
        if (minYear != null && y < minYear) y = minYear;
        if (maxYear != null && y > maxYear) y = maxYear;
        return y;
    })();

    // Rendered window of years (inclusive), clamped to the allowed life range so
    // we never render pre-birth or post-lifespan cards. A larger initial window
    // (±INIT_HALF) gives plenty of fling headroom before any growth is needed.
    const [firstYear, setFirstYear] = useState(() => {
        const lo = effectiveCenter - INIT_HALF;
        return minYear != null ? Math.max(lo, minYear) : lo;
    });
    const [lastYear, setLastYear] = useState(() => {
        const hi = effectiveCenter + INIT_HALF;
        return maxYear != null ? Math.min(hi, maxYear) : hi;
    });

    // Refs mirroring state/props for use inside GSAP/Draggable callbacks (which
    // close over stale values otherwise).
    const firstYearRef = useRef(firstYear);
    const lastYearRef = useRef(lastYear);
    firstYearRef.current = firstYear;
    lastYearRef.current = lastYear;
    const minYearRef = useRef(minYear);
    const maxYearRef = useRef(maxYear);
    minYearRef.current = minYear;
    maxYearRef.current = maxYear;

    // Items prepended (or trimmed from the front, negative) since the last
    // transform sync. Compensation is applied in the layout effect AFTER React
    // commits the new children, so the track never visibly jumps.
    const prependDeltaRef = useRef(0);

    // A year requested via the imperative `scrollToYear` handle that still needs
    // its (async) window-grow to commit before we can animate to it.
    const pendingScrollToRef = useRef<number | null>(null);

    const draggableRef = useRef<Draggable | null>(null);
    const viewportCenterRef = useRef(0);
    const onYearChangeRef = useRef(onYearChange);
    onYearChangeRef.current = onYearChange;
    const lastNotifiedYearRef = useRef(effectiveCenter);

    const years: number[] = [];
    for (let y = firstYear; y <= lastYear; y++) years.push(y);

    /** Focused logical index (float) within the current window, from current x. */
    const focusIndexFloat = useCallback(() => {
        const d = draggableRef.current;
        const x = d ? d.x : 0;
        const c = viewportCenterRef.current;
        return (c - itemWidth / 2 - x) / itemWidth - LEFT_PAD;
    }, [itemWidth]);

    /** Snap target: nearest item, with the CENTERED YEAR clamped to [minYear, maxYear]. */
    const snapX = useCallback((endX: number) => {
        const c = viewportCenterRef.current;
        const i = Math.round((c - itemWidth / 2 - endX) / itemWidth) - LEFT_PAD;
        // Clamp the centered year (not just the index) into the allowed range,
        // so the carousel can't be parked outside a person's life span.
        let year = firstYearRef.current + i;
        if (minYearRef.current != null && year < minYearRef.current) year = minYearRef.current;
        if (maxYearRef.current != null && year > maxYearRef.current) year = maxYearRef.current;
        const count = lastYearRef.current - firstYearRef.current + 1;
        const clamped = Math.max(0, Math.min(count - 1, year - firstYearRef.current));
        return c - ((clamped + LEFT_PAD) * itemWidth + itemWidth / 2);
    }, [itemWidth]);

    /** Grow the window if the focus is near an edge; trim the far side if too big.
     *  Growth is bounded by [minYear, maxYear]; the x-compensation for prepends /
     *  front-trims is deferred to the layout effect so nothing visibly jumps. */
    const maybeGrowWindow = useCallback(() => {
        const focus = focusIndexFloat();
        const count = lastYearRef.current - firstYearRef.current + 1;

        if (focus < EDGE_PAD) {
            // Grow left, but never below minYear.
            const want = firstYearRef.current - EXTEND_BY;
            const bounded = minYearRef.current != null ? Math.max(want, minYearRef.current) : want;
            const k = firstYearRef.current - bounded;
            if (k > 0) {
                firstYearRef.current = bounded;
                prependDeltaRef.current += k;   // compensated in the layout effect
                setFirstYear(firstYearRef.current);
            }
        } else if (count - 1 - focus < EDGE_PAD) {
            // Grow right, but never above maxYear.
            const want = lastYearRef.current + EXTEND_BY;
            const bounded = maxYearRef.current != null ? Math.min(want, maxYearRef.current) : want;
            if (bounded > lastYearRef.current) {
                lastYearRef.current = bounded;
                setLastYear(lastYearRef.current);
            }
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
                prependDeltaRef.current -= k;   // removed from front → shift right
                setFirstYear(firstYearRef.current);
            } else {
                lastYearRef.current -= (newCount - MAX_WINDOW);
                setLastYear(lastYearRef.current);
            }
        }
    }, [focusIndexFloat]);

    /** Notify the current centered year if it changed. */
    const notifyYear = useCallback(() => {
        const idx = Math.round(focusIndexFloat());
        const year = firstYearRef.current + idx;
        if (year !== lastNotifiedYearRef.current) {
            lastNotifiedYearRef.current = year;
            onYearChangeRef.current?.(year);
        }
    }, [focusIndexFloat]);

    /** Animate the track so that `year` is centered, keeping Draggable's x in sync.
     *  Only safe to run when the user is NOT actively dragging/throwing. */
    const animateScrollTo = useCallback((year: number) => {
        const d = draggableRef.current;
        const track = trackRef.current;
        if (!d || !track) return;
        const c = viewportCenterRef.current;
        const idx = year - firstYearRef.current;
        const targetX = c - ((idx + LEFT_PAD) * itemWidth + itemWidth / 2);
        gsap.killTweensOf(track);          // stop any in-flight inertia throw
        gsap.to(track, {
            x: targetX,
            duration: 0.6,
            ease: 'power3.out',
            onUpdate() { d.x = gsap.getProperty(track, 'x') as number; },
            onComplete() { d.x = targetX; notifyYear(); },
        });
    }, [itemWidth, notifyYear]);

    /** Grow the window ONLY while idle. Growing during an active drag/throw
     *  desyncs Draggable's pointer/inertia tracking and makes the track jump.
     *  onThrowComplete grows directly (gesture just ended); onDragEnd defers one
     *  frame and grows only if no inertia throw started (gsap.isTweening). By
     *  then Draggable is idle, so mutating d.x via the layout effect is safe. */
    const growIfIdle = useCallback(() => {
        requestAnimationFrame(() => {
            if (trackRef.current && gsap.isTweening(trackRef.current)) return; // throw in flight
            maybeGrowWindow();
            notifyYear();
        });
    }, [maybeGrowWindow, notifyYear]);

    // Imperative API for the parent (e.g. a "Back to this Year" button).
    useImperativeHandle(ref, () => ({
        scrollToYear(year: number) {
            const d = draggableRef.current;
            const track = trackRef.current;
            if (!d || !track) return;
            // Clamp into the allowed life range.
            let y = year;
            if (minYearRef.current != null && y < minYearRef.current) y = minYearRef.current;
            if (maxYearRef.current != null && y > maxYearRef.current) y = maxYearRef.current;

            // Grow the window to include y if needed; the actual animation runs
            // in the layout effect after React commits the new children.
            let grew = false;
            if (y < firstYearRef.current) {
                firstYearRef.current = Math.max(y - INIT_HALF, minYearRef.current ?? y - INIT_HALF);
                setFirstYear(firstYearRef.current);
                grew = true;
            }
            if (y > lastYearRef.current) {
                lastYearRef.current = Math.min(y + INIT_HALF, maxYearRef.current ?? y + INIT_HALF);
                setLastYear(lastYearRef.current);
                grew = true;
            }
            pendingScrollToRef.current = y;
            if (!grew) animateScrollTo(y);   // already in window → animate now
        },
    }), [animateScrollTo]);

    useGSAP(() => {
        const container = containerRef.current!;
        const track = trackRef.current!;

        const measure = () => {
            viewportCenterRef.current = container.getBoundingClientRect().left + container.clientWidth / 2;
        };
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(container);

        // Center the (range-clamped) effective center year on mount.
        const startIndex = effectiveCenter - firstYearRef.current;
        const startX = viewportCenterRef.current - ((startIndex + LEFT_PAD) * itemWidth + itemWidth / 2);
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
            dragResistance: 0.3,        // lower = faster/more direct follow (was 0.5, too sluggish)
            edgeResistance: 0.6,
            zIndexBoost: false,
            allowNativeTouchScrolling: false,
            snap: { x: snapX },
            // Growth is intentionally NOT done during drag/throw — doing so
            // desyncs Draggable's pointer/inertia tracking and makes the track
            // jump. We only grow while idle (scheduleGrow / onThrowComplete).
            onPress() { gsap.killTweensOf(track); },   // cancel any programmatic scroll on grab
            onDrag: notifyYear,
            onThrowUpdate: notifyYear,
            onDragEnd() { growIfIdle(); notifyYear(); },
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

    // After React commits the new window (children added/removed), apply the
    // deferred transform compensation so the viewport never visibly jumps, and
    // refresh the Draggable bounds. We avoid `d.update(true)` (forced snap) here
    // so an active drag/throw stays fluid instead of yanking to a snap point.
    useLayoutEffect(() => {
        const d = draggableRef.current;
        const track = trackRef.current;
        if (!d || !track) return;
        // Adopt the track's REAL transform before stamping d.x back onto it.
        // Draggable.create() leaves d.x at 0 (it never reads the element's
        // existing transform — that only happens on first press/update), so on
        // mount the unconditional gsap.set below would otherwise wipe the
        // initial centering done in useGSAP and park the track at x=0 (bug:
        // screen opened on the wrong year). After mount d.x already mirrors
        // the track (drag render loop / animateScrollTo keep it in sync), so
        // this is a no-op for window-grow commits.
        d.x = gsap.getProperty(track, 'x') as number;
        if (prependDeltaRef.current !== 0) {
            d.x -= prependDeltaRef.current * itemWidth;
            prependDeltaRef.current = 0;
        }
        gsap.set(track, { x: d.x });
        d.update();
        // If a programmatic scrollToYear had to grow the window first, run the
        // animation now that the new children have committed.
        if (pendingScrollToRef.current != null) {
            const y = pendingScrollToRef.current;
            pendingScrollToRef.current = null;
            animateScrollTo(y);
        }
    }, [firstYear, lastYear, itemWidth, animateScrollTo]);

    // Edge markers: show "calculating..." while the window can still grow toward
    // an edge; flip to the end label once the hard life-span bound is reached.
    const atStart = minYear != null && firstYear <= minYear;
    const atEnd = maxYear != null && lastYear >= maxYear;

    return (
        <div className="growth-carousel" ref={containerRef}>
            <div className="growth-carousel-stage">
                <div className="growth-carousel-track" ref={trackRef}>
                    <div
                        className="growth-edge-marker"
                        style={{ width: cardWidth, marginRight: cardGap }}
                        aria-hidden="true"
                    >
                        {atStart ? 'début' : 'calculating...'}
                    </div>
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
                                            cardId={ArcanaIdentities[arcana]}
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
                    <div
                        className="growth-edge-marker"
                        style={{ width: cardWidth, marginRight: cardGap }}
                        aria-hidden="true"
                    >
                        {atEnd ? 'morte' : 'calculating...'}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default GrowthCarousel;
