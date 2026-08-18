import { type ArcanaIdentityIndex, ArcanaIdentities } from '../arcana-identities';
import type { Element } from './arcana-elements';
import { ELEMENT_GLYPH, type Correspondence } from './correspondence-types';
import type { CardData } from '../../../types/card-data';
import { ZODIAC_ORDER, type NatalHouse, type ZodiacSign } from '../../utilities/astro/natal';

/**
 * The Astrological Houses reference data.
 *
 * Two layers, deliberately split:
 * - SIGN_ATTRIBUTIONS — keyed by zodiac sign: the Thoth Major Arcana card of
 *   the sign (standard Golden Dawn / Crowley correspondence) plus the sign's
 *   modality, yin-yang polarity, element, and alchemical operation. The chips
 *   under any house are derived from the CUSP SIGN, never from the house
 *   number (a Taurus-first native must not see Aries chips on house 1).
 * - HOUSE_MEANINGS — keyed by house number: the sign-agnostic name and
 *   description of each of the twelve houses.
 *
 * The page view model merges the two over the natal `houses` payload of
 * POST /reading/full (whole-sign, starting from the Ascendant's sign).
 * ASTROLOGICAL_HOUSES keeps the natural (1=Aries ... 12=Pisces) reference
 * order for any consumer without a natal chart.
 */

export type AstrologicalHouse = {
    /** 1-based house number (array index + 1). */
    number: number;
    /** Display name, e.g. "First House — Self". */
    name: string;
    /** Short description rendered beneath the card. */
    description: string;
    /** Major Arcana card of the house's cusp sign. */
    cardId: ArcanaIdentityIndex;
    /** Correspondence chips: modality, polarity, element, alchemical. */
    correspondences: Correspondence[];
};

/* ------------------------------------------------------------------ */
/* Chip builders — same terse style as arcana-correspondences.ts.      */
/* ------------------------------------------------------------------ */

function modality(label: string): Correspondence {
    return { kind: 'modality', label, sublabel: 'Modality' };
}

function polarity(label: 'Yin' | 'Yang'): Correspondence {
    return { kind: 'polarity', glyph: '☯', label, sublabel: 'Polarity' };
}

function element(el: Element): Correspondence {
    return {
        kind: 'element',
        glyph: ELEMENT_GLYPH[el],
        label: el[0].toUpperCase() + el.slice(1),
        sublabel: 'Element',
    };
}

function alchemical(operation: string): Correspondence {
    return { kind: 'alchemical', label: operation, sublabel: 'Alchemical' };
}

/* ------------------------------------------------------------------ */
/* Sign-keyed attributions (chips + Major card per zodiac sign).       */
/* ------------------------------------------------------------------ */

export type SignAttribution = {
    /** Thoth Major Arcana of the sign. */
    cardId: ArcanaIdentityIndex;
    modality: string;
    polarity: 'Yin' | 'Yang';
    element: Element;
    operation: string;
};

export const SIGN_ATTRIBUTIONS: Record<ZodiacSign, SignAttribution> = {
    Aries: { cardId: ArcanaIdentities.THE_EMPEROR, modality: 'Cardinal', polarity: 'Yang', element: 'fire', operation: 'Calcination' },
    Taurus: { cardId: ArcanaIdentities.THE_HIEROPHANT, modality: 'Fixed', polarity: 'Yin', element: 'earth', operation: 'Congelation' },
    Gemini: { cardId: ArcanaIdentities.THE_LOVERS, modality: 'Mutable', polarity: 'Yang', element: 'air', operation: 'Fixation' },
    Cancer: { cardId: ArcanaIdentities.THE_CHARIOT, modality: 'Cardinal', polarity: 'Yin', element: 'water', operation: 'Dissolution' },
    Leo: { cardId: ArcanaIdentities.LUST, modality: 'Fixed', polarity: 'Yang', element: 'fire', operation: 'Digestion' },
    Virgo: { cardId: ArcanaIdentities.THE_HERMIT, modality: 'Mutable', polarity: 'Yin', element: 'earth', operation: 'Distillation' },
    Libra: { cardId: ArcanaIdentities.ADJUSTMENT, modality: 'Cardinal', polarity: 'Yang', element: 'air', operation: 'Sublimation' },
    Scorpio: { cardId: ArcanaIdentities.DEATH, modality: 'Fixed', polarity: 'Yin', element: 'water', operation: 'Separation' },
    Sagittarius: { cardId: ArcanaIdentities.ART, modality: 'Mutable', polarity: 'Yang', element: 'fire', operation: 'Incineration' },
    Capricorn: { cardId: ArcanaIdentities.THE_DEVIL, modality: 'Cardinal', polarity: 'Yin', element: 'earth', operation: 'Fermentation' },
    Aquarius: { cardId: ArcanaIdentities.THE_STAR, modality: 'Fixed', polarity: 'Yang', element: 'air', operation: 'Multiplication' },
    Pisces: { cardId: ArcanaIdentities.THE_MOON, modality: 'Mutable', polarity: 'Yin', element: 'water', operation: 'Projection' },
};

