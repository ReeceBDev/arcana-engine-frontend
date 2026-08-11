import { type ArcanaIdentityIndex } from '../arcana-identities';
import { SUIT_OFFSETS } from './arcana-numbers';

/**
 * Elemental associations of the four minor suits.
 *
 * In the Hermetic / Thoth correspondence used by this deck:
 *   Fire  = Wands
 *   Water = Cups
 *   Air   = Swords
 *   Earth = Disks (Pentacles)
 */
export type Element = 'fire' | 'water' | 'air' | 'earth';

/** Maps each element to the minor suit (key into SUIT_OFFSETS) it corresponds to. */
export const ELEMENT_SUIT: Record<Element, keyof typeof SUIT_OFFSETS> = {
    fire: 'Wands',
    water: 'Cups',
    air: 'Swords',
    earth: 'Disks',
};

/** Number of cards in each minor suit (Ace through Knight). */
const MINOR_SUIT_LENGTH = 14;

/** All Major Arcana cards: 0 (The Fool) through 21 (The Universe) — 22 cards. */
export const MAJOR_ARCANA_IDS = Array.from({ length: 22 }, (_, i) => i) as ArcanaIdentityIndex[];

/** Build the list of card numbers for a minor suit from its offset. */
function suitIds(suit: keyof typeof SUIT_OFFSETS): ArcanaIdentityIndex[] {
    const offset = SUIT_OFFSETS[suit];
    // Ace is at offset+1 (e.g. ACE_OF_WANDS = 401), Knight at offset+14.
    return Array.from({ length: MINOR_SUIT_LENGTH }, (_, i) => offset + i + 1) as ArcanaIdentityIndex[];
}

// Minor arcana, grouped by element:
//   Fire  = Wands  (401–414)
export const FIRE_ARCANA_IDS = suitIds(ELEMENT_SUIT.fire);
//   Water = Cups   (101–114)
export const WATER_ARCANA_IDS = suitIds(ELEMENT_SUIT.water);
//   Air   = Swords (301–314)
export const AIR_ARCANA_IDS = suitIds(ELEMENT_SUIT.air);
//   Earth = Disks  (201–214)
export const EARTH_ARCANA_IDS = suitIds(ELEMENT_SUIT.earth);

/** Resolve the minor-arcana card numbers for a given element. */
export const ELEMENT_ARCANA_IDS: Record<Element, ArcanaIdentityIndex[]> = {
    fire: FIRE_ARCANA_IDS,
    water: WATER_ARCANA_IDS,
    air: AIR_ARCANA_IDS,
    earth: EARTH_ARCANA_IDS,
};

/** Two-line tagline shown for each element (horizontal deck-viewer top gold text). */
export const ELEMENT_TAGLINES: Record<Element, [string, string]> = {
    fire: ['Perfect is true Will,', 'unassaged of purpose!'],
    water: ['Herein is pure feeling', 'and sensitive intuition...'],
    air: ['Cutting perception,', 'in motion, fluctuation.'],
    earth: ['Divine light made', 'resolutely manifest!'],
};
