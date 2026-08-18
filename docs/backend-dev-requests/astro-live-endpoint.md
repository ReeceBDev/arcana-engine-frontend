# Development Request: `GET /astro/live` — Live Astrology timeline endpoint

**Backend:** Thoth.WebAPI (ASP.NET minimal API, base `http://127.0.0.1:5069`)
**Frontend consumer:** Live Astrology screen (`src/app/pages/LiveAstrology/*`, `src/app/components/LiveAstroTimeline/*`)
**Status:** Requested — the endpoint does not exist yet. Until it ships, the frontend silently falls back to hard-coded demo data (`src/app/utilities/astro/demo-data.ts`) and shows a "demo sky" pill in the header.

---

## 1. Route

```
GET /astro/live?from=<ISO-8601>&to=<ISO-8601>
```

- **Path convention:** bare route, no `/api` prefix — identical to the existing `MapPost("/reading/birthdate")`, `/reading/name`, `/reading/full`, `MapGet("/reading/growth")` registrations in `Endpoint.cs`. (`/astro/live` was chosen by the frontend to parallel `/reading/*`.)
- **`from` / `to`** — ISO-8601 strings **with offset** (e.g. `2026-08-18T09:23:11.000Z`). Parse with `DateTimeOffset.Parse`, same as `FullRequest.BirthTime`.
- The frontend always calls with `from = now − 1.5 days` and `to = now + 5 days` (constants `BEHIND_MS` / `AHEAD_MS` in `src/app/utilities/astro/live.ts`), refreshed every 10 minutes.
- **Response:** `200 OK` with a JSON body of the shape in §3 (camelCase, default ASP.NET serializer behaviour — matches the existing endpoints).
- **Errors:** any non-2xx → the frontend catches, logs, and falls back to demo data. Prefer a normal `Results.Problem` for unexpected failures; there is no frontend-specific error contract to honour.
- **CORS:** already handled host-wide (allow-any policy in `Program.cs`).

## 2. What the backend must compute

Using Swiss Ephemeris (already a Thoth dependency — `SwissEphNet`):

1. **Placements** for the ten classical bodies (`Sun…Pluto`): current sign, degree-in-sign (0–30), apparent geocentric speed (deg/day), retrograde flag, and each body's span through its current sign (entered / leaves / crosses 15°).
2. **Events** within `[from, to]`: sign ingresses and stations (retrograde/direct) — plus each event's text-row span (see §3).
3. **Aspects** currently within orb between any two of the ten bodies (conjunction, sextile, square, trine, opposition), with orb size and applying/separating state, plus entered-orb / exact-perfection / leaves-orb timestamps.

> Open questions for the backend developer to settle (frontend is agnostic):
> - Aspect **orb limits** per aspect/body (suggested starting point: 6° for conjunction/opposition, 4° elsewhere; Moon maybe wider).
> - Station span semantics (see `AstroEvent` below) — if a strict interpretation is impractical, return sensible approximations and note them here.

## 3. Response contract

The authoritative source is the TypeScript the frontend already consumes — `src/app/utilities/astro/types.ts`. Summary:

```jsonc
{
  "fetchedAt": "2026-08-18T12:00:00+00:00",   // server clock at computation time
  "placements": [ /* Placement, one per body — ALL TEN, always */ ],
  "events":     [ /* AstroEvent, ingress/station within [from, to] */ ],
  "aspects":    [ /* AspectInfo, currently within orb */ ]
}
```

### Placement

```jsonc
{
  "planet": "Venus",              // PlanetId: Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto
  "sign": "Leo",                  // ZodiacSign: Aries…Pisces
  "degreeInSign": 14.2,           // 0–30
  "speed": 1.1,                   // deg/day; negative = retrograde
  "retrograde": false,            // convenience: speed < 0
  "peaksAt": "2026-08-20T04:00:00+00:00",  // crosses 15° (mid-sign); null if already past 15°
  "stopsAt": "2026-09-07T11:00:00+00:00",  // leaves the sign
  "startedAt": "2026-08-01T08:00:00+00:00" // entered the sign
}
```

### AstroEvent (ingress / station)

```jsonc
{
  "id": "ingress-venus-leo-2026-08-15T04:00:00Z",  // stable identity (React keys)
  "kind": "ingress",               // "ingress" | "station"
  "planet": "Venus",
  "sign": "Leo",                   // new sign (ingress) or station sign
  "direction": "retrograde",       // stations only; omit for ingresses
  "time": "2026-08-15T04:00:00+00:00",  // the plotted moment of the event
  "peaksAt": "2026-08-25T04:00:00+00:00",  // ingress: crosses 15° of new sign
                                            // station retrograde: retrograde arc midpoint
  "stopsAt": "2026-09-07T11:00:00+00:00",   // ingress: leaves the new sign
                                            // station retrograde: station direct
  "startedAt": "2026-08-15T04:00:00+00:00"  // the event itself
}
```

### AspectInfo

```jsonc
{
  "planetA": "Mars",
  "signA": "Gemini",
  "planetB": "Jupiter",
  "signB": "Aquarius",
  "aspect": "trine",               // conjunction|sextile|square|trine|opposition
  "orbDeg": 1.4,                   // |separation − exact angle|
  "applying": true,                // growing more exact over time
  "peaksAt": "2026-08-21T00:00:00+00:00",  // exact perfection; null when it never perfects
  "stopsAt": "2026-08-30T00:00:00+00:00",  // leaves orb
  "startedAt": "2026-08-05T00:00:00+00:00" // entered orb
}
```

All timestamps ISO-8601 with offset. `peaksAt` is nullable **only** on aspects (an aspect that never perfects within its orb window); placements/events must always supply theirs.

## 4. Frontend validation (what makes the demo pill disappear)

`loadLiveAstro` (`src/app/utilities/astro/live.ts`) accepts the payload only when:
- the request returned 2xx, **and**
- `placements`, `events`, `aspects` are all arrays.

Anything else (or a throw) → demo fallback + "demo sky" pill. So: keep the three arrays present even when empty, and never return 200 with a differently-shaped body.

## 5. Worked example

`src/app/utilities/astro/demo-data.ts` (`buildDemoLiveAstro`) is a full, valid payload example — it was written to this contract, including one never-perfecting aspect (`peaksAt: null`) to exercise the nullable path. Cross-check against it.

## 6. Acceptance checklist

- [ ] `GET /astro/live?from=…&to=…` returns 200 with `fetchedAt` + the three arrays (camelCase).
- [ ] All ten bodies present in `placements`, each with the five span/sign/speed fields.
- [ ] An ingress inside the window appears in `events` with the full span triple.
- [ ] A retrograde station inside the window appears with `kind: "station"` + `direction`.
- [ ] At least one aspect in orb; a never-perfecting aspect returns `peaksAt: null`.
- [ ] Timestamps are ISO-8601 with offset and parse with `DateTimeOffset.Parse`-symmetric tooling (JS `Date.parse`).
- [ ] Live Astrology screen shows real data (no "demo sky" pill) against the running backend.
