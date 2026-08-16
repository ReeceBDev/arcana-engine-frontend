import { fetchLiveAstro } from '../../api';
import { buildDemoLiveAstro } from './demo-data';
import type { AspectInfo, AspectName, AstroEvent, LiveAstroData, Placement, Span, ZodiacSign } from './types';
import { PLANET_GLYPH, ZODIAC_GLYPH } from '../../constants/data/correspondence-types';

/* ------------------------------------------------------------------ */
/* Timeline window constants (single source of truth for chart + api) */
/* ------------------------------------------------------------------ */

/** How far behind `now` the chart reaches. */
export const BEHIND_MS = 1.5 * 86_400_000;
/** How far ahead of `now` the chart reaches. */
export const AHEAD_MS = 5 * 86_400_000;
/** Half-width of the "now" band: events within ±LIVE_BAND_MS of now are live. */
export const LIVE_BAND_MS = 2 * 3_600_000;

/* ------------------------------------------------------------------ */
/* Loading (real endpoint first, demo fallback while it is pending)   */
/* ------------------------------------------------------------------ */

export type LoadedLiveAstro = { data: LiveAstroData; isDemo: boolean };

export async function loadLiveAstro(now = Date.now()): Promise<LoadedLiveAstro> {
    const from = new Date(now - BEHIND_MS).toISOString();
    const to = new Date(now + AHEAD_MS).toISOString();
    try {
        const data = await fetchLiveAstro(from, to) as LiveAstroData;
        if (!data || !Array.isArray(data.placements) || !Array.isArray(data.events) || !Array.isArray(data.aspects)) {
            throw new Error('malformed /astro/live payload');
        }
        return { data, isDemo: false };
    } catch (err) {
        console.warn('Live Astrology: /astro/live unavailable, using demo data.', err);
        return { data: buildDemoLiveAstro(now), isDemo: true };
    }
}

/** A timestamp is LIVE while it sits inside the now band (either side of now). */
export function isTimeLive(timeIso: string, now: number): boolean {
    const t = Date.parse(timeIso);
    return !Number.isNaN(t) && Math.abs(t - now) <= LIVE_BAND_MS;
}

/** An event is LIVE while its time sits inside the now band (either side of now). */
export function isEventLive(event: AstroEvent, now: number): boolean {
    return isTimeLive(event.time, now);
}

/* ------------------------------------------------------------------ */
/* Glyphs (reuse the app-wide Unicode maps; FE0E forces text render)  */
/* ------------------------------------------------------------------ */

export const planetGlyph = (planet: string) => (PLANET_GLYPH[planet] ?? '?') + '\uFE0E';
export const signGlyph = (sign: ZodiacSign) => (ZODIAC_GLYPH[sign] ?? '?') + '\uFE0E';

export const ASPECT_GLYPH: Record<AspectName, string> = {
    conjunction: '\u260C\uFE0E', // ☌
    sextile: '\u27B9\uFE0E',     // ⚹
    square: '\u25A1\uFE0E',      // □
    trine: '\u25B3\uFE0E',       // △
    opposition: '\u260D\uFE0E',  // ☍
};

/* ------------------------------------------------------------------ */
/* Sentence builders for the text sections                            */
/* ------------------------------------------------------------------ */

export function describeEvent(e: AstroEvent): string {
    if (e.kind === 'ingress') return `${e.planet} enters ${e.sign}`;
    return `${e.planet} stations ${e.direction === 'retrograde' ? 'retrograde' : 'direct'} in ${e.sign}`;
}

export function describePlacement(p: Placement): string {
    return `${p.planet} in ${p.sign} \u00B7 ${p.degreeInSign.toFixed(1)}\u00B0 \u00B7 ${p.retrograde ? 'retrograde' : 'direct'}`;
}

export function describeAspect(a: AspectInfo): string {
    return `${a.planetA} ${a.aspect} ${a.planetB} \u00B7 ${a.orbDeg.toFixed(1)}\u00B0 orb \u00B7 ${a.applying ? 'applying' : 'separating'}`;
}

/* ------------------------------------------------------------------ */
/* Time formatting                                                    */
/* ------------------------------------------------------------------ */

/**
 * Human-readable moment, always relative ("in 3h" / "2d ago") — the absolute
 * date/time is carried separately by the stacked span columns.
 */
export function formatWhen(iso: string, now: number): string {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return '\u2014';
    const diffMs = t - now;
    if (Math.abs(diffMs) < 60_000) return 'now';
    const absMin = Math.abs(diffMs) / 60_000;
    let amount: number;
    let unit: string;
    if (absMin < 60) {
        amount = Math.round(absMin);
        unit = 'm';
    } else if (absMin < 60 * 48) {
        amount = Math.round(absMin / 60);
        unit = 'h';
    } else if (absMin < 60 * 24 * 14) {
        amount = Math.round(absMin / 1_440);
        unit = 'd';
    } else if (absMin < 60 * 24 * 70) {
        amount = Math.round(absMin / 10_080);
        unit = 'w';
    } else if (absMin < 60 * 24 * 365) {
        amount = Math.round(absMin / 43_200);
        unit = 'mo';
    } else {
        amount = Math.round(absMin / 525_600);
        unit = 'y';
    }
    return diffMs < 0 ? `${amount}${unit} ago` : `in ${amount}${unit}`;
}

/** Absolute date/time split for the stacked span columns, e.g. "15 Aug" + "14:00". */
export function splitAbsolute(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: '\u2014', time: '\u2014' };
    return {
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
}

/** Compact absolute local date-time, e.g. "15 Aug 14:00". */
export function formatAbsolute(iso: string): string {
    const { date, time } = splitAbsolute(iso);
    return `${date} ${time}`;
}

/** Short label for chart leader lines — always absolute so the x-position reads as a clock. */
export const formatChartWhen = formatAbsolute;

/** Short day label for the chart's day strip, e.g. "Fri 15". */
export function formatChartDay(d: Date): string {
    const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const day = d.toLocaleDateString('en-GB', { day: 'numeric' });
    return `${weekday} ${day}`;
}

/** One stacked column of the span block: tense-aware verb + relative time, date above time. */
export type SpanEntry = {
    key: 'peaks' | 'ends' | 'begins';
    label: string;
    date?: string;
    time?: string;
};

function spanPoint(key: SpanEntry['key'], present: string, past: string, iso: string, now: number): SpanEntry {
    const verb = Date.parse(iso) < now ? past : present;
    const { date, time } = splitAbsolute(iso);
    return { key, label: `${verb} ${formatWhen(iso, now)}`, date, time };
}

/**
 * The span triple shown by every text row, in the user's fixed order:
 * peaks → ends → begins. Verbs are tense-aware ("begins in 1h" for the
 * future, "began 2h ago" for the past). Null peaks (aspect never perfects)
 * degrade to an explicit "does not perfect" note without date/time.
 */
export function spanEntries(span: Span, now: number): SpanEntry[] {
    return [
        span.peaksAt
            ? spanPoint('peaks', 'peaks', 'peaked', span.peaksAt, now)
            : { key: 'peaks', label: 'does not perfect' },
        spanPoint('ends', 'ends', 'ended', span.stopsAt, now),
        spanPoint('begins', 'begins', 'began', span.startedAt, now),
    ];
}
