// weather.json holds {"name": ..., "latitude": ..., "longitude": ...} (see
// omarchy-weather-location, which owns the format). Missing, blank, or
// unparseable means the location is auto-detected from the IP address.
function parseLocationFile(raw) {
  var unset = { name: "", latitude: null, longitude: null }
  try {
    var data = JSON.parse(String(raw || ""))
    if (!data || typeof data !== "object") return unset

    var latitude = parseFloat(data.latitude)
    var longitude = parseFloat(data.longitude)
    var hasCoordinates = !isNaN(latitude) && !isNaN(longitude)
    return {
      name: typeof data.name === "string" ? data.name.replace(/^\s+|\s+$/g, "") : "",
      latitude: hasCoordinates ? latitude : null,
      longitude: hasCoordinates ? longitude : null
    }
  } catch (e) {
    return unset
  }
}

// weather-locations.json holds a JSON array of {name, latitude, longitude}
// saved-location entries. Unlike weather.json this file has no external
// owner (no CLI touches it) — the plugin reads and writes it directly.
// Missing/blank/unparseable/wrong-shaped input yields an empty list rather
// than throwing, mirroring parseLocationFile above.
function parseSavedLocations(raw) {
  try {
    var data = JSON.parse(String(raw || "[]"))
    if (!Array.isArray(data)) return []

    var out = []
    for (var i = 0; i < data.length; i++) {
      var entry = data[i]
      if (!entry || typeof entry !== "object") continue
      var name = typeof entry.name === "string" ? entry.name.replace(/^\s+|\s+$/g, "") : ""
      var latitude = parseFloat(entry.latitude)
      var longitude = parseFloat(entry.longitude)
      if (name === "" || isNaN(latitude) || isNaN(longitude)) continue
      out.push({ name: name, latitude: latitude, longitude: longitude })
    }
    return out
  } catch (e) {
    return []
  }
}

// Favourites offered until the user has saved a list of their own. Only a
// missing file gets them: an emptied list is written as [] and stays empty.
function defaultSavedLocations() {
  return [
    { name: "Reykjavík", latitude: 64.14660, longitude: -21.94260 },
    { name: "Marrakesch", latitude: 31.62947, longitude: -7.98108 },
    { name: "Montevideo", latitude: -34.90328, longitude: -56.18816 },
    { name: "Windhoek", latitude: -22.55941, longitude: 17.08323 }
  ]
}

// Append entry to the saved list, skipping an exact name+coordinate
// duplicate. Returns a new array; does not mutate `list`.
function addSavedLocation(list, entry) {
  var current = Array.isArray(list) ? list : []
  if (!entry || !entry.name) return current
  var latitude = parseFloat(entry.latitude)
  var longitude = parseFloat(entry.longitude)
  if (isNaN(latitude) || isNaN(longitude)) return current

  for (var i = 0; i < current.length; i++) {
    if (current[i].name === entry.name &&
        current[i].latitude === latitude &&
        current[i].longitude === longitude) return current
  }
  return current.concat([{ name: entry.name, latitude: latitude, longitude: longitude }])
}

// Remove the entry at `index`. Returns a new array; does not mutate `list`.
// Index-based (entries have no stable id), matching the existing
// suggestionIndex/Repeater convention used for search suggestions.
function removeSavedLocationAt(list, index) {
  var current = Array.isArray(list) ? list : []
  if (index < 0 || index >= current.length) return current
  return current.slice(0, index).concat(current.slice(index + 1))
}

var WEATHER_CACHE_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000
var WEATHER_CACHE_FALLBACK_DELAY_MS = 60 * 60 * 1000

// A failed initial load may use cache immediately. During an established
// session the last live snapshot stays authoritative for one hour; only a
// refresh failure newer than that snapshot may then activate full fallback.
function shouldUseWeatherCache(lastSuccessfulUpdateMs, lastForecastFailureMs, now) {
  var success = Number(lastSuccessfulUpdateMs || 0)
  var failure = Number(lastForecastFailureMs || 0)
  var current = Number(now || Date.now())
  if (!(failure > 0)) return false
  if (!(success > 0)) return true
  return failure > success && current - success >= WEATHER_CACHE_FALLBACK_DELAY_MS
}

function weatherCacheKey(name, latitude, longitude) {
  var lat = parseFloat(latitude)
  var lon = parseFloat(longitude)
  if (!isNaN(lat) && !isNaN(lon)) return "geo:" + lat.toFixed(4) + "," + lon.toFixed(4)
  var normalizedName = String(name || "").replace(/^\s+|\s+$/g, "").toLowerCase()
  return normalizedName ? "name:" + normalizedName : ""
}

function parseWeatherDataCache(raw, now) {
  var empty = { version: 1, lastActiveKey: "", lastAutoKey: "", entries: {} }
  var data
  try { data = JSON.parse(String(raw || "{}")) } catch (e) { return empty }
  if (!data || typeof data !== "object") return empty
  var sourceEntries = data.entries && typeof data.entries === "object" ? data.entries : {}
  var entries = {}
  var currentTime = Number(now || Date.now())
  var keys = Object.keys(sourceEntries)
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i]
    var entry = sourceEntries[key]
    var updatedAt = Number(entry && entry.updatedAt || 0)
    if (!entry || !entry.snapshot || !(updatedAt > 0)) continue
    var age = currentTime - updatedAt
    if (!(age >= 0) || age > WEATHER_CACHE_MAX_AGE_MS) continue
    entries[key] = {
      name: String(entry.name || ""),
      latitude: entry.latitude === null || entry.latitude === undefined ? null : Number(entry.latitude),
      longitude: entry.longitude === null || entry.longitude === undefined ? null : Number(entry.longitude),
      updatedAt: updatedAt,
      snapshot: entry.snapshot
    }
  }
  var lastActiveKey = String(data.lastActiveKey || "")
  var lastAutoKey = String(data.lastAutoKey || "")
  return {
    version: 1,
    lastActiveKey: entries[lastActiveKey] ? lastActiveKey : "",
    lastAutoKey: entries[lastAutoKey] ? lastAutoKey : "",
    entries: entries
  }
}

function weatherValueAvailable(value) {
  if (value === undefined || value === null || value === "") return false
  return !(typeof value === "number" && !isFinite(value))
}

function cachedOnlyWeatherObject(cached) {
  var source = cached && typeof cached === "object" ? cached : {}
  var result = {}
  var fields = {}
  var keys = Object.keys(source)
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i]
    if (key === "_cachedFields" || key === "_usesCachedData") continue
    result[key] = source[key]
    if (weatherValueAvailable(source[key])) fields[key] = true
  }
  result._cachedFields = fields
  result._usesCachedData = Object.keys(fields).length > 0
  return result
}

// Merge at display-field granularity. Live values always win; only genuinely
// absent scalar fields are supplied by the persisted snapshot and tagged so
// the QML delegate can render exactly those values in italics.
function mergeCachedWeatherObject(live, cached) {
  var liveObject = live && typeof live === "object" ? live : null
  var cachedObject = cached && typeof cached === "object" ? cached : null
  if (!liveObject) return cachedObject ? cachedOnlyWeatherObject(cachedObject) : null
  var result = {}
  var fields = {}
  var keys = {}
  Object.keys(liveObject).forEach(function(key) { keys[key] = true })
  if (cachedObject) Object.keys(cachedObject).forEach(function(key) { keys[key] = true })
  Object.keys(keys).forEach(function(key) {
    if (key === "_cachedFields" || key === "_usesCachedData") return
    var liveValue = liveObject[key]
    if (weatherValueAvailable(liveValue)) result[key] = liveValue
    else if (cachedObject && weatherValueAvailable(cachedObject[key])) {
      result[key] = cachedObject[key]
      fields[key] = true
    } else result[key] = liveValue
  })
  result._cachedFields = fields
  result._usesCachedData = Object.keys(fields).length > 0
  return result
}

function mergeCachedWeatherSeries(live, cached, identityKey, minimumTime, limit) {
  var liveRows = Array.isArray(live) ? live : []
  var cachedRows = Array.isArray(cached) ? cached : []
  // Time rows are matched by instant, not by spelling: the same hour may be
  // stored as a local stamp ("…T23:00") or, from older MET Norway data, as
  // UTC ("…T21:00:00Z").
  var byInstant = identityKey === "time"
  function identityOf(row) {
    var raw = String(row && row[identityKey] || "")
    if (!raw || !byInstant) return raw
    var stamp = new Date(raw).getTime()
    return isNaN(stamp) ? raw : String(stamp)
  }
  var cacheByIdentity = {}
  for (var i = 0; i < cachedRows.length; ++i) {
    var cachedIdentity = identityOf(cachedRows[i])
    if (cachedIdentity) cacheByIdentity[cachedIdentity] = cachedRows[i]
  }
  var result = []
  var present = {}
  for (var j = 0; j < liveRows.length; ++j) {
    var identity = identityOf(liveRows[j])
    if (!identity) continue
    result.push(mergeCachedWeatherObject(liveRows[j], cacheByIdentity[identity]))
    present[identity] = true
  }
  for (var k = 0; k < cachedRows.length; ++k) {
    var fallbackIdentity = identityOf(cachedRows[k])
    if (!fallbackIdentity || present[fallbackIdentity]) continue
    present[fallbackIdentity] = true
    var fallbackRow = cachedOnlyWeatherObject(cachedRows[k])
    if (byInstant && /Z$|[+-]\d\d:?\d\d$/.test(String(fallbackRow.time || "")))
      fallbackRow.time = localIsoMinute(Number(fallbackIdentity))
    result.push(fallbackRow)
  }
  result.sort(function(a, b) {
    if (byInstant) return new Date(a.time).getTime() - new Date(b.time).getTime()
    return String(a[identityKey] || "").localeCompare(String(b[identityKey] || ""))
  })
  var threshold = Number(minimumTime || 0)
  if (threshold > 0) result = result.filter(function(row) {
    var stamp = new Date(row[identityKey]).getTime()
    return !isNaN(stamp) && stamp >= threshold
  })
  var maximum = parseInt(limit, 10)
  return maximum > 0 ? result.slice(0, maximum) : result
}

function weatherFieldIsCached(object, key) {
  return !!(object && object._cachedFields && object._cachedFields[key])
}

function weatherObjectUsesCache(object) {
  return !!(object && object._usesCachedData)
}

function weatherSeriesUsesCache(series) {
  var rows = Array.isArray(series) ? series : []
  for (var i = 0; i < rows.length; ++i) if (weatherObjectUsesCache(rows[i])) return true
  return false
}

function stripWeatherCacheMetadata(value) {
  if (Array.isArray(value)) return value.map(stripWeatherCacheMetadata)
  if (!value || typeof value !== "object") return value
  var result = {}
  Object.keys(value).forEach(function(key) {
    if (key !== "_cachedFields" && key !== "_usesCachedData")
      result[key] = stripWeatherCacheMetadata(value[key])
  })
  return result
}

function mergeWeatherSnapshotForStorage(live, cached) {
  var incoming = live && typeof live === "object" ? live : {}
  var previous = cached && typeof cached === "object" ? cached : {}
  return {
    label: weatherValueAvailable(incoming.label) ? incoming.label : String(previous.label || ""),
    forecastProviderId: weatherValueAvailable(incoming.forecastProviderId)
      ? incoming.forecastProviderId : String(previous.forecastProviderId || ""),
    alertProviderId: weatherValueAvailable(incoming.alertProviderId)
      ? incoming.alertProviderId : String(previous.alertProviderId || ""),
    current: stripWeatherCacheMetadata(mergeCachedWeatherObject(incoming.current, previous.current)),
    hourly: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.hourly, previous.hourly, "time", 0, 72)),
    daily: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.daily, previous.daily, "date", 0, 3)),
    nowcast: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.nowcast, previous.nowcast, "time", 0, 9)),
    alerts: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.alerts, previous.alerts, "id", 0, 0))
  }
}

