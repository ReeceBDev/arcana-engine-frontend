# Build CAPITALS map (friendlyCountryName -> capitalCityName) from GeoNames
# countryInfo.txt, cross-referenced against src/data/cities.json so only capitals
# that EXIST in the dataset (by exact name + country) are emitted.
#
# Usage: powershell -ExecutionPolicy Bypass -File scripts\verify-capitals.ps1
# Outputs a TS object literal ready to paste into citySearch.ts, plus a report of
# any capitals NOT found in the dataset (so they can be hand-corrected).

param(
    [string]$CountryInfo = "$env:TEMP\countryInfo.txt",
    [string]$Cities = "$PSScriptRoot\..\src\data\cities.json"
)

# ISO-2 -> friendly name (must match generate-cities.ps1 exactly).
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

# Load cities dataset (UTF-8) and build a lookup set of "name|country".
$cityJson = [System.IO.File]::ReadAllText($Cities, [System.Text.Encoding]::UTF8)
$cityArr = $cityJson | ConvertFrom-Json
$cityKeys = New-Object System.Collections.Generic.HashSet[string]
foreach ($c in $cityArr) { [void]$cityKeys.Add("$($c.name)|$($c.country)") }
Write-Host "Loaded $($cityArr.Count) cities, $($cityKeys.Count) unique name|country keys"

# Parse countryInfo.txt: skip comment lines, columns are tab-delimited, capital is col 5 (index 1 after ISO).
# Columns: ISO ISO3 numericISO fips name capital area population ...
$capitalsRaw = @{}
foreach ($line in [System.IO.File]::ReadAllLines($CountryInfo, [System.Text.Encoding]::UTF8)) {
    if ($line.StartsWith('#')) { continue }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $f = $line -split "`t"
    if ($f.Count -lt 6) { continue }
    $iso2 = $f[0].Trim()
    $capital = $f[5].Trim()
    if ($iso2 -and $capital) { $capitalsRaw[$iso2] = $capital }
}
Write-Host "Parsed $($capitalsRaw.Count) capitals from countryInfo.txt"

# Build friendly-country -> capital, verify the capital exists in the dataset.
$found = [ordered]@{}
$missing = @()
foreach ($iso2 in ($capitalsRaw.Keys | Sort-Object)) {
    if (-not $CountryNames.ContainsKey($iso2)) { continue }   # skip countries not in dataset
    $friendly = $CountryNames[$iso2]
    $capital = $capitalsRaw[$iso2]
    if ($cityKeys.Contains("$capital|$friendly")) {
        $found[$friendly] = $capital
    } else {
        $missing += [pscustomobject]@{ Country = $friendly; CapitalFromGeonames = $capital }
    }
}

Write-Host "`n=== VERIFIED capitals: $($found.Count) ==="
# Emit TS literal.
foreach ($k in $found.Keys) {
    $cap = $found[$k]
    if ($k -match "'") { $keyStr = "'$($k -replace "'", "\''")'" } else { $keyStr = "'$k'" }
    if ($cap -match "'") { $valStr = "'$($cap -replace "'", "\''")'" } else { $valStr = "'$cap'" }
    Write-Output ("    " + $keyStr + ": " + $valStr + ",")
}

Write-Host ("`n=== MISSING (capital not in dataset under that exact name) - " + $missing.Count + " ===")
$missing | Format-Table -AutoSize | Out-String | Write-Host
