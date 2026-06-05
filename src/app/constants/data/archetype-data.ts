import type { ArcanaIdentity } from '../arcana-identities';

export type ArchetypeInfo = {
    title: string;
    body: string;
};

export const ARCHETYPE_DATA: Partial<Record<ArcanaIdentity, ArchetypeInfo>> = {
    THE_FOOL: {
        title: 'The Fool — Innocence & Potential',
        body: 'The Fool is pure potential, the spirit stepping into the unknown with absolute trust. There is no baggage here, no preconception — only the open road and the willingness to walk it. This is the breath before creation, the leap before the landing.',
    },
    THE_MAGUS: {
        title: 'The Magus — Will & Communication',
        body: 'The Magus is the first act of conscious will — the mind reaching out to shape reality through word and intention. Quicksilver and mercurial, this archetype is the bridge between thought and manifestation, the messenger who speaks worlds into being.',
    },
    THE_PRIESTESS: {
        title: 'The Priestess — Intuition & Mystery',
        body: 'The Priestess guards the threshold between the seen and the unseen. She is the keeper of hidden knowledge, the still surface of a deep lake. Her wisdom comes not from study but from silence — the knowing that arrives when the mind is quiet.',
    },
    THE_EMPRESS: {
        title: 'The Empress — Creation & Abundance',
        body: 'The Empress is the great mother of form — nature in its fullness, creativity flowing without restraint. She is love made visible, the garden in bloom, the body celebrated. Where she walks, life multiplies and beauty takes root.',
    },
    THE_EMPEROR: {
        title: 'The Emperor — Structure & Authority',
        body: 'The Emperor is order imposed upon chaos — the will to build, to govern, to define boundaries. He is the fire of vision made solid through discipline and law. His power is not brute force but the steady hand that shapes civilisation.',
    },
    THE_HIEROPHANT: {
        title: 'The Hierophant — Teaching & Tradition',
        body: 'The Hierophant is the voice of the inner teacher — the one who reveals sacred knowledge through symbol and ritual. He stands at the gate between heaven and earth, translating divine mystery into forms that can be understood and lived.',
    },
    THE_LOVERS: {
        title: 'The Lovers — Union & Choice',
        body: 'The Lovers speak of the primal act of choosing — not merely romantic love, but the recognition of complementary forces and the courage to unite them. This is the sword that divides in order to join, the analysis that precedes true synthesis.',
    },
    THE_CHARIOT: {
        title: 'The Chariot — Mastery & Will',
        body: 'The Chariot speaks of controlled power — two opposing forces harnessed and directed by sheer force of will. You move forward not by eliminating conflict, but by learning to steer through it.',
    },
    ADJUSTMENT: {
        title: 'Adjustment — Balance & Truth',
        body: 'Adjustment is the principle of cosmic equilibrium — every action met by its consequence, every imbalance corrected. She holds the sword of discrimination and the scales of perfect justice. This is not punishment but restoration, the universe righting itself.',
    },
    THE_HERMIT: {
        title: 'The Hermit — Solitude & Illumination',
        body: 'The Hermit walks alone, but not in loneliness — in purpose. He carries a lantern whose light illuminates only the next step, trusting the path to reveal itself. His solitude is not withdrawal but the deepest form of engagement with truth.',
    },
    FORTUNE: {
        title: 'Fortune — Cycles & Change',
        body: 'Fortune is the wheel that turns without ceasing — the reminder that all conditions are temporary, all states in motion. To understand Fortune is to find the still point at the centre of change, the axis around which fate revolves.',
    },
    LUST: {
        title: 'Lust — Passion & Courage',
        body: 'Lust is not mere desire but the full embrace of life force — the courage to ride the lion rather than cage it. This is passion harnessed, not suppressed; the ecstasy of meeting existence without flinching. The woman and the beast are one.',
    },
    THE_HANGED_MAN: {
        title: 'The Hanged Man — Surrender & Perspective',
        body: 'The Hanged Man is suspended between worlds, seeing everything from an inverted vantage. His sacrifice is not suffering but the willing surrender of the old perspective so that a deeper truth may emerge. In stillness, he finds what movement could not reveal.',
    },
    DEATH: {
        title: 'Death — Transformation',
        body: 'Despite its name, Death rarely signifies literal endings. It is the card of profound transformation — the shedding of what no longer serves, and the emergence of what must come next.',
    },
    ART: {
        title: 'Art — Alchemy & Integration',
        body: 'Your nature is creative transformation. You take what is broken or separate and, through patient work, create something new and whole. You are the arrow aimed at evolution — always aspiring, always making something better from what exists.',
    },
    THE_DEVIL: {
        title: 'The Devil — Illusion & Liberation',
        body: 'The Devil is the laughing god of matter — the creative force that binds spirit into form. He reveals the chains we wear by choice and the illusions we mistake for reality. His gift is the recognition that what imprisons us is also what we may master.',
    },
    THE_TOWER: {
        title: 'The Tower — Destruction & Revelation',
        body: 'The Tower is the lightning flash that shatters false structures — the sudden, violent clearing of everything built on unstable foundations. It is terrifying and liberating in equal measure, for what remains after the fall is what was always true.',
    },
    THE_STAR: {
        title: 'The Star — Hope & Revelation',
        body: 'The Star is the quiet radiance that follows catastrophe — the first clear light after the storm. She pours living water upon the earth and the sea, nourishing what was parched. This is meditation made visible, the soul revealed in its naked beauty.',
    },
    THE_MOON: {
        title: 'The Moon — Illusion & the Unconscious',
        body: 'The Moon illuminates the threshold of the unconscious — the realm of dream, instinct and shadow. Her light distorts as much as it reveals, and the path she shows winds between twin towers of fear and desire. To walk it is to trust what you cannot fully see.',
    },
    THE_SUN: {
        title: 'The Sun — Radiance & Clarity',
        body: 'The Sun brings light to everything it touches. This card speaks of clarity, vitality, and the simple joy of being fully alive. There is nothing hidden here — only warmth, openness, and truth.',
    },
    THE_AEON: {
        title: 'The Aeon — Judgement & Renewal',
        body: 'The Aeon is the call of a new age — the fire that transforms the old world into the new. It is not the judgement of reward and punishment but of awakening: the moment consciousness recognises itself and steps into a greater cycle of becoming.',
    },
    THE_UNIVERSE: {
        title: 'The Universe — Completion & Wholeness',
        body: 'The Universe is the dance of total completion — every element in its place, every journey arriving at its destination. She is the world made conscious of itself, the final card that is also the first, for completion is the doorway to a new beginning.',
    },
};
