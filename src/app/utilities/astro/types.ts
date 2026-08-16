/**
 * Live Astrology data contract.
 *
 * These types describe the payload of `GET /astro/live?from=<ISO>&to=<ISO>`
 * on the Thoth backend (Swiss Ephemeris). The backend endpoint is owned
 * server-side; the frontend consumes this shape and falls back to demo data
 * (see ./demo-data.ts) until the endpoint is available.
 *
 * All timestamps are ISO-8601 strings with offset (e.g. `2026-08-14T13:30:00+01:00`).
 */

/** The ten classical bodies tracked on the timeline. */
export type PlanetId =
    | 'Sun'
    | 'Moon'
    | 'Mercury'
    | 'Venus'
    | 'Mars'
    | 'Jupiter'
    | 'Saturn'
    | 'Uranus'
    | 'Neptune'
    | 'Pluto';

/** Tropical zodiac signs, Aries = 0° ecliptic. */
export type ZodiacSign =
    | 'Aries'
    | 'Taurus'
    | 'Gemini'
    | 'Cancer'
    | 'Leo'
    | 'Virgo'
    | 'Libra'
    | 'Scorpio'
    | 'Sagittarius'
    | 'Capricorn'
    | 'Aquarius'
    | 'Pisces';

/** How planet nodes are drawn on the timeline chart. */
export type IconMode = 'planet' | 'zodiac' | 'super';

/**
 * The triple shown next to every text row, in the user's fixed order:
 * peaks → stops → started.
 *
 * Semantics depend on the row kind:
 * - placement: peaks = crosses 15° (mid-sign), stops = leaves the sign, started = entered the sign.
 * - aspect:    peaks = exact perfection (may be null if it never perfects), stops = leaves orb, started = entered orb.
 */
export type Span = {
    peaksAt: string | null;
    stopsAt: string;
    startedAt: string;
};

/** Where a planet currently is, plus its full span through the sign. */
export type Placement = Span & {
    planet: PlanetId;
    sign: ZodiacSign;
    /** Longitude within the sign, 0–30. */
    degreeInSign: number;
    /** Apparent geocentric speed in ecliptic longitude, deg/day. Negative = retrograde. */
    speed: number;
    /** Convenience flag: speed < 0. */
    retrograde: boolean;
};

/** A discrete moment on the timeline chart. Also carries a text-row span:
 * - ingress: peaks = crosses 15° of the new sign, stops = leaves it, started = the ingress itself.
 * - station retrograde: peaks = retrograde arc midpoint, stops = station direct, started = the station itself. */
export type AstroEvent = Span & {
    /** Stable identity for React keys, e.g. `ingress-venus-leo-2026-08-15T04:00:00Z`. */
    id: string;
    kind: 'ingress' | 'station';
    planet: PlanetId;
    /** Sign the event occurs in: the new sign for an ingress, the sign of the station otherwise. */
    sign: ZodiacSign;
    /** Station direction; ingress events omit this. */
    direction?: 'retrograde' | 'direct';
    /** When the event happens (the moment plotted on the chart). */
    time: string;
};

export type AspectName = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

/** A pair of planets currently within orb of an aspect. */
export type AspectInfo = Span & {
    planetA: PlanetId;
    signA: ZodiacSign;
    planetB: PlanetId;
    signB: ZodiacSign;
    aspect: AspectName;
    /** |separation − exact angle| in degrees. */
    orbDeg: number;
    /** True when the aspect grows more exact over time. */
    applying: boolean;
};

/** Full `GET /astro/live` response. */
export type LiveAstroData = {
    /** Server clock at computation time. */
    fetchedAt: string;
    /** Current placements for all ten bodies. */
    placements: Placement[];
    /** Ingresses + stations within the requested [from, to] window. */
    events: AstroEvent[];
    /** Aspects currently within orb (whether applying or separating). */
    aspects: AspectInfo[];
};
