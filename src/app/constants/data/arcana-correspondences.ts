import type { ArcanaIdentity } from '../arcana-identities';
import { type Element } from './arcana-elements';
import {
    type Correspondence,
    ZODIAC_GLYPH,
    PLANET_GLYPH,
    ELEMENT_GLYPH,
    HEBREW_GLYPH,
} from './correspondence-types';

/**
 * Per-card esoteric correspondences for the Thoth deck.
 *
 * Keyed by the same `ArcanaIdentity` name used everywhere else (matches
 * `ARCANA_BY_NUMBER`), so it joins cleanly with `getArcanaByNumber(cardId)`.
 *
 * Sources are the canonical Crowley / Liber 777 attributions:
 *  - Majors: Hebrew letter (path 11–32), astrological attribution (planet /
 *    zodiac / element for the 3 Mother letters), Egyptian godform, King-scale
 *    colour, and the Tree-of-Life path number.
 *  - Aces: element ("Root of the Powers of …"), Kether, cardinal direction.
 *  - Numbered (2–10): element (by suit), sephirah (by number), zodiac decan +
 *    10° span, Chaldean decan-ruler planet, and the Thoth "Lord of …" title.
 *  - Courts: element-in-element (rank aspect within suit element), one of the
 *    Four Worlds, sephirah by rank, and the rank archetype.
 */
