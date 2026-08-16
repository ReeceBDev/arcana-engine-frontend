/**
 * City search + timezone resolution utilities.
 *
 * The city dataset lives at `src/data/cities.json` and is imported statically
 * (bundled directly). At ~33KB it's negligible in the initial payload and avoids
 * the flakiness of dynamic JSON imports.
 *
 * Each city carries its IANA timezone name (e.g. `Europe/London`). Combined with
 * a birth date + time, {@link offsetMinutesAt} resolves the *historical* UTC
 * offset that was genuinely in effect at that instant (DST + rule changes
 * included), as a pure local function call — the IANA tz database is already
 * bundled inside the JS engine via ICU (V8 on Android WebView, JavaScriptCore on
 * iOS WKWebView), so there is no network round-trip and no backend dependency.
 *
 * NOTE: IANA data is authoritative from ~1970 onward. Pre-1970 values fall back
 * to best-effort (often Local Mean Time). For this birth-reading app that window
 * is acceptable, so the existing `year > 1610` gate is unchanged.
 */

import citiesData from '../../data/cities.json';

export type City = {
    name: string;
    admin1?: string;
    country: string;
    lat: number;
    lng: number;
    timezone: string;
};

/**
 * ISO-3166 alpha-2 + common-alias lookup for the countries in the dataset, so
 * queries like "UK", "US", "DE", "UAE" match. Keyed by the exact country string
 * stored in cities.json. Covers all ~182 countries present after regeneration
 * from GeoNames.
 */
