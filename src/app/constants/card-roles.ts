export const CARD_ROLES = [
    'UncategorisedCard',
    'PersonalityCard',
    'CharacterCard',
    'GrowthCard',
    'FirstNameCard',
    'MiddleNameCard',
    'LastNameCard',
    'WholeNameCard',
    'ZodiacalSunCard',
    'RisingSunCard',
    'PersonalZodiacalCard',
    'PersonalDecanCard',
    'PersonalCourtCard',
] as const;

export type CardRole = typeof CARD_ROLES[number];

/** Turn "PersonalCourtCard" → "Personal Court Card" */
export function formatRole(role: CardRole): string {
    return role.replace(/([a-z])([A-Z])/g, '$1 $2');
}