// Identity of the configured location, used to notice changes and to key
// shared data: exact coordinates when both are present, the URL-encoded name
// as a fallback (hand-edited weather.json files may only carry a name), empty
// for IP auto-detect.
function locationQueryKey(location, latitude, longitude) {
  var lat = parseFloat(String(latitude))
  var lon = parseFloat(String(longitude))
  if (!isNaN(lat) && !isNaN(lon)) return lat + "," + lon

  var name = String(location || "").replace(/^\s+|\s+$/g, "")
  return name === "" ? "" : encodeURIComponent(name)
}

// Open-Meteo geocoding response → suggestion rows for the location picker.
function parseGeocodingResults(raw) {
  try {
    var data = JSON.parse(String(raw || "{}"))
    var results = data.results
    if (!results || !results.length) return []

    var out = []
    for (var i = 0; i < results.length; i++) {
      var r = results[i]
      if (!r || !r.name || r.latitude === undefined || r.longitude === undefined) continue
      var region = [r.admin1, r.country].filter(function(part) { return !!part }).join(", ")
      out.push({
        name: String(r.name),
        description: region,
        latitude: r.latitude,
        longitude: r.longitude
      })
    }
    return out
  } catch (e) {
    return []
  }
}

// Normalize the compact subset of OpenStreetMap place data used by the radar
// overlay. Ways and relations expose their position through `center`, while
// nodes carry latitude/longitude directly. Duplicate node/relation labels are
// collapsed by name so a city is never drawn twice.
function parseOverpassPlaces(raw, language) {
  var data
  try { data = JSON.parse(String(raw || "{}")) } catch (e) { return [] }
  var elements = data && Array.isArray(data.elements) ? data.elements : []
  var localeCode = String(language || "en").toLowerCase().split(/[_-]/)[0]
  var localeKey = "name:" + localeCode
  var byName = {}

  for (var i = 0; i < elements.length; ++i) {
    var element = elements[i] || {}
    var tags = element.tags || {}
    var place = String(tags.place || "")
    if (place !== "city" && place !== "town") continue
    var name = String(tags[localeKey] || tags.name || "").replace(/^\s+|\s+$/g, "")
    var latitude = parseFloat(element.lat !== undefined ? element.lat : (element.center && element.center.lat))
    var longitude = parseFloat(element.lon !== undefined ? element.lon : (element.center && element.center.lon))
    if (!name || isNaN(latitude) || isNaN(longitude)) continue
    var populationText = String(tags.population || "").replace(/[^0-9]/g, "")
    var population = populationText ? parseInt(populationText, 10) : 0
    var key = name.toLowerCase()
    var candidate = { name: name, latitude: latitude, longitude: longitude, place: place, population: population }
    var current = byName[key]
    if (!current || population > current.population || (place === "city" && current.place !== "city"))
      byName[key] = candidate
  }

  var result = []
  var keys = Object.keys(byName)
  for (var j = 0; j < keys.length; ++j) result.push(byName[keys[j]])
  return result
}

function parseRadarPlaceCache(raw) {
  try {
    var cache = JSON.parse(String(raw || "{}"))
    var latitude = parseFloat(cache.centerLatitude)
    var longitude = parseFloat(cache.centerLongitude)
    var radiusKm = parseFloat(cache.radiusKm)
    if (isNaN(latitude) || isNaN(longitude) || !(radiusKm > 0) || !Array.isArray(cache.places))
      return { centerLatitude: null, centerLongitude: null, radiusKm: 0, language: "", fetchedAt: 0, places: [] }
    return {
      centerLatitude: latitude,
      centerLongitude: longitude,
      radiusKm: radiusKm,
      language: String(cache.language || ""),
      fetchedAt: Number(cache.fetchedAt || 0),
      places: cache.places
    }
  } catch (e) {
    return { centerLatitude: null, centerLongitude: null, radiusKm: 0, language: "", fetchedAt: 0, places: [] }
  }
}

function geographicDistanceKm(lat1, lon1, lat2, lon2) {
  var toRadians = Math.PI / 180
  var aLat = parseFloat(lat1) * toRadians
  var bLat = parseFloat(lat2) * toRadians
  var dLat = (parseFloat(lat2) - parseFloat(lat1)) * toRadians
  var dLon = (parseFloat(lon2) - parseFloat(lon1)) * toRadians
  if ([aLat, bLat, dLat, dLon].some(function(value) { return isNaN(value) })) return Infinity
  var sinLat = Math.sin(dLat / 2)
  var sinLon = Math.sin(dLon / 2)
  var h = sinLat * sinLat + Math.cos(aLat) * Math.cos(bLat) * sinLon * sinLon
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
}

// Return a relevance-sorted shortlist; final overlap rejection happens with
// actual text measurements in the radar Canvas. Far views favor population,
// close views increasingly favor useful nearby towns.
function radarPlaceCandidates(places, centerLatitude, centerLongitude, radiusKm, zoomLevel, selectedName) {
  var source = Array.isArray(places) ? places : []
  var lat = parseFloat(centerLatitude)
  var lon = parseFloat(centerLongitude)
  var radius = Math.max(1, parseFloat(radiusKm) || 1)
  if (isNaN(lat) || isNaN(lon)) return []
  var thresholds = { "-2": 75000, "-1": 40000, "0": 15000, "1": 7000, "2": 2500, "3": 0 }
  var threshold = thresholds[String(Math.max(-2, Math.min(3, parseInt(zoomLevel, 10) || 0)))] || 0
  var selected = String(selectedName || "").toLowerCase()
  var result = []

  for (var i = 0; i < source.length; ++i) {
    var place = source[i] || {}
    var placeLat = parseFloat(place.latitude)
    var placeLon = parseFloat(place.longitude)
    if (isNaN(placeLat) || isNaN(placeLon)) continue
    var northDistance = Math.abs(placeLat - lat) * 111.32
    var eastDistance = Math.abs(placeLon - lon) * 111.32 * Math.max(0.2, Math.cos(lat * Math.PI / 180))
    if (northDistance > radius || eastDistance > radius) continue
    var distance = geographicDistanceKm(lat, lon, placeLat, placeLon)
    if (distance < 2 || String(place.name || "").toLowerCase() === selected) continue
    var population = Math.max(0, parseInt(place.population, 10) || 0)
    var estimatedPopulation = population || (place.place === "city" ? 75000 : 5000)
    if (estimatedPopulation < threshold) continue
    var proximityWeight = zoomLevel >= 1 ? 42 : 14
    var score = Math.log(estimatedPopulation + 1) * 12
      + (1 - Math.min(1, distance / (radius * 1.42))) * proximityWeight
      + (place.place === "city" ? 12 : 0)
    result.push({
      name: String(place.name || ""),
      latitude: placeLat,
      longitude: placeLon,
      place: String(place.place || "town"),
      population: population,
      distanceKm: distance,
      score: score
    })
  }
  result.sort(function(a, b) { return b.score - a.score })
  return result.slice(0, 24)
}

function locationCommit(text, suggestions, selectedIndex) {
  var name = String(text || "").replace(/^\s+|\s+$/g, "")
  if (name === "") return { name: "", latitude: null, longitude: null }

  var choices = suggestions || []
  var index = Math.max(0, Math.min(parseInt(selectedIndex, 10) || 0, choices.length - 1))
  var suggestion = choices[index]
  if (suggestion) return suggestion

  return { name: name, latitude: null, longitude: null }
}

function isFutureForecastDate(dateString, todayString) {
  if (!dateString) return false
  return String(dateString).slice(0, 10) > String(todayString || "")
}

function isForecastDateOnOrAfter(dateString, todayString) {
  if (!dateString) return false
  return String(dateString).slice(0, 10) >= String(todayString || "")
}

function roundedTemp(value) {
  if (value === undefined || value === null || value === "") return ""
  var n = parseFloat(String(value))
  return isNaN(n) ? "" : String(Math.round(n))
}

function celsiusToFahrenheit(value) {
  if (value === undefined || value === null || value === "") return ""
  var n = parseFloat(String(value))
  return isNaN(n) ? "" : (n * 9 / 5) + 32
}

function millimetersToInches(value) {
  var n = parseFloat(String(value))
  return isNaN(n) ? null : n / 25.4
}

function kilometersToMiles(value) {
  var n = parseFloat(String(value))
  return isNaN(n) ? null : n * 0.621371
}

function kilometersPerHourToMilesPerHour(value) {
  var n = parseFloat(String(value))
  return isNaN(n) ? null : n * 0.621371
}

function formatTemp(value, useImperial) {
  if (value === undefined || value === null || value === "") return ""
  return value + "°" + (useImperial ? "F" : "C")
}

function normalizedUnit(value) {
  return String(value || "").replace(/^\s+|\s+$/g, "").toLowerCase()
}

function localeUsesImperial(localeName) {
  var name = String(localeName || "").replace(".", "_")
  return /^en[_-]US($|[_.-])/.test(name) || /^en[_-]LR($|[_.-])/.test(name) || /^my($|[_.-])/.test(name)
}

function countryUsesImperial(countryName) {
  var country = String(countryName || "")
    .replace(/^\s+|\s+$/g, "")
    .replace(/[._-]+/g, " ")
    .toLowerCase()
  if (!country) return null
  if (country === "us" || country === "usa" || country === "united states" || country === "united states of america") return true
  if (country === "lr" || country === "liberia" || country === "mm" || country === "myanmar" || country === "burma") return true
  return false
}

function shouldUseImperial(unitOverride, localeName, countryName) {
  var unit = normalizedUnit(unitOverride)
  if (unit === "imperial") return true
  if (unit === "metric") return false

  var countryPreference = countryUsesImperial(countryName)
  if (countryPreference !== null) return countryPreference

  return localeUsesImperial(localeName)
}

function dayName(dateString, formatter) {
  if (!dateString) return ""
  var d = new Date(dateString + "T12:00:00")
  if (isNaN(d.getTime())) return ""
  if (formatter) return formatter(d)
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]
}

function openMeteoForecastDays(dailyForecastReport, todayString) {
  var daily = dailyForecastReport && dailyForecastReport.daily ? dailyForecastReport.daily : null
  if (!daily || !daily.time) return []

  var result = []
  // Seven calendar days including today. The view keeps them on one
  // horizontally scrollable row, so the popup width never has to grow.
  for (var i = 0; i < daily.time.length && result.length < 7; ++i) {
    var date = daily.time[i]
    if (!isForecastDateOnOrAfter(date, todayString)) continue

    var maxC = daily.temperature_2m_max ? daily.temperature_2m_max[i] : ""
    var minC = daily.temperature_2m_min ? daily.temperature_2m_min[i] : ""
    result.push({
      date: date,
      maxtempC: roundedTemp(maxC),
      mintempC: roundedTemp(minC),
      maxtempF: roundedTemp(celsiusToFahrenheit(maxC)),
      mintempF: roundedTemp(celsiusToFahrenheit(minC)),
      rainProbability: daily.precipitation_probability_max ? roundedTemp(daily.precipitation_probability_max[i]) : "",
      rainAmount: daily.precipitation_sum && daily.precipitation_sum[i] !== null && daily.precipitation_sum[i] !== undefined ? String(Math.round(parseFloat(daily.precipitation_sum[i]) * 10) / 10) : "",
      windSpeedKmph: daily.wind_speed_10m_max ? roundedTemp(daily.wind_speed_10m_max[i]) : "",
      windSpeedMph: daily.wind_speed_10m_max ? roundedTemp(parseFloat(daily.wind_speed_10m_max[i]) * 0.621371) : "",
      sunrise: daily.sunrise ? String(daily.sunrise[i] || "") : "",
      sunset: daily.sunset ? String(daily.sunset[i] || "") : "",
      uvIndex: daily.uv_index_max && daily.uv_index_max[i] !== null && daily.uv_index_max[i] !== undefined ? String(Math.round(parseFloat(daily.uv_index_max[i]) * 10) / 10) : "",
      openMeteoWeatherCode: daily.weather_code ? daily.weather_code[i] : null
    })
  }
  return result
}

