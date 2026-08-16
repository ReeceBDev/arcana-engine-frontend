import { useEffect, useRef, useState } from 'react';
import './LiveAstroTimeline.css';
import { PLANET_GLYPH, ZODIAC_GLYPH } from '../../constants/data/correspondence-types';
import type { AstroEvent, IconMode } from '../../utilities/astro/types';
import { AHEAD_MS, BEHIND_MS, LIVE_BAND_MS, formatChartDay, formatChartWhen } from '../../utilities/astro/live';

/**
 * The right-to-left drifting astrology timeline.
 *
 * Events (ingresses + stations) enter from the right and drift left as `now`
 * advances (the parent ticks `now` every second and positions are derived from
 * it, so the 1s linear CSS transition yields continuous motion). The "now"
 * band — two gold lines either side of now — marks events as LIVE.
 *
 * Icon modes: 'planet' (planet glyph), 'zodiac' (sign glyph with breathing
 * room), 'super' (planet glyph with the sign glyph superimposed).
 */

const NOW_FRACTION = 0.23;
const LABEL_LANES = 3;
const LABEL_WIDTH = 104;
const LANE_GAP = 10;
const LANE_STEP = 26;
const FIRST_LANE_TOP = 8;
/** Horizontal tracks the nodes ride on (was a single baseline). */
const TRACKS = 3;
/** Min horizontal px between nodes sharing a track (>= max node width). */
const TRACK_GAP_X = 56;
/** Px reserved at the chart bottom for the day labels. */
const DAY_STRIP = 26;
/** Label lanes occupy the top this many px; node tracks live below it. */
const LABEL_ZONE_BOTTOM = 78;

