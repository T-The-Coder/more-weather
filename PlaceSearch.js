.pragma library

// Place search answers, shared by the More plugins (tools/sync-shared.sh):
// Open-Meteo's geocoder and Nominatim's search turned into one shape,
//   { name, region, country, countryCode, lat, lon, tz }
// where `countryCode` is the lower-case ISO 3166-1 code and `tz` the IANA
// zone, each "" when the service names none (Nominatim has no zone).
// Pure functions, so the tests can load them in Node.

// Open-Meteo geocoding (/v1/search): { results: [{ name, admin1, country,
// country_code, latitude, longitude, timezone }] }.
function parseOpenMeteo(raw) {
  var data
  try { data = JSON.parse(String(raw || "")) } catch (e) { return [] }
  var rows = data && Array.isArray(data.results) ? data.results : []
  var out = []
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i]
    var place = placeOf(r && r.name, r && r.admin1, r && r.country, r && r.country_code,
      r && r.latitude, r && r.longitude, r && r.timezone)
    if (place) out.push(place)
  }
  return out
}

// Nominatim search (format=jsonv2, addressdetails=1): [{ name, display_name,
// lat, lon, address: { city, town, village, state, country, country_code, … } }].
function parseNominatim(raw) {
  var rows
  try { rows = JSON.parse(String(raw || "")) } catch (e) { return [] }
  if (!Array.isArray(rows)) return []
  var out = []
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i]
    if (!r) continue
    var address = r.address || {}
    var name = r.name || address.city || address.town || address.village
      || address.municipality || String(r.display_name || "").split(",")[0]
    var region = address.state || address.region || address.county || ""
    var place = placeOf(name, region, address.country, address.country_code, r.lat, r.lon, "")
    if (place) out.push(place)
  }
  return out
}

function placeOf(name, region, country, countryCode, lat, lon, tz) {
  var latitude = parseFloat(lat)
  var longitude = parseFloat(lon)
  var label = String(name || "").trim()
  if (label === "" || !isFinite(latitude) || !isFinite(longitude)) return null
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return {
    name: label,
    region: String(region || ""),
    country: String(country || ""),
    countryCode: /^[A-Za-z]{2}$/.test(String(countryCode || "")) ? String(countryCode).toLowerCase() : "",
    lat: latitude,
    lon: longitude,
    tz: /^[A-Za-z0-9_+\-\/]+$/.test(String(tz || "")) ? String(tz) : ""
  }
}

// Two places within about a kilometre (coordinates rounded to two
// decimals) are the same place.
function coordinateKey(lat, lon) {
  return Number(lat).toFixed(2) + "," + Number(lon).toFixed(2)
}

// Names compared without case and accents ("Klaksvík" = "Klaksvik").
function foldedName(name) {
  var text = String(name || "").toLowerCase()
  return typeof text.normalize === "function" ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : text
}

// The first of every place, in order, at most `limit` of them. Also the
// same name a few kilometres off counts as the same place, since rounding
// can split two neighbouring points.
function dedupe(places, limit) {
  var seen = {}
  var out = []
  var max = limit > 0 ? limit : Infinity
  for (var i = 0; i < (places || []).length && out.length < max; i++) {
    var place = places[i]
    var key = coordinateKey(place.lat, place.lon)
    if (seen[key]) continue
    var twin = false
    for (var j = 0; j < out.length && !twin; j++)
      twin = foldedName(out[j].name) === foldedName(place.name)
        && Math.abs(out[j].lat - place.lat) < 0.05 && Math.abs(out[j].lon - place.lon) < 0.05
    if (twin) continue
    seen[key] = true
    out.push(place)
  }
  return out
}

// The requests, so the URLs live next to their parsers.
function openMeteoRequest(query, language) {
  return {
    url: "https://geocoding-api.open-meteo.com/v1/search?count=8&format=json&name="
      + encodeURIComponent(String(query || "")) + "&language=" + encodeURIComponent(String(language || "en")),
    timeoutMs: 8000,
    maxBytes: 256 * 1024
  }
}

function nominatimRequest(query, language) {
  return {
    url: "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&q="
      + encodeURIComponent(String(query || "")),
    headers: { "Accept-Language": String(language || "en") },
    timeoutMs: 8000,
    maxBytes: 512 * 1024
  }
}
