import type { ArcanaIdentity, ArcanaIdentityIndex } from '../arcana-identities';

/** Card number → arcana name reverse lookup. */
export const ARCANA_BY_NUMBER: Partial<Record<ArcanaIdentityIndex, ArcanaIdentity>> = {
    // Major Arcana
    0: 'THE_FOOL',
    1: 'THE_MAGUS',
    2: 'THE_PRIESTESS',
    3: 'THE_EMPRESS',
    4: 'THE_EMPEROR',
    5: 'THE_HIEROPHANT',
    6: 'THE_LOVERS',
    7: 'THE_CHARIOT',
    8: 'ADJUSTMENT',
    9: 'THE_HERMIT',
    10: 'FORTUNE',
    11: 'LUST',
    12: 'THE_HANGED_MAN',
    13: 'DEATH',
    14: 'ART',
    15: 'THE_DEVIL',
    16: 'THE_TOWER',
    17: 'THE_STAR',
    18: 'THE_MOON',
    19: 'THE_SUN',
    20: 'THE_AEON',
    21: 'THE_UNIVERSE',

    // Cups (offset 100)
    101: 'ACE_OF_CUPS',
    102: 'LOVE',
    103: 'ABUNDANCE',
    104: 'LUXURY',
    105: 'DISAPPOINTMENT',
    106: 'PLEASURE',
    107: 'DEBAUCH',
    108: 'INDOLENCE',
    109: 'HAPPINESS',
    110: 'SATIETY',
    111: 'PRINCESS_OF_CUPS',
    112: 'PRINCE_OF_CUPS',
    113: 'QUEEN_OF_CUPS',
    114: 'KNIGHT_OF_CUPS',

    // Disks (offset 200)
    201: 'ACE_OF_DISKS',
    202: 'CHANGE',
    203: 'WORKS',
    204: 'POWER',
    205: 'WORRY',
    206: 'SUCCESS',
    207: 'FAILURE',
    208: 'PRUDENCE',
    209: 'GAIN',
    210: 'WEALTH',
    211: 'PRINCESS_OF_DISKS',
    212: 'PRINCE_OF_DISKS',
    213: 'QUEEN_OF_DISKS',
    214: 'KNIGHT_OF_DISKS',

    // Swords (offset 300)
    301: 'ACE_OF_SWORDS',
    302: 'PEACE',
    303: 'SORROW',
    304: 'TRUCE',
    305: 'DEFEAT',
    306: 'SCIENCE',
    307: 'FUTILITY',
    308: 'INTERFERENCE',
    309: 'CRUELTY',
    310: 'RUIN',
    311: 'PRINCESS_OF_SWORDS',
    312: 'PRINCE_OF_SWORDS',
    313: 'QUEEN_OF_SWORDS',
    314: 'KNIGHT_OF_SWORDS',

    // Wands (offset 400)
    401: 'ACE_OF_WANDS',
    402: 'DOMINION',
    403: 'VIRTUE',
    404: 'COMPLETION',
    405: 'STRIFE',
    406: 'VICTORY',
    407: 'VALOUR',
    408: 'SWIFTNESS',
    409: 'STRENGTH',
    410: 'OPPRESSION',
    411: 'PRINCESS_OF_WANDS',
    412: 'PRINCE_OF_WANDS',
    413: 'QUEEN_OF_WANDS',
    414: 'KNIGHT_OF_WANDS',
};

/** Arcana name → card number reverse lookup. */
export const NUMBER_BY_ARCANA: Partial<Record<ArcanaIdentity, ArcanaIdentityIndex>> =
    Object.fromEntries(
        Object.entries(ARCANA_BY_NUMBER).map(([num, name]) => [name as ArcanaIdentity, Number(num) as ArcanaIdentityIndex])
    );

/** Suit offset values. Add the card's relative index to the suit offset to get its card number. */
export const SUIT_OFFSETS = {
    Cups: 100,
    Disks: 200,
    Swords: 300,
    Wands: 400,
} as const;

export type SuitId = keyof typeof SUIT_OFFSETS;

/** Resolve an arcana name by its absolute card number. */
export function getArcanaByNumber(cardNumber: ArcanaIdentityIndex): ArcanaIdentity | undefined {
    return ARCANA_BY_NUMBER[cardNumber];
}

/** Resolve a card name from its suit and relative index. If suit is null, defaults to Major Arcana (no offset). */
export function getArcanaBySuit(suit: SuitId | null, relativeIndex: number): ArcanaIdentity | undefined {
    const offset = suit ? SUIT_OFFSETS[suit] : 0;
    return ARCANA_BY_NUMBER[(offset + relativeIndex) as ArcanaIdentityIndex];
}