export default function LiveAstroTimeline({ events, now, iconMode }: {
    events: AstroEvent[];
    now: number;
    iconMode: IconMode;
}) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(640);
    const [height, setHeight] = useState(280);
    // False until the chart's real geometry has been applied (and the quick
    // settle transition finished) — drives the `.settling` drift override.
    const [settled, setSettled] = useState(false);
    const settledRef = useRef(false);

    useEffect(() => {
        if (!chartRef.current) return;
        const observer = new ResizeObserver(entries => {
            setWidth(entries[0].contentRect.width);
            setHeight(entries[0].contentRect.height);
            if (!settledRef.current) {
                settledRef.current = true;
                window.setTimeout(() => setSettled(true), 300);
            }
        });
        observer.observe(chartRef.current);
        return () => observer.disconnect();
    }, []);

    const pxPerMs = width / (BEHIND_MS + AHEAD_MS);
    const xFor = (t: number) => NOW_FRACTION * width + (t - now) * pxPerMs;

    const visible = events
        .map(e => ({ e, t: Date.parse(e.time) }))
        .filter(v => !Number.isNaN(v.t)
            && v.t >= now - BEHIND_MS - LIVE_BAND_MS
            && v.t <= now + AHEAD_MS + LIVE_BAND_MS)
        .sort((a, b) => a.t - b.t);

    // Greedy lane assignment (x-ordered) so time labels never collide, plus a
    // second greedy pass spreading nodes across the horizontal tracks so
    // neighbouring events never overlap.
    const nowX = xFor(now);
    const laneEnds = new Array<number>(LABEL_LANES).fill(-Infinity);
    const trackEnds = new Array<number>(TRACKS).fill(-Infinity);
    const laid = visible.map(v => {
        const x = xFor(v.t);
        let lane = laneEnds.findIndex(end => end + LANE_GAP < x - LABEL_WIDTH / 2);
        if (lane === -1) lane = 0;
        laneEnds[lane] = Math.max(laneEnds[lane], x + LABEL_WIDTH / 2);
        let track = trackEnds.findIndex(end => end + TRACK_GAP_X < x);
        if (track === -1) track = trackEnds.indexOf(Math.min(...trackEnds));
        trackEnds[track] = x;
        return { ...v, x, lane, track };
    });

    // Track y-positions: centres evenly spaced through the zone between the
    // label lanes and the day strip.
    const zoneHeight = Math.max(height - DAY_STRIP - LABEL_ZONE_BOTTOM, TRACKS * 40);
    const trackBottom = (track: number) => DAY_STRIP + (zoneHeight * (track + 0.5)) / TRACKS;

    // Day boundaries: local midnights inside the window; each label sits at
    // the noon of its day (centre of the segment). Labels too close to the
    // NOW marker or off-screen are dropped, the boundary line remains.
    const dayMarks: { x: number; labelX: number | null; label: string }[] = [];
    const cursor = new Date(now - BEHIND_MS);
    cursor.setHours(0, 0, 0, 0);
    for (; cursor.getTime() <= now + AHEAD_MS; cursor.setDate(cursor.getDate() + 1)) {
        const x = xFor(cursor.getTime());
        if (x < -40 || x > width + 40) continue;
        const labelX = xFor(cursor.getTime() + 12 * 3_600_000);
        const clash = labelX < 8 || labelX > width - 8 || Math.abs(labelX - nowX) < 56;
        dayMarks.push({ x, labelX: clash ? null : labelX, label: formatChartDay(cursor) });
    }

    const bandX = xFor(now - LIVE_BAND_MS);
    const bandW = 2 * LIVE_BAND_MS * pxPerMs;

    return (
        <div className={`live-astro-timeline mode-${iconMode}${settled ? '' : ' settling'}`} ref={chartRef}>
            <div className="lat-chart">
                {/* now band (behind everything) */}
                <div
                    className="lat-band"
                    style={{ transform: `translateX(${bandX}px)`, width: `${bandW}px` }}
                />
                {/* day boundaries — local midnights drifting with the window */}
                {dayMarks.map(d => (
                    <div
                        key={`day-${d.label}`}
                        className="lat-day-line"
                        style={{ transform: `translateX(${d.x}px)` }}
                    />
                ))}
                <div className="lat-band-line lat-band-edge" style={{ transform: `translateX(${bandX}px)` }} />
                <div className="lat-band-line lat-band-edge" style={{ transform: `translateX(${bandX + bandW}px)` }} />
                <div className="lat-band-line lat-now-line" style={{ transform: `translateX(${nowX}px)` }} />
                <div className="lat-now-label" style={{ transform: `translateX(${nowX}px)` }}>NOW</div>

                {/* horizontal tracks */}
                {Array.from({ length: TRACKS }, (_, i) => (
                    <div key={`track-${i}`} className="lat-track" style={{ bottom: trackBottom(i) }} />
                ))}

                {/* day labels underneath */}
                {dayMarks.map(d => d.labelX !== null && (
                    <div
                        key={`daylabel-${d.label}`}
                        className="lat-day-label"
                        style={{ transform: `translateX(${d.labelX}px)` }}
                    >
                        {d.label}
                    </div>
                ))}

                {/* leader lines — beneath the nodes by z-order, per spec */}
                {laid.map(({ e, x, lane, track }) => (
                    <div
                        key={`line-${e.id}`}
                        className="lat-leader"
                        style={{ transform: `translateX(${x}px)`, top: FIRST_LANE_TOP + lane * LANE_STEP + 17, bottom: trackBottom(track) }}
                    />
                ))}

                {/* nodes */}
                {laid.map(({ e, x, track }) => {
                    const live = Math.abs(Date.parse(e.time) - now) <= LIVE_BAND_MS;
                    return (
                        <div
                            key={`node-${e.id}`}
                            className={`lat-node${live ? ' live' : ''}`}
                            style={{ transform: `translateX(${x}px)`, bottom: trackBottom(track) }}
                            title={describeQuick(e)}
                        >
                            {iconMode !== 'zodiac' && (
                                <span className="lat-node-glyph planet">{PLANET_GLYPH[e.planet] ?? '?'}{'\uFE0E'}</span>
                            )}
                            {(iconMode === 'zodiac' || iconMode === 'super') && (
                                <span className={`lat-node-glyph ${iconMode === 'super' ? 'overlay' : 'zodiac'}`}>
                                    {ZODIAC_GLYPH[e.sign] ?? '?'}{'\uFE0E'}
                                </span>
                            )}
                            {e.kind === 'station' && (
                                <span className="lat-badge">{e.direction === 'retrograde' ? 'R' : 'D'}</span>
                            )}
                        </div>
                    );
                })}

                {/* time labels in free space above the graph */}
                {laid.map(({ e, x, lane }) => (
                    <div
                        key={`label-${e.id}`}
                        className="lat-label"
                        style={{ transform: `translateX(${x}px)`, top: FIRST_LANE_TOP + lane * LANE_STEP }}
                    >
                        {formatChartWhen(e.time)}
                    </div>
                ))}
            </div>
        </div>
    );
}

function describeQuick(e: AstroEvent): string {
    if (e.kind === 'ingress') return `${e.planet} enters ${e.sign}`;
    return `${e.planet} stations ${e.direction === 'retrograde' ? 'retrograde' : 'direct'} in ${e.sign}`;
}