// Current conditions from the forecast response, in the panel's
// current-condition shape (temp_C, FeelsLikeC, windspeedKmph, …; the field
// names date back to wttr.in). Open-Meteo reports metric (°C, km/h).
function openMeteoCurrentCondition(dailyForecastReport) {
  var current = dailyForecastReport && dailyForecastReport.current ? dailyForecastReport.current : null
  if (!current || current.temperature_2m === undefined || current.temperature_2m === null) return null
  return {
    temp_C: roundedTemp(current.temperature_2m),
    temp_F: roundedTemp(celsiusToFahrenheit(current.temperature_2m)),
    FeelsLikeC: roundedTemp(current.apparent_temperature),
    FeelsLikeF: roundedTemp(celsiusToFahrenheit(current.apparent_temperature)),
    windspeedKmph: roundedTemp(current.wind_speed_10m),
    windspeedMiles: roundedTemp(current.wind_speed_10m * 0.621371),
    humidity: roundedTemp(current.relative_humidity_2m),
    openMeteoWeatherCode: current.weather_code,
    isDay: current.is_day
  }
}

// MET Norway Locationforecast is the independent global forecast fallback.
// Convert its compact GeoJSON response into the subset of the Open-Meteo
// shape consumed by this plugin.  Keeping the adapter here means switching
// provider never leaks into the view code.
function metNoWeatherCode(symbolCode) {
  var symbol = String(symbolCode || "").toLowerCase()
  if (symbol.indexOf("thunder") >= 0) return 95
  if (symbol.indexOf("snow") >= 0 || symbol.indexOf("sleet") >= 0) return 73
  if (symbol.indexOf("rain") >= 0 || symbol.indexOf("drizzle") >= 0) return 63
  if (symbol.indexOf("fog") >= 0) return 45
  if (symbol.indexOf("partlycloudy") >= 0) return 2
  if (symbol.indexOf("fair") >= 0) return 1
  if (symbol.indexOf("clearsky") >= 0) return 0
  return 3
}

// "yyyy-MM-ddTHH:mm" in this machine's local time, the timestamp shape
// Open-Meteo returns for timezone=auto. Views slice hours and dates out of
// these strings, so UTC stamps would show up shifted by the UTC offset.
function localIsoMinute(ms) {
  var date = new Date(ms)
  if (isNaN(date.getTime())) return ""
  return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate())
    + "T" + pad2(date.getHours()) + ":" + pad2(date.getMinutes())
}

function pad2(value) {
  return (value < 10 ? "0" : "") + value
}

// MET Norway timestamps are UTC ("…Z"); they are converted to local
// Open-Meteo-style stamps so both providers read the same downstream.
function metNoToOpenMeteo(report) {
  var timeseries = report && report.properties && Array.isArray(report.properties.timeseries)
    ? report.properties.timeseries : []
  if (!timeseries.length) return null

  var hourly = {
    time: [], temperature_2m: [], precipitation_probability: [], precipitation: [],
    weather_code: [], is_day: [], wind_speed_10m: []
  }
  var minutely = {
    time: [], precipitation: [], precipitation_probability: [], wind_speed_10m: [],
    wind_direction_10m: [], wind_gusts_10m: []
  }
  var dayGroups = {}
  var current = null

  for (var i = 0; i < timeseries.length; ++i) {
    var row = timeseries[i] || {}
    var data = row.data || {}
    var details = data.instant && data.instant.details ? data.instant.details : {}
    var next = data.next_1_hours || data.next_6_hours || data.next_12_hours || {}
    var nextDetails = next.details || {}
    var summary = next.summary || {}
    var stampMs = new Date(String(row.time || "")).getTime()
    if (isNaN(stampMs)) continue
    var stamp = localIsoMinute(stampMs)
    var temp = parseFloat(details.air_temperature)
    var windMs = parseFloat(details.wind_speed)
    var windKmh = isNaN(windMs) ? null : windMs * 3.6
    var windDirection = parseFloat(details.wind_from_direction)
    var gustMs = parseFloat(details.wind_speed_of_gust)
    var gustKmh = isNaN(gustMs) ? windKmh : gustMs * 3.6
    var precipitation = parseFloat(nextDetails.precipitation_amount)
    var probability = parseFloat(nextDetails.probability_of_precipitation)
    var weatherCode = metNoWeatherCode(summary.symbol_code)
    var isDay = String(summary.symbol_code || "").indexOf("_night") >= 0 ? 0 : 1

    hourly.time.push(stamp)
    hourly.temperature_2m.push(isNaN(temp) ? null : temp)
    hourly.precipitation_probability.push(isNaN(probability) ? null : probability)
    hourly.precipitation.push(isNaN(precipitation) ? 0 : precipitation)
    hourly.weather_code.push(weatherCode)
    hourly.is_day.push(isDay)
    hourly.wind_speed_10m.push(windKmh)

    if (minutely.time.length < 20) {
      var hourMs = stampMs
      if (!isNaN(hourMs)) {
        for (var quarter = 0; quarter < 4 && minutely.time.length < 20; ++quarter) {
          minutely.time.push(localIsoMinute(hourMs + quarter * 15 * 60 * 1000))
          minutely.precipitation.push(isNaN(precipitation) ? 0 : precipitation / 4)
          minutely.precipitation_probability.push(isNaN(probability) ? 0 : probability)
          minutely.wind_speed_10m.push(windKmh)
          minutely.wind_direction_10m.push(isNaN(windDirection) ? 0 : windDirection)
          minutely.wind_gusts_10m.push(gustKmh)
        }
      }
    }

    var date = stamp.slice(0, 10)
    if (!dayGroups[date]) dayGroups[date] = {
      min: Infinity, max: -Infinity, rain: 0, probability: -Infinity,
      wind: -Infinity, noonCode: weatherCode, noonDistance: Infinity
    }
    var group = dayGroups[date]
    if (!isNaN(temp)) { group.min = Math.min(group.min, temp); group.max = Math.max(group.max, temp) }
    if (!isNaN(precipitation)) group.rain += precipitation
    if (!isNaN(probability)) group.probability = Math.max(group.probability, probability)
    if (windKmh !== null) group.wind = Math.max(group.wind, windKmh)
    var hour = parseInt(stamp.slice(11, 13), 10)
    if (!isNaN(hour) && Math.abs(hour - 12) < group.noonDistance) {
      group.noonDistance = Math.abs(hour - 12)
      group.noonCode = weatherCode
    }

    if (!current && !isNaN(temp)) {
      current = {
        temperature_2m: temp,
        apparent_temperature: temp,
        relative_humidity_2m: parseFloat(details.relative_humidity),
        wind_speed_10m: windKmh,
        weather_code: weatherCode,
        is_day: isDay
      }
    }
  }

  if (!current || !hourly.time.length) return null
  var daily = {
    time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [],
    precipitation_probability_max: [], precipitation_sum: [], wind_speed_10m_max: [],
    sunrise: [], sunset: []
  }
  var dates = Object.keys(dayGroups).sort()
  for (var d = 0; d < dates.length && d < 8; ++d) {
    var item = dayGroups[dates[d]]
    if (item.min === Infinity || item.max === -Infinity) continue
    daily.time.push(dates[d])
    daily.weather_code.push(item.noonCode)
    daily.temperature_2m_max.push(item.max)
    daily.temperature_2m_min.push(item.min)
    daily.precipitation_probability_max.push(item.probability === -Infinity ? null : item.probability)
    daily.precipitation_sum.push(item.rain)
    daily.wind_speed_10m_max.push(item.wind === -Infinity ? null : item.wind)
    daily.sunrise.push("")
    daily.sunset.push("")
  }
  return {
    latitude: report.geometry && report.geometry.coordinates ? report.geometry.coordinates[1] : null,
    longitude: report.geometry && report.geometry.coordinates ? report.geometry.coordinates[0] : null,
    current: current,
    hourly: hourly,
    minutely_15: minutely,
    daily: daily,
    _providerId: "met-no"
  }
}

// Return the next hourly forecast slots, starting with the current hour.
// Open-Meteo returns local timestamps because the request uses timezone=auto.
function openMeteoHourlyForecast(report, currentHour, limit) {
  var hourly = report && report.hourly ? report.hourly : null
  if (!hourly || !hourly.time) return []

  var result = []
  var start = String(currentHour || "")
  var max = Math.max(1, parseInt(limit, 10) || 6)
  for (var i = 0; i < hourly.time.length && result.length < max; ++i) {
    var time = String(hourly.time[i] || "")
    if (start && time < start) continue
    var tempC = hourly.temperature_2m ? hourly.temperature_2m[i] : ""
    result.push({
      time: time,
      tempC: roundedTemp(tempC),
      tempF: roundedTemp(celsiusToFahrenheit(tempC)),
      rainProbability: hourly.precipitation_probability ? roundedTemp(hourly.precipitation_probability[i]) : "",
      rainAmount: hourly.precipitation && hourly.precipitation[i] !== null && hourly.precipitation[i] !== undefined ? String(Math.round(parseFloat(hourly.precipitation[i]) * 10) / 10) : "",
      windSpeedKmph: hourly.wind_speed_10m ? roundedTemp(hourly.wind_speed_10m[i]) : "",
      windSpeedMph: hourly.wind_speed_10m ? roundedTemp(parseFloat(hourly.wind_speed_10m[i]) * 0.621371) : "",
      uvIndex: hourly.uv_index && hourly.uv_index[i] !== null && hourly.uv_index[i] !== undefined
        ? String(Math.round(parseFloat(hourly.uv_index[i]) * 10) / 10)
        : "",
      weatherCode: hourly.weather_code ? hourly.weather_code[i] : null,
      isDay: hourly.is_day ? hourly.is_day[i] : 1
    })
  }
  return result
}

function brightSkyWeatherCode(icon) {
  var name = String(icon || "").toLowerCase()
  if (name.indexOf("thunderstorm") >= 0) return 95
  if (name.indexOf("snow") >= 0 || name.indexOf("sleet") >= 0) return 73
  if (name.indexOf("rain") >= 0) return 63
  if (name.indexOf("fog") >= 0) return 45
  if (name.indexOf("partly-cloudy") >= 0) return 2
  if (name.indexOf("clear") >= 0) return 0
  return 3
}

function brightSkyIsDay(icon) {
  return String(icon || "").indexOf("night") >= 0 ? 0 : 1
}

// The row for the hour that has already begun, not the nearest one: from
// half past, the nearest row is next hour's MOSMIX forecast, while earlier
// rows are replaced by station observations once the hour is over. Taking
// the nearest row showed forecast rain under a sky that was observed dry.
// Falls back to the nearest row when no row has begun within two hours
// (a report that starts later, or a gap).
function currentBrightSkyRecord(report, now) {
  var rows = report && report.weather ? report.weather : []
  if (!rows.length) return null
  var target = now instanceof Date ? now.getTime() : new Date(now || Date.now()).getTime()
  var begun = null
  var begunStamp = -Infinity
  var nearest = null
  var distance = Infinity
  for (var i = 0; i < rows.length; ++i) {
    var stamp = new Date(rows[i].timestamp).getTime()
    if (isNaN(stamp)) continue
    if (stamp <= target && stamp > begunStamp) { begun = rows[i]; begunStamp = stamp }
    var delta = Math.abs(stamp - target)
    if (delta < distance) { nearest = rows[i]; distance = delta }
  }
  return begun && target - begunStamp <= 2 * 60 * 60 * 1000 ? begun : nearest
}

