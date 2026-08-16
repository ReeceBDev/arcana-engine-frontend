import type { AspectInfo, AstroEvent, LiveAstroData, Placement, PlanetId, ZodiacSign } from './types';

/**
 * Demo data for the Live Astrology page.
 *
 * Used only while the backend `GET /astro/live` endpoint is pending. All times
 * are computed relative to `now` so the chart always has live-band hits, past
 * events and future events to display. Values are plausible for mid-August
 * 2026 but are NOT real ephemeris output — the page shows a demo badge while
 * this dataset is in use.
 */

const HOUR = 3_600_000;

export function buildDemoLiveAstro(now: number): LiveAstroData {
    const at = (hours: number) => new Date(now + hours * HOUR).toISOString();

    const placements: Placement[] = [
        placement('Sun', 'Leo', 9.2, 0.99, -9 * 24, 6 * 24, 9 * 24, at),
        placement('Moon', 'Scorpio', 8.4, 13.2, -30, 13, 34, at),
        placement('Mercury', 'Virgo', 12.6, -0.4, -16 * 24, null, 26, at),
        placement('Venus', 'Cancer', 27.1, 1.1, -12 * 24, -8 * 24, 1.5, at),
        placement('Mars', 'Gemini', 3.5, 0.55, -11 * 24, 4 * 24, 80, at),
        placement('Jupiter', 'Cancer', 18.0, 0.21, -40 * 24, -20 * 24, 55 * 24, at),
        placement('Saturn', 'Aries', 22.3, -0.08, -95 * 24, -30 * 24, 90, at),
        placement('Uranus', 'Gemini', 8.1, -0.05, -120 * 24, -20 / 24, 400, at),
        placement('Neptune', 'Pisces', 5.4, -0.04, -200 * 24, -60 * 24, 700, at),
        placement('Pluto', 'Aquarius', 1.2, -0.03, -300 * 24, -100 * 24, 900, at),
    ];

    const events: AstroEvent[] = [
        event('ingress', 'Moon', 'Scorpio', undefined, -30, 13, 34, at),
        event('station', 'Uranus', 'Gemini', 'direct', -20, 200, 400, at),
        event('station', 'Mercury', 'Virgo', 'direct', -1, 200, 400, at),
        event('ingress', 'Venus', 'Leo', undefined, 1.5, 35 * 24, 62 * 24, at),
        event('ingress', 'Moon', 'Sagittarius', undefined, 34, 47, 108, at),
        event('ingress', 'Mars', 'Taurus', undefined, 80, 30 * 24, 60 * 24, at),
        event('station', 'Saturn', 'Aries', 'direct', 90, 300, 500, at),
        event('ingress', 'Moon', 'Capricorn', undefined, 108, 121, 196, at),
        event('ingress', 'Jupiter', 'Leo', undefined, 55 * 24, 85 * 24, 115 * 24, at),
        // Far-future events exercise the window filter (5d window drops these).
        event('ingress', 'Sun', 'Virgo', undefined, 9 * 24, 24 * 24, 37 * 24, at),
    ];

    const aspects: AspectInfo[] = [
        aspect('Moon', 'Scorpio', 'Sun', 'Leo', 'trine', 2.4, true, -20, 6, 14, at),
        aspect('Mercury', 'Virgo', 'Jupiter', 'Cancer', 'sextile', 1.8, false, -48, -10, 36, at),
        aspect('Venus', 'Cancer', 'Uranus', 'Gemini', 'square', 3.1, true, -24, 72, 144, at),
        // Never perfects — null peaksAt exercises the fallback wording.
        aspect('Mars', 'Gemini', 'Saturn', 'Aries', 'sextile', 0.9, false, -60, null, 30, at),
    ];

    return { fetchedAt: new Date(now).toISOString(), placements, events, aspects };
}

/** Placement from hour offsets (peaks may be null or past for slow/retro bodies). */
function placement(
    planet: PlanetId,
    sign: ZodiacSign,
    degreeInSign: number,
    speed: number,
    startedHours: number,
    peaksHours: number | null,
    stopsHours: number,
    at: (hours: number) => string,
): Placement {
    return {
        planet,
        sign,
        degreeInSign,
        speed,
        retrograde: speed < 0,
        startedAt: at(startedHours),
        peaksAt: peaksHours == null ? null : at(peaksHours),
        stopsAt: at(stopsHours),
    };
}

function event(
    kind: 'ingress' | 'station',
    planet: PlanetId,
    sign: ZodiacSign,
    direction: 'retrograde' | 'direct' | undefined,
    startedHours: number,
    peaksHours: number | null,
    stopsHours: number,
    at: (hours: number) => string,
): AstroEvent {
    return {
        id: `${kind}-${planet}-${sign}-${at(startedHours)}`,
        kind,
        planet,
        sign,
        direction,
        time: at(startedHours),
        startedAt: at(startedHours),
        peaksAt: peaksHours == null ? null : at(peaksHours),
        stopsAt: at(stopsHours),
    };
}

function aspect(
    planetA: PlanetId,
    signA: ZodiacSign,
    planetB: PlanetId,
    signB: ZodiacSign,
    aspectName: AspectInfo['aspect'],
    orbDeg: number,
    applying: boolean,
    startedHours: number,
    peaksHours: number | null,
    stopsHours: number,
    at: (hours: number) => string,
): AspectInfo {
    return {
        planetA,
        signA,
        planetB,
        signB,
        aspect: aspectName,
        orbDeg,
        applying,
        startedAt: at(startedHours),
        peaksAt: peaksHours == null ? null : at(peaksHours),
        stopsAt: at(stopsHours),
    };
}