/** The four chips of a cusp sign: modality, polarity, element, alchemical. */
export function chipsForSign(sign: ZodiacSign): Correspondence[] {
    const a = SIGN_ATTRIBUTIONS[sign];
    return [
        modality(a.modality),
        polarity(a.polarity),
        element(a.element),
        alchemical(a.operation),
    ];
}

/* ------------------------------------------------------------------ */
/* House-keyed meanings (sign-agnostic).                               */
/* ------------------------------------------------------------------ */

export type HouseMeaning = {
    /** Display name, e.g. "First House — Self". */
    name: string;
    /** Short description rendered beneath the card. */
    description: string;
};

export const HOUSE_MEANINGS: HouseMeaning[] = [
    {
        name: 'First House — Self',
        description: 'The dawn of identity: the body, the will, and the mask worn before the world. All beginnings rise here.',
    },
    {
        name: 'Second House — Possessions',
        description: 'The treasury of the self — resources, values, and what is truly held sacred. Worth is measured in essence, not coin.',
    },
    {
        name: 'Third House — Communication',
        description: 'The busy crossroads of mind: speech, writing, siblings, and the short journeys that stitch the everyday together.',
    },
    {
        name: 'Fourth House — Home & Family',
        description: 'The root and foundation of being — ancestry, hearth, and the private ground from which all things grow.',
    },
    {
        name: 'Fifth House — Creativity',
        description: 'The playground of the heart: art, pleasure, romance, and the children of one\'s creative fire.',
    },
    {
        name: 'Sixth House — Service & Health',
        description: 'The daily craft — work, ritual, and the tending of the body temple. Devotion made practical.',
    },
    {
        name: 'Seventh House — Partnership',
        description: 'The mirrored other: marriage, contracts, and the sworn bonds that reveal the self through reflection.',
    },
    {
        name: 'Eighth House — Transformation',
        description: 'The crucible — death, rebirth, and the shared depths of intimacy, inheritance, and occult power.',
    },
    {
        name: 'Ninth House — Philosophy',
        description: 'The long road: higher learning, pilgrimage, and the search for meaning beyond the horizon.',
    },
    {
        name: 'Tenth House — Career',
        description: 'The summit of public standing — vocation, mastery, and the monument built at the chart\'s turning point.',
    },
    {
        name: 'Eleventh House — Community',
        description: 'The circle of equals: friendship, shared hopes, and the collective dream toward which the will bends.',
    },
    {
        name: 'Twelfth House — The Unconscious',
        description: 'The dissolving veil — solitude, dreams, karma, and the hidden well from which all endings flow.',
    },
];

/* ------------------------------------------------------------------ */
/* View-model builders.                                                */
/* ------------------------------------------------------------------ */

/** Assemble the page view model for one house number + cusp sign. */
function assembleHouse(number: number, sign: ZodiacSign, cardId: ArcanaIdentityIndex): AstrologicalHouse {
    const meaning = HOUSE_MEANINGS[number - 1];
    return {
        number,
        name: meaning.name,
        description: meaning.description,
        cardId,
        correspondences: chipsForSign(sign),
    };
}

/**
 * The twelve houses of a natal chart (POST /reading/full `houses`):
 * whole-sign from the Ascendant, so house 1 carries the rising sign's Major
 * and the chips follow each CUSP SIGN. The Major is taken from the backend
 * payload (source of truth), with the sign table as a consistency fallback.
 */
export function buildNatalHouses(houses: NatalHouse[]): AstrologicalHouse[] {
    return houses.map(h => assembleHouse(
        h.house,
        h.sign,
        ArcanaIdentities[h.zodiac.card] ?? SIGN_ATTRIBUTIONS[h.sign].cardId,
    ));
}

/** The natural-house reference (1=Aries ... 12=Pisces), sign table order. */
export const ASTROLOGICAL_HOUSES: AstrologicalHouse[] = ZODIAC_ORDER.map((sign, i) =>
    assembleHouse(i + 1, sign, SIGN_ATTRIBUTIONS[sign].cardId)
);

/* ------------------------------------------------------------------ */
/* PractitionerView panel adapter.                                     */
/* ------------------------------------------------------------------ */

/**
 * The natal houses as a CardData[] preview set for the PractitionerView
 * panel carousel — the panel system keys off this shape (face card, splay
 * fan count, has-cards routing), so each house maps onto its Major Arcana
 * identity. Natural 1→12 order: the panel fronts the LAST card, so the
 * natal Twelfth House's Major is the face (Aries → The Emperor for the
 * 1999-11-21 Portsmouth fixture, not the natural-chart The Moon). The role
 * never surfaces — tapping the panel opens the houses page, not a CardStack.
 */
export function buildNatalHouseCards(houses: NatalHouse[]): CardData[] {
    const cards: CardData[] = [];
    for (const h of houses) {
        cards.push({ role: 'UncategorisedCard', card: h.zodiac.card });
    }
    return cards;
}