// MOSMIX supplies temperature/wind and the condition. Open-Meteo fills
// fields MOSMIX does not expose here (apparent temperature and humidity).
function brightSkyCurrentCondition(report, fallback, now) {
  var row = currentBrightSkyRecord(report, now)
  if (!row || row.temperature === undefined || row.temperature === null) return fallback || null
  var base = fallback || {}
  return {
    temp_C: roundedTemp(row.temperature),
    temp_F: roundedTemp(celsiusToFahrenheit(row.temperature)),
    FeelsLikeC: base.FeelsLikeC || "",
    FeelsLikeF: base.FeelsLikeF || "",
    windspeedKmph: roundedTemp(row.wind_speed),
    windspeedMiles: roundedTemp(parseFloat(row.wind_speed || 0) * 0.621371),
    humidity: base.humidity || roundedTemp(row.relative_humidity),
    openMeteoWeatherCode: brightSkyWeatherCode(row.icon),
    isDay: brightSkyIsDay(row.icon)
  }
}

function hybridHourlyForecast(mosmixReport, dailyForecastReport, uvReport, radarReport, now, limit) {
  // Two separate Open-Meteo fallbacks, not one: dailyForecastReport's
  // hourly query carries rain fields but no UV, uvReport's carries UV but
  // no rain fields (see the two separate curl calls in Panel.qml). Merging
  // them into a single uvByHour lookup previously meant whichever report
  // won the `||` simply had its missing fields silently blank — including
  // rain probability whenever uvReport (checked first) was the one present.
  var rainFallback = openMeteoHourlyForecast(dailyForecastReport, "", 200)
  var rainByHour = {}
  for (var i = 0; i < rainFallback.length; ++i)
    rainByHour[String(rainFallback[i].time).slice(0, 13)] = rainFallback[i]

  var uvFallback = openMeteoHourlyForecast(uvReport, "", 200)
  var uvByHour = {}
  for (var u = 0; u < uvFallback.length; ++u)
    uvByHour[String(uvFallback[u].time).slice(0, 13)] = uvFallback[u]

  var rows = mosmixReport && mosmixReport.weather ? mosmixReport.weather : []
  var start = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  // MOSMIX rows land on the hour. Filtering by the exact instant (rather
  // than the hour it falls in) drops the in-progress hour's row for all but
  // the first second of every hour, so result[0] silently became next
  // hour's forecast — stale relative to the radar-observed amount patched
  // in below. Floor to the current hour so result[0] is the hour we're in.
  var hourStart = new Date(start)
  hourStart.setMinutes(0, 0, 0)
  var hourStartMs = hourStart.getTime()
  var max = Math.max(1, parseInt(limit, 10) || 6)
  var result = []
  for (var j = 0; j < rows.length && result.length < max; ++j) {
    var row = rows[j]
    var stamp = new Date(row.timestamp).getTime()
    if (isNaN(stamp) || stamp < hourStartMs) continue
    var hourKey = String(row.timestamp).slice(0, 13)
    var rainFb = rainByHour[hourKey] || {}
    var uvFb = uvByHour[hourKey] || {}
    // MOSMIX occasionally reports precipitation_probability as null for the
    // current (still in-progress) hour — fall back to Open-Meteo's value
    // for that same hour rather than showing nothing.
    var mosmixProbability = roundedTemp(row.precipitation_probability)
    result.push({
      time: row.timestamp,
      tempC: roundedTemp(row.temperature),
      tempF: roundedTemp(celsiusToFahrenheit(row.temperature)),
      rainProbability: mosmixProbability !== "" ? mosmixProbability : (rainFb.rainProbability || ""),
      rainAmount: row.precipitation === undefined || row.precipitation === null ? "" : String(Math.round(parseFloat(row.precipitation) * 10) / 10),
      windSpeedKmph: roundedTemp(row.wind_speed) || rainFb.windSpeedKmph || "",
      windSpeedMph: roundedTemp(parseFloat(row.wind_speed) * 0.621371) || rainFb.windSpeedMph || "",
      uvIndex: uvFb.uvIndex || "",
      weatherCode: brightSkyWeatherCode(row.icon),
      isDay: brightSkyIsDay(row.icon)
    })
  }
  if (result.length) {
    var radarAmount = radarNextHourAmount(radarReport, now)
    if (radarAmount !== "") result[0].rainAmount = radarAmount
    // Both MOSMIX and Open-Meteo can leave precipitation_probability empty
    // specifically for the current, still-in-progress hour (it's not a
    // data-source outage — the same gap shows up in both independently).
    // Borrow the next hour's figure rather than showing nothing; it's a
    // few minutes off at worst, and close beats blank.
    if (result[0].rainProbability === "" && result.length > 1)
      result[0].rainProbability = result[1].rainProbability
    return result
  }
  var futureFallback = []
  for (var k = 0; k < rainFallback.length && futureFallback.length < max; ++k) {
    if (new Date(rainFallback[k].time).getTime() >= start) {
      var fbEntry = rainFallback[k]
      var fbUv = uvByHour[String(fbEntry.time).slice(0, 13)] || {}
      futureFallback.push({
        time: fbEntry.time,
        tempC: fbEntry.tempC,
        tempF: fbEntry.tempF,
        rainProbability: fbEntry.rainProbability,
        rainAmount: fbEntry.rainAmount,
        windSpeedKmph: fbEntry.windSpeedKmph,
        windSpeedMph: fbEntry.windSpeedMph,
        uvIndex: fbUv.uvIndex || "",
        weatherCode: fbEntry.weatherCode,
        isDay: fbEntry.isDay
      })
    }
  }
  return futureFallback
}

function brightSkyForecastDays(report, todayString) {
  var rows = report && report.weather ? report.weather : []
  var groups = {}
  for (var i = 0; i < rows.length; ++i) {
    var row = rows[i]
    var date = String(row.timestamp || "").slice(0, 10)
    if (!isForecastDateOnOrAfter(date, todayString)) continue
    if (!groups[date]) groups[date] = { date: date, min: Infinity, max: -Infinity, maxWind: -Infinity, noon: null, rainProbability: -Infinity, rainAmount: 0, hasRainAmount: false }
    var temp = parseFloat(row.temperature)
    if (!isNaN(temp)) { groups[date].min = Math.min(groups[date].min, temp); groups[date].max = Math.max(groups[date].max, temp) }
    var probability = parseFloat(row.precipitation_probability)
    if (!isNaN(probability)) groups[date].rainProbability = Math.max(groups[date].rainProbability, probability)
    var amount = parseFloat(row.precipitation)
    if (!isNaN(amount)) { groups[date].rainAmount += amount; groups[date].hasRainAmount = true }
    var windSpeed = parseFloat(row.wind_speed)
    if (!isNaN(windSpeed)) groups[date].maxWind = Math.max(groups[date].maxWind, windSpeed)
    var hour = parseInt(String(row.timestamp || "").slice(11, 13), 10)
    if (!groups[date].noon || Math.abs(hour - 12) < Math.abs(groups[date].noon.hour - 12)) groups[date].noon = { hour: hour, icon: row.icon }
  }
  var dates = Object.keys(groups).sort()
  var result = []
  for (var j = 0; j < dates.length && result.length < 7; ++j) {
    var g = groups[dates[j]]
    if (g.min === Infinity || g.max === -Infinity) continue
    result.push({ date: g.date, mintempC: roundedTemp(g.min), maxtempC: roundedTemp(g.max), mintempF: roundedTemp(celsiusToFahrenheit(g.min)), maxtempF: roundedTemp(celsiusToFahrenheit(g.max)), rainProbability: g.rainProbability === -Infinity ? "" : roundedTemp(g.rainProbability), rainAmount: g.hasRainAmount ? String(Math.round(g.rainAmount * 10) / 10) : "", windSpeedKmph: g.maxWind === -Infinity ? "" : roundedTemp(g.maxWind), windSpeedMph: g.maxWind === -Infinity ? "" : roundedTemp(g.maxWind * 0.621371), openMeteoWeatherCode: brightSkyWeatherCode(g.noon ? g.noon.icon : "cloudy") })
  }
  return result
}

function hybridForecastDays(mosmixReport, openMeteoReport, todayString, uvReport) {
  var days = brightSkyForecastDays(mosmixReport, todayString)
  if (!days.length) return openMeteoForecastDays(openMeteoReport, todayString)

  // Bright Sky can occasionally return a shorter range. Fill missing dates
  // from Open-Meteo while keeping Bright Sky as the preferred source.
  var fallbackDays = openMeteoForecastDays(openMeteoReport, todayString)
  var present = {}
  for (var p = 0; p < days.length; ++p) present[days[p].date] = true
  for (var f = 0; f < fallbackDays.length && days.length < 7; ++f) {
    if (!present[fallbackDays[f].date]) {
      days.push(fallbackDays[f])
      present[fallbackDays[f].date] = true
    }
  }
  days.sort(function(a, b) { return String(a.date).localeCompare(String(b.date)) })
  if (days.length > 7) days = days.slice(0, 7)

  // Merge fields that are not reliably available in the hourly MOSMIX rows
  // from the matching daily ICON/Open-Meteo record.
  var fallbackByDate = {}
  for (var d = 0; d < fallbackDays.length; ++d) fallbackByDate[fallbackDays[d].date] = fallbackDays[d]
  var uvDays = openMeteoForecastDays(uvReport || openMeteoReport, todayString)
  var uvByDate = {}
  for (var i = 0; i < uvDays.length; ++i) uvByDate[uvDays[i].date] = uvDays[i].uvIndex
  for (var j = 0; j < days.length; ++j) {
    var dailyFallback = fallbackByDate[days[j].date] || {}
    days[j].uvIndex = uvByDate[days[j].date] || ""
    if (!days[j].windSpeedKmph) days[j].windSpeedKmph = dailyFallback.windSpeedKmph || ""
    if (!days[j].windSpeedMph) days[j].windSpeedMph = dailyFallback.windSpeedMph || ""
    days[j].sunrise = dailyFallback.sunrise || ""
    days[j].sunset = dailyFallback.sunset || ""
  }
  return days
}

function radarNextHourAmount(report, now) {
  var rows = report && report.radar ? report.radar : []
  if (!rows.length) return ""
  var start = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var end = start + 60 * 60 * 1000
  var totalHundredths = 0
  var count = 0
  for (var i = 0; i < rows.length; ++i) {
    var stamp = new Date(rows[i].timestamp).getTime()
    if (isNaN(stamp) || stamp <= start || stamp > end) continue
    var grid = rows[i].precipitation_5 || []
    var centerRow = grid[Math.floor(grid.length / 2)] || []
    var value = parseFloat(centerRow[Math.floor(centerRow.length / 2)])
    if (!isNaN(value)) { totalHundredths += value; count++ }
  }
  return count ? (totalHundredths / 100).toFixed(1) : ""
}

