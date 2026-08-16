/**
 * Growth-card computation — fully client-side.
 *
 * The backend's growth-card number for a given (birthDate, targetYear) follows
 * the numerology "personal year number" rule, verified empirically against the
 * backend (8/8 sample points matched):
 *
 *      number = reduce(month + day + year)
 *
 * where `reduce` repeatedly sums the decimal digits until the running total is
 * <= 22, then maps 22 → 0 (The Fool). Concretely:
 *
 *   - Sum month + day + year into one integer `total`.
 *   - Repeatedly sum its digits while the running sum > 22.
 *   - If the final sum is 22, it represents 0 (The Fool). Otherwise the sum is
 *     the major-arcana index 0–21.
 *
 * Because this is a pure function of (birthDate, year), we only ever need ONE
 * backend growth query (to seed/confirm) — every adjacent year is computed in
 * JS. That lets the growth-card carousel grow infinitely without extra network
 * calls: slide past an edge → compute the next year's card locally → spawn it.
 */

import { ARCANA_BY_NUMBER } from '../constants/data/arcana-numbers';
import type { ArcanaIdentity, ArcanaIdentityIndex } from '../constants/arcana-identities';
import type { CardData } from '../../types/card-data';

/** Sum the decimal digits of a non-negative integer once. e.g. 2047 → 13. */
function sumDigits(n: number): number {
    let s = 0;
    // Use string iteration for clarity; numbers here are small (<= ~9999).
    for (const ch of Math.abs(Math.trunc(n)).toString()) {
        s += ch.charCodeAt(0) - 48; // '0' is 48
    }
    return s;
}

/**
 * Reduce `total` per the growth-card rule: sum digits while > 22, then 22 → 0.
 * Returns a major-arcana index in the range 0–21.
 */
export function reduceGrowthTotal(total: number): number {
    let n = total;
    // Repeatedly sum digits until <= 22. e.g. 1999 → 28 → 10.
    while (n > 22) {
        n = sumDigits(n);
    }
    // 22 is The Fool (0). Everything else is already 0–21.
    return n === 22 ? 0 : n;
}

/** Parse an ISO birthDate (YYYY-MM-DD) into {month, day}, or null if unparseable. */
export function parseBirthDate(birthDate: string): { month: number; day: number } | null {
    if (!birthDate) return null;
    const parts = birthDate.split('-');
    if (parts.length < 3) return null;
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!Number.isFinite(month) || !Number.isFinite(day)) return null;
    return { month, day };
}

/**
 * Compute the major-arcana index for a growth card on a given target year.
 * Pure + deterministic — no I/O. Returns null if birthDate is unparseable.
 *
 * Example (birthDate 1990-06-15, year 2026):
 *   month+day+year = 6+15+2026 = 2047 → 2+0+4+7 = 13 → DEATH
 */
export function growthArcanaIndex(birthDate: string, year: number): ArcanaIdentityIndex | null {
    const md = parseBirthDate(birthDate);
    if (!md) return null;
    const total = md.month + md.day + year;
    const idx = reduceGrowthTotal(total);
    // Only 0–21 are valid major-arcana indices; confirm the lookup exists.
    return idx in ARCANA_BY_NUMBER ? (idx as ArcanaIdentityIndex) : null;
}

/** Resolve the arcana identity string for a growth year, or null. */
export function growthArcanaIdentity(birthDate: string, year: number): ArcanaIdentity | null {
    const idx = growthArcanaIndex(birthDate, year);
    return idx != null ? (ARCANA_BY_NUMBER[idx] ?? null) : null;
}

/** Number of prior-year growth cards fanned behind the current year's card. */
const PREVIEW_FILLER_YEARS = 4;

/**
 * Build a growth-card preview set for the PractitionerView: the current
 * calendar year's growth card as the face, plus a few prior-year growth cards
 * behind it to drive the CardSplay fan. Growth cards are unlimited (one per
 * year), so the fillers are simply the immediately preceding years — rendered
 * face-down by CardSplay, they exist only to make the splay animation fire.
 *
 * The current year is placed LAST (it is the face card; PractitionerView shows
 * the last card). Returns [] when birthDate is empty or unparseable.
 */
export function buildGrowthPreviewCards(birthDate: string): CardData[] {
    if (!birthDate) return [];
    const currentYear = new Date().getFullYear();
    const cards: CardData[] = [];
    for (let year = currentYear - PREVIEW_FILLER_YEARS; year <= currentYear; year++) {
        const card = growthArcanaIdentity(birthDate, year);
        if (card) cards.push({ role: 'GrowthCard', card });
    }
    return cards;
}
