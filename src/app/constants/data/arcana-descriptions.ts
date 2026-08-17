import type { ArcanaIdentity } from '../arcana-identities';
import { ARCHETYPE_DATA } from './archetype-data';

/**
 * Per-card human title + description body shown in the Inspect screen and the
 * card stacks.
 *
 * The 22 Major Arcana reuse the real archetype copy from `ARCHETYPE_DATA`
 * (so they're never empty). The 56 minor arcana carry bespoke Thoth-aligned
 * descriptions — numbered cards name their decan attribution (planet in sign),
 * court cards their elemental attribution (e.g. Fire of Fire).
 *
 * `getArcanaDescription(identity)` is the single accessor the UI should use; it
 * falls back to a generic placeholder if an entry is ever missing.
 */
export type ArcanaDescription = {
    title: string;
    body: string;
};

/**
 * The Atu mnemonics from Crowley's Book of Thoth — one two-line verse per
 * Major Arcana, listed in Atu order (0–XXI). Prepended to the Inspect body
 * by `arch()` below; line breaks survive because the Inspect description
 * styles the body with `white-space: pre-wrap`. Transcribed verbatim from
 * the client's source list — including the Hebrew letter as a comment per row.
 *
 * NOTE: this const must stay ABOVE `ARCANA_DESCRIPTIONS` — that object's
 * initializer calls `arch()`, which reads this table at module-init time.
 * Moving it below re-triggers "Cannot access 'ARCANA_MNEMONICS' before
 * initialization" and white-screens the whole app.
 */