// Compact two-hour series for the panel's rain tabs. Open-Meteo Best Match
// supplies the worldwide 15-minute time axis. In the DWD region, MOSMIX rain
// values refine it; elsewhere the selected regional/global model is used.
// Precipitation remains an intensity in mm/h.
function rainNowcastSeries(mosmixReport, report, now, limit) {
  var data = report && report.minutely_15 ? report.minutely_15 : null
  if (!data || !data.time) return []
  var weather = mosmixReport && mosmixReport.weather ? mosmixReport.weather : []
  var start = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var max = Math.max(2, parseInt(limit, 10) || 9)
  var result = []

  function mosmixAt(stamp, key, interpolate) {
    var before = null
    var after = null
    for (var rowIndex = 0; rowIndex < weather.length; ++rowIndex) {
      var rowStamp = new Date(weather[rowIndex].timestamp).getTime()
      if (isNaN(rowStamp)) continue
      if (rowStamp <= stamp) before = { row: weather[rowIndex], stamp: rowStamp }
      if (rowStamp >= stamp) { after = { row: weather[rowIndex], stamp: rowStamp }; break }
    }
    var selected = after || before
    if (!selected) return null
    var selectedValue = parseFloat(selected.row[key])
    if (!interpolate || !before || !after || before.stamp === after.stamp) return isNaN(selectedValue) ? null : selectedValue
    var beforeValue = parseFloat(before.row[key])
    var afterValue = parseFloat(after.row[key])
    if (isNaN(beforeValue) || isNaN(afterValue)) return isNaN(selectedValue) ? null : selectedValue
    var fraction = Math.max(0, Math.min(1, (stamp - before.stamp) / (after.stamp - before.stamp)))
    return beforeValue + (afterValue - beforeValue) * fraction
  }

  for (var i = 0; i < data.time.length && result.length < max; ++i) {
    var stamp = new Date(data.time[i]).getTime()
    if (isNaN(stamp) || stamp + 15 * 60 * 1000 < start) continue
    var probability = mosmixAt(stamp, "precipitation_probability", true)
    var precipitation = mosmixAt(stamp, "precipitation", false)
    result.push({
      time: data.time[i],
      probability: probability === null ? numericValue(data.precipitation_probability, i) : probability,
      precipitation: precipitation === null ? numericValue(data.precipitation, i) * 4 : precipitation,
      windSpeed: numericValue(data.wind_speed_10m, i),
      windDirection: numericValue(data.wind_direction_10m, i),
      windGust: numericValue(data.wind_gusts_10m, i)
    })
  }
  return result
}

// First 15-minute slot from now on with rain worth announcing: at least
// 0.1 mm/h and, where the source has one, a probability of 50 % or more.
// Returns { time, date, minutes, peak } or null when the next two hours stay
// dry. The caller decides whether it is already raining.
function upcomingRainStart(series, now) {
  var rows = Array.isArray(series) ? series : []
  var nowMs = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var start = -1
  for (var i = 0; i < rows.length; ++i) {
    var amount = Number(rows[i].precipitation)
    var probability = rows[i].probability
    var likely = probability === "" || probability === null || probability === undefined
      || !isFinite(Number(probability)) || Number(probability) >= 50
    if (isFinite(amount) && amount >= 0.1 && likely) { start = i; break }
  }
  if (start < 0) return null
  var date = new Date(rows[start].time)
  if (isNaN(date.getTime())) return null
  var peak = 0
  for (var j = start; j < rows.length; ++j) peak = Math.max(peak, Number(rows[j].precipitation) || 0)
  var begins = Math.max(nowMs, date.getTime())
  return {
    time: rows[start].time,
    date: new Date(begins),
    minutes: Math.max(0, Math.round((begins - nowMs) / 60000)),
    peak: peak
  }
}

// ---- Air quality and pollen (Open-Meteo air quality API, CAMS).
var AQI_BANDS = { european: [20, 40, 60, 80, 100], us: [50, 100, 150, 200, 300] }
var AQI_LABELS = {
  european: ["aqiGood", "aqiFair", "aqiModerate", "aqiPoor", "aqiVeryPoor", "aqiExtremelyPoor"],
  us: ["aqiGood", "aqiModerate", "aqiUnhealthySensitive", "aqiUnhealthy", "aqiVeryUnhealthy", "aqiHazardous"]
}
var AQI_COLORS = ["#50b848", "#a3c93a", "#f4c21b", "#f08c2a", "#e5412d", "#8f3f97"]
// Grains per m³ where a pollen type starts to count as low, moderate, high.
var POLLEN_BANDS = {
  alder: [1, 10, 100], birch: [1, 10, 100], grass: [1, 10, 50],
  mugwort: [1, 5, 20], olive: [1, 50, 200], ragweed: [1, 5, 20]
}
var POLLEN_TYPES = ["birch", "alder", "grass", "olive", "mugwort", "ragweed"]

function airQualityRequestUrl(latitude, longitude) {
  return "https://air-quality-api.open-meteo.com/v1/air-quality"
    + "?latitude=" + encodeURIComponent(String(latitude))
    + "&longitude=" + encodeURIComponent(String(longitude))
    + "&current=european_aqi,us_aqi,pm2_5,pm10,ozone,"
    + POLLEN_TYPES.map(function(type) { return type + "_pollen" }).join(",")
    + "&timezone=auto"
}

// { scale, index, category (0-5), labelKey, color, pm25, pm10, ozone,
//   pollen: null (no data for the region) or [{ type, value, level 1-3 }] }
function airQualitySummary(report, useUsScale) {
  var current = report && report.current ? report.current : null
  if (!current) return null
  var scale = useUsScale ? "us" : "european"
  var index = Number(current[scale === "us" ? "us_aqi" : "european_aqi"])
  var category = -1
  if (isFinite(index) && current[scale === "us" ? "us_aqi" : "european_aqi"] !== null) {
    category = 5
    for (var b = 0; b < AQI_BANDS[scale].length; ++b)
      if (index <= AQI_BANDS[scale][b]) { category = b; break }
  }
  var pollen = null
  for (var t = 0; t < POLLEN_TYPES.length; ++t) {
    var raw = current[POLLEN_TYPES[t] + "_pollen"]
    if (raw === null || raw === undefined) continue
    if (!pollen) pollen = []
    var value = Number(raw)
    var bands = POLLEN_BANDS[POLLEN_TYPES[t]]
    var level = value >= bands[2] ? 3 : (value >= bands[1] ? 2 : (value >= bands[0] ? 1 : 0))
    if (level > 0) pollen.push({ type: POLLEN_TYPES[t], value: value, level: level })
  }
  if (pollen) pollen.sort(function(a, b) { return b.level - a.level || b.value - a.value })
  function amount(key) {
    var v = current[key]
    return v === null || v === undefined || !isFinite(Number(v)) ? null : Number(v)
  }
  return {
    scale: scale,
    index: category < 0 ? null : Math.round(index),
    category: category,
    labelKey: category < 0 ? "" : AQI_LABELS[scale][category],
    color: category < 0 ? "" : AQI_COLORS[category],
    pm25: amount("pm2_5"),
    pm10: amount("pm10"),
    ozone: amount("ozone"),
    pollen: pollen
  }
}

function windGridSeries(report) {
  if (!report) return []
  var rows = Array.isArray(report) ? report : [report]
  var result = []
  for (var i = 0; i < rows.length; ++i) {
    var current = rows[i] && rows[i].current ? rows[i].current : null
    var latitude = parseFloat(rows[i] && rows[i].latitude)
    var longitude = parseFloat(rows[i] && rows[i].longitude)
    if (!current || isNaN(latitude) || isNaN(longitude)) continue
    result.push({
      latitude: latitude,
      longitude: longitude,
      windSpeed: numericValue([current.wind_speed_10m], 0),
      windDirection: numericValue([current.wind_direction_10m], 0),
      windGust: numericValue([current.wind_gusts_10m], 0)
    })
  }
  return result
}

function precipitationGridSeries(report) {
  if (!report) return []
  var rows = Array.isArray(report) ? report : [report]
  var result = []
  for (var i = 0; i < rows.length; ++i) {
    var current = rows[i] && rows[i].current ? rows[i].current : null
    var latitude = parseFloat(rows[i] && rows[i].latitude)
    var longitude = parseFloat(rows[i] && rows[i].longitude)
    if (!current || isNaN(latitude) || isNaN(longitude)) continue
    var amount = parseFloat(current.precipitation)
    if (isNaN(amount)) amount = 0
    result.push({ latitude: latitude, longitude: longitude, precipitation: Math.max(0, amount) })
  }
  return result
}

function weatherAlerts(report, now, language) {
  var rows = report && report.alerts ? report.alerts : []
  var useGerman = language === "de"
  var currentTime = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var severityRank = { minor: 1, moderate: 2, severe: 3, extreme: 4 }
  var result = []
  for (var i = 0; i < rows.length; ++i) {
    var alert = rows[i] || {}
    if (alert.status && alert.status !== "actual") continue
    if (alert.category && alert.category !== "met") continue
    var expires = alert.expires ? new Date(alert.expires).getTime() : Infinity
    if (!isNaN(expires) && expires <= currentTime) continue
    result.push({
      id: alert.alert_id || String(alert.id || i),
      severity: String(alert.severity || "minor").toLowerCase(),
      event: (useGerman ? alert.event_de : alert.event_en)
        || (useGerman ? alert.event_en : alert.event_de)
        || (useGerman ? "WETTERWARNUNG" : "WEATHER WARNING"),
      headline: (useGerman ? alert.headline_de : alert.headline_en)
        || (useGerman ? alert.headline_en : alert.headline_de)
        || (useGerman ? "Amtliche Wetterwarnung" : "Official weather warning"),
      description: (useGerman ? alert.description_de : alert.description_en)
        || (useGerman ? alert.description_en : alert.description_de) || "",
      instruction: (useGerman ? alert.instruction_de : alert.instruction_en)
        || (useGerman ? alert.instruction_en : alert.instruction_de) || "",
      onset: alert.onset || alert.effective || "",
      expires: alert.expires || ""
    })
  }
  result.sort(function(a, b) {
    var severityDifference = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)
    if (severityDifference !== 0) return severityDifference
    return new Date(a.onset || 0).getTime() - new Date(b.onset || 0).getTime()
  })
  return result
}

function nwsAlertReport(raw) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!parsed || !Array.isArray(parsed.features)) return null
  var alerts = []
  for (var i = 0; i < parsed.features.length; ++i) {
    var feature = parsed.features[i] || {}
    var p = feature.properties || {}
    alerts.push({
      alert_id: feature.id || p.id || String(i),
      status: String(p.status || "Actual").toLowerCase(),
      category: "met",
      severity: String(p.severity || "Minor").toLowerCase(),
      event_en: p.event || "Weather warning",
      event_de: p.event || "Wetterwarnung",
      headline_en: p.headline || p.event || "Official NWS weather warning",
      headline_de: p.headline || p.event || "Amtliche NWS-Wetterwarnung",
      description_en: p.description || "",
      description_de: p.description || "",
      instruction_en: p.instruction || "",
      instruction_de: p.instruction || "",
      onset: p.onset || p.effective || "",
      effective: p.effective || "",
      expires: p.expires || p.ends || "",
      web: p.web || "https://www.weather.gov/"
    })
  }
  return { alerts: alerts, _providerId: "nws" }
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"").replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "").replace(/^\s+|\s+$/g, "")
}

function xmlElement(block, name) {
  var escaped = String(name).replace(/:/g, "\\:")
  var match = String(block || "").match(new RegExp("<" + escaped + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + escaped + ">", "i"))
  return match ? decodeXml(match[1]) : ""
}

