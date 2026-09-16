// Provider registry for the weather plugin.  Keep service selection, URLs and
// regional coverage out of Panel.qml so a source can be replaced without
// touching presentation or response-normalisation code.

function number(value) {
  var parsed = parseFloat(String(value))
  return isNaN(parsed) ? null : parsed
}

function normalized(value) {
  return String(value || "").toLowerCase()
    .replace(/[áàâäãå]/g, "a").replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i").replace(/[óòôöõ]/g, "o")
    .replace(/[úùûü]/g, "u").replace(/[ç]/g, "c")
    .replace(/[ß]/g, "ss").replace(/[^a-z0-9]+/g, " ")
    .replace(/^\s+|\s+$/g, "")
}

var COUNTRY_NAMES = {
  "ad": ["andorra"],
  "at": ["austria", "osterreich", "oesterreich"],
  "ba": ["bosnia and herzegovina", "bosnien und herzegowina"],
  "be": ["belgium", "belgien"],
  "bg": ["bulgaria", "bulgarien"],
  "ca": ["canada", "kanada"],
  "ch": ["switzerland", "schweiz", "suisse", "svizzera"],
  "cy": ["cyprus", "zypern"],
  "cz": ["czechia", "czech republic", "tschechien"],
  "de": ["germany", "deutschland"],
  "dk": ["denmark", "danemark", "daenemark"],
  "ee": ["estonia", "estland"],
  "es": ["spain", "spanien", "espana"],
  "fi": ["finland", "finnland"],
  "fr": ["france", "frankreich"],
  "gb": ["united kingdom", "great britain", "uk", "england", "scotland", "wales", "northern ireland", "vereinigtes konigreich"],
  "gr": ["greece", "griechenland"],
  "hr": ["croatia", "kroatien"],
  "hu": ["hungary", "ungarn"],
  "ie": ["ireland", "irland"],
  "il": ["israel"],
  "is": ["iceland", "island"],
  "it": ["italy", "italien", "italia"],
  "lt": ["lithuania", "litauen"],
  "lu": ["luxembourg", "luxemburg"],
  "lv": ["latvia", "lettland"],
  "md": ["moldova", "moldau"],
  "me": ["montenegro"],
  "mk": ["north macedonia", "nordmazedonien"],
  "mt": ["malta"],
  "nl": ["netherlands", "niederlande", "holland"],
  "no": ["norway", "norwegen"],
  "pl": ["poland", "polen"],
  "pt": ["portugal"],
  "ro": ["romania", "rumanien", "rumaenien"],
  "rs": ["serbia", "serbien"],
  "se": ["sweden", "schweden"],
  "si": ["slovenia", "slowenien"],
  "sk": ["slovakia", "slowakei"],
  "ua": ["ukraine"],
  "us": ["united states", "united states of america", "usa", "us", "vereinigte staaten"]
}

var METEOALARM_SLUGS = {
  ad: "andorra", at: "austria", ba: "bosnia-herzegovina", be: "belgium",
  bg: "bulgaria", ch: "switzerland", cy: "cyprus", cz: "czechia",
  de: "germany", dk: "denmark", ee: "estonia", es: "spain", fi: "finland",
  fr: "france", gb: "united-kingdom", gr: "greece", hr: "croatia",
  hu: "hungary", ie: "ireland", il: "israel", is: "iceland", it: "italy",
  lt: "lithuania", lu: "luxembourg", lv: "latvia", md: "moldova",
  me: "montenegro", mk: "republic-of-north-macedonia", mt: "malta", nl: "netherlands",
  no: "norway", pl: "poland", pt: "portugal", ro: "romania", rs: "serbia",
  se: "sweden", si: "slovenia", sk: "slovakia", ua: "ukraine"
}

function countryCode(countryName) {
  var candidate = normalized(countryName)
  if (/^[a-z]{2}$/.test(candidate)) return candidate === "uk" ? "gb" : candidate
  var codes = Object.keys(COUNTRY_NAMES)
  for (var i = 0; i < codes.length; ++i) {
    var names = COUNTRY_NAMES[codes[i]]
    for (var j = 0; j < names.length; ++j)
      if (candidate === normalized(names[j])) return codes[i]
  }
  return ""
}