export const ARCANA_MNEMONICS: Partial<Record<ArcanaIdentity, string>> = {
    THE_FOOL: /* א */ 'Truth, laughter, lust: Wine\'s Holy Fool! Veil rent,\nLewd madness is sublime enlightenment.',
    THE_MAGUS: /* ב */ 'The Word of Wisdom weaves the web of lies,\nWeds irreducible Infinities.',
    THE_PRIESTESS: /* ג */ 'Mother, moon-maiden, playmate, bride of Pan;\nGod\'s Angel-Minister to every man.',
    THE_EMPRESS: /* ד */ 'Beauty, display thine Empire! Truth above\nThought\'s reach: the wholeness of the world is Love.',
    THE_EMPEROR: /* צ */ 'Sire and inceptor, Emperor and King\nOf all things mortal, hail Him lord of Spring!',
    THE_HIEROPHANT: /* ו */ 'Wisdom to each apportioned to his want\nBy modes of Light, shed forth, great Hierophant!',
    THE_LOVERS: /* ז */ 'To each his Understanding sooth discovers\nWordless: your mode, immortal Twins and Lovers!',
    THE_CHARIOT: /* ח */ 'Behold, the Chariot! Through the water floods\nThe Sangraal, life and rapture, Wine\'s and Blood\'s!',
    ADJUSTMENT: /* ל */ 'Adjustment! Rhythm writhes through every act.\nWild is the dance; its balance is exact.',
    THE_HERMIT: /* י */ 'Most secret seed of all Live\'s serpent plan,\nVirgin, the Hermit goes, dumb Guardian.',
    FORTUNE: /* כ */ 'Sped by its energies triune, the Wheel\nOf Fortune spins: its Axle\'s immobile.',
    LUST: /* ט */ 'The Lion-Serpent begets Gods! Thy throne\nThe rampant Beast, our Lady Babalon!',
    THE_HANGED_MAN: /* מ */ 'In Mother-Deeps of Ocean the God-Man\nHangs, Lamp of the Abyss Aeonian.',
    DEATH: /* נ */ 'Eagle, and Snake, and Scorpion! the Dance\nOf Death whirls Life from Trance to Trance to Trance.',
    ART: /* ס */ 'O Solve, coagula! By V.I.T.R.I.O.L. shewn,\nThe Tincture, the Elixir, and the Stone!',
    THE_DEVIL: /* ע */ 'Ιο Pan! upon the summits the God-goat\nLeaps in wild lust of ecstasy afloat.',
    THE_TOWER: /* פ */ 'Bellona, scream! Unhood the Hawks! the roar\nOf Universes crashing into War!',
    THE_STAR: /* ה */ 'Nuit, our Lady of the Stars! Event\nIs all Thy play, sublime Experiment!',
    THE_MOON: /* ק */ 'Witch-moon, upon thy beck of blood afloat\nThe Midnight Beetle\'s brave prophetic Boat!',
    THE_SUN: /* ר */ 'The Sun, our Father! Soul of Life and Light,\nLove and play freely, sacred in Thy sight!',
    THE_AEON: /* ש */ 'Nuit, Hadit, Ra-Hoor-Khuit! The Aeon\nOf the Twin Child! Exult, o Empyrean!',
    THE_UNIVERSE: /* ת */ 'Naught becomes All to realise the span\nOf naught, O perfect Universe of Pan.',
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
    ACE_OF_WANDS: d('Ace of Wands — Root of Fire',
        'The Root of the Powers of Fire: will in its purest state, before it has chosen a shape. This is the first ignition — purpose arriving as a flash of certainty, raw creative force pregnant with every possible act. Plant it deliberately; a spark this pure becomes either illumination or wildfire.'),
    DOMINION: d('2 of Wands — Dominion',
        'Mars in Aries. The first bold stroke of will upon the world — authority asserted without apology or hesitation. Dominion is initiative in its most confident form: the plan drawn, the sceptre raised, the certainty that the world will answer. Act now; this energy does not store.'),
    VIRTUE: d('3 of Wands — Virtue',
        'Sun in Aries. Will made real and confirmed by its own success. Virtue here is strength born of alignment — when action and purpose point the same way, power compounds. The foundation is laid and the horizon is opening; keep creating in the same true direction.'),
    COMPLETION: d('4 of Wands — Completion',
        'Venus in Aries. A work of will perfected and celebrated — harmony established through effort, now enjoyed without guilt. Completion is the harvest of discipline: order won, then relaxed into. Let this be a genuine resting point before the next beginning.'),
    STRIFE: d('5 of Wands — Strife',
        'Saturn in Leo. Competing wills locked in contest — ambition against ambition, fire testing fire. Strife is the friction that reveals whether desire deserves its name. The struggle is not the failure; it is the examination. Fight cleanly and learn what you actually want.'),
    VICTORY: d('6 of Wands — Victory',
        'Jupiter in Leo. Triumph after genuine struggle — success earned, not inherited. Victory expands the self and, rightly worn, turns outward as generosity. Regard the struggle that bought this; the crown fits because the head beneath it has grown.'),
    VALOUR: d('7 of Wands — Valour',
        'Mars in Leo. Courage under sustained pressure — defiance as a form of grace. Valour does not promise victory; it promises mettle equal to the hour. The odds are real, and so is the strength that faces them; hold the line.'),
    SWIFTNESS: d('8 of Wands — Swiftness',
        'Mercury in Sagittarius. Energy unbound — the arrow released, electricity finding its path. Swiftness is rapid motion, communication at the speed of need, events accelerating beyond planning. Align loosely and steer on the wing; precision now comes from timing, not deliberation.'),
    STRENGTH: d('9 of Wands — Strength',
        'Moon in Sagittarius. Immense force held in conscious reserve — preparedness, resilience, health. The great strength of this card is discipline: power that could overwhelm, instead waits. A steady flame, sufficient to the task; do not mistake restraint for weakness.'),
    OPPRESSION: d('10 of Wands — Oppression',
        'Saturn in Sagittarius. Will turned tyrant — force crushing what it meant to champion. Oppression is burnout with a banner: energy enslaved to ends that no longer justify the cost. Put the burden down and ask what it was for.'),
    PRINCESS_OF_WANDS: d('Princess of Wands — Earth of Fire',
        'The spark incarnate — fire finding a foothold in the real world. The Princess is impulsive, adventurous and magnetic, the ignition point of every new flame. Her gift is beginnings; her lesson is that a spark must become a hearth.'),
    PRINCE_OF_WANDS: d('Prince of Wands — Air of Fire',
        'The swift charioteer of will — fire given direction and speed. The Prince is decisive, intense and dramatic, a leader who writes the road as he rides it. His flame illuminates or consumes, depending on whether thought ever touches the reins.'),
    QUEEN_OF_WANDS: d('Queen of Wands — Water of Fire',
        'Warmth that transforms — fire that has learned to nurture. The Queen is vibrant, charismatic and utterly self-assured; her passion inspires devotion and her presence commands the room. She proves that the strongest flame is the one that lights others.'),
    KNIGHT_OF_WANDS: d('Knight of Wands — Fire of Fire',
        'Fire in its purest, most unmediated form — the charge itself. The Knight is daring, impulsive and magnificent, riding at life with total commitment and no brakes. He is the spirit of adventure incarnate; follow him for the beginning, never for the follow-through.'),

    /* Cups (Water) */
    ACE_OF_CUPS: d('Ace of Cups — Root of Water',
        'The Root of the Powers of Water: feeling at its source, love before it has chosen an object. This is the wellspring — emotion unconditioned, the heart opened before it knows what it will hold. Receive it; the cup is offered, not taken.'),
    LOVE: d('2 of Cups — Love',
        'Venus in Cancer. The perfect image of union — two natures mirroring, attracting and completing one another. Love here is reciprocity itself: the beginning of a bond whose strength is mutual recognition. What is truly shared from the first will sustain itself.'),
    ABUNDANCE: d('3 of Cups — Abundance',
        'Mercury in Cancer. The cup overflowing into cups — fertility, community, celebration. Abundance is joy multiplied by witnesses: friendship that feeds, harvest shared at the same table. Gratitude given voice is what makes the plenty real.'),
    LUXURY: d('4 of Cups — Luxury',
        'Moon in Cancer. Blended pleasure — contentment deepening toward satiety. Luxury is softness chosen deliberately: comfort, tenderness, the sweet excess of feeling safe. Its gentle danger is forgetfulness; enjoy it, but remember the door of the garden.'),
    DISAPPOINTMENT: d('5 of Cups — Disappointment',
        'Mars in Scorpio. The cup spilled — hopes inverted, pleasure broken on the truth. Disappointment is the sting of expectation unmet, and it is real; grieve it honestly. The three cups still standing are what remain when the two are mourned.'),
    PLEASURE: d('6 of Cups — Pleasure',
        'Sun in Scorpio. Simple, honest delight — pleasure without complication or apology. This card is nostalgia, kindness, the past returned as warmth rather than weight. Let it be exactly what it is; not every gift must be a lesson.'),
    DEBAUCH: d('7 of Cups — Debauch',
        'Venus in Scorpio. Desire drinking itself — the heady excess where feeling and illusion mix. Debauch is glamour in the old sense: fantasy mistaken for emotion, intoxication promising what only connection can deliver. Yet the same depths briefly open creative doors no sober mind finds. Drink from the vision; do not live in it.'),
    INDOLENCE: d('8 of Cups — Indolence',
        'Saturn in Pisces. Abandoned success — the cups set down half-drunk, effort surrendered just short of the goal. Indolence is not rest but drift: the peculiar fatigue of almost-having-wanted-something. Turn back toward the work or release it wholly; the middle is the only failure.'),
    HAPPINESS: d('9 of Cups — Happiness',
        'Jupiter in Pisces. The wish fulfilled — joy crystallized into form. Happiness here is emotional completion: the heart at rest in its own abundance, wishes realized rather than merely dreamed. This is one of the best of cards; accept it without negotiating.'),
    SATIETY: d('10 of Cups — Satiety',
        'Mars in Pisces. Love completed and made lasting — permanent, stable success of the heart. Satiety is fullness that asks nothing more, the marriage sustained, the cycle closed in peace. From such completion the only honest move is a new beginning.'),
    PRINCESS_OF_CUPS: d('Princess of Cups — Earth of Water',
        'The pearl rising in the lotus — feeling finding form. The Princess is dreamy, tender and strangely knowing, her creativity surfacing from depths she cannot explain. Her gift is the poem, the image, the almost-said thing; trust what arrives through her.'),
    PRINCE_OF_CUPS: d('Prince of Cups — Air of Water',
        'The still eagle riding the moving wave — emotion governed by an elegant mind. The Prince is subtle, romantic and secretive, feeling deeply and calculating calmly at once. His depths are real; so is the shell. What he offers, he offers deliberately.'),
    QUEEN_OF_CUPS: d('Queen of Cups — Water of Water',
        'The reflected depth — feeling in its purest element. The Queen is loving, empathic and psychically open, absorbing every current and mirroring every soul. Her gift is total receptivity; her discipline is keeping her own shape within it.'),
    KNIGHT_OF_CUPS: d('Knight of Cups — Fire of Water',
        'The grail borne forward — feeling in motion. The Knight is the romantic idealist, graceful and gracious, extending an offer of the heart without guarantee of return. Follow him for beauty and invitation; the answer is not his to command.'),

    /* Disks (Earth) */
    ACE_OF_DISKS: d('Ace of Disks — Root of Earth',
        'The Root of the Powers of Earth: matter in its first seed. This is material opportunity — the tangible beginning, the garden planned before a single furrow is cut. An Ace of Disks asks for hands, not visions; plant something real.'),
    CHANGE: d('2 of Disks — Change',
        'Jupiter in Capricorn. The juggler with his rings — harmonious flux. Change here is adaptation with rhythm: two weights kept in play by confident, unhurried motion. Nothing is fixed and nothing falls; the skill is the pattern, not the pause.'),
    WORKS: d('3 of Disks — Works',
        'Mars in Capricorn. The forge and the drawing-board — skilled labour made visible. Works is craft, collaboration, material effort well begun and truly made. The mason, the engineer and the priest consecrate the same plan; build it properly and it will outlast the building.'),
    POWER: d('4 of Disks — Power',
        'Sun in Capricorn. The cornerstone set — material stability and the authority that grows from it. Power in Disks is provision: control grounded in substance, the structure that shelters what it governs. Hold it open-handedly; a fortress is only useful if it has a gate.'),
    WORRY: d('5 of Disks — Worry',
        'Mercury in Taurus. The mind chewing on matter — material anxiety, the counting-house at three in the morning. Worry is work misdirected: the coins loom larger than the harvest they could buy. Restore the light, and the engines quiet themselves.'),
    SUCCESS: d('6 of Disks — Success',
        'Moon in Taurus. Generous harvest — material success made sweeter by sharing. Success here is achievement with an open hand: the full purse turned outward. What is given from genuine plenty returns as genuine standing.'),
    FAILURE: d('7 of Disks — Failure',
        'Saturn in Taurus. Uncompleted work — effort that never ripened into form. Failure in Disks is not verdict but postponement: the harvest failed, not the field. Pause and reassess before pressing on; some projects ask to be released, not rescued.'),
    PRUDENCE: d('8 of Disks — Prudence',
        'Sun in Virgo. The careful hand — skill, patience, attention to the material fact. Prudence is the virtue of the craftsman: moderation, good management, the willingness to let things ripen slowly. Mastery is compound interest; pay in daily.'),
    GAIN: d('9 of Disks — Gain',
        'Venus in Virgo. The fruit on the tree — material increase quietly earned. Gain is inheritance, earnings, fruitful partnership: abundance that grew while attention was on the work. Walk in your own vineyard; it is yours, and it is enough.'),
    WEALTH: d('10 of Disks — Wealth',
        'Mercury in Virgo. The harvest stored — lasting wealth, security completed. Wealth is the cycle closed in plenty: the granary full at the door of winter, the family provided, the work able to rest. Guard it not as a wall but as a well.'),
    PRINCESS_OF_DISKS: d('Princess of Disks — Earth of Earth',
        'The seed in the furrow — matter in its purest patience. The Princess is practical, nurturing and immensely persistent, growth as a way of being. She is unhurried because she is certain; everything she tends, lives.'),
    PRINCE_OF_DISKS: d('Prince of Disks — Air of Earth',
        'The patient engineer — matter organized by mind. The Prince is methodical, reliable and quietly stubborn, building because building is his breath. Others outrun him to everything except the finish line.'),
    QUEEN_OF_DISKS: d('Queen of Disks — Water of Earth',
        'The fruitful garden — matter nurtured into generosity. The Queen is resourceful, warm and fiercely maternal; she makes everything she touches grow. Her realm is the real: bodies, food, home, harvest. Prosperity follows her like a season.'),
    KNIGHT_OF_DISKS: d('Knight of Disks — Fire of Earth',
        'The tireless ploughman — endurance as a flame. The Knight is routine, patience and unglamorous persistence; he wins by never stopping. His is the slow fire that cannot be extinguished, only finished.'),

    /* Swords (Air) */
    ACE_OF_SWORDS: d('Ace of Swords — Root of Air',
        'The Root of the Powers of Air: the first cut of the mind. This is clarity as an event — decision, the primary assertion of intellect, a truth sharp enough to divide. Take up the sword knowingly: what it severs cannot be rejoined.'),
    PEACE: d('2 of Swords — Peace',
        'Moon in Libra. The sword sheathed — the mind at rest in equilibrium. Peace here is balanced judgement restored, the crescent holding both edges equally. It is delicate and it is real; guard it by deciding nothing until the moon is full.'),
    SORROW: d('3 of Swords — Sorrow',
        'Saturn in Libra. The heart pierced by its own logic — grief, separation, the necessary pain of clear sight. Sorrow in Swords is not cruelty but truth arriving where it hurts. Let it cut cleanly; a clean wound heals true.'),
    TRUCE: d('4 of Swords — Truce',
        'Jupiter in Libra. Fragile concord — rest from conflict without resolution of it. Truce is recuperation, détente, the blades crossed in pause rather than battle. Use the interval to strengthen; peace held lightly is peace kept.'),
    DEFEAT: d('5 of Swords — Defeat',
        'Venus in Aquarius. The mind turned against itself — quarrel, failure, the strange collapse after contest. Defeat here is curiously self-inflicted: what breaks is the frame, not the fighter. Withdraw with what dignity remains; the assets are not all lost.'),
    SCIENCE: d('6 of Swords — Science',
        'Mercury in Aquarius. The perfect instrument — method, objectivity, exact thought. Science is the mind that maps reality without distorting it, balance held between conviction and doubt. Here problems yield not to force but to precision.'),
    FUTILITY: d('7 of Swords — Futility',
        'Moon in Aquarius. Unsteady effort — ingenuity without stamina, plans dissolving in the dawn. Futility is the dim laboratory at three in the morning: much motion, little light. The clever thing is to stop pushing and re-open the windows.'),
    INTERFERENCE: d('8 of Swords — Interference',
        'Saturn in Gemini. Force scattered — too many blades, not one blow. Interference is the cramped mind: distraction, blocked action, the purposes of others crowding the narrow way. Prune. A single edge will cut what eight cannot touch.'),
    CRUELTY: d('9 of Swords — Cruelty',
        'Mars in Gemini. The mind at war with itself — anguish, obsession, deliberate harm. Cruelty in this card is mostly internal: the sleepless interrogation that calls itself honesty. The mercy is waking; the swords that torture are also swords that can be dropped.'),
    RUIN: d('10 of Swords — Ruin',
        'Sun in Gemini. The edifice of thought collapsed — complete breakdown of a matter of the mind. Ruin is intellectual death, sudden and total; and like all deaths in the deck, it clears ground. Nothing grows on a foundation of intellectual dishonesty.'),
    PRINCESS_OF_SWORDS: d('Princess of Swords — Earth of Air',
        'The fresh edge of the storm — thought landing in the real. The Princess is vigilant, perceptive and severe, cutting through comfort to fact without malice and without mercy. Her gift is the clean perception others avoid; her lesson is when to sheathe it.'),
    PRINCE_OF_SWORDS: d('Prince of Swords — Air of Air',
        'The pure idea in motion — intellect as element. The Prince is brilliant, versatile and ruthless in logic, a mind that dissects everything, including itself. He is the perfect analyst and the natural sceptic; what he cannot cut, he does not believe.'),
    QUEEN_OF_SWORDS: d('Queen of Swords — Water of Air',
        'Clarity carved by loss — feeling refined into sight. The Queen is clear-eyed, independent and unbowed; her sorrow became perception, her solitude became scale. She extends the sword as justice: precisely, and to exactly the length required.'),
    KNIGHT_OF_SWORDS: d('Knight of Swords — Fire of Air',
        'Thought as cavalry charge — intellect weaponized and released. The Knight is relentless, swift and absolute, riding down opposition by pure speed of mind. He is right more often than he is kind; deploy him where the truth must arrive on time.'),

    /* Special */
    THELEMA: d('Thelema — the Word of the Law',
        'The word of the Law — “Do what thou wilt shall be the whole of the Law.” Thelema is not licence but the discovery and living of the true will: love is the law, love under will. When this card appears, the question is not what is permitted, but what is yours.'),
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
    // Majors reuse the archetype title + body verbatim, prefixed with the
    // Book of Thoth mnemonic verse when one exists. Minors never pass through
    // here, so the verses stay exclusive to the Inspect screen, and
    // ARCHETYPE_DATA itself stays clean for the CardStack screens.
    const data = ARCHETYPE_DATA[identity];
    const body = data?.body ?? PLACEHOLDER_DESCRIPTION.body;
    const mnemonic = ARCANA_MNEMONICS[identity];
    return { title: data?.title ?? identity, body: mnemonic ? `${mnemonic}\n\n${body}` : body };
}
function d(title: string, body: string): ArcanaDescription {
    return { title, body };
}