export const ARCANA_CORRESPONDENCES: Partial<Record<ArcanaIdentity, Correspondence[]>> = {

    /* ===================== MAJOR ARCANA (22) ===================== */
    THE_FOOL: [
        hebrew('Aleph'), element('air'), path(11), godform('Harpocrates'), color('Pale Yellow'), keyword('Infinite possibility'),
    ],
    THE_MAGUS: [
        hebrew('Beth'), planet('Mercury'), path(12), godform('Thoth'), color('Yellow'), keyword('Will & skill'),
    ],
    THE_PRIESTESS: [
        hebrew('Gimel'), planet('Moon'), path(13), godform('Isis'), color('Silver-Blue'), keyword('Pure intuition'),
    ],
    THE_EMPRESS: [
        hebrew('Daleth'), planet('Venus'), path(14), godform('Hathor'), color('Emerald Green'), keyword('Fertile creation'),
    ],
    THE_EMPEROR: [
        // Thoth attribution: Tzaddi, not the Golden Dawn's Heh ("Tzaddi is not
        // the Star" — Liber AL I:57). Path 28 travels with the letter.
        hebrew('Tzaddi'), zodiac('Aries'), path(28), godform('Amoun'), color('Red'), keyword('Sovereign order'),
    ],
    THE_HIEROPHANT: [
        hebrew('Vau'), zodiac('Taurus'), path(16), godform('Osiris'), color('Russet'), keyword('Sacred doctrine'),
    ],
    THE_LOVERS: [
        hebrew('Zain'), zodiac('Gemini'), path(17), godform('Hera'), color('Orange'), keyword('Sacred marriage'),
    ],
    THE_CHARIOT: [
        hebrew('Cheth'), zodiac('Cancer'), path(18), godform('Apollo'), color('Amber'), keyword('Triumph & focus'),
    ],
    ADJUSTMENT: [
        hebrew('Lamed'), zodiac('Libra'), path(22), godform('Maat'), color('Emerald'), keyword('Cosmic balance'),
    ],
    THE_HERMIT: [
        hebrew('Yod'), zodiac('Virgo'), path(20), godform('Hermes'), color('Olive'), keyword('Inward light'),
    ],
    FORTUNE: [
        hebrew('Kaph'), planet('Jupiter'), path(21), godform('Zeus'), color('Violet'), keyword('Cyclic destiny'),
    ],
    LUST: [
        hebrew('Teth'), zodiac('Leo'), path(19), godform('Sekhmet'), color('Yellow-Green'), keyword('Fierce vitality'),
    ],
    THE_HANGED_MAN: [
        hebrew('Mem'), element('water'), path(23), godform('Osiris'), color('Deep Blue'), keyword('Redemptive surrender'),
    ],
    DEATH: [
        hebrew('Nun'), zodiac('Scorpio'), path(24), godform('Set'), color('Blue-Green'), keyword('Transformation'),
    ],
    ART: [
        hebrew('Samekh'), zodiac('Sagittarius'), path(25), godform('Diana'), color('Blue'), keyword('Sacred alchemy'),
    ],
    THE_DEVIL: [
        hebrew('Ayin'), zodiac('Capricorn'), path(26), godform('Pan'), color('Indigo'), keyword('Primal appetite'),
    ],
    THE_TOWER: [
        hebrew('Peh'), planet('Mars'), path(27), godform('Horus'), color('Scarlet'), keyword('Shattering revelation'),
    ],
    THE_STAR: [
        // Thoth swap: Heh (see THE_EMPEROR note); path 15 travels with Heh.
        hebrew('Heh'), zodiac('Aquarius'), path(15), godform('Nuit'), color('Violet'), keyword('Inspired hope'),
    ],
    THE_MOON: [
        hebrew('Qoph'), zodiac('Pisces'), path(29), godform('Hecate'), color('Crimson'), keyword('Liminal illusion'),
    ],
    THE_SUN: [
        hebrew('Resh'), planet('Sun'), path(30), godform('Ra'), color('Gold'), keyword('Luminous joy'),
    ],
    THE_AEON: [
        hebrew('Shin'), element('fire'), path(31), godform('Horus'), color('Glowing Orange'), keyword('New dispensation'),
    ],
    THE_UNIVERSE: [
        hebrew('Tau'), planet('Saturn'), element('earth'), path(32), godform('Pan'), color('Blue-Black'), keyword('Total synthesis'),
    ],

    /* ===================== ACES (4) ===================== */
    ACE_OF_WANDS: [
        element('fire'), esotericTitle('Root of the Powers of Fire'), sephirah('Kether'), direction('South'), keyword('Spark of Will'),
    ],
    ACE_OF_CUPS: [
        element('water'), esotericTitle('Root of the Powers of Water'), sephirah('Kether'), direction('West'), keyword('Spring of feeling'),
    ],
    ACE_OF_SWORDS: [
        element('air'), esotericTitle('Root of the Powers of Air'), sephirah('Kether'), direction('East'), keyword('Edge of Mind'),
    ],
    ACE_OF_DISKS: [
        element('earth'), esotericTitle('Root of the Powers of Earth'), sephirah('Kether'), direction('North'), keyword('Seed of Matter'),
    ],

    /* ===================== WANDS — Fire (Aries, Leo, Sagittarius) ===================== */
    DOMINION: minor('fire', 'Chokmah', ['Aries', 1], 'Mars', 'Lord of Dominion', 'Initiating force'),
    VIRTUE: minor('fire', 'Chokmah', ['Aries', 2], 'Sun', 'Lord of Virtue', 'Solar courage'),
    COMPLETION: minor('fire', 'Chesed', ['Aries', 3], 'Venus', 'Lord of Perfected Work', 'Harmonised creation'),
    STRIFE: minor('fire', 'Geburah', ['Leo', 1], 'Saturn', 'Lord of Strife', 'Contested ambition'),
    VICTORY: minor('fire', 'Netzach', ['Leo', 2], 'Jupiter', 'Lord of Victory', 'Expansive triumph'),
    VALOUR: minor('fire', 'Netzach', ['Leo', 3], 'Mars', 'Lord of Valour', 'Unyielding bravery'),
    SWIFTNESS: minor('fire', 'Hod', ['Sagittarius', 1], 'Mercury', 'Lord of Swiftness', 'Rapid communication'),
    STRENGTH: minor('fire', 'Yesod', ['Sagittarius', 2], 'Moon', 'Lord of Great Strength', 'Lunar fortitude'),
    OPPRESSION: minor('fire', 'Malkuth', ['Sagittarius', 3], 'Saturn', 'Lord of Oppression', 'Crushing dominance'),

    /* ===================== CUPS — Water (Cancer, Scorpio, Pisces) ===================== */
    LOVE: minor('water', 'Chokmah', ['Cancer', 1], 'Venus', 'Lord of Love', 'Awakening affection'),
    ABUNDANCE: minor('water', 'Binah', ['Cancer', 2], 'Mercury', 'Lord of Abundance', 'Overflowing plenty'),
    LUXURY: minor('water', 'Chesed', ['Cancer', 3], 'Moon', 'Lord of Blended Pleasure', 'Dreamy indulgence'),
    DISAPPOINTMENT: minor('water', 'Geburah', ['Scorpio', 1], 'Mars', 'Lord of Loss in Pleasure', 'Emotional rupture'),
    PLEASURE: minor('water', 'Tiphareth', ['Scorpio', 2], 'Sun', 'Lord of Pleasure', 'Radiant delight'),
    DEBAUCH: minor('water', 'Netzach', ['Scorpio', 3], 'Venus', 'Lord of Illusionary Success', 'Sensory excess'),
    INDOLENCE: minor('water', 'Hod', ['Pisces', 1], 'Saturn', 'Lord of Abandoned Success', 'Stagnant ease'),
    HAPPINESS: minor('water', 'Yesod', ['Pisces', 2], 'Jupiter', 'Lord of Material Happiness', 'Blessed contentment'),
    SATIETY: minor('water', 'Malkuth', ['Pisces', 3], 'Mars', 'Lord of Perfected Success', 'Sated completion'),

    /* ===================== SWORDS — Air (Libra, Aquarius, Gemini) ===================== */
    PEACE: minor('air', 'Chokmah', ['Libra', 1], 'Moon', 'Lord of Peace Restored', 'Returned calm'),
    SORROW: minor('air', 'Binah', ['Libra', 2], 'Saturn', 'Lord of Sorrow', 'Incisive grief'),
    TRUCE: minor('air', 'Chesed', ['Libra', 3], 'Jupiter', 'Lord of Truce', 'Fragile accord'),
    DEFEAT: minor('air', 'Geburah', ['Aquarius', 1], 'Venus', 'Lord of Defeat', 'Pyrrhic concession'),
    SCIENCE: minor('air', 'Tiphareth', ['Aquarius', 2], 'Mercury', 'Lord of Science', 'Analytic clarity'),
    FUTILITY: minor('air', 'Netzach', ['Aquarius', 3], 'Moon', 'Lord of Unstable Effort', 'Diffused striving'),
    INTERFERENCE: minor('air', 'Hod', ['Gemini', 1], 'Jupiter', 'Lord of Shortened Force', 'Cramped impulse'),
    CRUELTY: minor('air', 'Yesod', ['Gemini', 2], 'Mars', 'Lord of Cruelty', 'Relentless anguish'),
    RUIN: minor('air', 'Malkuth', ['Gemini', 3], 'Sun', 'Lord of Ruin', 'Brilliant collapse'),

    /* ===================== DISKS — Earth (Capricorn, Taurus, Virgo) ===================== */
    CHANGE: minor('earth', 'Chokmah', ['Capricorn', 1], 'Jupiter', 'Lord of Harmonious Change', 'Rhythmic flux'),
    WORKS: minor('earth', 'Binah', ['Capricorn', 2], 'Mars', 'Lord of Material Works', 'Productive labour'),
    POWER: minor('earth', 'Chesed', ['Capricorn', 3], 'Sun', 'Lord of Earthly Power', 'Secured authority'),
    WORRY: minor('earth', 'Geburah', ['Taurus', 1], 'Mercury', 'Lord of Material Trouble', 'Anxious strain'),
    SUCCESS: minor('earth', 'Tiphareth', ['Taurus', 2], 'Moon', 'Lord of Material Success', 'Steady accrual'),
    FAILURE: minor('earth', 'Netzach', ['Taurus', 3], 'Saturn', 'Lord of Success Unfulfilled', 'Heavy shortfall'),
    PRUDENCE: minor('earth', 'Hod', ['Virgo', 1], 'Sun', 'Lord of Prudence', 'Considered care'),
    GAIN: minor('earth', 'Yesod', ['Virgo', 2], 'Venus', 'Lord of Material Gain', 'Cultivated yield'),
    WEALTH: minor('earth', 'Malkuth', ['Virgo', 3], 'Mercury', 'Lord of Wealth', 'Abiding resource'),

    /* ===================== COURT CARDS (16) ===================== */
    /* Wands — Fire */
    KNIGHT_OF_WANDS: court('fire', 'fire'),
    QUEEN_OF_WANDS: court('water', 'fire'),
    PRINCE_OF_WANDS: court('air', 'fire'),
    PRINCESS_OF_WANDS: court('earth', 'fire'),
    /* Cups — Water */
    KNIGHT_OF_CUPS: court('fire', 'water'),
    QUEEN_OF_CUPS: court('water', 'water'),
    PRINCE_OF_CUPS: court('air', 'water'),
    PRINCESS_OF_CUPS: court('earth', 'water'),
    /* Swords — Air */
    KNIGHT_OF_SWORDS: court('fire', 'air'),
    QUEEN_OF_SWORDS: court('water', 'air'),
    PRINCE_OF_SWORDS: court('air', 'air'),
    PRINCESS_OF_SWORDS: court('earth', 'air'),
    /* Disks — Earth */
    KNIGHT_OF_DISKS: court('fire', 'earth'),
    QUEEN_OF_DISKS: court('water', 'earth'),
    PRINCE_OF_DISKS: court('air', 'earth'),
    PRINCESS_OF_DISKS: court('earth', 'earth'),
};

