# Transform GeoNames cities15000.txt into src/data/cities.json
# Reads with UTF-8 to preserve non-ASCII city names.
# Columns (geonames.org/export): geonameid, name, asciiname, alternatenames,
#   lat, lng, featureClass, featureCode, countryCode, cc2, admin1Code,
#   admin2Code, admin3Code, admin4Code, population, elevation, dem, timezone, modified

param(
    [string]$In = "$env:TEMP\cities15000\cities15000.txt",
    [string]$Out = "$PSScriptRoot\..\src\data\cities.json"
)

# Map ISO-2 country code -> full country name (subset of the ~250 ISO codes).
# GeoNames uses ISO-2; we want the friendly name for display.
$CountryNames = @{
    'AD'='Andorra'; 'AE'='United Arab Emirates'; 'AF'='Afghanistan'; 'AG'='Antigua and Barbuda'
    'AI'='Anguilla'; 'AL'='Albania'; 'AM'='Armenia'; 'AO'='Angola'; 'AR'='Argentina'
    'AT'='Austria'; 'AU'='Australia'; 'AW'='Aruba'; 'AZ'='Azerbaijan'; 'BA'='Bosnia and Herzegovina'
    'BB'='Barbados'; 'BD'='Bangladesh'; 'BE'='Belgium'; 'BF'='Burkina Faso'; 'BG'='Bulgaria'
    'BH'='Bahrain'; 'BI'='Burundi'; 'BJ'='Benin'; 'BN'='Brunei'; 'BO'='Bolivia'
    'BR'='Brazil'; 'BS'='Bahamas'; 'BT'='Bhutan'; 'BW'='Botswana'; 'BY'='Belarus'
    'BZ'='Belize'; 'CA'='Canada'; 'CD'='DR Congo'; 'CF'='Central African Republic'; 'CG'='Congo'
    'CH'='Switzerland'; 'CI'="Cote d'Ivoire"; 'CL'='Chile'; 'CM'='Cameroon'; 'CN'='China'
    'CO'='Colombia'; 'CR'='Costa Rica'; 'CU'='Cuba'; 'CV'='Cape Verde'; 'CY'='Cyprus'
    'CZ'='Czechia'; 'DE'='Germany'; 'DJ'='Djibouti'; 'DK'='Denmark'; 'DO'='Dominican Republic'
    'DZ'='Algeria'; 'EC'='Ecuador'; 'EE'='Estonia'; 'EG'='Egypt'; 'ER'='Eritrea'
    'ES'='Spain'; 'ET'='Ethiopia'; 'FI'='Finland'; 'FJ'='Fiji'; 'FM'='Micronesia'
    'FO'='Faroe Islands'; 'FR'='France'; 'GA'='Gabon'; 'GB'='United Kingdom'; 'GD'='Grenada'
    'GE'='Georgia'; 'GF'='French Guiana'; 'GH'='Ghana'; 'GL'='Greenland'; 'GM'='Gambia'
    'GN'='Guinea'; 'GP'='Guadeloupe'; 'GQ'='Equatorial Guinea'; 'GR'='Greece'; 'GT'='Guatemala'
    'GU'='Guam'; 'GW'='Guinea-Bissau'; 'GY'='Guyana'; 'HK'='Hong Kong'; 'HN'='Honduras'
    'HR'='Croatia'; 'HT'='Haiti'; 'HU'='Hungary'; 'ID'='Indonesia'; 'IE'='Ireland'
    'IL'='Israel'; 'IN'='India'; 'IQ'='Iraq'; 'IR'='Iran'; 'IS'='Iceland'
    'IT'='Italy'; 'JM'='Jamaica'; 'JO'='Jordan'; 'JP'='Japan'; 'KE'='Kenya'
    'KG'='Kyrgyzstan'; 'KH'='Cambodia'; 'KI'='Kiribati'; 'KM'='Comoros'; 'KN'='Saint Kitts and Nevis'
    'KP'='North Korea'; 'KR'='South Korea'; 'KW'='Kuwait'; 'KY'='Cayman Islands'; 'KZ'='Kazakhstan'
    'LA'='Laos'; 'LB'='Lebanon'; 'LC'='Saint Lucia'; 'LI'='Liechtenstein'; 'LK'='Sri Lanka'
    'LR'='Liberia'; 'LS'='Lesotho'; 'LT'='Lithuania'; 'LU'='Luxembourg'; 'LV'='Latvia'
    'LY'='Libya'; 'MA'='Morocco'; 'MC'='Monaco'; 'MD'='Moldova'; 'ME'='Montenegro'
    'MG'='Madagascar'; 'MH'='Marshall Islands'; 'MK'='North Macedonia'; 'ML'='Mali'; 'MM'='Myanmar'
    'MN'='Mongolia'; 'MO'='Macau'; 'MP'='Northern Mariana Islands'; 'MR'='Mauritania'; 'MS'='Montserrat'
    'MT'='Malta'; 'MU'='Mauritius'; 'MV'='Maldives'; 'MW'='Malawi'; 'MX'='Mexico'
    'MY'='Malaysia'; 'MZ'='Mozambique'; 'NA'='Namibia'; 'NC'='New Caledonia'; 'NE'='Niger'
    'NG'='Nigeria'; 'NI'='Nicaragua'; 'NL'='Netherlands'; 'NO'='Norway'; 'NP'='Nepal'
    'NR'='Nauru'; 'NZ'='New Zealand'; 'OM'='Oman'; 'PA'='Panama'; 'PE'='Peru'
    'PF'='French Polynesia'; 'PG'='Papua New Guinea'; 'PH'='Philippines'; 'PK'='Pakistan'; 'PL'='Poland'
    'PM'='Saint Pierre and Miquelon'; 'PR'='Puerto Rico'; 'PT'='Portugal'; 'PW'='Palau'; 'PY'='Paraguay'
    'QA'='Qatar'; 'RE'='Reunion'; 'RO'='Romania'; 'RS'='Serbia'; 'RU'='Russia'
    'RW'='Rwanda'; 'SA'='Saudi Arabia'; 'SB'='Solomon Islands'; 'SC'='Seychelles'; 'SD'='Sudan'
    'SE'='Sweden'; 'SG'='Singapore'; 'SI'='Slovenia'; 'SK'='Slovakia'; 'SL'='Sierra Leone'
    'SM'='San Marino'; 'SN'='Senegal'; 'SO'='Somalia'; 'SR'='Suriname'; 'SS'='South Sudan'
    'ST'='Sao Tome and Principe'; 'SV'='El Salvador'; 'SY'='Syria'; 'SZ'='Eswatini'; 'TD'='Chad'
    'TG'='Togo'; 'TH'='Thailand'; 'TJ'='Tajikistan'; 'TL'='Timor-Leste'; 'TM'='Turkmenistan'
    'TN'='Tunisia'; 'TO'='Tonga'; 'TR'='Turkey'; 'TT'='Trinidad and Tobago'; 'TV'='Tuvalu'
    'TW'='Taiwan'; 'TZ'='Tanzania'; 'UA'='Ukraine'; 'UG'='Uganda'; 'US'='United States'
    'UY'='Uruguay'; 'UZ'='Uzbekistan'; 'VA'='Vatican City'; 'VC'='Saint Vincent and the Grenadines'
    'VE'='Venezuela'; 'VG'='British Virgin Islands'; 'VI'='U.S. Virgin Islands'; 'VN'='Vietnam'; 'VU'='Vanuatu'
    'WS'='Samoa'; 'YE'='Yemen'; 'ZA'='South Africa'; 'ZM'='Zambia'; 'ZW'='Zimbabwe'
}

