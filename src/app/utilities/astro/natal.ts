import type { CardData } from '../../../types/card-data';
import type { ZodiacSign } from './types';

export type { ZodiacSign } from './types';

/**
 * Full-reading (natal) data contract.
 *
 * These types describe the payload of `POST /reading/full` on the Thoth
 * backend (Swiss Ephemeris). The endpoint collects what only the full
 * workflow gathers — birth date, exact time, and birthplace — so screens
 * backed by other endpoints can never show these collections.
 *
 * Semantics (do not fight these):
 * - Whole-sign ("fixed") houses per Crowley — deliberately NOT Placidus.
 *   One full sign per house; signs start from the Ascendant's sign and
 *   ascend in zodiac order, wrapping.
 * - The backend's `degree` field is always 0 (whole-sign cusps sit on sign
 *   boundaries) and is intentionally DROPPED here — never render it or build
 *   UI implying mid-sign cusps.
 * - `houses[0]` is NOT the Ascendant card. The degree-accurate ascendant
 *   lives in `correspondences` under role `RisingSun`; house 1 is sign-level.
 *   Drive any ascendant marker from correspondences, not from houses.
 * - Distinguish house entries and correspondence entries by `house`/`role`
 *   fields — NEVER by array position (the collections can grow).
 */

/** The classical bodies reported in `correspondences` (8 roles; Mars restored 2026-08-18). */
export type PlanetRole =
    | 'ZodiacalSun'
    | 'RisingSun'
    | 'Moon'
    | 'Mercury'
    | 'Venus'
    | 'Mars'
    | 'Jupiter'
    | 'Saturn';

/** Zodiac order from Aries — also the natural-house order (house N = index N-1). */
export const ZODIAC_ORDER: readonly ZodiacSign[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export function isZodiacSign(value: unknown): value is ZodiacSign {
    return typeof value === 'string' && (ZODIAC_ORDER as readonly string[]).includes(value);
}

export function isPlanetRole(value: unknown): value is PlanetRole {
    return typeof value === 'string' && [
        'ZodiacalSun', 'RisingSun', 'Moon', 'Mercury',
        'Venus', 'Mars', 'Jupiter', 'Saturn',
    ].includes(value);
}

/** One whole-sign house of the natal chart. */
export type NatalHouse = {
    /** 1-12, always ordered 1 -> 12 after mapping. */
    house: number;
    /** Sign on the cusp (the sign that fills this whole-sign house). */
    sign: ZodiacSign;
    /** Major Arcana card of the cusp sign. */
    zodiac: CardData;
    /** Decan card for the cusp. */
    decan: CardData;
    /** Court card for the cusp. */
    court: CardData;
};

/** One classical body's card triple from `correspondences`. */
export type NatalCorrespondence = {
    role: PlanetRole;
    zodiac: CardData;
    decan: CardData;
    court: CardData;
};

/** The natal portions of the `POST /reading/full` response. */
export type FullReading = {
    houses: NatalHouse[];
    correspondences: NatalCorrespondence[];
};

/** Lifecycle of the App-level full-reading fetch. */
export type FullReadingStatus = 'idle' | 'loading' | 'ready' | 'error';