const COUNTRY_CODES: Record<string, string[]> = {
    'Afghanistan': ['AF'],
    'Albania': ['AL'],
    'Algeria': ['DZ'],
    'Andorra': ['AD'],
    'Angola': ['AO'],
    'Antigua and Barbuda': ['AG'],
    'Argentina': ['AR'],
    'Armenia': ['AM'],
    'Australia': ['AU'],
    'Austria': ['AT'],
    'Azerbaijan': ['AZ'],
    'Bahamas': ['BS'],
    'Bahrain': ['BH'],
    'Bangladesh': ['BD'],
    'Barbados': ['BB'],
    'Belarus': ['BY'],
    'Belgium': ['BE'],
    'Belize': ['BZ'],
    'Benin': ['BJ'],
    'Bhutan': ['BT'],
    'Bolivia': ['BO'],
    'Bosnia and Herzegovina': ['BA', 'BiH'],
    'Botswana': ['BW'],
    'Brazil': ['BR'],
    'Brunei': ['BN'],
    'Bulgaria': ['BG'],
    'Burkina Faso': ['BF'],
    'Burundi': ['BI'],
    'Cambodia': ['KH'],
    'Cameroon': ['CM'],
    'Canada': ['CA'],
    'Cape Verde': ['CV'],
    'Central African Republic': ['CF'],
    'Chad': ['TD'],
    'Chile': ['CL'],
    'China': ['CN'],
    'Colombia': ['CO'],
    'Comoros': ['KM'],
    'Congo': ['CG'],
    'Costa Rica': ['CR'],
    "Cote d'Ivoire": ['CI', "Côte d'Ivoire", 'CDI'],
    'Croatia': ['HR'],
    'Cuba': ['CU'],
    'Cyprus': ['CY'],
    'Czechia': ['CZ', 'Czech Republic'],
    'Czech Republic': ['CZ', 'Czechia'],
    'Denmark': ['DK'],
    'Djibouti': ['DJ'],
    'Dominican Republic': ['DO', 'DR'],
    'DR Congo': ['CD', 'DRC'],
    'Ecuador': ['EC'],
    'Egypt': ['EG'],
    'El Salvador': ['SV'],
    'Equatorial Guinea': ['GQ'],
    'Eritrea': ['ER'],
    'Estonia': ['EE'],
    'Eswatini': ['SZ'],
    'Ethiopia': ['ET'],
    'Fiji': ['FJ'],
    'Finland': ['FI'],
    'France': ['FR'],
    'French Guiana': ['GF'],
    'Gabon': ['GA'],
    'Gambia': ['GM'],
    'Georgia': ['GE'],
    'Germany': ['DE'],
    'Ghana': ['GH'],
    'Greece': ['GR'],
    'Guadeloupe': ['GP'],
    'Guatemala': ['GT'],
    'Guinea': ['GN'],
    'Guinea-Bissau': ['GW'],
    'Guyana': ['GY'],
    'Haiti': ['HT'],
    'Honduras': ['HN'],
    'Hong Kong': ['HK'],
    'Hungary': ['HU'],
    'Iceland': ['IS'],
    'India': ['IN'],
    'Indonesia': ['ID'],
    'Iran': ['IR'],
    'Iraq': ['IQ'],
    'Ireland': ['IE'],
    'Israel': ['IL'],
    'Italy': ['IT'],
    'Jamaica': ['JM'],
    'Japan': ['JP'],
    'Jordan': ['JO'],
    'Kazakhstan': ['KZ'],
    'Kenya': ['KE'],
    'Kyrgyzstan': ['KG'],
    'Laos': ['LA'],
    'Latvia': ['LV'],
    'Lebanon': ['LB'],
    'Lesotho': ['LS'],
    'Liberia': ['LR'],
    'Libya': ['LY'],
    'Liechtenstein': ['LI'],
    'Lithuania': ['LT'],
    'Luxembourg': ['LU'],
    'Macau': ['MO'],
    'Madagascar': ['MG'],
    'Malawi': ['MW'],
    'Malaysia': ['MY'],
    'Maldives': ['MV'],
    'Mali': ['ML'],
    'Malta': ['MT'],
    'Mauritania': ['MR'],
    'Mauritius': ['MU'],
    'Mexico': ['MX'],
    'Moldova': ['MD'],
    'Mongolia': ['MN'],
    'Montenegro': ['ME'],
    'Morocco': ['MA'],
    'Mozambique': ['MZ'],
    'Myanmar': ['MM'],
    'Namibia': ['NA'],
    'Nepal': ['NP'],
    'Netherlands': ['NL'],
    'New Caledonia': ['NC'],
    'New Zealand': ['NZ'],
    'Nicaragua': ['NI'],
    'Niger': ['NE'],
    'Nigeria': ['NG'],
    'North Korea': ['KP'],
    'North Macedonia': ['MK'],
    'Norway': ['NO'],
    'Oman': ['OM'],
    'Pakistan': ['PK'],
    'Panama': ['PA'],
    'Papua New Guinea': ['PG'],
    'Paraguay': ['PY'],
    'Peru': ['PE'],
    'Philippines': ['PH'],
    'Poland': ['PL'],
    'Portugal': ['PT'],
    'Puerto Rico': ['PR'],
    'Qatar': ['QA'],
    'Reunion': ['RE', 'Réunion'],
    'Romania': ['RO'],
    'Russia': ['RU'],
    'Rwanda': ['RW'],
    'Saint Kitts and Nevis': ['KN'],
    'Saint Lucia': ['LC'],
    'Saint Vincent and the Grenadines': ['VC'],
    'Samoa': ['WS'],
    'San Marino': ['SM'],
    'Sao Tome and Principe': ['ST'],
    'Saudi Arabia': ['SA'],
    'Senegal': ['SN'],
    'Serbia': ['RS'],
    'Seychelles': ['SC'],
    'Sierra Leone': ['SL'],
    'Singapore': ['SG'],
    'Slovakia': ['SK'],
    'Slovenia': ['SI'],
    'Solomon Islands': ['SB'],
    'Somalia': ['SO'],
    'South Africa': ['ZA'],
    'South Korea': ['KR'],
    'South Sudan': ['SS'],
    'Spain': ['ES'],
    'Sri Lanka': ['LK'],
    'Sudan': ['SD'],
    'Suriname': ['SR'],
    'Sweden': ['SE'],
    'Switzerland': ['CH'],
    'Syria': ['SY'],
    'Taiwan': ['TW'],
    'Tajikistan': ['TJ'],
    'Tanzania': ['TZ'],
    'Thailand': ['TH'],
    'Timor-Leste': ['TL'],
    'Togo': ['TG'],
    'Trinidad and Tobago': ['TT'],
    'Tunisia': ['TN'],
    'Turkey': ['TR'],
    'Turkmenistan': ['TM'],
    'U.S. Virgin Islands': ['VI'],
    'Uganda': ['UG'],
    'Ukraine': ['UA'],
    'United Arab Emirates': ['AE', 'UAE'],
    'United Kingdom': ['GB', 'UK'],
    'United States': ['US', 'USA'],
    'Uruguay': ['UY'],
    'Uzbekistan': ['UZ'],
    'Vanuatu': ['VU'],
    'Vatican City': ['VA'],
    'Venezuela': ['VE'],
    'Vietnam': ['VN'],
    'Yemen': ['YE'],
    'Zambia': ['ZM'],
    'Zimbabwe': ['ZW'],
};

