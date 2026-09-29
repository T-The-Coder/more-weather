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
  "au": ["australia", "australien", "australie"],
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
  "jp": ["japan", "japon", "giappone", "nihon"],
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
  "nz": ["new zealand", "neuseeland", "nouvelle zelande", "nueva zelanda", "aotearoa"],
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

// MeteoSwiss runs ICON-CH1 (1 km) and ICON-CH2 (2 km) for the Alpine
// region; Open-Meteo's Best Match takes DWD ICON-D2 there. Its seamless
// MeteoSwiss series reaches five days, so Best Match is asked alongside and
// fills the rest (Model.mergedModelForecast).
var METEOSWISS_COUNTRIES = ["ch", "li"]
var METEOSWISS_MODEL = "meteoswiss_icon_seamless"

function usesMeteoSwiss(countryName) {
  return METEOSWISS_COUNTRIES.indexOf(countryCode(countryName)) >= 0
}

function openMeteoForecastUrl(latitude, longitude, countryName) {
  return "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + encodeURIComponent(String(latitude))
    + "&longitude=" + encodeURIComponent(String(longitude))
    + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset,uv_index_max"
    + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day"
    + "&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,uv_index"
    // Feels-like and humidity per hour, for the hour cursor.
    + ",apparent_temperature,relative_humidity_2m"
    // Steering wind for the radar drift arrow where radar motion is unavailable.
    + ",wind_speed_700hPa,wind_direction_700hPa"
    + "&minutely_15=precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m"
    + "&forecast_minutely_15=16&forecast_days=8&timezone=auto"
    + (usesMeteoSwiss(countryName) ? "&models=" + METEOSWISS_MODEL + ",best_match" : "")
}

// Request specs for WeatherRequest.qml: { url, method, headers, body,
// timeoutMs, maxBytes }. The request component always sends an identifying
// User-Agent, which MET Norway and the NWS require.
function forecastRequest(providerId, latitude, longitude, countryName) {
  if (providerId === "met-no") {
    return {
      url: "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat="
        + encodeURIComponent(String(latitude)) + "&lon=" + encodeURIComponent(String(longitude)),
      timeoutMs: 8000
    }
  }
  return { url: openMeteoForecastUrl(latitude, longitude, countryName), timeoutMs: 6000 }
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
  if (code === "fi") return "fmi"
  if (code === "nl") return "knmi"
  return ""
}

// FMI's Finnish radar composite, rain rate, every five minutes.
var FMI_RADAR_LAYER = "suomi_rr_eureffin"
// KNMI's Dutch radar composite (ADAGUC), rain rate every five minutes.
var KNMI_RADAR_BASE = "https://geoservices.knmi.nl/adagucserver?dataset=RADAR"
var KNMI_RADAR_LAYER = "RAD_NL25_PCP_CM"

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
  // The layer's own endpoint keeps the answer small (the whole server's is
  // over 400 KB) and its only time dimension the radar's.
  if (providerId === "fmi")
    return "https://openwms.fmi.fi/geoserver/Radar/" + FMI_RADAR_LAYER
      + "/ows?service=WMS&version=1.3.0&request=GetCapabilities"
  if (providerId === "knmi")
    return KNMI_RADAR_BASE + "&service=WMS&version=1.3.0&request=GetCapabilities"
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
  } else if (providerId === "fmi") {
    base = "https://openwms.fmi.fi/geoserver/Radar/wms"
    layer = FMI_RADAR_LAYER
  } else if (providerId === "knmi") {
    base = KNMI_RADAR_BASE
    layer = KNMI_RADAR_LAYER
  } else {
    var nws = NWS_RADAR[providerId]
    if (!nws) return ""
    base = "https://opengeo.ncep.noaa.gov/geoserver/" + nws.workspace + "/" + nws.layer + "/ows"
    layer = nws.layer
    style = "radar_reflectivity"
  }
  var url = base + (base.indexOf("?") >= 0 ? "&" : "?") + "service=WMS&version=1.1.1&request=GetMap"
    + "&layers=" + encodeURIComponent(layer)
    + "&styles=" + encodeURIComponent(style)
    + "&bbox=" + encodeURIComponent(String(bbox))
    + "&width=" + encodeURIComponent(String(width || 480))
    + "&height=" + encodeURIComponent(String(height || 250))
    + "&srs=EPSG:4326&format=image/png&transparent=true"
  // ECCC's GeoMet answers "…:00.000Z" with an XML error and only takes
  // "…:00Z", so the Canadian radar always fell back to RainViewer.
  if (timestamp) url += "&time=" + encodeURIComponent(String(timestamp).replace(/\.\d{3}Z$/, "Z"))
  return url
}

