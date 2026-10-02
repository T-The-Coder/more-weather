.pragma library
.import "i18n/en.js" as L_en
.import "i18n/de.js" as L_de
.import "i18n/es.js" as L_es
.import "i18n/fr.js" as L_fr
.import "i18n/pt.js" as L_pt
.import "i18n/ru.js" as L_ru
.import "i18n/uk.js" as L_uk
.import "i18n/pl.js" as L_pl
.import "i18n/it.js" as L_it
.import "i18n/nl.js" as L_nl
.import "i18n/tr.js" as L_tr
.import "i18n/cs.js" as L_cs
.import "i18n/sv.js" as L_sv
.import "i18n/fi.js" as L_fi
.import "i18n/nb.js" as L_nb
.import "i18n/da.js" as L_da
.import "i18n/ro.js" as L_ro
.import "i18n/hu.js" as L_hu
.import "i18n/el.js" as L_el
.import "i18n/zh_CN.js" as L_zh_CN
.import "i18n/zh_TW.js" as L_zh_TW
.import "i18n/ja.js" as L_ja
.import "i18n/ko.js" as L_ko
.import "i18n/ar.js" as L_ar
.import "i18n/he.js" as L_he
.import "i18n/fa.js" as L_fa
.import "i18n/hi.js" as L_hi
.import "i18n/id.js" as L_id
.import "i18n/vi.js" as L_vi
.import "i18n/th.js" as L_th

// Runtime UI catalogue. Every translated catalogue is an overlay on English:
// a missing key therefore falls back independently instead of breaking the
// whole locale. The texts live in one file per language under i18n/ (each
// well under the plugin marketplace's 512 KiB limit for a text file):
// English and German as full catalogues, the others as `compact` (the
// values of localizedKeys below, in order) plus `entries` (every other key).

var localizedKeys = [
  "weather", "warningExtreme", "warningSevere", "warningModerate", "warningMinor",
  "effectiveNow", "untilFurtherNotice", "updating", "justNow", "minutesAgo", "hoursAgo",
  "today", "current", "now", "searchCity",
  "feelsLike", "wind", "humidity", "autoDetected", "fetchingForecast",
  "hourly", "daily", "forecast", "settings", "app", "widget", "menubar",
  "widgetSettings", "appSettings", "menubarSettings", "displaySettingsHint",
  "general", "unitSystem", "metricUnits", "imperialUnits", "time", "weekday",
  "weatherSymbol", "temperature", "feelsLikeTemperature", "currentWeather", "location",
  "precipitation", "weatherWarnings", "feelsLikeShort", "temperatureRange",
  "rainProbability", "rainAmount", "uvIndex", "sunriseSunset", "twoHourTotal", "defaultTab",
  "rainForecastTwoHours", "rainRadarPastTwoHours", "precipitationModelCurrent",
  "rain", "probability", "intensity", "rainNone", "rainWeak", "rainMedium", "rainStrong",
  "rainExtreme", "radar", "noRainExpected", "total", "noDataWaiting", "radarLoading",
  "noRadarData", "windMapSummary", "windDataLoading", "noWindData", "cachedDataNotice"
]