/**
 * National capitals (friendly-country → capital-city name), verified to exist
 * in the dataset under that exact name+country. Generated from GeoNames
 * `countryInfo.txt` via `scripts/verify-capitals.ps1`. Used so a country-level
 * query (e.g. "UK", "Germany", "United States") resolves to its capital rather
 * than an arbitrary city.
 *
 * Countries absent here (mostly small island/territory capitals below the 50k
 * population threshold, or accent-stripped name mismatches) simply have no
 * capital shortcut — their cities still search/match normally.
 */
const CAPITALS: Record<string, string> = {
    'United Arab Emirates': 'Abu Dhabi',
    'Afghanistan': 'Kabul',
    'Albania': 'Tirana',
    'Armenia': 'Yerevan',
    'Angola': 'Luanda',
    'Argentina': 'Buenos Aires',
    'Austria': 'Vienna',
    'Australia': 'Canberra',
    'Azerbaijan': 'Baku',
    'Bosnia and Herzegovina': 'Sarajevo',
    'Barbados': 'Bridgetown',
    'Bangladesh': 'Dhaka',
    'Belgium': 'Brussels',
    'Burkina Faso': 'Ouagadougou',
    'Bulgaria': 'Sofia',
    'Bahrain': 'Manama',
    'Burundi': 'Gitega',
    'Benin': 'Porto-Novo',
    'Brunei': 'Bandar Seri Begawan',
    'Bolivia': 'Sucre',
    'Bahamas': 'Nassau',
    'Bhutan': 'Thimphu',
    'Botswana': 'Gaborone',
    'Belarus': 'Minsk',
    'Canada': 'Ottawa',
    'DR Congo': 'Kinshasa',
    'Central African Republic': 'Bangui',
    'Congo': 'Brazzaville',
    'Switzerland': 'Bern',
    "Cote d'Ivoire": 'Yamoussoukro',
    'Chile': 'Santiago',
    'China': 'Beijing',
    'Cuba': 'Havana',
    'Cape Verde': 'Praia',
    'Cyprus': 'Nicosia',
    'Czechia': 'Prague',
    'Germany': 'Berlin',
    'Djibouti': 'Djibouti',
    'Denmark': 'Copenhagen',
    'Dominican Republic': 'Santo Domingo',
    'Algeria': 'Algiers',
    'Ecuador': 'Quito',
    'Estonia': 'Tallinn',
    'Egypt': 'Cairo',
    'Eritrea': 'Asmara',
    'Spain': 'Madrid',
    'Ethiopia': 'Addis Ababa',
    'Finland': 'Helsinki',
    'Fiji': 'Suva',
    'France': 'Paris',
    'Gabon': 'Libreville',
    'United Kingdom': 'London',
    'Georgia': 'Tbilisi',
    'French Guiana': 'Cayenne',
    'Ghana': 'Accra',
    'Guinea': 'Conakry',
    'Greece': 'Athens',
    'Guatemala': 'Guatemala City',
    'Guinea-Bissau': 'Bissau',
    'Guyana': 'Georgetown',
    'Hong Kong': 'Hong Kong',
    'Honduras': 'Tegucigalpa',
    'Croatia': 'Zagreb',
    'Haiti': 'Port-au-Prince',
    'Hungary': 'Budapest',
    'Indonesia': 'Jakarta',
    'Ireland': 'Dublin',
    'Israel': 'Jerusalem',
    'India': 'New Delhi',
    'Iraq': 'Baghdad',
    'Iran': 'Tehran',
    'Italy': 'Rome',
    'Jamaica': 'Kingston',
    'Jordan': 'Amman',
    'Japan': 'Tokyo',
    'Kenya': 'Nairobi',
    'Kyrgyzstan': 'Bishkek',
    'Cambodia': 'Phnom Penh',
    'Comoros': 'Moroni',
    'North Korea': 'Pyongyang',
    'South Korea': 'Seoul',
    'Kuwait': 'Kuwait City',
    'Laos': 'Vientiane',
    'Lebanon': 'Beirut',
    'Sri Lanka': 'Colombo',
    'Liberia': 'Monrovia',
    'Lesotho': 'Maseru',
    'Lithuania': 'Vilnius',
    'Luxembourg': 'Luxembourg',
    'Latvia': 'Riga',
    'Libya': 'Tripoli',
    'Morocco': 'Rabat',
    'Moldova': 'Chisinau',
    'Montenegro': 'Podgorica',
    'Madagascar': 'Antananarivo',
    'North Macedonia': 'Skopje',
    'Mali': 'Bamako',
    'Myanmar': 'Nay Pyi Taw',
    'Mauritania': 'Nouakchott',
    'Mauritius': 'Port Louis',
    'Maldives': 'Male',
    'Malawi': 'Lilongwe',
    'Mexico': 'Mexico City',
    'Malaysia': 'Kuala Lumpur',
    'Mozambique': 'Maputo',
    'Namibia': 'Windhoek',
    'Niger': 'Niamey',
    'Nigeria': 'Abuja',
    'Nicaragua': 'Managua',
    'Netherlands': 'Amsterdam',
    'Norway': 'Oslo',
    'Nepal': 'Kathmandu',
    'New Zealand': 'Wellington',
    'Oman': 'Muscat',
    'Panama': 'Panama City',
    'Peru': 'Lima',
    'Papua New Guinea': 'Port Moresby',
    'Philippines': 'Manila',
    'Pakistan': 'Islamabad',
    'Poland': 'Warsaw',
    'Puerto Rico': 'San Juan',
    'Portugal': 'Lisbon',
    'Qatar': 'Doha',
    'Reunion': 'Saint-Denis',
    'Romania': 'Bucharest',
    'Serbia': 'Belgrade',
    'Russia': 'Moscow',
    'Rwanda': 'Kigali',
    'Saudi Arabia': 'Riyadh',
    'Solomon Islands': 'Honiara',
    'Sudan': 'Khartoum',
    'Sweden': 'Stockholm',
    'Singapore': 'Singapore',
    'Slovenia': 'Ljubljana',
    'Slovakia': 'Bratislava',
    'Sierra Leone': 'Freetown',
    'Senegal': 'Dakar',
    'Somalia': 'Mogadishu',
    'Suriname': 'Paramaribo',
    'South Sudan': 'Juba',
    'El Salvador': 'San Salvador',
    'Syria': 'Damascus',
    'Eswatini': 'Mbabane',
    'Chad': "N'Djamena",
    'Thailand': 'Bangkok',
    'Tajikistan': 'Dushanbe',
    'Timor-Leste': 'Dili',
    'Turkmenistan': 'Ashgabat',
    'Tunisia': 'Tunis',
    'Turkey': 'Ankara',
    'Taiwan': 'Taipei',
    'Tanzania': 'Dodoma',
    'Ukraine': 'Kyiv',
    'Uganda': 'Kampala',
    'United States': 'Washington',
    'Uruguay': 'Montevideo',
    'Uzbekistan': 'Tashkent',
    'Venezuela': 'Caracas',
    'Vietnam': 'Hanoi',
    'Yemen': 'Sanaa',
    'South Africa': 'Pretoria',
    'Zambia': 'Lusaka',
    'Zimbabwe': 'Harare',
};