function normalizedPlace(value) {
  return String(value || "").toLowerCase()
    .replace(/[áàâäãå]/g, "a").replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i").replace(/[óòôöõ]/g, "o")
    .replace(/[úùûü]/g, "u").replace(/[ç]/g, "c").replace(/ß/g, "ss")
    .replace(/\b(stadt|kreis|region|county|district|province|municipality|departement|department)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ").replace(/^\s+|\s+$/g, "")
}

// MeteoAlarm's public feeds contain country-wide entries.  They do not
// expose point geometry without a re-user token, so match the warning area's
// official name against the place, county and region names from the place
// lookup.  A conservative match avoids ever showing a warning for the wrong
// part of a country.
function meteoAlarmAlertReport(raw, locationAliases) {
  var xml = String(raw || "")
  if (xml.indexOf("<feed") < 0) return null
  var aliases = []
  var input = Array.isArray(locationAliases) ? locationAliases : []
  for (var a = 0; a < input.length; ++a) {
    var alias = normalizedPlace(input[a])
    if (alias.length >= 3 && aliases.indexOf(alias) < 0) aliases.push(alias)
  }
  var entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || []
  var alerts = []
  for (var i = 0; i < entries.length; ++i) {
    var block = entries[i]
    var area = xmlElement(block, "cap:areaDesc")
    var title = xmlElement(block, "title")
    var haystack = normalizedPlace(area + " " + title)
    var matches = false
    for (var j = 0; j < aliases.length; ++j) {
      if (haystack.indexOf(aliases[j]) >= 0 || aliases[j].indexOf(haystack) >= 0) {
        matches = true
        break
      }
    }
    if (!matches) continue
    var severity = xmlElement(block, "cap:severity") || "Minor"
    var event = xmlElement(block, "cap:event") || "Weather warning"
    alerts.push({
      alert_id: xmlElement(block, "cap:identifier") || xmlElement(block, "id") || String(i),
      status: String(xmlElement(block, "cap:status") || "Actual").toLowerCase(),
      category: "met",
      severity: severity.toLowerCase(),
      event_en: event,
      event_de: event,
      headline_en: title || ("Official warning for " + area),
      headline_de: title || ("Amtliche Warnung für " + area),
      description_en: area,
      description_de: area,
      instruction_en: "",
      instruction_de: "",
      onset: xmlElement(block, "cap:onset"),
      expires: xmlElement(block, "cap:expires"),
      web: "https://meteoalarm.org/"
    })
  }
  return { alerts: alerts, _providerId: "meteoalarm" }
}

// MeteoAlarm JSON API (feeds.meteoalarm.org/api/v1): the same country-wide
// warnings as the Atom feed with full CAP detail. Much larger, so it is only
// the fallback when the Atom feed fails. Prefers the interface language's
// info block, then English.
function meteoAlarmApiAlertReport(raw, locationAliases, language) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!parsed || !Array.isArray(parsed.warnings)) return null
  var aliases = []
  var input = Array.isArray(locationAliases) ? locationAliases : []
  for (var a = 0; a < input.length; ++a) {
    var alias = normalizedPlace(input[a])
    if (alias.length >= 3 && aliases.indexOf(alias) < 0) aliases.push(alias)
  }
  var wanted = String(language || "en").toLowerCase()
  var alerts = []
  for (var i = 0; i < parsed.warnings.length; ++i) {
    var alert = parsed.warnings[i] && parsed.warnings[i].alert
    var infos = alert && Array.isArray(alert.info) ? alert.info : []
    if (!infos.length) continue
    var info = null
    var english = null
    for (var n = 0; n < infos.length; ++n) {
      var tag = String(infos[n].language || "").toLowerCase()
      if (!info && tag.indexOf(wanted) === 0) info = infos[n]
      if (!english && tag.indexOf("en") === 0) english = infos[n]
    }
    info = info || english || infos[0]
    var areas = Array.isArray(info.area) ? info.area : []
    var areaNames = []
    for (var r = 0; r < areas.length; ++r) areaNames.push(String(areas[r].areaDesc || ""))
    var haystack = normalizedPlace(areaNames.join(" "))
    var matches = false
    for (var j = 0; j < aliases.length && !matches; ++j)
      matches = haystack.indexOf(aliases[j]) >= 0
    if (!matches) continue
    var event = String(info.event || "Weather warning")
    var headline = String(info.headline || event)
    alerts.push({
      alert_id: String(alert.identifier || parsed.warnings[i].uuid || i),
      status: String(alert.status || "Actual").toLowerCase(),
      category: "met",
      severity: String(info.severity || "Minor").toLowerCase(),
      event_en: event,
      event_de: event,
      headline_en: headline,
      headline_de: headline,
      description_en: String(info.description || areaNames.join(", ")),
      description_de: String(info.description || areaNames.join(", ")),
      instruction_en: String(info.instruction || ""),
      instruction_de: String(info.instruction || ""),
      onset: String(info.onset || info.effective || ""),
      expires: String(info.expires || ""),
      web: "https://meteoalarm.org/"
    })
  }
  return { alerts: alerts, _providerId: "meteoalarm-api" }
}

function pointInRing(latitude, longitude, ring) {
  var inside = false
  for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    var xi = Number(ring[i][0]), yi = Number(ring[i][1])
    var xj = Number(ring[j][0]), yj = Number(ring[j][1])
    if ((yi > latitude) !== (yj > latitude)
        && longitude < (xj - xi) * (latitude - yi) / ((yj - yi) || 1e-12) + xi)
      inside = !inside
  }
  return inside
}

function geometryContainsPoint(geometry, latitude, longitude) {
  if (!geometry || !Array.isArray(geometry.coordinates)) return true
  var polygons = geometry.type === "MultiPolygon" ? geometry.coordinates
    : (geometry.type === "Polygon" ? [geometry.coordinates] : null)
  if (!polygons) return true
  for (var p = 0; p < polygons.length; ++p) {
    var rings = polygons[p] || []
    if (!rings.length || !pointInRing(latitude, longitude, rings[0])) continue
    var inHole = false
    for (var h = 1; h < rings.length && !inHole; ++h)
      inHole = pointInRing(latitude, longitude, rings[h])
    if (!inHole) return true
  }
  return false
}

// Environment and Climate Change Canada public alerts (api.weather.gc.ca
// OGC API "weather-alerts"). The request asks for a tiny box around the
// place; features are checked against their polygons, and the one alert
// issued for several forecast regions is listed once.
function ecccAlertReport(raw, latitude, longitude, language) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!parsed || !Array.isArray(parsed.features)) return null
  var french = String(language || "") === "fr"
  var lat = Number(latitude)
  var lon = Number(longitude)
  var colourSeverity = { yellow: "moderate", orange: "severe", red: "extreme" }
  var typeSeverity = { warning: "severe", watch: "moderate", advisory: "minor", statement: "minor" }
  var seen = {}
  var alerts = []
  for (var i = 0; i < parsed.features.length; ++i) {
    var feature = parsed.features[i] || {}
    var p = feature.properties || {}
    if (isFinite(lat) && isFinite(lon) && !geometryContainsPoint(feature.geometry, lat, lon)) continue
    var key = [p.alert_code, p.alert_type, p.publication_datetime].join("|")
    if (seen[key]) continue
    seen[key] = true
    var state = String(p.status_en || "issued").toLowerCase()
    var event = String((french ? p.alert_short_name_fr : p.alert_short_name_en) || p.alert_short_name_en || "Weather alert")
    var headline = String((french ? p.alert_name_fr : p.alert_name_en) || p.alert_name_en || event)
    var text = String((french ? p.alert_text_fr : p.alert_text_en) || p.alert_text_en || "")
    alerts.push({
      alert_id: String(feature.id || key),
      status: state === "cancelled" || state === "ended" ? "cancelled" : "actual",
      category: "met",
      severity: colourSeverity[String(p.risk_colour_en || "").toLowerCase()]
        || typeSeverity[String(p.alert_type || "").toLowerCase()] || "minor",
      event_en: event,
      event_de: event,
      headline_en: headline.charAt(0).toUpperCase() + headline.slice(1),
      headline_de: headline.charAt(0).toUpperCase() + headline.slice(1),
      description_en: text,
      description_de: text,
      instruction_en: "",
      instruction_de: "",
      onset: String(p.validity_datetime || p.publication_datetime || ""),
      expires: String(p.event_end_datetime || p.expiration_datetime || ""),
      web: "https://weather.gc.ca/"
    })
  }
  return { alerts: alerts, _providerId: "eccc" }
}

// ---- Place lookup. Name, region and country for the forecast place, from
//      IP geolocation (auto-detect), Nominatim reverse geocoding (stored
//      coordinates) or a name search (name-only locations). The result keeps
//      the nearest_area shape the panel has always read, so every consumer
//      (map centre, country-dependent providers, MeteoAlarm aliases, the
//      cache key) works unchanged.
function placeReport(place, sourceId) {
  if (!place) return null
  var latitude = parseFloat(place.latitude)
  var longitude = parseFloat(place.longitude)
  if (isNaN(latitude) || isNaN(longitude)) return null
  function field(value) { return [{ value: String(value || "") }] }
  return {
    nearest_area: [{
      areaName: field(place.name),
      region: field(place.region),
      county: field(place.county),
      country: field(String(place.countryCode || "").toUpperCase()),
      latitude: String(latitude),
      longitude: String(longitude)
    }],
    _placeSource: String(sourceId || "")
  }
}

// IP geolocation services, tried in order.
function ipPlace(providerId, raw) {
  var data
  try { data = JSON.parse(String(raw || "")) } catch (e) { return null }
  if (!data) return null
  if (providerId === "ipwho.is") {
    if (data.success === false) return null
    return { name: data.city, region: data.region, county: "", countryCode: data.country_code,
      latitude: data.latitude, longitude: data.longitude }
  }
  if (providerId === "ipapi.co") {
    if (data.error) return null
    return { name: data.city, region: data.region, county: "", countryCode: data.country_code,
      latitude: data.latitude, longitude: data.longitude }
  }
  if (providerId === "geojs") {
    return { name: data.city, region: data.region, county: "", countryCode: data.country_code,
      latitude: data.latitude, longitude: data.longitude }
  }
  return null
}

// Nominatim (OpenStreetMap) reverse geocoding: /reverse?format=jsonv2.
function nominatimReversePlace(raw, latitude, longitude) {
  var data
  try { data = JSON.parse(String(raw || "")) } catch (e) { return null }
  var address = data && data.address
  if (!address) return null
  return {
    name: address.city || address.town || address.village || address.municipality
      || address.hamlet || data.name || "",
    county: address.county || address.state_district || "",
    region: address.state || address.region || "",
    countryCode: address.country_code || "",
    latitude: latitude,
    longitude: longitude
  }
}

// Open-Meteo geocoding (/v1/search) for name-only locations. The search is
// fuzzy ("Bobingen" also finds "Böbingen"), so an exact name match wins over
// the top-ranked hit.
function geocodingSearchPlace(raw, wantedName) {
  var data
  try { data = JSON.parse(String(raw || "")) } catch (e) { return null }
  var results = data && Array.isArray(data.results) ? data.results : []
  var wanted = String(wantedName || "").split(",")[0].replace(/^\s+|\s+$/g, "").toLowerCase()
  var hit = null
  for (var i = 0; i < results.length && !hit; ++i)
    if (String(results[i].name || "").toLowerCase() === wanted) hit = results[i]
  hit = hit || results[0]
  if (!hit) return null
  return { name: hit.name, county: hit.admin2 || hit.admin3 || "", region: hit.admin1 || "",
    countryCode: hit.country_code || "", latitude: hit.latitude, longitude: hit.longitude }
}

function placeCountryCode(report) {
  var area = report && report.nearest_area && report.nearest_area[0]
  return area && area.country && area.country[0] ? String(area.country[0].value || "") : ""
}

function placeAliases(report, configuredName) {
  var result = []
  function add(value) {
    var text = String(value || "").replace(/^\s+|\s+$/g, "")
    if (text && result.indexOf(text) < 0) result.push(text)
  }
  add(configuredName)
  var area = report && report.nearest_area && report.nearest_area[0]
  if (area) {
    if (area.areaName && area.areaName[0]) add(area.areaName[0].value)
    if (area.county && area.county[0]) add(area.county[0].value)
    if (area.region && area.region[0]) add(area.region[0].value)
  }
  return result
}

function isoDurationMilliseconds(value) {
  var match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i)
  if (!match) return 0
  return ((parseInt(match[1] || "0", 10) * 60 + parseInt(match[2] || "0", 10)) * 60
    + parseInt(match[3] || "0", 10)) * 1000
}

