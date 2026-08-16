import { type ArcanaIdentityIndex, ArcanaIdentities } from '../arcana-identities';
import { ARCANA_BY_NUMBER } from './arcana-numbers';
import type { Element } from './arcana-elements';
import { ELEMENT_GLYPH, type Correspondence } from './correspondence-types';
import type { CardData } from '../../../types/card-data';

/**
 * A single entry of the Astrological Houses reference page.
 *
 * Each house is keyed to its natural zodiac sign (house 1 = Aries through
 * house 12 = Pisces), and therefore to the Thoth Major Arcana card carrying
 * that sign's attribution in `ARCANA_CORRESPONDENCES` — the standard Golden
 * Dawn / Crowley correspondence. The four chips repeat the sign's modality,
 * yin-yang polarity, element, and alchemical operation.
 */
export type AstrologicalHouse = {
    /** 1-based house number (array index + 1). */
    number: number;
    /** Display name, e.g. "First House — Self". */
    name: string;
    /** Short description rendered beneath the card. */
    description: string;
    /** Major Arcana card of the house's natural zodiac sign. */
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

function house(
    number: number,
    name: string,
    description: string,
    cardId: ArcanaIdentityIndex,
    modalityLabel: string,
    polarityLabel: 'Yin' | 'Yang',
    el: Element,
    operation: string,
): AstrologicalHouse {
    return {
        number,
        name,
        description,
        cardId,
        correspondences: [
            modality(modalityLabel),
            polarity(polarityLabel),
            element(el),
            alchemical(operation),
        ],
    };
}

/* ------------------------------------------------------------------ */
/* The twelve houses.                                                  */
/* ------------------------------------------------------------------ */

export const ASTROLOGICAL_HOUSES: AstrologicalHouse[] = [
    house(1, 'First House — Self',
        'The dawn of identity: the body, the will, and the mask worn before the world. All beginnings rise here.',
        ArcanaIdentities.THE_EMPEROR, 'Cardinal', 'Yang', 'fire', 'Calcination'),
    house(2, 'Second House — Possessions',
        'The treasury of the self — resources, values, and what is truly held sacred. Worth is measured in essence, not coin.',
        ArcanaIdentities.THE_HIEROPHANT, 'Fixed', 'Yin', 'earth', 'Congelation'),
    house(3, 'Third House — Communication',
        'The busy crossroads of mind: speech, writing, siblings, and the short journeys that stitch the everyday together.',
        ArcanaIdentities.THE_LOVERS, 'Mutable', 'Yang', 'air', 'Fixation'),
    house(4, 'Fourth House — Home & Family',
        'The root and foundation of being — ancestry, hearth, and the private ground from which all things grow.',
        ArcanaIdentities.THE_CHARIOT, 'Cardinal', 'Yin', 'water', 'Dissolution'),
    house(5, 'Fifth House — Creativity',
        'The playground of the heart: art, pleasure, romance, and the children of one\'s creative fire.',
        ArcanaIdentities.LUST, 'Fixed', 'Yang', 'fire', 'Digestion'),
    house(6, 'Sixth House — Service & Health',
        'The daily craft — work, ritual, and the tending of the body temple. Devotion made practical.',
        ArcanaIdentities.THE_HERMIT, 'Mutable', 'Yin', 'earth', 'Distillation'),
    house(7, 'Seventh House — Partnership',
        'The mirrored other: marriage, contracts, and the sworn bonds that reveal the self through reflection.',
        ArcanaIdentities.ADJUSTMENT, 'Cardinal', 'Yang', 'air', 'Sublimation'),
    house(8, 'Eighth House — Transformation',
        'The crucible — death, rebirth, and the shared depths of intimacy, inheritance, and occult power.',
        ArcanaIdentities.DEATH, 'Fixed', 'Yin', 'water', 'Separation'),
    house(9, 'Ninth House — Philosophy',
        'The long road: higher learning, pilgrimage, and the search for meaning beyond the horizon.',
        ArcanaIdentities.ART, 'Mutable', 'Yang', 'fire', 'Incineration'),
    house(10, 'Tenth House — Career',
        'The summit of public standing — vocation, mastery, and the monument built at the chart\'s turning point.',
        ArcanaIdentities.THE_DEVIL, 'Cardinal', 'Yin', 'earth', 'Fermentation'),
    house(11, 'Eleventh House — Community',
        'The circle of equals: friendship, shared hopes, and the collective dream toward which the will bends.',
        ArcanaIdentities.THE_STAR, 'Fixed', 'Yang', 'air', 'Multiplication'),
    house(12, 'Twelfth House — The Unconscious',
        'The dissolving veil — solitude, dreams, karma, and the hidden well from which all endings flow.',
        ArcanaIdentities.THE_MOON, 'Mutable', 'Yin', 'water', 'Projection'),
];

/* ------------------------------------------------------------------ */
/* PractitionerView panel adapter.                                     */
/* ------------------------------------------------------------------ */

/**
 * The twelve houses as a CardData[] preview set for the PractitionerView
 * panel carousel — the panel system keys off this shape (face card, splay
 * fan count, has-cards routing), so each house maps onto its Major Arcana
 * identity via the reverse number lookup. Natural 1→12 order: the panel
 * fronts the LAST card, so the Twelfth House is the face. The role never
 * surfaces — tapping the panel opens the houses page, not a CardStack.
 */
export const ASTROLOGICAL_HOUSE_CARDS: CardData[] = [];
for (const h of ASTROLOGICAL_HOUSES) {
    const card = ARCANA_BY_NUMBER[h.cardId];
    if (card) ASTROLOGICAL_HOUSE_CARDS.push({ role: 'UncategorisedCard', card });
}