/**
 * Reverse map: ISO-2 code / alias → friendly country name, so a code query like
 * "UK" or "DE" can resolve to the country whose capital we want. Built once from
 * {@link COUNTRY_CODES} at module load.
 */
const CODE_TO_COUNTRY: Record<string, string> = (() => {
    const m: Record<string, string> = {};
    for (const [country, codes] of Object.entries(COUNTRY_CODES)) {
        m[country.toLowerCase()] = country;
        for (const code of codes) m[code.toLowerCase()] = country;
    }
    return m;
})();

/**
 * If a query refers to a country (by name, ISO-2 code, or alias), return the
 * friendly country name. Case-insensitive, exact-or-prefix match.
 *   "UK" → "United Kingdom", "German" → "Germany", "United St" → "United States"
 */
export function matchCountry(query: string): string | null {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    // Exact code/name first.
    if (CODE_TO_COUNTRY[q]) return CODE_TO_COUNTRY[q];
    // Prefix match against names + codes (longest first so "United States"
    // beats a hypothetical "United ...").
    const keys = Object.keys(CODE_TO_COUNTRY).filter(k => k.startsWith(q));
    if (keys.length) {
        keys.sort((a, b) => b.length - a.length);
        return CODE_TO_COUNTRY[keys[0]];
    }
    return null;
}

