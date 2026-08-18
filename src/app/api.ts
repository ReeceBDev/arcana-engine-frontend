import { THOTH_BACKEND_API } from "../../config";
import { CARD_ROLES, type CardRole } from "./constants/card-roles";
import type { CardData } from "../types/card-data";
import { isPlanetRole, isZodiacSign, type FullReading, type NatalCorrespondence, type NatalHouse } from "./utilities/astro/natal";
import { getArcanaByNumber, getArcanaBySuit, type SuitId } from "./constants/data/arcana-numbers";
import { ArcanaIdentities, type ArcanaIdentity, type ArcanaIdentityIndex } from "./constants/arcana-identities";

export async function fetchBirthdateReading(birthDate: string) {
    const res = await fetch(`${THOTH_BACKEND_API}/reading/birthdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate })
    });

    const data = await res.json();
    return mapBirthdateReading(data);
}

/** Thrown when the backend rejects a name as unconvertible to Hebrew gematria
 *  (HTTP 422 + `invalidNameError`). The backend's text is developer-facing API
 *  guidance — the UI shows its own practitioner-facing instructions instead. */
export class NameRejectionError extends Error {
    /** The backend's developer-facing guidance (logged, never shown to practitioners). */
    readonly backendMessage: string;

    constructor(backendMessage: string) {
        super(backendMessage);
        this.name = 'NameRejectionError';
        this.backendMessage = backendMessage;
    }
}

export async function fetchNameReading(birthDate: string, name: string) {
    console.debug("API: fetchNameReading request:", { birthDate, name });
    const response = await fetch(`${THOTH_BACKEND_API}/reading/name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, name })
    });
    const data = await response.json();
    // Rejection (e.g. a name containing an unresolved letter 'C'): the backend
    // answers 422 with null cards + invalidNameError guidance. Without this
    // check the null cards flow through as an empty reading and the user is
    // navigated onto an empty name-card stack.
    if (!response.ok || data.invalidNameError) {
        throw new NameRejectionError(String(data.invalidNameError ?? `Name reading failed: ${response.status}`));
    }
    const normalizedCards: CardData[] = (data.nameCards ?? [])
        .map(normalizeCardData)
        .filter((card: CardData | null): card is CardData => card != null);
    console.debug("API: Name reading:", data, "normalized:", normalizedCards);
    return { ...data, cards: normalizedCards };
}

/**
 * Full reading: the backend takes the birth DATE and the folded ISO-8601
 * birth TIME-WITH-OFFSET as separate fields, plus the name and the
 * birthplace coordinates (resolved client-side from the selected city):
 *   { birthDate: "2000-05-15", birthTime: "2000-05-15T13:30:00+01:00", name, latitude, longitude }
 */
