import { THOTH_BACKEND_API } from "../../config";
import { CARD_ROLES, type CardRole } from "./constants/card-roles";
import type { CardData } from "../types/card-data";
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
 * Full reading: date, time and timezoneOffset are folded into a single
 * ISO-8601 `birthIso` string at the API boundary (e.g. `2000-05-15T13:30:00+01:00`),
 * which the C# backend parses via `DateTimeOffset.Parse`. Latitude/longitude
 * are the birthplace coordinates (resolved client-side from the selected city).
 */
export async function fetchFullReading(birthIso: string, name: string, latitude: number, longitude: number) {
    console.debug("API: fetchFullReading request:", { birthIso, name, latitude, longitude });
    const response = await fetch(`${THOTH_BACKEND_API}/reading/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthIso, name, latitude, longitude })
    });
    const data = await response.json();
    console.debug("API: Full reading:", data);
    return data;
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