function radarLabelKey(providerId) {
  if (providerId === "dwd") return "sourceRadar"
  if (providerId === "eccc") return "sourceEcccRadar"
  if (providerId === "fmi") return "sourceFmiRadar"
  if (providerId === "knmi") return "sourceKnmiRadar"
  if (providerId === "jma") return "sourceJmaRadar"
  if (String(providerId || "").indexOf("nws-") === 0) return "sourceNwsRadar"
  if (providerId === "rainviewer") return "sourceRainViewer"
  if (providerId === "met-no-model") return "sourceMetNoModelFallback"
  return "sourceModelFallback"
}

function radarLink(providerId) {
  if (providerId === "dwd") return "https://www.dwd.de/"
  if (providerId === "eccc") return "https://geo.weather.gc.ca/geomet/"
  if (providerId === "fmi") return "https://en.ilmatieteenlaitos.fi/open-data"
  if (providerId === "knmi") return "https://www.knmi.nl/"
  if (providerId === "jma") return "https://www.jma.go.jp/bosai/nowc/"
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
  if (code === "au") return [{ id: "bom", countryCode: code, state: australianState(latitude, longitude), labelKey: "sourceBomWarnings" }]
  if (code === "nz") return [{ id: "metservice", countryCode: code, staged: true, labelKey: "sourceMetServiceWarnings" }]
  if (code === "jp") return [{ id: "jma", countryCode: code, staged: true, labelKey: "sourceJmaWarnings" }]
  if (meteoAlarm.length) return meteoAlarm
  if (!code) return []
  // Everywhere else the official CAP feeds registered with the WMO, through
  // the Alert Hub register; Brazil and Argentina ask their services directly.
  var alertHub = [{ id: "alert-hub", countryCode: code, staged: true, labelKey: "sourceAlertHubWarnings" }]
  if (code === "br") return [{ id: "inmet", countryCode: code, labelKey: "sourceInmetWarnings" }].concat(alertHub)
  if (code === "ar") return [{ id: "smn", countryCode: code, staged: true, labelKey: "sourceSmnWarnings" }].concat(alertHub)
  return alertHub
}

// The Bureau of Meteorology publishes one warnings feed per state (NSW
// includes the ACT). The state comes from the coordinates: rough boxes along
// the borders, good enough for a state-wide feed.
var BOM_FEEDS = {
  nsw: "IDZ00054", nt: "IDZ00055", qld: "IDZ00056", sa: "IDZ00057",
  tas: "IDZ00058", vic: "IDZ00059", wa: "IDZ00060"
}