function inBox(latitude, longitude, south, west, north, east) {
  var lat = number(latitude)
  var lon = number(longitude)
  return lat !== null && lon !== null && lat >= south && lat <= north && lon >= west && lon <= east
}

function usesDwd(latitude, longitude) {
  return inBox(latitude, longitude, 46.5, 5.0, 55.5, 16.0)
}

// MET Norway's own 1 km MET Nordic model backs its API in these countries,
// which makes it the first choice there; everywhere else Open-Meteo's best
// national model leads and MET Norway (ECMWF-based) is the fallback.
var MET_NORDIC_COUNTRIES = ["no", "se", "fi", "dk"]

function forecastProviders(latitude, longitude, countryName) {
  var lat = number(latitude)
  var lon = number(longitude)
  if (lat === null || lon === null) return []
  var openMeteo = { id: "open-meteo", labelKey: "sourceBestMatch", link: "https://open-meteo.com/" }
  var metNo = { id: "met-no", labelKey: "sourceMetNo", link: "https://api.met.no/" }
  return MET_NORDIC_COUNTRIES.indexOf(countryCode(countryName)) >= 0
    ? [metNo, openMeteo] : [openMeteo, metNo]
}

// ---- Place lookup. IP geolocation for auto-detect, tried
//      in order; Nominatim reverse geocoding for stored coordinates; a name
//      search for name-only locations.
function ipPlaceProviders() {
  return [
    { id: "ipwho.is", url: "https://ipwho.is/" },
    { id: "ipapi.co", url: "https://ipapi.co/json/" },
    { id: "geojs", url: "https://get.geojs.io/v1/ip/geo.json" }
  ]
}

function reversePlaceRequest(latitude, longitude, language) {
  return {
    url: "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10"
      + "&lat=" + encodeURIComponent(String(latitude))
      + "&lon=" + encodeURIComponent(String(longitude))
      + "&accept-language=" + encodeURIComponent(String(language || "en")),
    timeoutMs: 8000
  }
}

function placeSearchRequest(name, language) {
  return {
    url: "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(String(name || ""))
      + "&count=10&language=" + encodeURIComponent(String(language || "en")) + "&format=json",
    timeoutMs: 6000
  }
}

function openMeteoForecastUrl(latitude, longitude) {
  return "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + encodeURIComponent(String(latitude))
    + "&longitude=" + encodeURIComponent(String(longitude))
    + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset,uv_index_max"
    + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day"
    + "&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,uv_index"
    // Steering wind for the radar drift arrow where radar motion is unavailable.
    + ",wind_speed_700hPa,wind_direction_700hPa"
    + "&minutely_15=precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m"
    + "&forecast_minutely_15=16&forecast_days=8&timezone=auto"
}

// Request specs for WeatherRequest.qml: { url, method, headers, body,
// timeoutMs, maxBytes }. The request component always sends an identifying
// User-Agent, which MET Norway and the NWS require.
function forecastRequest(providerId, latitude, longitude) {
  if (providerId === "met-no") {
    return {
      url: "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat="
        + encodeURIComponent(String(latitude)) + "&lon=" + encodeURIComponent(String(longitude)),
      timeoutMs: 8000
    }
  }
  return { url: openMeteoForecastUrl(latitude, longitude), timeoutMs: 6000 }
}

function nwsRadarProvider(latitude, longitude) {
  if (inBox(latitude, longitude, 18, -161.5, 23.5, -154)) return "nws-hawaii"
  if (inBox(latitude, longitude, 12, 130, 22, 150)) return "nws-guam"
  if (inBox(latitude, longitude, 15, -70.5, 24.5, -59.5)) return "nws-caribbean"
  if (inBox(latitude, longitude, 50, -180, 72.5, -129)) return "nws-alaska"
  if (inBox(latitude, longitude, 20, -130, 55, -60)) return "nws-conus"
  return ""
}

function primaryRadarProvider(countryName, latitude, longitude) {
  if (usesDwd(latitude, longitude)) return "dwd"
  var code = countryCode(countryName)
  if (code === "us") return nwsRadarProvider(latitude, longitude)
  if (code === "ca") return "eccc"
  return ""
}