function wmsRadarTimeline(raw, providerId, now, hours) {
  var xml = String(raw || "")
  var dimension = xml.match(/<Dimension[^>]*name=["']time["'][^>]*>([^<]+)<\/Dimension>/i)
  if (!dimension) return []
  var specification = decodeXml(dimension[1])
  var stamps = []
  if (specification.indexOf("/") >= 0) {
    var parts = specification.split("/")
    var start = new Date(parts[0]).getTime()
    var end = new Date(parts[1]).getTime()
    var step = isoDurationMilliseconds(parts[2])
    if (!isNaN(start) && !isNaN(end) && step > 0)
      for (var stamp = start; stamp <= end && stamps.length < 500; stamp += step) stamps.push(stamp)
  } else {
    var values = specification.split(",")
    for (var i = 0; i < values.length; ++i) {
      var parsed = new Date(values[i]).getTime()
      if (!isNaN(parsed)) stamps.push(parsed)
    }
  }
  var currentTime = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  if (isNaN(currentTime)) currentTime = Date.now()
  var firstAllowed = currentTime - Math.max(1, parseFloat(hours) || 2) * 60 * 60 * 1000 - 10 * 60 * 1000
  var lastAllowed = currentTime + 10 * 60 * 1000
  var result = []
  for (var s = 0; s < stamps.length; ++s) {
    if (stamps[s] < firstAllowed || stamps[s] > lastAllowed) continue
    result.push({ timestamp: new Date(stamps[s]).toISOString(), wmsProvider: providerId })
  }
  result.sort(function(a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() })
  return result
}

function numericValue(values, index) {
  if (!values || values[index] === undefined || values[index] === null) return 0
  var value = parseFloat(values[index])
  return isNaN(value) ? 0 : value
}

function closestRadarFrameIndex(frames, now) {
  var source = Array.isArray(frames) ? frames : []
  if (!source.length) return 0
  var target = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  if (isNaN(target)) target = Date.now()
  var newestPastIndex = -1
  var newestPastTime = -Infinity
  var earliestFutureIndex = -1
  var earliestFutureTime = Infinity
  for (var i = 0; i < source.length; ++i) {
    var timestamp = new Date(source[i] && source[i].timestamp).getTime()
    if (isNaN(timestamp)) continue
    if (timestamp <= target && timestamp > newestPastTime) {
      newestPastTime = timestamp
      newestPastIndex = i
    } else if (timestamp > target && timestamp < earliestFutureTime) {
      earliestFutureTime = timestamp
      earliestFutureIndex = i
    }
  }
  return newestPastIndex >= 0 ? newestPastIndex : Math.max(0, earliestFutureIndex)
}

// Bright Sky's RADOLAN grid is 1 km per cell. Return the frame nearest "now";
// the UI crops a local square around its center instead of pretending the
// polar-stereographic grid is a conventional web map.
function radarSnapshot(report, now) {
  var frames = report && report.radar ? report.radar : []
  if (!frames.length) return null
  var target = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var best = null
  var bestDistance = Infinity
  for (var i = 0; i < frames.length; ++i) {
    var stamp = new Date(frames[i].timestamp).getTime()
    if (isNaN(stamp)) continue
    var distance = Math.abs(stamp - target)
    if (distance < bestDistance) { best = frames[i]; bestDistance = distance }
  }
  if (!best || !best.precipitation_5 || !best.precipitation_5.length) return null
  return { timestamp: best.timestamp, grid: best.precipitation_5 }
}

// Keep only the forecast frames that form the flipbook from "now" through
// the requested horizon. Bright Sky's RV records arrive every five minutes;
// allowing one interval before the exact wall-clock time preserves the frame
// for the current five-minute bucket. Invalid and duplicate timestamps are
// dropped so the playback controls always advance monotonically.
function radarTimeline(report, now, hours) {
  var frames = report && report.radar ? report.radar : []
  if (!frames.length) return []

  var currentTime = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  if (isNaN(currentTime)) currentTime = Date.now()
  var horizonHours = Math.max(0, parseFloat(hours))
  if (isNaN(horizonHours)) horizonHours = 2
  var firstAllowed = currentTime - 5 * 60 * 1000
  var lastAllowed = currentTime + horizonHours * 60 * 60 * 1000
  var result = []
  var seen = {}

  for (var i = 0; i < frames.length; ++i) {
    var frame = frames[i]
    var stamp = new Date(frame && frame.timestamp).getTime()
    if (isNaN(stamp) || stamp < firstAllowed || stamp > lastAllowed) continue
    if (seen[String(stamp)]) continue
    seen[String(stamp)] = true
    result.push(frame)
  }

  result.sort(function(a, b) {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })
  return result
}

// RainViewer's public global catalogue contains observed radar frames as
// Unix timestamps plus tile paths. Normalize them to the same lightweight
// frame shape consumed by the panel's existing playback controls. Forecast
// frames are included automatically if RainViewer publishes them again.
function rainViewerTimeline(report, now, hours) {
  var radar = report && report.radar ? report.radar : null
  var host = String(report && report.host || "")
  if (!radar || host.indexOf("https://") !== 0) return []
  var rows = []
  if (Array.isArray(radar.past)) rows = rows.concat(radar.past)
  if (Array.isArray(radar.nowcast)) rows = rows.concat(radar.nowcast)

  var currentTime = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  if (isNaN(currentTime)) currentTime = Date.now()
  var horizonHours = Math.max(1, parseFloat(hours) || 2)
  var firstAllowed = currentTime - horizonHours * 60 * 60 * 1000 - 10 * 60 * 1000
  var lastAllowed = currentTime + horizonHours * 60 * 60 * 1000
  var seen = {}
  var result = []
  for (var i = 0; i < rows.length; ++i) {
    var stamp = Number(rows[i] && rows[i].time) * 1000
    var path = String(rows[i] && rows[i].path || "")
    if (!isFinite(stamp) || stamp < firstAllowed || stamp > lastAllowed || path.indexOf("/v2/") !== 0) continue
    if (seen[String(stamp)]) continue
    seen[String(stamp)] = true
    result.push({
      timestamp: new Date(stamp).toISOString(),
      rainViewer: true,
      rainViewerHost: host,
      rainViewerPath: path
    })
  }
  result.sort(function(a, b) {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })
  return result
}

// Rain rate observed *right now* at the configured location, derived from
// the single nearest RADOLAN frame (not a forecast). Cell values are
// hundredths of a mm accumulated over that frame's 5-minute step; scaled by
// 12 that becomes an hourly rate so it reads on the same mm/h scale as
// radarNextHourAmount's next-60-minutes total.
function radarCurrentIntensity(report, now) {
  var snapshot = radarSnapshot(report, now)
  if (!snapshot) return ""
  var grid = snapshot.grid
  var centerRow = grid[Math.floor(grid.length / 2)] || []
  var value = parseFloat(centerRow[Math.floor(centerRow.length / 2)])
  if (isNaN(value)) return ""
  return (value * 12 / 100).toFixed(1)
}

function hourlyTemp(hour, useImperial) {
  if (!hour) return ""
  var value = useImperial ? hour.tempF : hour.tempC
  return value === undefined || value === null || value === "" ? "" : value + "°"
}

function hourlyIcon(hour) {
  if (!hour) return ""
  return iconForOpenMeteoCode(hour.weatherCode, Number(hour.isDay) === 0,
    hour.time ? new Date(hour.time) : null)
}

function currentIcon(current, fallback, date) {
  if (!current) return fallback || ""
  if (current.openMeteoWeatherCode !== undefined && current.openMeteoWeatherCode !== null)
    return iconForOpenMeteoCode(current.openMeteoWeatherCode, Number(current.isDay) === 0,
      date === undefined ? new Date() : date)
  if (current.weatherCode !== undefined && current.weatherCode !== null)
    return iconForCode(current.weatherCode, false)
  return fallback || ""
}

// A location save finishes once the first response for the new place has
// arrived: the forecast when coordinates are known, otherwise the place
// lookup that resolves them.
function weatherResponseCompletesSave(hasConfiguredCoordinates, source) {
  return hasConfiguredCoordinates ? (source === "open-meteo" || source === "met-no") : source === "place"
}

function bareTempForDay(day, kind, useImperial) {
  if (!day) return ""
  var v = useImperial
    ? (kind === "max" ? day.maxtempF : day.mintempF)
    : (kind === "max" ? day.maxtempC : day.mintempC)
  if (v === undefined || v === null || v === "") return ""
  return v + "°"
}

function dayIcon(day) {
  if (!day) return ""
  if (day.openMeteoWeatherCode !== undefined && day.openMeteoWeatherCode !== null)
    return iconForOpenMeteoCode(day.openMeteoWeatherCode)
  if (!day.hourly || day.hourly.length === 0) return ""

  var best = day.hourly[0]
  var bestDist = 9999
  for (var i = 0; i < day.hourly.length; ++i) {
    var t = parseInt(String(day.hourly[i].time || "0"), 10)
    var dist = Math.abs(t - 1200)
    if (dist < bestDist) {
      bestDist = dist
      best = day.hourly[i]
    }
  }
  return iconForCode(best.weatherCode, false)
}

// Weather symbol group (WorldWeatherOnline condition codes, the table
// iconForCode is keyed by) for an Open-Meteo WMO weather code.
function wttrCodeForOpenMeteoCode(code) {
  var c = parseInt(String(code || "0"), 10)
  if (c === 0) return 113
  if (c === 1 || c === 2) return 116
  if (c === 3) return 119
  if (c === 45 || c === 48) return 143
  if (c === 51 || c === 53 || c === 55 || c === 56 || c === 57 || c === 61) return 266
  if (c === 63 || c === 65 || c === 66 || c === 67 || c === 80 || c === 81 || c === 82) return 308
  if (c === 71 || c === 73 || c === 75 || c === 77 || c === 85 || c === 86) return 338
  if (c === 95 || c === 96 || c === 99) return 389
  return 119
}

function iconForOpenMeteoCode(code, night, date) {
  return iconForCode(wttrCodeForOpenMeteoCode(code), night, date)
}

// ---- Moon phase. Position in the synodic month as the Moon's true
//      elongation from the Sun (Meeus, "Astronomical Algorithms", ch. 49
//      low-precision terms): 0 new, 0.25 first quarter, 0.5 full. Accurate to
//      well under an hour of phase, far finer than the 28 glyph steps.
function moonPhaseFraction(date) {
  var ms = date instanceof Date ? date.getTime() : new Date(date === undefined ? Date.now() : date).getTime()
  if (isNaN(ms)) return 0
  var centuries = (ms / 86400000 + 2440587.5 - 2451545) / 36525
  var rad = Math.PI / 180
  var elongation = 297.8501921 + 445267.1114034 * centuries
  var sunAnomaly = 357.5291092 + 35999.0502909 * centuries
  var moonAnomaly = 134.9633964 + 477198.8675055 * centuries
  var trueElongation = elongation
    + 6.289 * Math.sin(moonAnomaly * rad)
    - 2.100 * Math.sin(sunAnomaly * rad)
    + 1.274 * Math.sin((2 * elongation - moonAnomaly) * rad)
    + 0.658 * Math.sin(2 * elongation * rad)
    + 0.214 * Math.sin(2 * moonAnomaly * rad)
    + 0.110 * Math.sin(elongation * rad)
  var fraction = (trueElongation % 360) / 360
  return fraction < 0 ? fraction + 1 : fraction
}

// 0 = new moon, 7 = first quarter, 14 = full, 21 = last quarter.
function moonPhaseIndex(date) {
  return Math.round(moonPhaseFraction(date) * 28) % 28
}

// Nerd Font moon set (moon_new … moon_waning_crescent_6): the lit part is the
// filled shape, which reads correctly on a dark panel; the new moon is an
// empty outline. The "moon-alt" set fills the shadow instead and would show
// a waxing crescent as a bright waning half. Northern hemisphere orientation,
// lit on the right while waxing.
function moonPhaseGlyph(date) {
  return String.fromCharCode(0xe38d + moonPhaseIndex(date))
}

// Cloud / precipitation glyph without a sun or moon, for layering in front of
// the moon phase. Null where no combined symbol is drawn: clear skies use the
// phase glyph itself, and overcast hides the sky completely.
function neutralWeatherGlyph(code) {
  var c = parseInt(String(code || "0"), 10)
  switch (c) {
    case 116: return "\ue33d"
    case 143: case 248: case 260: return "\ue313"
    case 176: case 263: case 353: return "\ue319"
    case 179: case 227: case 230: case 323: case 326: case 368:
    case 329: case 332: case 335: case 338: case 371: return "\ue31a"
    case 182: case 185: case 281: case 284: case 311: case 314:
    case 317: case 320: case 350: case 362: case 365: case 374: case 377: return "\ue3ad"
    case 200: case 386: case 389: case 392: case 395: return "\ue31d"
    case 266: case 293: case 296: case 299: case 302: case 305: case 308: case 356: case 359: return "\ue318"
    default: return null
  }
}

// The phase itself is the same everywhere at a given instant; what depends on
// the place is how it looks. South of the equator the Moon is seen upside
// down, so the glyph is mirrored and a waxing moon is lit on the left.
function isMoonPhaseGlyph(text) {
  var code = String(text || "").charCodeAt(0)
  return code >= 0xe38d && code <= 0xe3a8
}

function moonMirroredAt(latitude) {
  return Number(latitude) < 0
}

// Which side of the disc is lit, as the observer sees it. Full and new moon
// count as right-lit.
function moonLitOnLeft(date, latitude) {
  var index = moonPhaseIndex(date)
  var waning = index > 14
  return waning !== moonMirroredAt(latitude)
}

// Moon phase behind a weather glyph for the large current-conditions symbol
// at night. Null by day, for clear or overcast skies, and without a code.
// The moon peeks out on its lit side, so a waning crescent is not hidden
// behind the cloud.
function nightCompositeSymbol(current, date, latitude) {
  if (!current || Number(current.isDay) !== 0) return null
  if (current.openMeteoWeatherCode === undefined || current.openMeteoWeatherCode === null) return null
  var weather = neutralWeatherGlyph(wttrCodeForOpenMeteoCode(current.openMeteoWeatherCode))
  if (!weather) return null
  return {
    moon: moonPhaseGlyph(date),
    weather: weather,
    mirrored: moonMirroredAt(latitude),
    moonOnLeft: moonLitOnLeft(date, latitude)
  }
}

// Night variants use the crescent ("night-alt") glyphs: the full-moon set
// hides a round moon behind the cloud and reads as a plain day cloud.
// Overcast (119/122) has no sky visible, so it keeps one glyph.
function iconForCode(code, night, date) {
  var c = parseInt(String(code || "0"), 10)
  switch (c) {
    // A clear night shows the actual moon phase when the time is known.
    case 113: return night ? (date !== undefined && date !== null ? moonPhaseGlyph(date) : "\ue32b") : "\ue30d"
    case 116: return night ? "" : ""
    case 119: case 122: return ""
    case 143: case 248: case 260: return night ? "\ue346" : "\ue313"
    case 176: case 263: case 353: return night ? "" : ""
    case 179: case 227: case 230: case 323: case 326: case 368: return night ? "" : ""
    case 182: case 185: case 281: case 284: case 311: case 314:
    case 317: case 320: case 350: case 362: case 365: case 374: case 377: return night ? "" : ""
    case 200: case 386: case 389: case 392: case 395: return night ? "" : ""
    case 266: case 293: case 296: case 299: case 302: case 305: case 308: case 356: case 359: return night ? "" : ""
    case 329: case 332: case 335: case 338: case 371: return night ? "" : ""
    default: return ""
  }
}

// ---- Rain drift. The radar arrow shows where rain moves, which follows the
//      wind a few kilometres up rather than the surface wind: on 2026-09-16
//      the 10 m wind came from 316° while the rain moved from 236°.
//
//      In the DWD region the motion is read from the radar itself
//      (RadarMotion.mjs, run by RadarMotionWorker.mjs off the GUI thread).
//      Elsewhere, or with too little rain to track, the 700 hPa model wind
//      stands in, and only without that (MET Norway) the surface wind.

// Drift for one moment, normally the radar frame on screen:
// { directionFrom, speedKmh, source: "radar" | "steering" | "surface" } or null.
function rainDriftAt(motion, forecastReport, nowcast, time) {
  var target = time instanceof Date ? time.getTime() : Number(time)
  if (isNaN(target)) target = Date.now()
  var best = null
  var bestDistance = Infinity
  for (var i = 0; motion && i < motion.length; ++i) {
    // A step describes the 15 minutes that follow its time.
    var distance = Math.abs(motion[i].time + 7.5 * 60 * 1000 - target)
    if (distance < bestDistance) { best = motion[i]; bestDistance = distance }
  }
  if (best && bestDistance <= 15 * 60 * 1000)
    return { directionFrom: best.directionFrom, speedKmh: best.speedKmh, source: "radar" }

  var hourly = forecastReport && forecastReport.hourly
  if (hourly && hourly.time && hourly.wind_direction_700hPa && hourly.wind_speed_700hPa) {
    var hourIndex = -1
    var hourDistance = Infinity
    for (var h = 0; h < hourly.time.length; ++h) {
      var hourStamp = new Date(hourly.time[h]).getTime()
      var delta = Math.abs(hourStamp + 30 * 60 * 1000 - target)
      if (!isNaN(hourStamp) && delta < hourDistance) { hourIndex = h; hourDistance = delta }
    }
    if (hourIndex >= 0 && hourDistance <= 90 * 60 * 1000) {
      var direction = Number(hourly.wind_direction_700hPa[hourIndex])
      var speed = Number(hourly.wind_speed_700hPa[hourIndex])
      if (hourly.wind_direction_700hPa[hourIndex] !== null && hourly.wind_speed_700hPa[hourIndex] !== null
          && !isNaN(direction) && !isNaN(speed))
        return { directionFrom: direction, speedKmh: speed, source: "steering" }
    }
  }

  if (nowcast && nowcast.length) {
    var slot = nowcast[0]
    var slotDistance = Infinity
    for (var n = 0; n < nowcast.length; ++n) {
      var slotDelta = Math.abs(new Date(nowcast[n].time).getTime() - target)
      if (slotDelta < slotDistance) { slot = nowcast[n]; slotDistance = slotDelta }
    }
    if (slot.windDirection !== undefined && slot.windDirection !== null)
      return { directionFrom: Number(slot.windDirection) || 0, speedKmh: Number(slot.windSpeed) || 0, source: "surface" }
  }
  return null
}

// ---- Shared live data. The bar widget and the app hand each other their raw
//      responses through a watched file that both processes re-parse on
//      every write, so only fields some view actually reads are kept.
var SHARED_MOSMIX_FIELDS = ["timestamp", "temperature", "precipitation",
  "precipitation_probability", "wind_speed", "relative_humidity", "icon"]

function pickFields(source, fields) {
  var result = {}
  for (var i = 0; i < fields.length; ++i)
    if (source && source[fields[i]] !== undefined) result[fields[i]] = source[fields[i]]
  return result
}

function compactMosmixReport(report) {
  if (!report || !Array.isArray(report.weather)) return report || null
  var rows = []
  for (var i = 0; i < report.weather.length; ++i)
    rows.push(pickFields(report.weather[i], SHARED_MOSMIX_FIELDS))
  return { weather: rows }
}


if (typeof module !== "undefined") {
  module.exports = {
    rainDriftAt: rainDriftAt,
    compactMosmixReport: compactMosmixReport,
    parseLocationFile: parseLocationFile,
    parseSavedLocations: parseSavedLocations,
    defaultSavedLocations: defaultSavedLocations,
    addSavedLocation: addSavedLocation,
    removeSavedLocationAt: removeSavedLocationAt,
    WEATHER_CACHE_MAX_AGE_MS: WEATHER_CACHE_MAX_AGE_MS,
    WEATHER_CACHE_FALLBACK_DELAY_MS: WEATHER_CACHE_FALLBACK_DELAY_MS,
    shouldUseWeatherCache: shouldUseWeatherCache,
    weatherCacheKey: weatherCacheKey,
    parseWeatherDataCache: parseWeatherDataCache,
    mergeCachedWeatherObject: mergeCachedWeatherObject,
    mergeCachedWeatherSeries: mergeCachedWeatherSeries,
    weatherFieldIsCached: weatherFieldIsCached,
    weatherObjectUsesCache: weatherObjectUsesCache,
    weatherSeriesUsesCache: weatherSeriesUsesCache,
    stripWeatherCacheMetadata: stripWeatherCacheMetadata,
    mergeWeatherSnapshotForStorage: mergeWeatherSnapshotForStorage,
    locationQueryKey: locationQueryKey,
    parseGeocodingResults: parseGeocodingResults,
    parseOverpassPlaces: parseOverpassPlaces,
    parseRadarPlaceCache: parseRadarPlaceCache,
    geographicDistanceKm: geographicDistanceKm,
    radarPlaceCandidates: radarPlaceCandidates,
    locationCommit: locationCommit,
    isFutureForecastDate: isFutureForecastDate,
    isForecastDateOnOrAfter: isForecastDateOnOrAfter,
    roundedTemp: roundedTemp,
    celsiusToFahrenheit: celsiusToFahrenheit,
    millimetersToInches: millimetersToInches,
    kilometersToMiles: kilometersToMiles,
    kilometersPerHourToMilesPerHour: kilometersPerHourToMilesPerHour,
    formatTemp: formatTemp,
    normalizedUnit: normalizedUnit,
    localeUsesImperial: localeUsesImperial,
    countryUsesImperial: countryUsesImperial,
    shouldUseImperial: shouldUseImperial,
    dayName: dayName,
    openMeteoForecastDays: openMeteoForecastDays,
    openMeteoCurrentCondition: openMeteoCurrentCondition,
    metNoToOpenMeteo: metNoToOpenMeteo,
    openMeteoHourlyForecast: openMeteoHourlyForecast,
    brightSkyCurrentCondition: brightSkyCurrentCondition,
    hybridHourlyForecast: hybridHourlyForecast,
    brightSkyForecastDays: brightSkyForecastDays,
    hybridForecastDays: hybridForecastDays,
    radarNextHourAmount: radarNextHourAmount,
    rainNowcastSeries: rainNowcastSeries,
    upcomingRainStart: upcomingRainStart,
    airQualityRequestUrl: airQualityRequestUrl,
    airQualitySummary: airQualitySummary,
    windGridSeries: windGridSeries,
    precipitationGridSeries: precipitationGridSeries,
    weatherAlerts: weatherAlerts,
    nwsAlertReport: nwsAlertReport,
    meteoAlarmAlertReport: meteoAlarmAlertReport,
    placeCountryCode: placeCountryCode,
    placeAliases: placeAliases,
    placeReport: placeReport,
    ipPlace: ipPlace,
    nominatimReversePlace: nominatimReversePlace,
    geocodingSearchPlace: geocodingSearchPlace,
    meteoAlarmApiAlertReport: meteoAlarmApiAlertReport,
    ecccAlertReport: ecccAlertReport,
    geometryContainsPoint: geometryContainsPoint,
    wmsRadarTimeline: wmsRadarTimeline,
    closestRadarFrameIndex: closestRadarFrameIndex,
    radarSnapshot: radarSnapshot,
    radarTimeline: radarTimeline,
    rainViewerTimeline: rainViewerTimeline,
    hourlyTemp: hourlyTemp,
    hourlyIcon: hourlyIcon,
    currentIcon: currentIcon,
    weatherResponseCompletesSave: weatherResponseCompletesSave,
    bareTempForDay: bareTempForDay,
    dayIcon: dayIcon,
    iconForOpenMeteoCode: iconForOpenMeteoCode,
    moonPhaseFraction: moonPhaseFraction,
    moonPhaseIndex: moonPhaseIndex,
    moonPhaseGlyph: moonPhaseGlyph,
    neutralWeatherGlyph: neutralWeatherGlyph,
    nightCompositeSymbol: nightCompositeSymbol,
    isMoonPhaseGlyph: isMoonPhaseGlyph,
    moonMirroredAt: moonMirroredAt,
    moonLitOnLeft: moonLitOnLeft,
    iconForCode: iconForCode
  }
}