function australianState(latitude, longitude) {
  var lat = number(latitude)
  var lon = number(longitude)
  if (lat === null || lon === null) return ""
  if (lat < -39.2) return "tas"
  if (lon < 129) return "wa"
  if (lon < 138) return lat > -26 ? "nt" : "sa"
  if (lon < 141) return lat > -26 ? "qld" : "sa"
  // Queensland ends at 29° S in the west and bends north to Point Danger.
  var queensland = [[141.0, -29.0], [148.9, -29.0], [150.3, -28.6], [151.2, -28.9],
    [151.93, -28.93], [152.6, -28.3], [153.6, -28.17]]
  for (var q = 1; q < queensland.length; ++q) {
    if (lon > queensland[q][0] && q < queensland.length - 1) continue
    var qWest = queensland[q - 1]
    var qEast = queensland[q]
    var qEdge = qWest[1] + (qEast[1] - qWest[1]) * Math.max(0, Math.min(1, (lon - qWest[0]) / (qEast[0] - qWest[0])))
    if (lat > qEdge) return "qld"
    break
  }
  // The Murray, then a straight line from its source to Cape Howe, splits
  // Victoria from New South Wales.
  var border = [[141.0, -34.0], [142.2, -34.15], [143.5, -35.3], [144.75, -36.12],
    [146.9, -36.12], [148.2, -36.8], [149.98, -37.5]]
  for (var i = 1; i < border.length; ++i) {
    if (lon > border[i][0] && i < border.length - 1) continue
    var west = border[i - 1]
    var east = border[i]
    var edge = west[1] + (east[1] - west[1]) * Math.max(0, Math.min(1, (lon - west[0]) / (east[0] - west[0])))
    return lat < edge ? "vic" : "nsw"
  }
  return "nsw"
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
  if (provider.id === "inmet") {
    // All of Brazil in one answer, ~0.4 MB with its warning icons.
    return { url: "https://apiprevmet3.inmet.gov.br/avisos/ativos", timeoutMs: 20000, maxBytes: 8 * 1024 * 1024 }
  }
  if (provider.id === "bom" && BOM_FEEDS[provider.state]) {
    return {
      url: "https://www.bom.gov.au/fwo/" + BOM_FEEDS[provider.state] + ".warnings_" + provider.state + ".xml",
      timeoutMs: 10000
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
  if (providerId === "bom") return "sourceBomWarnings"
  if (providerId === "metservice") return "sourceMetServiceWarnings"
  if (providerId === "jma") return "sourceJmaWarnings"
  if (providerId === "inmet") return "sourceInmetWarnings"
  if (providerId === "smn") return "sourceSmnWarnings"
  if (providerId === "alert-hub") return "sourceAlertHubWarnings"
  return "sourceMeteoAlarm"
}

function alertLink(providerId) {
  if (providerId === "dwd") return "https://www.dwd.de/"
  if (providerId === "nws") return "https://www.weather.gov/"
  if (providerId === "eccc") return "https://weather.gc.ca/"
  if (providerId === "bom") return "https://www.bom.gov.au/"
  if (providerId === "metservice") return "https://www.metservice.com/warnings/home"
  if (providerId === "jma") return "https://www.jma.go.jp/bosai/warning/"
  if (providerId === "inmet") return "https://alertas2.inmet.gov.br/"
  if (providerId === "smn") return "https://www.smn.gob.ar/alertas"
  if (providerId === "alert-hub") return "https://alertingauthority.wmo.int/"
  return "https://meteoalarm.org/"
}

function forecastLabelKey(providerId) {
  if (providerId === "meteoswiss") return "sourceMeteoSwiss"
  return providerId === "met-no" ? "sourceMetNo" : "sourceBestMatch"
}

function forecastLink(providerId) {
  if (providerId === "meteoswiss") return "https://www.meteoswiss.admin.ch/"
  return providerId === "met-no" ? "https://api.met.no/" : "https://open-meteo.com/"
}

// ---- The place's forecast at a weather service, for the "open at the
//      weather service" button: the NWS in the USA, ECCC in Canada, and
//      elsewhere yr.no (MET Norway), whose pages take any coordinates.
function serviceForecastLink(countryName, latitude, longitude, language) {
  var lat = number(latitude)
  var lon = number(longitude)
  if (lat === null || lon === null) return null
  var code = countryCode(countryName)
  var point = lat.toFixed(3) + "," + lon.toFixed(3)
  if (code === "us")
    return { name: "NWS", url: "https://forecast.weather.gov/MapClick.php?lat=" + lat.toFixed(3) + "&lon=" + lon.toFixed(3) }
  if (code === "ca")
    return { name: "ECCC", url: "https://weather.gc.ca/" + (language === "fr" ? "fr" : "en") + "/location/index.html?coords=" + point }
  if (language === "nb") return { name: "yr.no", url: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig-tabell/" + point }
  return { name: "yr.no", url: "https://www.yr.no/en/forecast/daily-table/" + point }
}

// ---- Rain nowcast from a national radar nowcast, beyond the DWD area:
//      MET Norway Nowcast 2.0 (5-minute rain rate, Nordic radar) and
//      GeoSphere Austria's INCA-based nowcast (15-minute sums, 1 km).
var MET_NOWCAST_COUNTRIES = ["no", "se", "fi", "dk"]

function regionalNowcastProvider(countryName, latitude, longitude) {
  var code = countryCode(countryName)
  if (code === "at") return "geosphere"
  // Buienradar's rain text, from the KNMI radar: free for non-commercial use
  // with credit; KNMI's own nowcast needs an API key.
  if (code === "nl" || code === "be") return "buienradar"
  // JMA's radar and one-hour nowcast, read from its map tiles (Model.js).
  if (code === "jp") return "jma"
  if (MET_NOWCAST_COUNTRIES.indexOf(code) >= 0) return "met-nowcast"
  return ""
}

function regionalNowcastRequest(providerId, latitude, longitude) {
  var lat = number(latitude)
  var lon = number(longitude)
  if (lat === null || lon === null) return null
  if (providerId === "met-nowcast")
    return {
      url: "https://api.met.no/weatherapi/nowcast/2.0/complete?lat=" + lat.toFixed(4) + "&lon=" + lon.toFixed(4),
      timeoutMs: 8000
    }
  if (providerId === "buienradar")
    return {
      url: "https://gpsgadget.buienradar.nl/data/raintext?lat=" + lat.toFixed(2) + "&lon=" + lon.toFixed(2),
      timeoutMs: 8000
    }
  if (providerId === "geosphere")
    return {
      url: "https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nowcast-v1-15min-1km"
        + "?parameters=rr&output_format=geojson&lat_lon=" + lat.toFixed(4) + "," + lon.toFixed(4),
      timeoutMs: 10000
    }
  return null
}

function regionalNowcastLabelKey(providerId) {
  if (providerId === "buienradar") return "sourceBuienradarNowcast"
  if (providerId === "jma") return "sourceJmaNowcast"
  return providerId === "geosphere" ? "sourceGeoSphereNowcast" : "sourceMetNowcast"
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
    forecastLink: forecastLink,
    usesMeteoSwiss: usesMeteoSwiss,
    regionalNowcastProvider: regionalNowcastProvider,
    regionalNowcastRequest: regionalNowcastRequest,
    regionalNowcastLabelKey: regionalNowcastLabelKey,
    australianState: australianState,
    serviceForecastLink: serviceForecastLink
  }
}