/**
 * Resolve the capital {@link City} for a friendly country name, looked up in the
 * loaded dataset. Returns null if the country has no capital shortcut (see
 * {@link CAPITALS}) or the capital isn't present in the data.
 */
export function getCapitalCity(country: string, cities?: City[]): City | null {
    const capitalName = CAPITALS[country];
    if (!capitalName) return null;
    const list = cities ?? getIndex().map(ic => ic.city);
    return list.find(c => c.name === capitalName && c.country === country) ?? null;
}

type IndexedCity = { city: City; name: string; haystack: string };

let cache: IndexedCity[] | null = null;

/**
 * Load + index the city dataset (cached after first call). The data is imported
 * statically; this wrapper builds a normalized search index (name + admin1 +
 * country + country codes) for substring matching.
 */
function getIndex(): IndexedCity[] {
    if (cache) return cache;
    const data = citiesData as unknown;
    if (!Array.isArray(data)) {
        console.error('[citySearch] getIndex: imported JSON is not an array:', typeof data);
        cache = [];
        return cache;
    }
    cache = (data as City[]).map(city => {
        const name = city.name.toLowerCase();
        const codes = COUNTRY_CODES[city.country] ?? [];
        const haystack = [
            city.name,
            city.admin1 ?? '',
            city.country,
            ...codes,
        ].join(' ').toLowerCase();
        return { city, name, haystack };
    });
    console.debug('[citySearch] getIndex: indexed', cache.length, 'cities. First:', cache[0]?.city);
    return cache;
}

/**
 * Prime the search index (cached after first call). Kept for callers that want
 * to warm the cache on mount; {@link searchCities} self-initializes if needed.
 */
export function loadCities(): City[] {
    return getIndex().map(ic => ic.city);
}

/**
 * Substring match across name + admin1 + country + ISO codes, ranked so that
 * name matches surface above country matches. If the query refers to a country
 * (by name or code), that country's CAPITAL is boosted to position #1 so that
 * pressing Enter on a country query resolves to the capital. Solved cases:
 *  - "Lo" / "lon"        → London (name prefix)
 *  - "UK" / "US" / "DE"  → capital boosted first (London / Washington / Berlin)
 *  - "Unite" / "United"  → capital boosted first, then other matching cities
 *  - "York" / "England"  → via admin1/country substring
 */
export function searchCities(query: string, cities?: City[], limit = 8): City[] {
    // Accept either the indexed form or raw City[] for backwards compat.
    const index: IndexedCity[] = cache ?? (Array.isArray(cities)
        ? cities.map(c => {
            const codes = COUNTRY_CODES[c.country] ?? [];
            return {
                city: c,
                name: c.name.toLowerCase(),
                haystack: [c.name, c.admin1 ?? '', c.country, ...codes].join(' ').toLowerCase(),
            };
        })
        : []);
    if (cache === null) cache = index;

    const q = query.trim().toLowerCase();
    if (!q) return [];

    const prefix: IndexedCity[] = [];
    const substr: IndexedCity[] = [];
    for (const ic of index) {
        if (ic.name.startsWith(q)) prefix.push(ic);
        else if (ic.haystack.includes(q)) substr.push(ic);
    }

    let ranked: City[] = [...prefix, ...substr].map(ic => ic.city);

    // If the query refers to a country, boost its capital to the very top.
    const country = matchCountry(q);
    if (country) {
        const capital = getCapitalCity(country, cities);
        if (capital) {
            ranked = ranked.filter(c => !(c.name === capital.name && c.country === capital.country));
            ranked.unshift(capital);
        }
    }

    const matches = ranked.slice(0, limit);
    console.debug('[citySearch] searchCities: query="' + q + '"' + (country ? ' (country=' + country + ', capital boosted)' : '') + ' →', matches.length, 'matches:', matches.map(c => `${c.name}, ${c.country}`));
    return matches;
}