export async function fetchFullReading(birthDate: string, birthTimeIso: string, name: string, latitude: number, longitude: number): Promise<FullReading> {
    console.debug("API: fetchFullReading request:", { birthDate, birthTimeIso, name, latitude, longitude });
    const response = await fetch(`${THOTH_BACKEND_API}/reading/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime: birthTimeIso, name, latitude, longitude })
    });
    const data = await response.json();
    console.debug("API: Full reading:", data);
    // Rejection (e.g. a name containing an unresolved letter 'C'): the backend
    // answers 422 with null collections + invalidNameError guidance — surface
    // it via the same error type as the name reading so the UI can show the
    // K/Z guidance verbatim instead of an empty reading.
    if (data.invalidNameError || response.status === 422) {
        throw new NameRejectionError(String(data.invalidNameError ?? `Full reading rejected: ${response.status}`));
    }
    if (!response.ok) {
        throw new Error(`Full reading failed: ${response.status}${data?.detail ? ` — ${data.detail}` : ''}`);
    }
    return mapFullReading(data);
}

/** Normalize one zodiac/decan/court card payload; throws when unresolvable. */
function requireNatalCard(raw: any, context: string): CardData {
    const card = normalizeCardData(raw);
    if (!card) throw new Error(`Full reading: unresolvable ${context} card payload`);
    return card;
}

/**
 * Map the natal collections of a /reading/full response: exactly 12 houses
 * sorted by the `house` field (never trust array position), cards resolved
 * via the shared suit-aware normalizer, correspondences filtered by `role`
 * (never indexed by position — an 8th role appeared after Venus once).
 * The backend's whole-sign `degree` is always 0 and is dropped here.
 */
function mapFullReading(data: any): FullReading {
    const rawHouses: any[] = Array.isArray(data?.houses) ? data.houses : [];
    if (rawHouses.length !== 12) {
        throw new Error(`Full reading: expected 12 houses, got ${rawHouses.length}`);
    }
    const houses: NatalHouse[] = [...rawHouses]
        .sort((a, b) => (a?.house ?? 0) - (b?.house ?? 0))
        .map((h) => {
            if (!isZodiacSign(h?.sign)) {
                throw new Error(`Full reading: house ${h?.house} has unknown sign '${h?.sign}'`);
            }
            return {
                house: h.house,
                sign: h.sign,
                zodiac: requireNatalCard(h?.zodiac, `house ${h.house} zodiac`),
                decan: requireNatalCard(h?.decan, `house ${h.house} decan`),
                court: requireNatalCard(h?.court, `house ${h.house} court`),
            };
        });

    const correspondences: NatalCorrespondence[] = (Array.isArray(data?.correspondences) ? data.correspondences : [])
        .filter((c: any) => isPlanetRole(c?.role))
        .map((c: any) => ({
            role: c.role,
            zodiac: requireNatalCard(c?.zodiac, `${c.role} zodiac`),
            decan: requireNatalCard(c?.decan, `${c.role} decan`),
            court: requireNatalCard(c?.court, `${c.role} court`),
        }));

    return { houses, correspondences };
}

/** A single growth-card entry: the calendar year it applies to + its card. */
export type GrowthYearCard = {
    year: number;
    card: CardData | null;
};

export type GrowthReading = {
    targetYear: number;
    cards: GrowthYearCard[];
};

export async function fetchGrowthReading(birthDate: string, year: number, before?: number, after?: number): Promise<GrowthReading> {
    console.debug("API: fetchGrowthReading request:", { birthDate, year, before, after });
    const params = new URLSearchParams({ birthDate, year: year.toString() });
    if (before != null) params.append("before", before.toString());
    if (after != null) params.append("after", after.toString());

    const response = await fetch(`${THOTH_BACKEND_API}/reading/growth?${params.toString()}`);
    const data = await response.json();
    console.debug("API: Growth reading:", data);

    const cards: GrowthYearCard[] = Array.isArray(data.cards)
        ? data.cards.map((entry: any) => ({
            year: typeof entry?.year === "number" ? entry.year : Number(entry?.year),
            card: normalizeCardData(entry?.card ?? entry),
        }))
        : [];

    return {
        targetYear: typeof data.targetYear === "number" ? data.targetYear : year,
        cards,
    };
}

/**
 * Live Astrology timeline: current placements, upcoming/past ingresses and
 * stations within [from, to], and aspects currently within orb. Computed by
 * the backend via Swiss Ephemeris. Both params are ISO-8601 strings.
 */
export async function fetchLiveAstro(from: string, to: string) {
    console.debug("API: fetchLiveAstro request:", { from, to });
    const params = new URLSearchParams({ from, to });
    const response = await fetch(`${THOTH_BACKEND_API}/astro/live?${params.toString()}`);
    if (!response.ok) throw new Error(`Live astro request failed: ${response.status}`);
    const data = await response.json();
    console.debug("API: Live astro:", data);
    return data;
}

function mapBirthdateReading(data: any) {
    const personalityCards = data.personalityCards ?? [];
    const zodiacal = data.zodiacalSunCards ?? [];

    const personality = normalizeCardData(personalityCards.find((c: any) => c.role === "PersonalityCard")) ?? null;
    const explicitCharacter = normalizeCardData(personalityCards.find((c: any) => c.role === "CharacterCard"));
    // When the backend omits a CharacterCard, it has signalled that the character
    // cross-sum collapsed to the personality card. Relabel the second personality
    // card as the hybrid role so the frontend can present a merged description.
    const character = explicitCharacter
        ?? (personality ? { ...personality, role: 'HybridCharacterPersonalCard' as CardRole } : null);

    return {
        personalityCard: personality,
        characterCard: character,
        personalCourtCard: normalizeCardData(zodiacal.find((c: any) => c.role === "PersonalCourtCard")) ?? null,
        personalDecanCard: normalizeCardData(zodiacal.find((c: any) => c.role === "PersonalDecanCard")) ?? null,
        personalZodiacalCard: normalizeCardData(zodiacal.find((c: any) => c.role === "PersonalZodiacalCard")) ?? null,
        cuspWarning: !!data.cuspWarning,
        cuspWarningMessage: data.cuspWarningMessage ?? null
    };
}

function isCardRole(value: unknown): value is CardRole {
    return typeof value === "string" && (CARD_ROLES as readonly string[]).includes(value);
}

function isArcanaIdentity(value: unknown): value is ArcanaIdentity {
    return typeof value === "string" && value in ArcanaIdentities;
}

function resolveArcanaIdentityFromNumber(value: unknown): ArcanaIdentity | null {
    if (typeof value === "number") {
        return getArcanaByNumber(value as ArcanaIdentityIndex) ?? null;
    }
    if (isArcanaIdentity(value)) {
        return value;
    }
    return null;
}

function resolveSuitId(value: unknown): SuitId | null {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "cups") return "Cups";
        if (normalized === "disks" || normalized === "discs") return "Disks";
        if (normalized === "swords") return "Swords";
        if (normalized === "wands") return "Wands";
    }

    if (typeof value === "number") {
        if (value === 100 || value === 1) return "Cups";
        if (value === 200 || value === 2) return "Disks";
        if (value === 300 || value === 3) return "Swords";
        if (value === 400 || value === 4) return "Wands";
    }

    return null;
}

function normalizeCardData(raw: any): CardData | null {
    if (!raw || !isCardRole(raw.role)) {
        console.debug("API: Rejected card — unrecognised role:", raw?.role, raw);
        return null;
    }

    const suit = resolveSuitId(raw.suitId ?? raw.suit);
    const numberValue = typeof raw.number === "number" ? raw.number : raw.cardNumber;

    const card = resolveArcanaIdentityFromNumber(raw.card)
        ?? (typeof numberValue === "number" && suit ? getArcanaBySuit(suit, numberValue) ?? null : null)
        ?? resolveArcanaIdentityFromNumber(numberValue);

    if (!card) {
        console.debug("API: Unresolved card payload", raw);
        return null;
    }
    return { role: raw.role, card };
}