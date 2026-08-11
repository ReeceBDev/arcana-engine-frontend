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

export async function fetchNameReading(birthDate: string, name: string) {
    console.debug("API: fetchNameReading request:", { birthDate, name });
    const response = await fetch(`${THOTH_BACKEND_API}/reading/name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, name })
    });
    const data = await response.json();
    const normalizedCards: CardData[] = (data.nameCards ?? [])
        .map(normalizeCardData)
        .filter((card: CardData | null): card is CardData => card != null);
    console.debug("API: Name reading:", data, "normalized:", normalizedCards);
    return { ...data, cards: normalizedCards };
}

export async function fetchFullReading(birthDate: string, name: string, birthTime: string, latitude: number, longitude: number) {
    console.debug("API: fetchFullReading request:", { birthDate, name, birthTime, latitude, longitude });
    const response = await fetch(`${THOTH_BACKEND_API}/reading/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, name, birthTime, latitude, longitude })
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