/* ------------------------------------------------------------------ */
/* Builders — keep the data table terse and hard to get wrong.        */
/* ------------------------------------------------------------------ */

function hebrew(letter: string): Correspondence {
    return { kind: 'hebrew', glyph: HEBREW_GLYPH[letter], label: letter, sublabel: 'Hebrew letter' };
}
function zodiac(sign: string): Correspondence {
    return { kind: 'zodiac', glyph: ZODIAC_GLYPH[sign], label: sign, sublabel: 'Zodiac sign' };
}
function planet(p: string): Correspondence {
    return { kind: 'planet', glyph: PLANET_GLYPH[p], label: p, sublabel: 'Planet' };
}
function element(e: Element): Correspondence {
    return { kind: 'element', glyph: ELEMENT_GLYPH[e], label: capitalize(e), sublabel: 'Element' };
}
function path(n: number): Correspondence {
    return { kind: 'path', label: `Path ${n}`, sublabel: 'Tree of Life' };
}
function sephirah(name: string): Correspondence {
    return { kind: 'sephirah', label: name, sublabel: 'Sephirah' };
}
function godform(name: string): Correspondence {
    return { kind: 'godform', label: name, sublabel: 'Egyptian godform' };
}
function color(name: string): Correspondence {
    return { kind: 'color', label: name, sublabel: 'Colour (King scale)' };
}
function direction(d: string): Correspondence {
    return { kind: 'keyword', label: d, sublabel: 'Direction' };
}
function esotericTitle(title: string): Correspondence {
    return { kind: 'title', label: title };
}
function keyword(k: string): Correspondence {
    return { kind: 'keyword', label: k, sublabel: 'Keyword' };
}

