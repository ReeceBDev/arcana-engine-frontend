import type { ArcanaIdentity } from "../app/constants/arcana-identities";
import type { CardRole } from "../app/constants/card-roles";

export type CardData = {
    role: CardRole;
    card: ArcanaIdentity;
};