var NWS_RADAR = {
  "nws-conus": { workspace: "conus", layer: "conus_bref_qcd" },
  "nws-alaska": { workspace: "alaska", layer: "alaska_bref_qcd" },
  "nws-hawaii": { workspace: "hawaii", layer: "hawaii_bref_qcd" },
  "nws-caribbean": { workspace: "carib", layer: "carib_bref_qcd" },
  "nws-guam": { workspace: "guam", layer: "guam_bref_qcd" }
}

function radarCapabilitiesUrl(providerId) {
  if (providerId === "eccc")
    return "https://geo.weather.gc.ca/geomet?service=WMS&request=GetCapabilities&version=1.3.0&layers=RADAR_1KM_RRAI"
  var nws = NWS_RADAR[providerId]
  if (!nws) return ""
  return "https://opengeo.ncep.noaa.gov/geoserver/" + nws.workspace + "/" + nws.layer
    + "/ows?request=GetCapabilities&service=wms&version=1.3.0"
}

function radarCapabilitiesRequest(providerId) {
  var url = radarCapabilitiesUrl(providerId)
  return url ? { url: url, timeoutMs: 10000 } : null
}

function radarMapUrl(providerId, bbox, width, height, timestamp) {
  var base = ""
  var layer = ""
  var style = ""
  if (providerId === "eccc") {
    base = "https://geo.weather.gc.ca/geomet"
    layer = "RADAR_1KM_RRAI"
  } else {
    var nws = NWS_RADAR[providerId]
    if (!nws) return ""
    base = "https://opengeo.ncep.noaa.gov/geoserver/" + nws.workspace + "/" + nws.layer + "/ows"
    layer = nws.layer
    style = "radar_reflectivity"
  }
  var url = base + "?service=WMS&version=1.1.1&request=GetMap"
    + "&layers=" + encodeURIComponent(layer)
    + "&styles=" + encodeURIComponent(style)
    + "&bbox=" + encodeURIComponent(String(bbox))
    + "&width=" + encodeURIComponent(String(width || 480))
    + "&height=" + encodeURIComponent(String(height || 250))
    + "&srs=EPSG:4326&format=image/png&transparent=true"
  if (timestamp) url += "&time=" + encodeURIComponent(String(timestamp))
  return url
}

function radarLabelKey(providerId) {
  if (providerId === "dwd") return "sourceRadar"
  if (providerId === "eccc") return "sourceEcccRadar"
  if (String(providerId || "").indexOf("nws-") === 0) return "sourceNwsRadar"
  if (providerId === "rainviewer") return "sourceRainViewer"
  if (providerId === "met-no-model") return "sourceMetNoModelFallback"
  return "sourceModelFallback"
}

function radarLink(providerId) {
  if (providerId === "dwd") return "https://www.dwd.de/"
  if (providerId === "eccc") return "https://geo.weather.gc.ca/geomet/"
  if (String(providerId || "").indexOf("nws-") === 0) return "https://radar.weather.gov/"
  if (providerId === "rainviewer") return "https://www.rainviewer.com/"
  if (providerId === "met-no-model") return "https://api.met.no/"
  return "https://open-meteo.com/"
}

function placeEndpoints() {
  return [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
  ]
}

function calmContextMapUrl(bbox, width, height) {
  return "https://maps.dwd.de/geoserver/dwd/ows"
    + "?service=WMS&version=1.1.1&request=GetMap"
    + "&layers=dwd:bluemarble&styles="
    + "&bbox=" + encodeURIComponent(String(bbox || ""))
    + "&width=" + Number(width || 480) + "&height=" + Number(height || 250)
    + "&srs=EPSG:4326&format=image/png&transparent=false"
}

