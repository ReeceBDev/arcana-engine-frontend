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
    /** True when the birth date falls near a zodiacal cusp (backend flag) — the
     *  birth time is required before zodiacal readings are accurate. Persisted so
     *  re-entering the app re-applies the time-entry deviation until a time exists. */
    cuspWarning?: boolean;
    /** Backend-supplied user-facing explanation shown with the cusp warning. */
    cuspWarningMessage?: string | null;
    createdAt: number;
}
