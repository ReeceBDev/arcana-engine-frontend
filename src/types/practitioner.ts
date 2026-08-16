export type Practitioner = {
    id: string;
    birthDate?: string;
    name?: string;
    birthTime?: string;
    birthLocation?: string;
    /** Birthplace latitude/longitude + IANA timezone, resolved from the selected city. */
    birthLatitude?: number;
    birthLongitude?: number;
    birthTimezone?: string;
    createdAt: number;
}