function alertProviders(countryName, latitude, longitude) {
  var code = countryCode(countryName)
  if (!code && usesDwd(latitude, longitude)) code = "de"
  // The MeteoAlarm Atom feed is compact; its JSON API carries the same
  // warnings in far larger files and only steps in when the feed fails.
  var meteoAlarm = METEOALARM_SLUGS[code] ? [
    { id: "meteoalarm", countryCode: code, slug: METEOALARM_SLUGS[code], labelKey: "sourceMeteoAlarm" },
    { id: "meteoalarm-api", countryCode: code, slug: METEOALARM_SLUGS[code], labelKey: "sourceMeteoAlarm" }
  ] : []
  if (code === "de") return [{ id: "dwd", labelKey: "sourceDwdWarnings" }].concat(meteoAlarm)
  if (code === "us") return [{ id: "nws", countryCode: code, labelKey: "sourceNwsWarnings" }]
  if (code === "ca") return [{ id: "eccc", countryCode: code, labelKey: "sourceEcccWarnings" }]
  return meteoAlarm
}

function alertRequest(provider, latitude, longitude) {
  if (!provider) return null
  if (provider.id === "dwd") {
    return {
      url: "https://api.brightsky.dev/alerts?lat=" + encodeURIComponent(String(latitude))
        + "&lon=" + encodeURIComponent(String(longitude))
        + "&tz=" + encodeURIComponent("Europe/Berlin"),
      timeoutMs: 8000
    }
  }
  if (provider.id === "nws") {
    return {
      url: "https://api.weather.gov/alerts/active?point="
        + encodeURIComponent(String(latitude) + "," + String(longitude)),
      headers: { "Accept": "application/geo+json" },
      timeoutMs: 8000
    }
  }
  if (provider.id === "meteoalarm" && provider.slug) {
    return {
      url: "https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-" + provider.slug,
      timeoutMs: 8000,
      // Germany's feed is ~0.8 MB on a quiet day.
      maxBytes: 16 * 1024 * 1024
    }
  }
  if (provider.id === "meteoalarm-api" && provider.slug) {
    return {
      url: "https://feeds.meteoalarm.org/api/v1/warnings/feeds-" + provider.slug,
      timeoutMs: 25000,
      // Germany's JSON is ~2.4 MB on a quiet day and grows with every warning.
      maxBytes: 32 * 1024 * 1024
    }
  }
  if (provider.id === "eccc") {
    // A box of roughly 1 km around the place; polygons are checked exactly
    // when the response is parsed.
    var lat = Number(latitude)
    var lon = Number(longitude)
    return {
      url: "https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=100&bbox="
        + [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01].map(function(v) { return v.toFixed(4) }).join(","),
      timeoutMs: 15000
    }
  }
  return null
}

function alertLabelKey(providerId) {
  if (providerId === "dwd") return "sourceDwdWarnings"
  if (providerId === "nws") return "sourceNwsWarnings"
  if (providerId === "eccc") return "sourceEcccWarnings"
  return "sourceMeteoAlarm"
}

function alertLink(providerId) {
  if (providerId === "dwd") return "https://www.dwd.de/"
  if (providerId === "nws") return "https://www.weather.gov/"
  if (providerId === "eccc") return "https://weather.gc.ca/"
  return "https://meteoalarm.org/"
}

function forecastLabelKey(providerId) {
  return providerId === "met-no" ? "sourceMetNo" : "sourceBestMatch"
}

function forecastLink(providerId) {
  return providerId === "met-no" ? "https://api.met.no/" : "https://open-meteo.com/"
}

if (typeof module !== "undefined") {
  module.exports = {
    normalized: normalized,
    countryCode: countryCode,
    usesDwd: usesDwd,
    forecastProviders: forecastProviders,
    ipPlaceProviders: ipPlaceProviders,
    reversePlaceRequest: reversePlaceRequest,
    placeSearchRequest: placeSearchRequest,
    forecastRequest: forecastRequest,
    primaryRadarProvider: primaryRadarProvider,
    radarCapabilitiesUrl: radarCapabilitiesUrl,
    radarCapabilitiesRequest: radarCapabilitiesRequest,
    radarMapUrl: radarMapUrl,
    radarLabelKey: radarLabelKey,
    radarLink: radarLink,
    placeEndpoints: placeEndpoints,
    calmContextMapUrl: calmContextMapUrl,
    alertProviders: alertProviders,
    alertRequest: alertRequest,
    alertLabelKey: alertLabelKey,
    alertLink: alertLink,
    forecastLabelKey: forecastLabelKey,
    forecastLink: forecastLink
  }
}