/** Numbered minor (2–10): element, sephirah, decan (sign + 10° span), decan ruler, title, keyword. */
function minor(
    el: Element,
    sephName: string,
    decan: [string, 1 | 2 | 3],
    ruler: string,
    title: string,
    kw: string,
): Correspondence[] {
    const [sign, d] = decan;
    const start = (d - 1) * 10;
    const span = `${start}°–${start + 10}° ${sign}`;
    return [
        element(el),
        sephirah(sephName),
        { kind: 'decan', glyph: ZODIAC_GLYPH[sign], label: `${sign} ${toRoman(d)}`, sublabel: span },
        { kind: 'planet', glyph: PLANET_GLYPH[ruler], label: `${ruler} in ${sign}`, sublabel: 'Decan ruler' },
        esotericTitle(title),
        keyword(kw),
    ];
}

/** Court card: element-in-element, Four Worlds, sephirah by rank, rank archetype, suit element, role. */
function court(rankElement: Element, suitElement: Element): Correspondence[] {
    // The court rank is fixed by its sub-element: Fire→Knight, Water→Queen,
    // Air→Prince, Earth→Princess.
    const rankName: Record<Element, string> = { fire: 'Knight', water: 'Queen', air: 'Prince', earth: 'Princess' };
    const info: Record<Element, { seph: string; world: string; archetype: string; role: string }> = {
        fire: { seph: 'Chokmah', world: 'Atziluth', archetype: 'Active force', role: 'The motivator' },
        water: { seph: 'Binah', world: 'Briah', archetype: 'Receptive depth', role: 'The nurturer' },
        air: { seph: 'Tiphareth', world: 'Yetzirah', archetype: 'Intellect in motion', role: 'The strategist' },
        earth: { seph: 'Malkuth', world: 'Assiah', archetype: 'Material realisation', role: 'The pragmatist' },
    };
    const r = info[rankElement];
    return [
        { kind: 'element-in-element', glyph: ELEMENT_GLYPH[rankElement], label: `${capitalize(rankElement)} of ${capitalize(suitElement)}`, sublabel: 'Sub-element' },
        element(suitElement),
        { kind: 'sephirah', label: r.seph, sublabel: `${rankName[rankElement]} rank` },
        { kind: 'godform', label: r.world, sublabel: 'Four Worlds' },
        { kind: 'keyword', label: r.archetype, sublabel: 'Archetype' },
        { kind: 'keyword', label: r.role, sublabel: 'Office' },
    ];
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function toRoman(n: 1 | 2 | 3): string {
    return ['I', 'II', 'III'][n - 1];
}
