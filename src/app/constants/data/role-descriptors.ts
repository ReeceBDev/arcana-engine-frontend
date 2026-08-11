import type { CardRole } from '../card-roles';

export type RoleDescriptor = {
    label: string;
    lines: string[];
};

export const ROLE_DESCRIPTORS: Record<CardRole, RoleDescriptor> = {
    UncategorisedCard: {
        label: 'Arcana Card',
        lines: [
            'A card drawn from the universal deck.',
        ],
    },
    PersonalityCard: {
        label: 'Your Personality Card',
        lines: [
            'The outward face you present to the world — the mask and the mirror.',
            'This card reveals the persona shaped by your date of birth.',
            'Derived from the numerological reduction of your birthday.',
        ],
    },
    CharacterCard: {
        label: 'Your Character Card',
        lines: [
            'The inner nature beneath the personality — your deeper motivations and drives.',
            'Where the Personality Card is the mask, this is the face behind it.',
            'Derived from your specific celestial data.',
        ],
    },
    HybridCharacterPersonalCard: {
        label: 'Your Unified Persona Card',
        lines: [
            'When the personality and the character become one — outer mask and inner face aligned.',
            'Your date of birth reduces to a single essence: the same card speaks for both the persona you present and the nature beneath it.',
            'A unified persona — what you show the world is precisely who you are within.',
        ],
    },
    GrowthCard: {
        label: 'Your Growth Card',
        lines: [
            'The card of your current cycle — the lesson the universe is teaching you this year.',
            'Growth cards shift annually, marking the evolving chapter of your journey.',
            'Derived from your birth date and the current year.',
        ],
    },
    FirstNameCard: {
        label: 'Your First Name Card',
        lines: [
            'Your first name carries a vibrational signature in the Qabalah.',
            'Each letter corresponds to a path on the Tree of Life, revealing how you present yourself.',
            'Derived from the numerological analysis of your first name.',
        ],
    },
    MiddleNameCard: {
        label: 'Your Middle Name Card',
        lines: [
            'The hidden name — the bridge between your outer self and your family lineage.',
            'Your middle name reveals qualities held in reserve, waiting to be called upon.',
            'Derived from the numerological analysis of your middle name.',
        ],
    },
    LastNameCard: {
        label: 'Your Last Name Card',
        lines: [
            'Your surname carries the ancestral current — the river of your bloodline.',
            'This card reflects the inherited qualities and karmic legacy of your family.',
            'Derived from the numerological analysis of your last name.',
        ],
    },
    WholeNameCard: {
        label: 'Your Whole Name Card',
        lines: [
            'The grand synthesis — your complete name vibration as a single cosmic tone.',
            'All names combined reveal the total identity you carry through this incarnation.',
            'Derived from the numerological analysis of your full name.',
        ],
    },
    ZodiacalSunCard: {
        label: 'Your Zodiacal Sun Card',
        lines: [
            'The Zodiacal Sun is your cosmic archetype.',
            'Behold the colour of your soul. This card represents the very nature of your being, how you live and your role to play.',
            'Your Zodiacal Sun is based on your Zodiac. This is the part of the universe which is you.',
        ],
    },
    RisingSunCard: {
        label: 'Your Rising Sun Card',
        lines: [
            'The Rising Sun — your ascendant influence, how the world first perceives you.',
            'This card colours the dawn of every encounter and first impression.',
            'Derived from your birth time and location.',
        ],
    },
    PersonalZodiacalCard: {
        label: 'Your Personal Zodiacal Card',
        lines: [
            'The Zodiacal Sun is your cosmic archetype.',
            'Behold the colour of your soul. This card represents the very nature of your being, how you live and your role to play.',
            'Your Zodiacal Sun is based on your Zodiac. This is the part of the universe which is you.',
        ],
    },
    PersonalDecanCard: {
        label: 'Your Decan Card',
        lines: [
            'A refinement of your Zodiacal Sun — the aspect and flavour of your soul.',
            'Reveals how your archetype manifests through you, the particular expression of your cosmic nature.',
            'Your Decan is based on the specific third of your Zodiac.',
        ],
    },
    PersonalCourtCard: {
        label: 'Your Court Card',
        lines: [
            'The culmination of your being — who you truly are, or else may reveal yourself as and become.',
            'This is you at your deepest core, your truest potential.',
            'Your Court Card is based on the precise degree of your Zodiac.',
        ],
    },
};