# Read raw lines as UTF-8.
$lines = [System.IO.File]::ReadAllLines($In, [System.Text.Encoding]::UTF8)
Write-Host "Read $($lines.Count) lines"

# Geonames feature classes we want: P (populated place). Filter PPL*/PCL*.
$cities = New-Object System.Collections.Generic.List[object]
$seen = New-Object System.Collections.Generic.HashSet[string]

foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $f = $line -split "`t"
    if ($f.Count -lt 18) { continue }
    $fc = $f[6]; $code = $f[7]
    # Only populated places (PPL*), skip countries/regions (PCL*) and administrative seats we don't want.
    if ($fc -ne 'P') { continue }
    if (-not $code.StartsWith('PPL')) { continue }

    $name = $f[1].Trim()
    $lat = $f[4]; $lng = $f[5]
    $cc = $f[8]
    $pop = 0; [int]::TryParse($f[14], [ref]$pop) | Out-Null
    $tz = $f[17]

    if ([string]::IsNullOrWhiteSpace($name)) { continue }
    if ([string]::IsNullOrWhiteSpace($cc)) { continue }
    if (-not $CountryNames.ContainsKey($cc)) { continue }
    if ([string]::IsNullOrWhiteSpace($tz)) { continue }
    # Keep population >= 30000 — balance of coverage vs size (~5k-7k cities).
    if ($pop -lt 50000) { continue }

    # Dedupe by (name, country) — keep the highest-population variant.
    $key = "$name|$cc"
    if ($seen.Contains($key)) { continue }
    [void]$seen.Add($key)

    [void]$cities.Add([pscustomobject]@{
        name = $name
        country = $CountryNames[$cc]
        lat = [double]$lat
        lng = [double]$lng
        timezone = $tz
    })
}

Write-Host "After filtering (PPL, pop>=30000, dedupe): $($cities.Count) cities"

# Sort: country, then name for stable output.
$cities = @($cities | Sort-Object country, name)

# Write JSON as UTF-8 (no BOM).
$json = $cities | ConvertTo-Json -Depth 5 -Compress
# ConvertTo-Json emits a single object (not array) if count==1; guard.
if ($cities.Count -eq 1) { $json = "[$json]" }
$outDir = Split-Path $Out -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
[System.IO.File]::WriteAllText($Out, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Wrote $($cities.Count) cities to $Out ($([math]::Round((Get-Item $Out).Length/1KB)) KB)"

# Stats
$byCountry = $cities | Group-Object country | Sort-Object Count -Descending | Select-Object -First 10
Write-Host "`nTop 10 countries:"
$byCountry | ForEach-Object { Write-Host ("  {0,-30} {1}" -f $_.Name, $_.Count) }