/** Human-readable label, e.g. `"London, United Kingdom"`. Used for the input + persisted birthLocation string. */
export function formatCityLabel(city: City): string {
    return `${city.name}, ${city.country}`;
}

/**
 * Resolve the UTC offset (in minutes) that was in effect in `tz` at the given
 * *local wall-clock* instant. DST + historical tz rules are included because we
 * round-trip through `Intl.DateTimeFormat` (which uses the bundled IANA db).
 *
 * Technique: pretend the local wall-clock is UTC, ask the formatter what the
 * wall-clock actually reads in `tz` at that instant, and take the difference.
 *
 * Caveat: near a DST transition a wall time can be non-existent or ambiguous;
 * this resolves to whichever interpretation the formatter picks. Fine for a
 * birth-reading app.
 */
export function offsetMinutesAt(
    tz: string,
    y: number,
    m: number,
    d: number,
    h: number,
    min: number
): number {
    // Treat the given local wall-clock as if it were UTC.
    const asIfUtc = Date.UTC(y, m - 1, d, h, min);

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).formatToParts(new Date(asIfUtc));

    const p: Record<string, string> = {};
    for (const part of parts) p[part.type] = part.value;
    // Hour may render as "24" at midnight in some engines — wrap to 0..23.
    const localAsUtc = Date.UTC(
        Number(p.year),
        Number(p.month) - 1,
        Number(p.day),
        (Number(p.hour) % 24),
        Number(p.minute)
    );

    return Math.round((localAsUtc - asIfUtc) / 60000);
}

/** Parsed birth inputs in the formats the app stores them. */
export type BirthInputs = { y: number; m: number; d: number; h: number; min: number };

/**
 * Parse the app's stored birthDate / birthTime into numeric components for
 * {@link offsetMinutesAt}. `birthDate` is ISO `YYYY-MM-DD` (from DateSelector);
 * `birthTime` is `HH : MM` (from handleTimeInput) or empty if skipped.
 *
 * If the time was skipped, defaults to 12:00 (noon) — a common astrology fallback.
 * Returns null if `birthDate` is missing or malformed.
 */
export function parseBirthInputs(birthDate: string, birthTime: string): BirthInputs | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
    const [y, m, d] = birthDate.split('-').map(Number);

    const digits = birthTime.replace(/\D/g, '');
    const h = digits.length >= 2 ? Number(digits.slice(0, 2)) : 12;
    const min = digits.length >= 4 ? Number(digits.slice(2, 4)) : 0;

    return { y, m, d, h, min };
}

/** Format a signed integer minute offset as `+HH:MM` / `-HH:MM`. */
export function formatOffset(offsetMinutes: number): string {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const offH = String(Math.floor(abs / 60)).padStart(2, '0');
    const offM = String(abs % 60).padStart(2, '0');
    return `${sign}${offH}:${offM}`;
}

/**
 * Assemble an ISO-8601 birth-datetime string with offset at the API boundary,
 * e.g. `2000-05-15T13:30:00+01:00` — natively parseable by C# `DateTimeOffset.Parse`.
 *
 * @param birthDate  ISO `YYYY-MM-DD` (from DateSelector).
 * @param birthTime  `HH : MM` (from handleTimeInput), or empty.
 * @param offsetMinutes  Resolved offset in minutes (from {@link offsetMinutesAt}).
 */
export function toIso8601(birthDate: string, birthTime: string, offsetMinutes: number): string {
    const digits = birthTime.replace(/\D/g, '');
    const hh = (digits.length >= 2 ? digits.slice(0, 2) : '00').padStart(2, '0');
    const mm = (digits.length >= 4 ? digits.slice(2, 4) : '00').padStart(2, '0');
    return `${birthDate}T${hh}:${mm}:00${formatOffset(offsetMinutes)}`;
}
