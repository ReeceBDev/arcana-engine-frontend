import type { ArcanaIdentity } from '../arcana-identities';
import { ARCHETYPE_DATA } from './archetype-data';

/**
 * Per-card human title + description body shown in the Inspect screen.
 *
 * The 22 Major Arcana reuse the real archetype copy from `ARCHETYPE_DATA`
 * (so they're never empty). The 56 minor arcana carry placeholder bodies for
 * now — replace each `body` with the full description you'd like shown.
 *
 * `getArcanaDescription(identity)` is the single accessor the UI should use; it
 * falls back to a generic placeholder if an entry is ever missing.
 */
export type ArcanaDescription = {
    title: string;
    body: string;
};

export const ARCANA_DESCRIPTIONS: Partial<Record<ArcanaIdentity, ArcanaDescription>> = {
    /* Majors — reuse existing archetype copy. */
    THE_FOOL: arch('THE_FOOL'),
    THE_MAGUS: arch('THE_MAGUS'),
    THE_PRIESTESS: arch('THE_PRIESTESS'),
    THE_EMPRESS: arch('THE_EMPRESS'),
    THE_EMPEROR: arch('THE_EMPEROR'),
    THE_HIEROPHANT: arch('THE_HIEROPHANT'),
    THE_LOVERS: arch('THE_LOVERS'),
    THE_CHARIOT: arch('THE_CHARIOT'),
    ADJUSTMENT: arch('ADJUSTMENT'),
    THE_HERMIT: arch('THE_HERMIT'),
    FORTUNE: arch('FORTUNE'),
    LUST: arch('LUST'),
    THE_HANGED_MAN: arch('THE_HANGED_MAN'),
    DEATH: arch('DEATH'),
    ART: arch('ART'),
    THE_DEVIL: arch('THE_DEVIL'),
    THE_TOWER: arch('THE_TOWER'),
    THE_STAR: arch('THE_STAR'),
    THE_MOON: arch('THE_MOON'),
    THE_SUN: arch('THE_SUN'),
    THE_AEON: arch('THE_AEON'),
    THE_UNIVERSE: arch('THE_UNIVERSE'),

    /* Wands (Fire) */
    ACE_OF_WANDS: ace('Fire', 'Wands'),
    DOMINION: ph('2 of Wands — Dominion'),
    VIRTUE: ph('3 of Wands — Virtue'),
    COMPLETION: ph('4 of Wands — Completion'),
    STRIFE: ph('5 of Wands — Strife'),
    VICTORY: ph('6 of Wands — Victory'),
    VALOUR: ph('7 of Wands — Valour'),
    SWIFTNESS: ph('8 of Wands — Swiftness'),
    STRENGTH: ph('9 of Wands — Strength'),
    OPPRESSION: ph('10 of Wands — Oppression'),
    PRINCESS_OF_WANDS: court('Princess', 'Wands'),
    PRINCE_OF_WANDS: court('Prince', 'Wands'),
    QUEEN_OF_WANDS: court('Queen', 'Wands'),
    KNIGHT_OF_WANDS: court('Knight', 'Wands'),

    /* Cups (Water) */
    ACE_OF_CUPS: ace('Water', 'Cups'),
    LOVE: ph('2 of Cups — Love'),
    ABUNDANCE: ph('3 of Cups — Abundance'),
    LUXURY: ph('4 of Cups — Luxury'),
    DISAPPOINTMENT: ph('5 of Cups — Disappointment'),
    PLEASURE: ph('6 of Cups — Pleasure'),
    DEBAUCH: ph('7 of Cups — Debauch'),
    INDOLENCE: ph('8 of Cups — Indolence'),
    HAPPINESS: ph('9 of Cups — Happiness'),
    SATIETY: ph('10 of Cups — Satiety'),
    PRINCESS_OF_CUPS: court('Princess', 'Cups'),
    PRINCE_OF_CUPS: court('Prince', 'Cups'),
    QUEEN_OF_CUPS: court('Queen', 'Cups'),
    KNIGHT_OF_CUPS: court('Knight', 'Cups'),

    /* Disks (Earth) */
    ACE_OF_DISKS: ace('Earth', 'Disks'),
    CHANGE: ph('2 of Disks — Change'),
    WORKS: ph('3 of Disks — Works'),
    POWER: ph('4 of Disks — Power'),
    WORRY: ph('5 of Disks — Worry'),
    SUCCESS: ph('6 of Disks — Success'),
    FAILURE: ph('7 of Disks — Failure'),
    PRUDENCE: ph('8 of Disks — Prudence'),
    GAIN: ph('9 of Disks — Gain'),
    WEALTH: ph('10 of Disks — Wealth'),
    PRINCESS_OF_DISKS: court('Princess', 'Disks'),
    PRINCE_OF_DISKS: court('Prince', 'Disks'),
    QUEEN_OF_DISKS: court('Queen', 'Disks'),
    KNIGHT_OF_DISKS: court('Knight', 'Disks'),

    /* Swords (Air) */
    ACE_OF_SWORDS: ace('Air', 'Swords'),
    PEACE: ph('2 of Swords — Peace'),
    SORROW: ph('3 of Swords — Sorrow'),
    TRUCE: ph('4 of Swords — Truce'),
    DEFEAT: ph('5 of Swords — Defeat'),
    SCIENCE: ph('6 of Swords — Science'),
    FUTILITY: ph('7 of Swords — Futility'),
    INTERFERENCE: ph('8 of Swords — Interference'),
    CRUELTY: ph('9 of Swords — Cruelty'),
    RUIN: ph('10 of Swords — Ruin'),
    PRINCESS_OF_SWORDS: court('Princess', 'Swords'),
    PRINCE_OF_SWORDS: court('Prince', 'Swords'),
    QUEEN_OF_SWORDS: court('Queen', 'Swords'),
    KNIGHT_OF_SWORDS: court('Knight', 'Swords'),
};

/** Generic fallback used by `getArcanaDescription` for any unkeyed identity. */
export const PLACEHOLDER_DESCRIPTION: ArcanaDescription = {
    title: 'Arcana',
    body: 'Placeholder description. Detailed text for this card is coming soon.',
};

/** Safe accessor: always returns a usable description object. */
export function getArcanaDescription(identity: ArcanaIdentity): ArcanaDescription {
    return ARCANA_DESCRIPTIONS[identity] ?? PLACEHOLDER_DESCRIPTION;
}

/* ---- builders (keep the table terse) ---- */

function arch(identity: ArcanaIdentity): ArcanaDescription {
    // Majors reuse the archetype title + body verbatim.
    const data = ARCHETYPE_DATA[identity];
    return { title: data?.title ?? identity, body: data?.body ?? PLACEHOLDER_DESCRIPTION.body };
}
function ace(element: string, suit: string): ArcanaDescription {
    const title = `Ace of ${suit}`;
    return { title, body: `Placeholder description for the Ace of ${suit} — the Root of the Powers of ${element}.` };
}
function court(rank: string, suit: string): ArcanaDescription {
    const title = `${rank} of ${suit}`;
    return { title, body: `Placeholder description for the ${title}.` };
}
function ph(title: string): ArcanaDescription {
    return { title, body: `Placeholder description for ${title}.` };
}
