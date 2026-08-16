import type { Element } from './arcana-elements';

/**
 * The kind of esoteric attribution a correspondence entry represents. Different
 * cards naturally carry different kinds (majors have Hebrew letters & Tree-of-
 * Life paths; minors have decans; courts carry element-in-element), so the
 * `Correspondence` model is a flexible tagged union rather than a rigid shape.
 */
export type CorrespondenceKind =
    | 'zodiac'            // astrological sign (e.g. Aries, Leo)
    | 'planet'            // planetary ruler (e.g. Mars, Sun)
    | 'element'           // one of the four classical elements
    | 'element-in-element'// court-card sub-element (e.g. Fire of Fire)
    | 'hebrew'            // Hebrew letter attribution (majors only)
    | 'path'              // Tree-of-Life path (two sephiroth)
    | 'sephirah'          // single sephirah attribution (aces / numbered)
    | 'godform'           // Egyptian godform (Crowley attributions)
    | 'decan'             // 10° zodiac decan (minor 2–10)
    | 'title'             // esoteric "Lord of…" title
    | 'quadrant'          // court-card zodiac quadrant span
    | 'color'             // colour attribution (King scale)
    | 'keyword'           // free keyword / concept
    | 'modality'          // zodiacal modality — cardinal, fixed or mutable
    | 'polarity'          // yin-yang polarity of a sign or house
    | 'alchemical';       // alchemical operation attribution

/**
 * A single correspondence chip shown in the inspect grid.
 *
 * - `glyph` is optional because some entries (titles, paths) read as text only.
 * - `label` is ALWAYS rendered beside the glyph, so the entry stays readable
 *   even on a font that lacks the astrological symbol.
 * - `sublabel` carries secondary detail (e.g. the planet name under a decan,
 *   or the Hebrew letter's literal name under the glyph).
 */
export type Correspondence = {
    kind: CorrespondenceKind;
    glyph?: string;
    label: string;
    sublabel?: string;
};

/* ------------------------------------------------------------------ */
/* Glyph maps — Unicode astrological / alchemical symbols.             */
/* These are rendered at a large size with the name label always shown, */
/* so even if a device font lacks the glyph the entry stays readable.  */
/* ------------------------------------------------------------------ */

/** Zodiac signs (Aries → Pisces) — U+2648..U+2653. */
export const ZODIAC_GLYPH: Record<string, string> = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
};

/** Classical planets + the modern luminaries/nodes used in Thoth attributions. */
export const PLANET_GLYPH: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    'Head of the Dragon': '☊', // north node (Caput)
    'Tail of the Dragon': '☋', // south node (Cauda)
};

/**
 * Element glyphs. We use alchemical triangle symbols (U+1F70x range) for a
 * distinctive occult look; the label always repeats the element name.
 */
export const ELEMENT_GLYPH: Record<Element, string> = {
    fire: '🜂',
    water: '🜄',
    air: '🜁',
    earth: '🜃',
};

/** Element display colours (used for the kind accent + glyph tint). */
export const ELEMENT_COLOR: Record<Element, string> = {
    fire: '#e0633a',
    water: '#3a78d6',
    air: '#5fb46e',
    earth: '#c9a23a',
};

/** Hebrew letters Aleph (א) → Tau (ת), keyed by transliteration. */
export const HEBREW_GLYPH: Record<string, string> = {
    Aleph: 'א', Beth: 'ב', Gimel: 'ג', Daleth: 'ד', Heh: 'ה', Vau: 'ו',
    Zain: 'ז', Cheth: 'ח', Teth: 'ט', Yod: 'י', Kaph: 'כ', Lamed: 'ל',
    Mem: 'מ', Nun: 'נ', Samekh: 'ס', Ayin: 'ע', Peh: 'פ', Tzaddi: 'צ',
    Qoph: 'ק', Resh: 'ר', Shin: 'ש', Tau: 'ת',
};