var languageMeta = {
  en: { locale: "en_US", directions: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] },
  de: { locale: "de_DE", directions: ["N", "NO", "O", "SO", "S", "SW", "W", "NW"] },
  es: { locale: "es_ES", directions: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] },
  fr: { locale: "fr_FR", directions: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] },
  pt: { locale: "pt_BR", directions: ["N", "NE", "L", "SE", "S", "SO", "O", "NO"] },
  ru: { locale: "ru_RU", directions: ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"] },
  uk: { locale: "uk_UA", directions: ["Пн", "ПнСх", "Сх", "ПдСх", "Пд", "ПдЗх", "Зх", "ПнЗх"] },
  pl: { locale: "pl_PL", directions: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] },
  it: { locale: "it_IT", directions: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] },
  nl: { locale: "nl_NL", directions: ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"] },
  tr: { locale: "tr_TR", directions: ["K", "KD", "D", "GD", "G", "GB", "B", "KB"] },
  cs: { locale: "cs_CZ", directions: ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"] },
  sv: { locale: "sv_SE", directions: ["N", "NO", "O", "SO", "S", "SV", "V", "NV"] },
  fi: { locale: "fi_FI", directions: ["P", "KO", "I", "KA", "E", "LO", "L", "LU"] },
  nb: { locale: "nb_NO", directions: ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"] },
  da: { locale: "da_DK", directions: ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"] },
  ro: { locale: "ro_RO", directions: ["N", "NE", "E", "SE", "S", "SV", "V", "NV"] },
  hu: { locale: "hu_HU", directions: ["É", "ÉK", "K", "DK", "D", "DNy", "Ny", "ÉNy"] },
  el: { locale: "el_GR", directions: ["Β", "ΒΑ", "Α", "ΝΑ", "Ν", "ΝΔ", "Δ", "ΒΔ"] },
  zh_CN: { locale: "zh_CN", directions: ["北", "东北", "东", "东南", "南", "西南", "西", "西北"] },
  zh_TW: { locale: "zh_TW", directions: ["北", "東北", "東", "東南", "南", "西南", "西", "西北"] },
  ja: { locale: "ja_JP", directions: ["北", "北東", "東", "南東", "南", "南西", "西", "北西"] },
  ko: { locale: "ko_KR", directions: ["북", "북동", "동", "남동", "남", "남서", "서", "북서"] },
  ar: { locale: "ar_SA", rtl: true, directions: ["ش", "ش ق", "ق", "ج ق", "ج", "ج غ", "غ", "ش غ"] },
  he: { locale: "he_IL", rtl: true, directions: ["צ", "צמז", "מז", "דמז", "ד", "דמע", "מע", "צמע"] },
  fa: { locale: "fa_IR", rtl: true, directions: ["ش", "ش‌ق", "ق", "ج‌ق", "ج", "ج‌غ", "غ", "ش‌غ"] },
  hi: { locale: "hi_IN", directions: ["उ", "उपू", "पू", "दपू", "द", "दप", "प", "उप"] },
  id: { locale: "id_ID", directions: ["U", "TL", "T", "TG", "S", "BD", "B", "BL"] },
  vi: { locale: "vi_VN", directions: ["B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"] },
  th: { locale: "th_TH", directions: ["น", "ตอ.เฉียงเหนือ", "ตอ.", "ตอ.เฉียงใต้", "ใต้", "ตต.เฉียงใต้", "ตต.", "ตต.เฉียงเหนือ"] }
}

// A compact catalogue and its keyed entries as one table.
function compactCatalog(values, entries) {
  var result = {}
  for (var i = 0; i < localizedKeys.length && i < values.length; ++i)
    if (values[i] !== null) result[localizedKeys[i]] = values[i]
  for (var key in entries) result[key] = entries[key]
  return result
}

var catalog = {
  en: L_en.catalog,
  de: L_de.catalog,
  es: compactCatalog(L_es.compact, L_es.entries),
  fr: compactCatalog(L_fr.compact, L_fr.entries),
  pt: compactCatalog(L_pt.compact, L_pt.entries),
  ru: compactCatalog(L_ru.compact, L_ru.entries),
  uk: compactCatalog(L_uk.compact, L_uk.entries),
  pl: compactCatalog(L_pl.compact, L_pl.entries),
  it: compactCatalog(L_it.compact, L_it.entries),
  nl: compactCatalog(L_nl.compact, L_nl.entries),
  tr: compactCatalog(L_tr.compact, L_tr.entries),
  cs: compactCatalog(L_cs.compact, L_cs.entries),
  sv: compactCatalog(L_sv.compact, L_sv.entries),
  fi: compactCatalog(L_fi.compact, L_fi.entries),
  nb: compactCatalog(L_nb.compact, L_nb.entries),
  da: compactCatalog(L_da.compact, L_da.entries),
  ro: compactCatalog(L_ro.compact, L_ro.entries),
  hu: compactCatalog(L_hu.compact, L_hu.entries),
  el: compactCatalog(L_el.compact, L_el.entries),
  zh_CN: compactCatalog(L_zh_CN.compact, L_zh_CN.entries),
  zh_TW: compactCatalog(L_zh_TW.compact, L_zh_TW.entries),
  ja: compactCatalog(L_ja.compact, L_ja.entries),
  ko: compactCatalog(L_ko.compact, L_ko.entries),
  ar: compactCatalog(L_ar.compact, L_ar.entries),
  he: compactCatalog(L_he.compact, L_he.entries),
  fa: compactCatalog(L_fa.compact, L_fa.entries),
  hi: compactCatalog(L_hi.compact, L_hi.entries),
  id: compactCatalog(L_id.compact, L_id.entries),
  vi: compactCatalog(L_vi.compact, L_vi.entries),
  th: compactCatalog(L_th.compact, L_th.entries)
}

var languageNames = {
  "en": "English",
  "de": "Deutsch",
  "es": "Español",
  "fr": "Français",
  "pt": "Português",
  "ru": "Русский",
  "uk": "Українська",
  "pl": "Polski",
  "it": "Italiano",
  "nl": "Nederlands",
  "tr": "Türkçe",
  "cs": "Čeština",
  "sv": "Svenska",
  "fi": "Suomi",
  "nb": "Norsk bokmål",
  "da": "Dansk",
  "ro": "Română",
  "hu": "Magyar",
  "el": "Ελληνικά",
  "zh_CN": "简体中文",
  "zh_TW": "繁體中文",
  "ja": "日本語",
  "ko": "한국어",
  "ar": "العربية",
  "he": "עברית",
  "fa": "فارسی",
  "hi": "हिन्दी",
  "id": "Bahasa Indonesia",
  "vi": "Tiếng Việt",
  "th": "ไทย"
}

function languageName(language) {
  return languageNames[language] || language
}

// "auto" or a supported language code; anything else resolves to "auto".
function resolvedLanguage(choice, localeName) {
  var chosen = String(choice || "auto")
  return chosen !== "auto" && languageMeta[chosen] ? chosen : languageForLocale(localeName)
}

function languageForLocale(localeName) {
  var normalized = String(localeName || "").toLowerCase().replace(/-/g, "_")
  var base = normalized.split(/[_.@]/)[0]
  if (base === "zh") {
    if (normalized.indexOf("tw") >= 0 || normalized.indexOf("hk") >= 0
        || normalized.indexOf("mo") >= 0 || normalized.indexOf("hant") >= 0) return "zh_TW"
    return "zh_CN"
  }
  // Accept legacy libc/Java aliases as well as Norwegian locale variants.
  if (base === "iw") base = "he"
  if (base === "in") base = "id"
  if (base === "no" || base === "nn") base = "nb"
  return catalog[base] ? base : "en"
}

function localeName(language) {
  var meta = languageMeta[language] || languageMeta.en
  return meta.locale
}

// External services generally accept the ISO 639 base language, while the UI
// keeps region-aware catalogue IDs for Chinese.
function serviceLanguage(language) {
  return String(language || "en").split("_")[0]
}

function isRightToLeft(language) {
  return !!(languageMeta[language] && languageMeta[language].rtl)
}

function supportedLanguages() {
  return Object.keys(languageMeta)
}

function text(language, key, values) {
  var languageCatalog = catalog[language] || catalog.en
  var value = languageCatalog[key]
  if (value === undefined) value = catalog.en[key]
  if (value === undefined) return key

  var replacements = values || {}
  return String(value).replace(/\{([^}]+)\}/g, function(match, name) {
    return replacements[name] === undefined ? match : String(replacements[name])
  })
}

function directionNames(language) {
  var meta = languageMeta[language] || languageMeta.en
  return meta.directions
}
