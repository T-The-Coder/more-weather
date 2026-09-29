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
    if (byInstant && /Z$/.test(String(fallbackRow.time || "")))
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

// Past rows are dropped before the lists are cut to length: they are sorted
// by time and the first rows kept, so without the cut-off the oldest hours
// stayed for good and every newer forecast fell off the end (seen on
// 2026-09-29: saved places still held the hours of 14 September).
function mergeWeatherSnapshotForStorage(live, cached, nowMs) {
  var incoming = live && typeof live === "object" ? live : {}
  var previous = cached && typeof cached === "object" ? cached : {}
  var now = Number(nowMs) || Date.now()
  // The hour under way stays; a day stays until well past its end whatever
  // the time zone ("2026-09-29" reads as midnight UTC).
  var hourFrom = now - 60 * 60 * 1000
  var dayFrom = now - 36 * 60 * 60 * 1000
  var nowcastFrom = now - 15 * 60 * 1000
  return {
    label: weatherValueAvailable(incoming.label) ? incoming.label : String(previous.label || ""),
    forecastProviderId: weatherValueAvailable(incoming.forecastProviderId)
      ? incoming.forecastProviderId : String(previous.forecastProviderId || ""),
    alertProviderId: weatherValueAvailable(incoming.alertProviderId)
      ? incoming.alertProviderId : String(previous.alertProviderId || ""),
    current: stripWeatherCacheMetadata(mergeCachedWeatherObject(incoming.current, previous.current)),
    hourly: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.hourly, previous.hourly, "time", hourFrom, 72)),
    daily: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.daily, previous.daily, "date", dayFrom, 3)),
    nowcast: stripWeatherCacheMetadata(mergeCachedWeatherSeries(incoming.nowcast, previous.nowcast, "time", nowcastFrom, 9)),
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

// Temperatures carry their own scale: Kelvin is a choice of its own, while
// every other value (wind, rain, distance) stays metric with it.
function temperatureScale(unitOverride, localeName, countryName) {
  if (normalizedUnit(unitOverride) === "kelvin") return "kelvin"
  return shouldUseImperial(unitOverride, localeName, countryName) ? "fahrenheit" : "celsius"
}

function celsiusToKelvin(value) {
  var n = parseFloat(String(value))
  return isNaN(n) ? null : Math.round(n + 273.15)
}

// Bare number for the scale, from a reading that carries °C and °F.
function tempNumber(celsius, fahrenheit, scale) {
  var raw = scale === "fahrenheit" ? fahrenheit : celsius
  if (raw === undefined || raw === null || raw === "") return ""
  if (scale !== "kelvin") return String(raw)
  var kelvin = celsiusToKelvin(celsius)
  return kelvin === null ? "" : String(kelvin)
}

function tempUnitLabel(scale) {
  return scale === "kelvin" ? "K" : (scale === "fahrenheit" ? "°F" : "°C")
}

// Value with its unit ("17°C", "63°F", "290 K").
function tempWithUnit(celsius, fahrenheit, scale) {
  var number = tempNumber(celsius, fahrenheit, scale)
  if (number === "") return ""
  return scale === "kelvin" ? number + " K" : number + "°" + (scale === "fahrenheit" ? "F" : "C")
}

// Compact form for the forecast rows: a degree sign carries no scale, so
// Kelvin spells its unit out.
function tempBare(celsius, fahrenheit, scale) {
  var number = tempNumber(celsius, fahrenheit, scale)
  if (number === "") return ""
  return scale === "kelvin" ? number + " K" : number + "°"
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
  // Kelvin keeps every other value metric.
  if (unit === "metric" || unit === "kelvin") return false

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

// "yyyy-MM-ddTHH:mm+hh:mm" in this machine's local time, the shape
// withPlaceOffsets gives Open-Meteo's timestamps. Views slice hours and dates
// out of these strings, so UTC stamps would show up shifted by the UTC
// offset; the offset keeps the instant exact for comparisons.
function localIsoMinute(ms) {
  var date = new Date(ms)
  if (isNaN(date.getTime())) return ""
  return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate())
    + "T" + pad2(date.getHours()) + ":" + pad2(date.getMinutes())
    + offsetSuffix(-date.getTimezoneOffset() * 60)
}

// "+02:00" for 7200 seconds east of UTC.
function offsetSuffix(seconds) {
  var minutes = Math.round(Number(seconds) / 60)
  var sign = minutes < 0 ? "-" : "+"
  minutes = Math.abs(minutes)
  return sign + pad2(Math.floor(minutes / 60)) + ":" + pad2(minutes % 60)
}

// Open-Meteo answers timezone=auto with the place's wall-clock times and no
// offset ("2026-09-16T13:00"). JavaScript reads those as this machine's local
// time, which shifted every hourly and 15-minute series by the difference:
// New York's forecast started at 20:00 and its rain tab stayed empty. The
// place's offset (utc_offset_seconds) is appended here once, on arrival, so
// labels that slice "HH:mm" still show the place's time and every comparison
// with now uses the right instant. Dates (daily.time) stay as they are.
function withPlaceOffsets(report) {
  if (!report || typeof report !== "object" || !isFinite(Number(report.utc_offset_seconds))) return report
  var suffix = offsetSuffix(report.utc_offset_seconds)
  function stamped(value) {
    var text = String(value || "")
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text) ? text + suffix : value
  }
  var series = ["hourly", "minutely_15"]
  for (var i = 0; i < series.length; ++i) {
    var block = report[series[i]]
    if (block && Array.isArray(block.time)) block.time = block.time.map(stamped)
  }
  if (report.current && report.current.time) report.current.time = stamped(report.current.time)
  return report
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
    var feelsC = hourly.apparent_temperature ? hourly.apparent_temperature[i] : null
    result.push({
      time: time,
      tempC: roundedTemp(tempC),
      tempF: roundedTemp(celsiusToFahrenheit(tempC)),
      feelsLikeC: feelsC === null || feelsC === undefined ? "" : roundedTemp(feelsC),
      feelsLikeF: feelsC === null || feelsC === undefined ? "" : roundedTemp(celsiusToFahrenheit(feelsC)),
      humidity: hourly.relative_humidity_2m && hourly.relative_humidity_2m[i] !== null
        && hourly.relative_humidity_2m[i] !== undefined ? roundedTemp(hourly.relative_humidity_2m[i]) : "",
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

// `nowcast` is rainNowcastSeries' output: for the hours its radar slots cover,
// their probability, amount and precipitation symbol replace the hourly
// forecast's, so the hourly strip and the rain tab agree for the next two
// hours. `thunderConfirmed` (thunderstormConfirmed) applies to the hour in
// progress only.
function hybridHourlyForecast(mosmixReport, dailyForecastReport, uvReport, radarReport, now, limit, nowcast, thunderConfirmed) {
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
      // MOSMIX has no feels-like: Open-Meteo's for the same hour.
      feelsLikeC: rainFb.feelsLikeC !== undefined ? rainFb.feelsLikeC : "",
      feelsLikeF: rainFb.feelsLikeF !== undefined ? rainFb.feelsLikeF : "",
      humidity: row.relative_humidity !== undefined && row.relative_humidity !== null
        ? roundedTemp(row.relative_humidity) : (rainFb.humidity || ""),
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
    applyNowcastToHours(result, nowcast, thunderConfirmed)
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
    // From the hour in progress, as the MOSMIX branch above does.
    if (new Date(rainFallback[k].time).getTime() >= hourStartMs) {
      var fbEntry = rainFallback[k]
      var fbUv = uvByHour[String(fbEntry.time).slice(0, 13)] || {}
      futureFallback.push({
        time: fbEntry.time,
        tempC: fbEntry.tempC,
        tempF: fbEntry.tempF,
        feelsLikeC: fbEntry.feelsLikeC,
        feelsLikeF: fbEntry.feelsLikeF,
        humidity: fbEntry.humidity,
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

// Radar-backed nowcast slots override an hour's rain probability (the highest
// of its slots) and amount (their mean intensity over the hour) when at least
// two of the hour's four quarter hours are covered. The hour in progress takes
// the probability of its remaining slots; its amount stays the radar's next
// sixty minutes (radarNextHourAmount).
function applyNowcastToHours(hours, nowcast, thunderConfirmed) {
  var slots = Array.isArray(nowcast) ? nowcast : []
  for (var h = 0; h < hours.length; ++h) {
    var hourStart = new Date(hours[h].time).getTime()
    if (isNaN(hourStart)) continue
    var probability = null
    var probabilitySlots = 0
    var intensity = 0
    var amountSlots = 0
    var strongest = 0
    for (var s = 0; s < slots.length; ++s) {
      var slotStart = new Date(slots[s].time).getTime()
      if (isNaN(slotStart) || slotStart < hourStart || slotStart >= hourStart + 60 * 60 * 1000) continue
      if (slots[s].probabilitySource === "radar") {
        probability = Math.max(probability === null ? 0 : probability, Number(slots[s].probability) || 0)
        probabilitySlots++
      }
      if (slots[s].precipitationSource === "radar") {
        intensity += Number(slots[s].precipitation) || 0
        strongest = Math.max(strongest, Number(slots[s].precipitation) || 0)
        amountSlots++
      }
    }
    var inProgress = h === 0
    if (probability !== null && (probabilitySlots >= 2 || inProgress)) hours[h].rainProbability = String(Math.round(probability))
    if (amountSlots >= 2 && !inProgress)
      hours[h].rainAmount = String(Math.round(intensity / amountSlots * 10) / 10)
    // The symbol follows the hour's strongest radar quarter hour, by the same
    // rule as the current symbol (radarAdjustedCondition).
    if (amountSlots >= 2 || (inProgress && amountSlots > 0)) {
      var adjusted = radarAdjustedCondition({ openMeteoWeatherCode: hours[h].weatherCode },
        strongest.toFixed(2), inProgress && thunderConfirmed)
      if (adjusted) hours[h].weatherCode = adjusted.openMeteoWeatherCode
    }
  }
}

// Share of the 3 x 3 km around the place with rain in one radar frame; the
// stand-in when the wide grid's neighbourhoods are missing.
function radarFrameWetShare(frame) {
  var grid = frame && frame.precipitation_5 ? frame.precipitation_5 : []
  var centerRow = Math.floor(grid.length / 2)
  var wet = 0
  var count = 0
  for (var r = Math.max(0, centerRow - 1); r <= Math.min(grid.length - 1, centerRow + 1); ++r) {
    var row = grid[r] || []
    var centerColumn = Math.floor(row.length / 2)
    for (var c = Math.max(0, centerColumn - 1); c <= Math.min(row.length - 1, centerColumn + 1); ++c) {
      var value = parseFloat(row[c])
      if (isNaN(value)) continue
      count++
      if (value >= 1) wet++
    }
  }
  return count ? wet / count : null
}

// Rain probability in % from the radar's wet share and the forecast's
// probability. The radar weighs fully now and less with every minute of
// lead time (0.6 at one hour, 0.2 from two hours on), since it cannot see
// showers that have yet to form; the forecast covers the rest. Without a
// forecast probability the radar share stands alone.
function rainProbabilityBlend(wetShare, forecastProbability, leadMinutes) {
  var radar = Math.max(0, Math.min(1, Number(wetShare))) * 100
  var forecast = Number(forecastProbability)
  if (forecastProbability === null || forecastProbability === "" || !isFinite(forecast)) return Math.round(radar)
  var weight = Math.max(0.2, Math.min(1, 1 - Number(leadMinutes) / 150))
  return Math.round(weight * radar + (1 - weight) * forecast)
}

// Rain at the place in one Bright Sky radar frame, in 0.01 mm per 5 minutes:
// the mean of the 3 x 3 km grid around it rather than the single 1 km cell,
// so a shower edge a few hundred metres off does not flip the reading, and
// the nowcast's position error (growing with lead time) is softened.
function radarFrameAmount(frame) {
  var grid = frame && frame.precipitation_5 ? frame.precipitation_5 : []
  var centerRow = Math.floor(grid.length / 2)
  var sum = 0
  var count = 0
  for (var r = Math.max(0, centerRow - 1); r <= Math.min(grid.length - 1, centerRow + 1); ++r) {
    var row = grid[r] || []
    var centerColumn = Math.floor(row.length / 2)
    for (var c = Math.max(0, centerColumn - 1); c <= Math.min(row.length - 1, centerColumn + 1); ++c) {
      var value = parseFloat(row[c])
      if (!isNaN(value)) { sum += value; count++ }
    }
  }
  return count ? sum / count : NaN
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
    var value = radarFrameAmount(rows[i])
    if (!isNaN(value)) { totalHundredths += value; count++ }
  }
  return count ? (totalHundredths / 100).toFixed(1) : ""
}

// Compact two-hour series for the panel's rain tabs. Open-Meteo Best Match
// supplies the worldwide 15-minute time axis. In the DWD region the rain
// amount comes from the DWD radar nowcast (RV, via Bright Sky) wherever it
// reaches: observed rain moved along its track, which times a shower far
// better than any model in the first two hours. The amount beyond the radar
// comes from MOSMIX; elsewhere from the selected regional/global model.
// Precipitation remains an intensity in mm/h, and `precipitationSource` says
// which of the two supplied it.
//
// The probability blends both (rainProbabilityBlend): MOSMIX alone gives the
// chance of rain in the hour from models and does not know that the sky is
// dry right now, so a dry radar used to sit beside 55 %. `radarWet` holds the
// wet share around the place per frame (RadarMotion.mjs); without it the
// 3 x 3 km grid of `radarReport` stands in. `probabilitySource` is "radar"
// where the radar took part.
// Open-Meteo answers a request for two models with every hourly, daily and
// 15-minute field twice, suffixed by model. The first model's value wins
// wherever it has one, the second fills its gaps and the days beyond its
// range. `_modelId` names the first model when it supplied anything.
function mergedModelForecast(response, primary, fallback, modelId) {
  if (!response || typeof response !== "object") return response
  var primarySuffix = "_" + primary
  var fallbackSuffix = "_" + fallback
  var sections = ["hourly", "daily", "minutely_15"]
  var usedPrimary = false
  var result = {}
  for (var key in response) result[key] = response[key]
  function baseName(field) {
    if (field.slice(-primarySuffix.length) === primarySuffix) return field.slice(0, -primarySuffix.length)
    if (field.slice(-fallbackSuffix.length) === fallbackSuffix) return field.slice(0, -fallbackSuffix.length)
    return ""
  }
  function mergeSection(data, countPrimary) {
    if (!data || typeof data !== "object") return data
    var merged = {}
    var bases = []
    for (var field in data) {
      var base = baseName(field)
      if (base === "") merged[field] = data[field]
      else if (bases.indexOf(base) < 0) bases.push(base)
    }
    for (var b = 0; b < bases.length; ++b) {
      var first = data[bases[b] + primarySuffix]
      var second = data[bases[b] + fallbackSuffix]
      if (Array.isArray(first) || Array.isArray(second)) {
        var length = Math.max(first ? first.length : 0, second ? second.length : 0)
        var values = []
        for (var i = 0; i < length; ++i) {
          var value = first && first[i] !== null && first[i] !== undefined ? first[i] : null
          if (value !== null && countPrimary) usedPrimary = true
          values.push(value !== null ? value : (second && second[i] !== undefined ? second[i] : null))
        }
        merged[bases[b]] = values
      } else {
        merged[bases[b]] = first !== null && first !== undefined ? first : second
      }
    }
    return merged
  }
  for (var s = 0; s < sections.length; ++s) {
    if (response[sections[s]]) result[sections[s]] = mergeSection(response[sections[s]], true)
    if (response[sections[s] + "_units"]) result[sections[s] + "_units"] = mergeSection(response[sections[s] + "_units"], false)
  }
  result._modelId = usedPrimary ? String(modelId || primary) : ""
  return result
}

// ---- Regional rain nowcast. Both sources become the same list of
//      { start, end, rate } in epoch ms and mm/h for rainNowcastSeries.
// MET Norway Nowcast 2.0: an instant rain rate every five minutes, from the
// Nordic radar composite. Only used where MET reports radar coverage.
function metNowcastPoints(raw) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  var properties = parsed && parsed.properties
  if (!properties || !Array.isArray(properties.timeseries)) return null
  if (properties.meta && properties.meta.radar_coverage && properties.meta.radar_coverage !== "ok") return []
  var points = []
  for (var i = 0; i < properties.timeseries.length; ++i) {
    var row = properties.timeseries[i]
    var start = new Date(row && row.time).getTime()
    var details = row && row.data && row.data.instant ? row.data.instant.details : null
    var rate = details ? Number(details.precipitation_rate) : NaN
    if (isNaN(start) || !isFinite(rate)) continue
    points.push({ start: start, end: start + 5 * 60 * 1000, rate: Math.max(0, rate) })
  }
  return points
}

// GeoSphere Austria nowcast (INCA): the sum of each 15 minutes, stamped at
// the end of the quarter hour, over a 1 km grid.
function geosphereNowcastPoints(raw) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!parsed || !Array.isArray(parsed.timestamps) || !Array.isArray(parsed.features) || !parsed.features.length)
    return null
  var parameters = parsed.features[0].properties && parsed.features[0].properties.parameters
  var values = parameters && parameters.rr ? parameters.rr.data : null
  if (!Array.isArray(values)) return null
  var points = []
  for (var i = 0; i < parsed.timestamps.length && i < values.length; ++i) {
    var end = new Date(parsed.timestamps[i]).getTime()
    var amount = Number(values[i])
    if (isNaN(end) || values[i] === null || !isFinite(amount)) continue
    points.push({ start: end - 15 * 60 * 1000, end: end, rate: Math.max(0, amount) * 4 })
  }
  return points
}

// Buienradar rain text: "value|HH:MM" every five minutes for two hours, in
// Dutch local time without a date; value 0–255 on a logarithmic scale,
// 10^((value - 109) / 32) mm/h. The first row lies within minutes of now, so
// of the two possible offsets (CET, CEST) the one that puts it closest wins.
function buienradarNowcastPoints(raw, now) {
  var lines = String(raw || "").trim().split(/\r?\n/)
  var rows = []
  for (var i = 0; i < lines.length; ++i) {
    var match = lines[i].match(/^\s*(\d{1,3})\s*\|\s*(\d{1,2}):(\d{2})\s*$/)
    if (match) rows.push({ value: Number(match[1]), hour: Number(match[2]), minute: Number(match[3]) })
  }
  if (!rows.length) return null
  var current = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var best = null
  for (var offset = 1; offset <= 2; ++offset) {
    var base = new Date(current)
    var candidate = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(),
      rows[0].hour - offset, rows[0].minute)
    while (candidate - current > 12 * 60 * 60 * 1000) candidate -= 24 * 60 * 60 * 1000
    while (current - candidate > 12 * 60 * 60 * 1000) candidate += 24 * 60 * 60 * 1000
    if (best === null || Math.abs(candidate - current) < Math.abs(best - current)) best = candidate
  }
  var points = []
  for (var r = 0; r < rows.length; ++r) {
    var start = best + r * 5 * 60 * 1000
    var rate = rows[r].value > 0 ? Math.pow(10, (rows[r].value - 109) / 32) : 0
    points.push({ start: start, end: start + 5 * 60 * 1000, rate: Math.round(rate * 100) / 100 })
  }
  return points
}

// ---- JMA radar tiles (Japan). JMA publishes its radar and one-hour
//      nowcast only as Web Mercator PNG tiles at even zoom levels. The rain
//      at the place is read from one pixel: the tiles use a 4-bit palette
//      whose index is JMA's intensity class, so no colour matching is
//      needed. Reading a pixel takes a small PNG decoder with an inflate
//      written after RFC 1951 (no Canvas: it has no context without a window).
var JMA_TILE_BASE = "https://www.jma.go.jp/bosai/jmatile/data/nowc/"
// Palette index → mm/h (class middle): 0/1 transparent, then <1, 1–5,
// 5–10, 10–20, 20–30, 30–50, 50–80, ≥80.
var JMA_RAIN_RATES = [0, 0, 0.5, 3, 7.5, 15, 25, 40, 65, 90]

// "20260929083500" (UTC) → epoch ms.
function jmaTimeMs(text) {
  var match = String(text || "").match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (!match) return NaN
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]),
    Number(match[4]), Number(match[5]), Number(match[6]))
}

// targetTimes_N1.json (observed, newest first) or _N2.json (forecast).
function jmaTargetTimes(raw) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!Array.isArray(parsed)) return null
  var times = []
  for (var i = 0; i < parsed.length; ++i) {
    var entry = parsed[i] || {}
    var elements = Array.isArray(entry.elements) ? entry.elements : []
    if (elements.indexOf("hrpns") < 0) continue
    var valid = jmaTimeMs(entry.validtime)
    if (!isNaN(valid)) times.push({ basetime: String(entry.basetime), validtime: String(entry.validtime), ms: valid })
  }
  times.sort(function(a, b) { return a.ms - b.ms })
  return times
}

function mercatorTile(latitude, longitude, zoom) {
  var n = Math.pow(2, zoom)
  var lat = Math.max(-85, Math.min(85, Number(latitude))) * Math.PI / 180
  var fx = (Number(longitude) + 180) / 360 * n
  var fy = (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * n
  var x = Math.floor(fx)
  var y = Math.floor(fy)
  return { z: zoom, x: x, y: y, px: Math.min(255, Math.floor((fx - x) * 256)), py: Math.min(255, Math.floor((fy - y) * 256)) }
}

function mercatorTileBounds(x, y, zoom) {
  var n = Math.pow(2, zoom)
  function latitudeOf(row) { return Math.atan(Math.sinh(Math.PI * (1 - 2 * row / n))) * 180 / Math.PI }
  return { west: x / n * 360 - 180, east: (x + 1) / n * 360 - 180, north: latitudeOf(y), south: latitudeOf(y + 1) }
}

function jmaTileUrl(time, zoom, x, y) {
  return JMA_TILE_BASE + time.basetime + "/none/" + time.validtime + "/surf/hrpns/" + zoom + "/" + x + "/" + y + ".png"
}

// Tiles of one even zoom level that cover the map extent; the zoom is the
// finest (up to 8) at which a handful of tiles do.
function jmaTilesFor(west, east, south, north, latitude) {
  var widthKm = Math.abs(east - west) * 111.32 * Math.max(0.2, Math.cos(Number(latitude) * Math.PI / 180))
  var zoom = 8
  while (zoom > 4 && widthKm > 3 * 40075 * Math.max(0.2, Math.cos(Number(latitude) * Math.PI / 180)) / Math.pow(2, zoom)) zoom -= 2
  var northWest = mercatorTile(north, west, zoom)
  var southEast = mercatorTile(south, east, zoom)
  var tiles = []
  for (var ty = northWest.y; ty <= southEast.y && tiles.length < 36; ++ty)
    for (var tx = northWest.x; tx <= southEast.x && tiles.length < 36; ++tx) {
      var bounds = mercatorTileBounds(tx, ty, zoom)
      tiles.push({ z: zoom, x: tx, y: ty, west: bounds.west, east: bounds.east, north: bounds.north, south: bounds.south })
    }
  return tiles
}

// Raw DEFLATE (RFC 1951) from `start` in a byte array; returns the bytes.
function inflateBytes(data, start) {
  var position = start || 0
  var bitBuffer = 0
  var bitCount = 0
  var out = []
  function bits(count) {
    while (bitCount < count) {
      if (position >= data.length) throw new Error("inflate: out of data")
      bitBuffer |= data[position++] << bitCount
      bitCount += 8
    }
    var value = bitBuffer & ((1 << count) - 1)
    bitBuffer >>>= count
    bitCount -= count
    return value
  }
  function huffman(lengths, count) {
    var counts = []
    var offsets = []
    var symbols = []
    for (var l = 0; l < 16; ++l) counts.push(0)
    for (var s = 0; s < count; ++s) counts[lengths[s]]++
    counts[0] = 0
    offsets.push(0, 0)
    for (var o = 1; o < 15; ++o) offsets.push(offsets[o] + counts[o])
    for (var t = 0; t < count; ++t) if (lengths[t]) symbols[offsets[lengths[t]]++] = t
    return { counts: counts, symbols: symbols }
  }
  function decode(table) {
    var code = 0
    var first = 0
    var index = 0
    for (var length = 1; length < 16; ++length) {
      code |= bits(1)
      var count = table.counts[length]
      if (code - count < first) return table.symbols[index + (code - first)]
      index += count
      first = (first + count) << 1
      code <<= 1
    }
    throw new Error("inflate: bad code")
  }
  var lengthBase = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258]
  var lengthExtra = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
  var distanceBase = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537,
    2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]
  var distanceExtra = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
  var order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
  var fixedLength = null
  var fixedDistance = null
  var last = 0
  while (!last) {
    last = bits(1)
    var type = bits(2)
    if (type === 0) {
      bitBuffer = 0
      bitCount = 0
      if (position + 4 > data.length) throw new Error("inflate: short stored block")
      var storedLength = data[position] | (data[position + 1] << 8)
      position += 4
      for (var b = 0; b < storedLength; ++b) out.push(data[position++])
      continue
    }
    var lengthTable
    var distanceTable
    if (type === 1) {
      if (!fixedLength) {
        var fixed = []
        for (var f = 0; f < 288; ++f) fixed.push(f < 144 ? 8 : (f < 256 ? 9 : (f < 280 ? 7 : 8)))
        fixedLength = huffman(fixed, 288)
        var fixedDist = []
        for (var g = 0; g < 30; ++g) fixedDist.push(5)
        fixedDistance = huffman(fixedDist, 30)
      }
      lengthTable = fixedLength
      distanceTable = fixedDistance
    } else if (type === 2) {
      var literalCount = bits(5) + 257
      var distanceCount = bits(5) + 1
      var codeCount = bits(4) + 4
      var codeLengths = []
      for (var c = 0; c < 19; ++c) codeLengths.push(0)
      for (var k = 0; k < codeCount; ++k) codeLengths[order[k]] = bits(3)
      var codeTable = huffman(codeLengths, 19)
      var lengths = []
      while (lengths.length < literalCount + distanceCount) {
        var symbol = decode(codeTable)
        if (symbol < 16) lengths.push(symbol)
        else {
          var repeat = 0
          var value = 0
          if (symbol === 16) {
            if (!lengths.length) throw new Error("inflate: bad repeat")
            value = lengths[lengths.length - 1]
            repeat = 3 + bits(2)
          } else if (symbol === 17) repeat = 3 + bits(3)
          else repeat = 11 + bits(7)
          for (var r = 0; r < repeat; ++r) lengths.push(value)
        }
      }
      lengthTable = huffman(lengths.slice(0, literalCount), literalCount)
      distanceTable = huffman(lengths.slice(literalCount), distanceCount)
    } else {
      throw new Error("inflate: bad block type")
    }
    while (true) {
      var next = decode(lengthTable)
      if (next < 256) out.push(next)
      else if (next === 256) break
      else {
        next -= 257
        if (next >= 29) throw new Error("inflate: bad length")
        var copyLength = lengthBase[next] + bits(lengthExtra[next])
        var distanceSymbol = decode(distanceTable)
        var distance = distanceBase[distanceSymbol] + bits(distanceExtra[distanceSymbol])
        if (distance > out.length) throw new Error("inflate: distance too far")
        for (var d = 0; d < copyLength; ++d) out.push(out[out.length - distance])
      }
    }
  }
  return out
}

// Palette index (colour type 3) or grey/red value of one pixel of a PNG
// given as a string of byte values; null when it cannot be read.
function pngPixelIndex(binary, x, y) {
  var text = String(binary || "")
  var bytes = []
  for (var i = 0; i < text.length; ++i) bytes.push(text.charCodeAt(i) & 0xff)
  var signature = [137, 80, 78, 71, 13, 10, 26, 10]
  for (var s = 0; s < 8; ++s) if (bytes[s] !== signature[s]) return null
  var position = 8
  var width = 0
  var height = 0
  var depth = 0
  var colourType = 0
  var compressed = []
  while (position + 8 <= bytes.length) {
    var length = ((bytes[position] << 24) | (bytes[position + 1] << 16) | (bytes[position + 2] << 8) | bytes[position + 3]) >>> 0
    var type = String.fromCharCode(bytes[position + 4], bytes[position + 5], bytes[position + 6], bytes[position + 7])
    var dataStart = position + 8
    if (type === "IHDR") {
      width = ((bytes[dataStart] << 24) | (bytes[dataStart + 1] << 16) | (bytes[dataStart + 2] << 8) | bytes[dataStart + 3]) >>> 0
      height = ((bytes[dataStart + 4] << 24) | (bytes[dataStart + 5] << 16) | (bytes[dataStart + 6] << 8) | bytes[dataStart + 7]) >>> 0
      depth = bytes[dataStart + 8]
      colourType = bytes[dataStart + 9]
      if (bytes[dataStart + 12] !== 0) return null
    } else if (type === "IDAT") {
      for (var b = 0; b < length; ++b) compressed.push(bytes[dataStart + b])
    } else if (type === "IEND") {
      break
    }
    position = dataStart + length + 4
  }
  var channels = colourType === 3 || colourType === 0 ? 1 : (colourType === 2 ? 3 : (colourType === 6 ? 4 : (colourType === 4 ? 2 : 0)))
  if (!width || !height || !channels || x < 0 || y < 0 || x >= width || y >= height || compressed.length < 3) return null
  var raw
  try { raw = inflateBytes(compressed, 2) } catch (e) { return null }
  var bitsPerPixel = depth * channels
  var rowBytes = Math.ceil(width * bitsPerPixel / 8)
  var step = Math.max(1, Math.floor(bitsPerPixel / 8))
  var previous = []
  for (var p = 0; p < rowBytes; ++p) previous.push(0)
  var row = previous
  for (var r = 0; r <= y; ++r) {
    var offset = r * (rowBytes + 1)
    if (offset + rowBytes >= raw.length + 1) return null
    var filter = raw[offset]
    row = []
    for (var c = 0; c < rowBytes; ++c) {
      var value = raw[offset + 1 + c]
      var left = c >= step ? row[c - step] : 0
      var up = previous[c]
      var upLeft = c >= step ? previous[c - step] : 0
      if (filter === 1) value += left
      else if (filter === 2) value += up
      else if (filter === 3) value += Math.floor((left + up) / 2)
      else if (filter === 4) {
        var estimate = left + up - upLeft
        var distanceLeft = Math.abs(estimate - left)
        var distanceUp = Math.abs(estimate - up)
        var distanceUpLeft = Math.abs(estimate - upLeft)
        value += distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft ? left
          : (distanceUp <= distanceUpLeft ? up : upLeft)
      }
      row.push(value & 0xff)
    }
    previous = row
  }
  var bitOffset = x * bitsPerPixel
  var byte = row[Math.floor(bitOffset / 8)]
  if (depth >= 8) return byte
  var shift = 8 - depth - (bitOffset % 8)
  return (byte >> shift) & ((1 << depth) - 1)
}

// Rain at the place from one JMA tile: mm/h, or null when unreadable.
function jmaTileRainRate(binary, px, py) {
  var index = pngPixelIndex(binary, px, py)
  if (index === null || index === undefined) return null
  return index < JMA_RAIN_RATES.length ? JMA_RAIN_RATES[index] : null
}

// ---- Wind in the unit of choice. Every source gives km/h; the general
//      setting picks km/h, m/s, mph, knots or Beaufort ("auto" follows the
//      unit system: mph for imperial, km/h otherwise).
var BEAUFORT_LIMITS_KMH = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118]

function windUnitFor(setting, imperial) {
  var unit = String(setting || "auto")
  if (["kmh", "ms", "mph", "kn", "bft"].indexOf(unit) >= 0) return unit
  return imperial ? "mph" : "kmh"
}

// { value (rounded number), unit (label) } or null without a speed.
function windValue(kmh, unit) {
  var speed = parseFloat(kmh)
  if (kmh === "" || kmh === null || kmh === undefined || !isFinite(speed)) return null
  speed = Math.max(0, speed)
  if (unit === "ms") return { value: Math.round(speed / 3.6), unit: "m/s" }
  if (unit === "mph") return { value: Math.round(speed * 0.621371), unit: "mph" }
  if (unit === "kn") return { value: Math.round(speed / 1.852), unit: "kn" }
  if (unit === "bft") {
    var force = 0
    while (force < BEAUFORT_LIMITS_KMH.length && speed >= BEAUFORT_LIMITS_KMH[force]) force++
    return { value: force, unit: "Bft" }
  }
  return { value: Math.round(speed), unit: "km/h" }
}

// ---- Day length (NOAA approximation: solar declination by day of year,
//      sunrise and sunset at −0.833° for refraction and the sun's disc).
//      Minutes of daylight; 0 in polar night, 1440 in midnight sun.
function dayLengthMinutes(date, latitude) {
  var day = date instanceof Date ? date : new Date(date)
  var lat = Number(latitude)
  if (isNaN(day.getTime()) || !isFinite(lat)) return null
  var start = Date.UTC(day.getUTCFullYear(), 0, 0)
  var dayOfYear = Math.floor((Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()) - start) / 86400000)
  var gamma = 2 * Math.PI / 365 * (dayOfYear - 1)
  var declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma)
  var phi = lat * Math.PI / 180
  var cosHour = (Math.sin(-0.833 * Math.PI / 180) - Math.sin(phi) * Math.sin(declination))
    / (Math.cos(phi) * Math.cos(declination))
  if (cosHour >= 1) return 0
  if (cosHour <= -1) return 1440
  return Math.round(2 * Math.acos(cosHour) * 180 / Math.PI * 4)
}

// "YYYY-MM-DD" → day length and its change against the day before, in
// minutes, both by the same approximation so the change is consistent.
function dayLengthFor(dateText, latitude) {
  var match = String(dateText || "").match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  var noon = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  var today = dayLengthMinutes(new Date(noon), latitude)
  var before = dayLengthMinutes(new Date(noon - 86400000), latitude)
  if (today === null || before === null) return null
  return { minutes: today, change: today - before }
}

// ---- The next full or new moon, whichever comes first: the phase fraction
//      crosses 0.5 (full) or wraps from 1 to 0 (new). Found hourly, then to
//      the minute. { full, date }.
function nextMoonEvent(now) {
  var start = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var previous = moonPhaseFraction(new Date(start))
  for (var hours = 1; hours <= 31 * 24; ++hours) {
    var stamp = start + hours * 3600000
    var fraction = moonPhaseFraction(new Date(stamp))
    var full = previous < 0.5 && fraction >= 0.5
    var fresh = fraction < previous
    if (full || fresh) {
      var low = stamp - 3600000
      var high = stamp
      for (var step = 0; step < 12; ++step) {
        var middle = (low + high) / 2
        var value = moonPhaseFraction(new Date(middle))
        var crossed = full ? value >= 0.5 : value < previous && value < 0.5
        if (crossed) high = middle
        else low = middle
      }
      return { full: full, date: new Date(high) }
    }
    previous = fraction
  }
  return null
}

// ---- Today against yesterday: the temperature now and at the same hour
//      yesterday, from Open-Meteo's hourly series with past_days=1 (times in
//      the place's zone, utc_offset_seconds). °C difference, or null.
function yesterdayTemperatureChange(report, currentCelsius, now) {
  var hourly = report && report.hourly
  if (!hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.temperature_2m)) return null
  var offset = Number(report.utc_offset_seconds || 0) * 1000
  var nowMs = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var best = -1
  for (var i = 0; i < hourly.time.length; ++i) {
    var match = String(hourly.time[i]).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (!match) continue
    var stamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]),
      Number(match[4]), Number(match[5])) - offset
    if (stamp <= nowMs) best = i
  }
  if (best < 24) return null
  var then = parseFloat(hourly.temperature_2m[best - 24])
  var current = parseFloat(currentCelsius)
  if (!isFinite(then) || !isFinite(current)) return null
  return current - then
}

// Mean rate over a 15-minute slot, or null when the points cover less than
// ten minutes of it.
function regionalSlotIntensity(points, slotStart) {
  if (!Array.isArray(points) || !points.length) return null
  var slotEnd = slotStart + 15 * 60 * 1000
  var covered = 0
  var sum = 0
  for (var i = 0; i < points.length; ++i) {
    var overlap = Math.min(slotEnd, points[i].end) - Math.max(slotStart, points[i].start)
    if (overlap <= 0) continue
    covered += overlap
    sum += points[i].rate * overlap
  }
  return covered >= 10 * 60 * 1000 ? sum / covered : null
}

function rainNowcastSeries(mosmixReport, report, now, limit, radarReport, radarWet, regionalPoints) {
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

  // Radar frames by time. A frame's 5-minute sum is taken to end at its
  // timestamp (the RADOLAN convention), so the slot starting at 15:30 holds
  // the frames of 15:35, 15:40 and 15:45.
  var radarFrames = radarReport && radarReport.radar ? radarReport.radar : []
  var radarByTime = {}
  for (var f = 0; f < radarFrames.length; ++f) {
    var frameStamp = new Date(radarFrames[f].timestamp).getTime()
    if (!isNaN(frameStamp)) radarByTime[frameStamp] = radarFrames[f]
  }
  function radarSlotIntensity(slotStart) {
    var sum = 0
    var frames = 0
    for (var step = 1; step <= 3; ++step) {
      var value = radarFrameAmount(radarByTime[slotStart + step * 5 * 60 * 1000])
      if (!isNaN(value)) { sum += value; frames++ }
    }
    // Two of three frames still describe the quarter hour; the in-progress
    // slot at the start of a report can lack its first.
    return frames >= 2 ? sum / frames * 12 / 100 : null
  }

  var wetByTime = {}
  var wetRadii = radarWet && radarWet.radiiKm ? radarWet.radiiKm : []
  var wetFrames = radarWet && radarWet.frames ? radarWet.frames : []
  for (var w = 0; w < wetFrames.length; ++w) wetByTime[wetFrames[w].time] = wetFrames[w].fractions
  // Share of the surroundings with rain in the slot's wettest frame, for a
  // neighbourhood that widens with the lead time: about 1 km now, 10 km in
  // two hours.
  function radarSlotWetShare(slotStart, leadMinutes) {
    var wanted = 1 + leadMinutes * 9 / 120
    var radiusIndex = wetRadii.length - 1
    for (var r = 0; r < wetRadii.length; ++r) if (wetRadii[r] >= wanted - 0.001) { radiusIndex = r; break }
    var share = null
    for (var step = 1; step <= 3; ++step) {
      var frameTime = slotStart + step * 5 * 60 * 1000
      var fractions = wetByTime[frameTime]
      var value = null
      if (fractions && radiusIndex >= 0) {
        value = Number(fractions[radiusIndex])
      } else if (radarByTime[frameTime]) {
        value = radarFrameWetShare(radarByTime[frameTime])
      }
      if (value !== null && !isNaN(value)) share = share === null ? value : Math.max(share, value)
    }
    return share
  }

  for (var i = 0; i < data.time.length && result.length < max; ++i) {
    var stamp = new Date(data.time[i]).getTime()
    if (isNaN(stamp) || stamp + 15 * 60 * 1000 < start) continue
    var probability = mosmixAt(stamp, "precipitation_probability", true)
    var precipitation = mosmixAt(stamp, "precipitation", false)
    // A national radar nowcast (MET Norway, GeoSphere) is fetched only where
    // it is the better source; the DWD radar amount covers the rest.
    var radarIntensity = regionalSlotIntensity(regionalPoints, stamp)
    if (radarIntensity === null) radarIntensity = radarSlotIntensity(stamp)
    // null when the source has no probability (MET Norway's 15-minute data),
    // so the chart can leave the line out instead of drawing 0 %.
    var rawProbability = data.precipitation_probability ? parseFloat(data.precipitation_probability[i]) : NaN
    var forecastProbability = probability !== null ? probability : (isNaN(rawProbability) ? null : rawProbability)
    var leadMinutes = Math.max(0, (stamp + 7.5 * 60 * 1000 - start) / 60000)
    var wetShare = radarSlotWetShare(stamp, leadMinutes)
    result.push({
      time: data.time[i],
      probability: wetShare === null ? forecastProbability
        : rainProbabilityBlend(wetShare, forecastProbability, leadMinutes),
      probabilitySource: wetShare === null ? "forecast" : "radar",
      precipitation: radarIntensity !== null ? Math.round(radarIntensity * 100) / 100
        : (precipitation === null ? numericValue(data.precipitation, i) * 4 : precipitation),
      precipitationSource: radarIntensity !== null ? "radar" : "forecast",
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
    // Radar amounts are rain already on its way, not a chance of it.
    var likely = rows[i].precipitationSource === "radar"
      || probability === "" || probability === null || probability === undefined
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

// Highs and lows worth a label on a temperature line, after linecast (MIT):
// a point higher (lower) than everything within `window` points either side
// (the last of equal ones, labelled at their middle),
// and at least `minGap` points after the last label of its kind.
function temperatureExtrema(values, window, minGap) {
  // Through a Repeater's modelData the list arrives as a Qt list, not an Array.
  var list = values && values.length !== undefined ? Array.prototype.slice.call(values) : []
  var out = []
  var lastMax = -minGap * 2
  var lastMin = -minGap * 2
  for (var i = 0; i < list.length; i++) {
    var value = Number(list[i])
    if (list[i] === "" || list[i] === null || !isFinite(value)) continue
    var isMax = true
    var isMin = true
    for (var j = Math.max(0, i - window); j <= Math.min(list.length - 1, i + window); j++) {
      if (j === i || list[j] === "" || list[j] === null || !isFinite(Number(list[j]))) continue
      var other = Number(list[j])
      // Whole degrees make flat tops: the last point of one counts.
      if (j < i ? other > value : other >= value) isMax = false
      if (j < i ? other < value : other <= value) isMin = false
      if (!isMax && !isMin) break
    }
    // The label goes to the middle of a flat top or bottom.
    var first = i
    while (first > 0 && Number(list[first - 1]) === value) first--
    var at = Math.floor((first + i) / 2)
    if (isMax && i - lastMax >= minGap) {
      out.push({ index: at, kind: "max", value: value })
      lastMax = i
    } else if (isMin && i - lastMin >= minGap) {
      out.push({ index: at, kind: "min", value: value })
      lastMin = i
    }
  }
  return out
}

// A value of an hourly series for the moment `nowMs`, interpolated between
// the hours around it (hours stand for their start). Answers null when the
// series has no hour within 90 minutes before now, so a series that has run
// out is not stretched.
function hourlyValueAt(hourly, nowMs, key) {
  var list = hourly && hourly.length !== undefined ? hourly : []
  var before = null
  var after = null
  for (var i = 0; i < list.length; ++i) {
    var at = new Date(list[i].time).getTime()
    var value = parseFloat(list[i][key])
    if (isNaN(at) || !isFinite(value)) continue
    if (at <= nowMs && (!before || at > before.at)) before = { at: at, value: value, row: list[i] }
    if (at > nowMs && (!after || at < after.at)) after = { at: at, value: value, row: list[i] }
  }
  if (!before || nowMs - before.at > 90 * 60 * 1000) return null
  if (!after || after.at - before.at > 3 * 60 * 60 * 1000) return { value: before.value, row: before.row }
  var f = (nowMs - before.at) / (after.at - before.at)
  return { value: before.value + (after.value - before.value) * f, row: before.row }
}

// Level on the rain legend's scale: light up to 0.5 mm/h, moderate up to 4,
// heavy above.
function rainLevel(rate) {
  var value = Number(rate) || 0
  return value > 4 ? 2 : (value > 0.5 ? 1 : 0)
}

// Rain notification: the first slot within `leadMinutes` whose rate reaches
// `threshold` (mm/h) and is likely, as upcomingRainStart. Rain already at
// that strength now is nothing to announce; light rain now and a downpour
// ahead, with a threshold above light, is.
function rainAlertStart(series, now, threshold, leadMinutes) {
  var rows = Array.isArray(series) ? series : []
  var nowMs = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var limit = Math.max(0.1, Number(threshold) || 0.1)
  var horizon = nowMs + Math.max(15, Number(leadMinutes) || 30) * 60000
  var start = -1
  for (var i = 0; i < rows.length; ++i) {
    var stamp = new Date(rows[i].time).getTime()
    if (isNaN(stamp) || stamp > horizon) break
    var amount = Number(rows[i].precipitation)
    var probability = rows[i].probability
    var likely = rows[i].precipitationSource === "radar"
      || probability === "" || probability === null || probability === undefined
      || !isFinite(Number(probability)) || Number(probability) >= 50
    if (!(isFinite(amount) && amount >= limit && likely)) continue
    // The slot under way already holds it: it is raining that hard now.
    if (stamp <= nowMs) return null
    start = i
    break
  }
  if (start < 0) return null
  var peak = 0
  for (var j = start; j < rows.length; ++j) {
    var at = new Date(rows[j].time).getTime()
    if (!isNaN(at) && at > horizon) break
    peak = Math.max(peak, Number(rows[j].precipitation) || 0)
  }
  var begins = new Date(rows[start].time).getTime()
  return {
    time: rows[start].time,
    date: new Date(begins),
    minutes: Math.max(0, Math.round((begins - nowMs) / 60000)),
    peak: peak,
    level: rainLevel(peak)
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

// Heights the wind map offers (Open-Meteo's variable suffixes): the 10 m of
// every forecast, wind-turbine height, and the pressure levels meteorology
// and aviation use, with their usual height and the speed the colour scale
// reaches its end at (winds aloft blow far harder).
var WIND_LEVELS = [
  { id: "10m", metres: 10, scaleKmh: 100 },
  { id: "120m", metres: 120, scaleKmh: 120 },
  { id: "850hPa", metres: 1500, scaleKmh: 150 },
  { id: "700hPa", metres: 3000, scaleKmh: 180 },
  { id: "500hPa", metres: 5500, scaleKmh: 240 },
  { id: "250hPa", metres: 10500, scaleKmh: 320 }
]

function windLevel(id) {
  for (var i = 0; i < WIND_LEVELS.length; ++i) if (WIND_LEVELS[i].id === id) return WIND_LEVELS[i]
  return WIND_LEVELS[0]
}

// The grid's wind at one of WIND_LEVELS; gusts exist only at 10 m.
function windGridSeries(report, levelId) {
  if (!report) return []
  var level = windLevel(levelId).id
  var rows = Array.isArray(report) ? report : [report]
  var result = []
  for (var i = 0; i < rows.length; ++i) {
    var current = rows[i] && rows[i].current ? rows[i].current : null
    var latitude = parseFloat(rows[i] && rows[i].latitude)
    var longitude = parseFloat(rows[i] && rows[i].longitude)
    if (!current || isNaN(latitude) || isNaN(longitude)) continue
    var speed = current["wind_speed_" + level]
    if (speed === undefined || speed === null) continue
    result.push({
      latitude: latitude,
      longitude: longitude,
      windSpeed: numericValue([speed], 0),
      windDirection: numericValue([current["wind_direction_" + level]], 0),
      windGust: level === "10m" ? numericValue([current.wind_gusts_10m], 0) : null
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

// ---- CAP 1.2 (MetService New Zealand). One alert document; its info block
//      in English, its areas checked against the place when they carry
//      polygons or circles. Returns an array of alerts (usually one).
function capPolygonContains(text, latitude, longitude) {
  var ring = []
  var pairs = String(text || "").trim().split(/\s+/)
  for (var i = 0; i < pairs.length; ++i) {
    var parts = pairs[i].split(",")
    var lat = Number(parts[0])
    var lon = Number(parts[1])
    if (isFinite(lat) && isFinite(lon)) ring.push([lon, lat])
  }
  return ring.length >= 3 && pointInRing(latitude, longitude, ring)
}

function capCircleContains(text, latitude, longitude) {
  var match = String(text || "").trim().match(/^(-?[\d.]+),(-?[\d.]+)\s+([\d.]+)$/)
  if (!match) return false
  var dLat = (latitude - Number(match[1])) * 111.2
  var dLon = (longitude - Number(match[2])) * 111.2 * Math.cos(latitude * Math.PI / 180)
  return Math.sqrt(dLat * dLat + dLon * dLon) <= Number(match[3])
}

// Some services write every CAP element with a namespace prefix (cap:info);
// the parsers here read plain names.
function withoutXmlPrefixes(xml) {
  return String(xml || "").replace(/<(\/?)[A-Za-z][\w.-]*:(?=[A-Za-z])/g, "<$1")
}

// CAP categories that belong in a weather app: weather, environment (floods,
// air), fire. Earthquakes, health, security and the like are left out.
var CAP_WEATHER_CATEGORIES = ["met", "env", "fire"]

function capAlerts(raw, latitude, longitude, providerId, web) {
  var xml = withoutXmlPrefixes(raw)
  if (xml.indexOf("<alert") < 0) return null
  var status = String(xmlElement(xml, "status") || "Actual").toLowerCase()
  var messageType = String(xmlElement(xml, "msgType") || "Alert").toLowerCase()
  var infos = xml.match(/<info>[\s\S]*?<\/info>/gi) || []
  var info = infos[0] || ""
  for (var i = 0; i < infos.length; ++i) {
    if (/^en/i.test(xmlElement(infos[i], "language"))) { info = infos[i]; break }
  }
  if (!info) return []
  var lat = Number(latitude)
  var lon = Number(longitude)
  var areas = info.match(/<area>[\s\S]*?<\/area>/gi) || []
  var located = !areas.length || !isFinite(lat) || !isFinite(lon)
  var areaNames = []
  for (var a = 0; a < areas.length; ++a) {
    var polygons = areas[a].match(/<polygon>[\s\S]*?<\/polygon>/gi) || []
    var circles = areas[a].match(/<circle>[\s\S]*?<\/circle>/gi) || []
    var inside = !polygons.length && !circles.length
    for (var p = 0; p < polygons.length && !inside; ++p)
      inside = capPolygonContains(decodeXml(polygons[p]), lat, lon)
    for (var c = 0; c < circles.length && !inside; ++c)
      inside = capCircleContains(decodeXml(circles[c]), lat, lon)
    if (inside) {
      located = true
      var name = xmlElement(areas[a], "areaDesc")
      if (name && areaNames.indexOf(name) < 0) areaNames.push(name)
    }
  }
  if (!located) return []
  // MetService adds its colour code as a parameter; it is the clearer scale.
  var colour = ""
  var parameters = info.match(/<parameter>[\s\S]*?<\/parameter>/gi) || []
  for (var q = 0; q < parameters.length; ++q)
    if (/colou?r/i.test(xmlElement(parameters[q], "valueName"))) colour = xmlElement(parameters[q], "value").toLowerCase()
  var colourSeverity = { yellow: "moderate", orange: "severe", red: "extreme" }
  var event = xmlElement(info, "event") || "Weather warning"
  var headline = xmlElement(info, "headline") || event
  var description = xmlElement(info, "description")
  if (areaNames.length) description = areaNames.join(", ") + (description ? "\n" + description : "")
  var instruction = xmlElement(info, "instruction")
  var categories = (info.match(/<category>[\s\S]*?<\/category>/gi) || []).map(function(tag) {
    return decodeXml(tag).toLowerCase()
  })
  var weatherRelated = !categories.length || categories.some(function(category) {
    return CAP_WEATHER_CATEGORIES.indexOf(category) >= 0
  })
  // Identifiers this message updates or cancels ("sender,identifier,sent").
  var references = String(xmlElement(xml, "references") || "").trim().split(/\s+/).filter(Boolean)
    .map(function(entry) { return entry.split(",")[1] || entry })
  return [{
    alert_id: xmlElement(xml, "identifier") || headline,
    status: messageType === "cancel" ? "cancelled" : status,
    category: weatherRelated ? "met" : "other",
    _references: references,
    severity: colourSeverity[colour] || String(xmlElement(info, "severity") || "minor").toLowerCase(),
    event_en: event,
    event_de: event,
    headline_en: headline,
    headline_de: headline,
    description_en: description,
    description_de: description,
    instruction_en: instruction,
    instruction_de: instruction,
    onset: xmlElement(info, "onset") || xmlElement(info, "effective") || xmlElement(xml, "sent"),
    expires: xmlElement(info, "expires"),
    web: xmlElement(info, "web") || web || ""
  }]
}

// A CAP feed (RSS or Atom) lists one CAP document per alert: its link and,
// where given, when it was published (epoch ms, NaN when unknown).
function capFeedEntries(raw) {
  var xml = withoutXmlPrefixes(raw)
  if (xml.indexOf("<rss") < 0 && xml.indexOf("<feed") < 0) return null
  var entries = []
  var seen = {}
  var items = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) || []
  for (var i = 0; i < items.length; ++i) {
    var link = xmlElement(items[i], "link")
    if (!link) {
      var href = items[i].match(/<link[^>]*href="([^"]+)"/i)
      link = href ? decodeXml(href[1]) : ""
    }
    // Some authorities serve their documents over plain HTTP only.
    if (!/^https?:\/\//.test(link) || seen[link]) continue
    seen[link] = true
    var published = new Date(xmlElement(items[i], "pubDate") || xmlElement(items[i], "updated")
      || xmlElement(items[i], "published")).getTime()
    entries.push({ link: link, published: published })
  }
  return entries
}

// Drops alerts that a later message in the same set updates or cancels.
function withoutSupersededAlerts(alerts) {
  var list = Array.isArray(alerts) ? alerts : []
  var superseded = {}
  for (var i = 0; i < list.length; ++i) {
    var references = list[i]._references || []
    for (var r = 0; r < references.length; ++r) superseded[references[r]] = true
  }
  return list.filter(function(alert) { return !superseded[alert.alert_id] })
}

// ---- Alert Hub (Alert-Hub.Org CIC): the register of the official CAP feeds
//      of WMO-registered alerting authorities. The authorities' own feeds are
//      used; the hub's mirror (cap-sources) lags years behind for many. The
//      country's official feeds, weather services first.
function alertHubFeeds(raw, countryCode) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!parsed || !Array.isArray(parsed.sources)) return null
  var code = String(countryCode || "").toLowerCase()
  var feeds = []
  for (var i = 0; i < parsed.sources.length; ++i) {
    var source = parsed.sources[i] && parsed.sources[i].source
    if (!source || String(source.authorityCountry || "").toLowerCase() !== code) continue
    if (source.sourceIsOfficial === false || source.capAlertFeedStatus !== "operating" || !source.capAlertFeed) continue
    var name = source.byLanguage && source.byLanguage[0] ? String(source.byLanguage[0].name || "") : ""
    var weatherService = /meteo|met\b|weather|hydromet|climat|senamhi|inamhi|ideam|inmet|smn|nms|dmn/i
      .test(String(source.sourceId || "") + " " + name)
    feeds.push({ url: String(source.capAlertFeed), language: String(source.sourceId || "").split("-")[2] || "",
      weather: weatherService, name: name })
  }
  // One feed per authority: English where offered, else the first language.
  var byAuthority = {}
  for (var f = 0; f < feeds.length; ++f) {
    var key = feeds[f].url.replace(/-[a-z]{2,3}\/rss\.xml$/, "")
    if (!byAuthority[key] || feeds[f].language === "en") byAuthority[key] = feeds[f]
  }
  var chosen = []
  for (var k in byAuthority) chosen.push(byAuthority[k])
  chosen.sort(function(a, b) { return (b.weather ? 1 : 0) - (a.weather ? 1 : 0) })
  return chosen.slice(0, 4)
}

// ---- INMET (Brazil): all active warnings with their polygons in one JSON
//      (apiprevmet3.inmet.gov.br/avisos/ativos), today's and upcoming.
function inmetAlertReport(raw, latitude, longitude) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  if (!parsed || (!Array.isArray(parsed.hoje) && !Array.isArray(parsed.futuro))) return null
  var rows = (parsed.hoje || []).concat(parsed.futuro || [])
  var lat = Number(latitude)
  var lon = Number(longitude)
  var severities = { "perigo potencial": "moderate", "perigo": "severe", "grande perigo": "extreme" }
  // Times are Brasília time without an offset.
  function brasilia(text) {
    var match = String(text || "").match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/)
    return match ? match[1] + "T" + match[2] + ":00-03:00" : ""
  }
  function listText(text) {
    return String(text || "").replace(/^\[|\]$/g, "").split(/',\s*'/).map(function(part) {
      return part.replace(/^['"\s]+|['"\s]+$/g, "")
    }).filter(Boolean).join("\n")
  }
  var alerts = []
  var seen = {}
  for (var i = 0; i < rows.length; ++i) {
    var row = rows[i] || {}
    if (String(row.encerrado) === "True") continue
    var geometry = null
    try { geometry = typeof row.poligono === "string" ? JSON.parse(row.poligono) : row.poligono } catch (e) { geometry = null }
    if (isFinite(lat) && isFinite(lon) && (!geometry || !geometryContainsPoint(geometry, lat, lon))) continue
    var id = String(row.codigo || row.id || i)
    if (seen[id]) continue
    seen[id] = true
    var event = String(row.descricao || "Aviso")
    var headline = "Aviso de " + event + " · " + String(row.severidade || "")
    alerts.push({
      alert_id: id,
      status: "actual",
      category: "met",
      severity: severities[String(row.severidade || "").toLowerCase()] || "minor",
      event_en: event,
      event_de: event,
      headline_en: headline,
      headline_de: headline,
      description_en: listText(row.riscos),
      description_de: listText(row.riscos),
      instruction_en: listText(row.instrucoes),
      instruction_de: listText(row.instrucoes),
      onset: brasilia(row.inicio),
      expires: brasilia(row.fim),
      web: "https://alertas2.inmet.gov.br/"
    })
  }
  return { alerts: alerts, _providerId: "inmet" }
}

// ---- Bureau of Meteorology: one RSS feed of current warnings per state.
//      Titles only ("29/16:05 EST Severe Weather Warning for …"); marine
//      and coastal-water warnings are left out for a place on land.
function bomAlertReport(raw) {
  var xml = String(raw || "")
  if (xml.indexOf("<rss") < 0) return null
  var items = xml.match(/<item>[\s\S]*?<\/item>/gi) || []
  var alerts = []
  for (var i = 0; i < items.length; ++i) {
    var title = xmlElement(items[i], "title").replace(/^\d{1,2}\/\d{1,2}:\d{2}\s+[A-Z]{3,4}\s+/, "")
    if (!title || /marine|coastal waters|ocean wind|surf|tsunami (no threat|cancellation)/i.test(title)) continue
    var lower = title.toLowerCase()
    var severity = /emergency|tropical cyclone warning|extreme/.test(lower) ? "extreme"
      : (/severe|warning/.test(lower) && !/watch|advice/.test(lower) ? "severe"
        : (/watch|advice|minor/.test(lower) ? "moderate" : "minor"))
    var event = title.replace(/\s+for\s+.*$/i, "")
    alerts.push({
      alert_id: xmlElement(items[i], "guid") || title,
      status: /cancel/i.test(title) ? "cancelled" : "actual",
      category: "met",
      severity: severity,
      event_en: event,
      event_de: event,
      headline_en: title,
      headline_de: title,
      description_en: "",
      description_de: "",
      instruction_en: "",
      instruction_de: "",
      onset: xmlElement(items[i], "pubDate") ? new Date(xmlElement(items[i], "pubDate")).toISOString() : "",
      expires: "",
      web: xmlElement(items[i], "link").replace(/^http:/, "https:")
    })
  }
  return { alerts: alerts, _providerId: "bom" }
}

// ---- Japan Meteorological Agency (bosai JSON, warning system of 2026).
//      Warnings are issued per municipality (class20 area). The place is
//      matched through JMA's own area outlines; see WeatherAlertLookup.qml.
// Municipalities whose bounding box holds the place, from class20relm.json.
function jmaAreaCandidates(raw, latitude, longitude) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return [] }
  var lat = Number(latitude)
  var lon = Number(longitude)
  var codes = []
  if (!parsed || !isFinite(lat) || !isFinite(lon)) return codes
  for (var code in parsed) {
    var box = parsed[code]
    if (!box || !box.ne || !box.sw) continue
    if (lat <= box.ne[0] && lat >= box.sw[0] && lon <= box.ne[1] && lon >= box.sw[1]) codes.push(code)
  }
  return codes
}

function jmaAreaContains(raw, latitude, longitude) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return false }
  var features = parsed && Array.isArray(parsed.features) ? parsed.features : (parsed && parsed.geometry ? [parsed] : [])
  for (var i = 0; i < features.length; ++i)
    if (features[i] && features[i].geometry && geometryContainsPoint(features[i].geometry, Number(latitude), Number(longitude)))
      return true
  return false
}

// The forecast office (prefecture level) a municipality belongs to, via the
// class15 and class10 levels of area.json.
function jmaOfficeCode(raw, areaCode) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return "" }
  if (!parsed || !parsed.class20s || !parsed.class20s[areaCode]) return ""
  var class15 = parsed.class20s[areaCode].parent
  var class10 = parsed.class15s && parsed.class15s[class15] ? parsed.class15s[class15].parent : ""
  return parsed.class10s && parsed.class10s[class10] ? String(parsed.class10s[class10].parent || "") : ""
}

// Code → [kind, level], as JMA's own warning page lists them (2026 system).
var JMA_KINDS = {
  "02": ["wind_snow", 30], "03": ["rain", 30], "05": ["wind", 30], "06": ["snow", 30], "07": ["wave", 30],
  "08": ["tide", 30], "09": ["landslide", 30], "10": ["rain", 20], "12": ["snow", 20], "13": ["wind_snow", 20],
  "14": ["thunder", 20], "15": ["wind", 20], "16": ["wave", 20], "17": ["snow_melting", 20], "19": ["tide", 20],
  "20": ["flood", 20], "21": ["flood", 20], "22": ["flood", 20], "23": ["cold", 20], "24": ["frost", 20],
  "25": ["ice_accretion", 20], "26": ["snow_accretion", 20], "29": ["landslide", 20], "30": ["flood", 30],
  "31": ["flood", 30], "32": ["wind_snow", 50], "33": ["rain", 50], "35": ["wind", 50], "36": ["snow", 50],
  "37": ["wave", 50], "38": ["tide", 50], "39": ["landslide", 50], "40": ["flood", 40], "41": ["flood", 40],
  "43": ["rain", 40], "48": ["tide", 40], "49": ["landslide", 40], "51": ["flood", 50], "53": ["flood", 50]
}
var JMA_NAMES = {
  rain: ["Heavy rain", "Starkregen"], landslide: ["Landslide", "Erdrutsch"], flood: ["Flood", "Hochwasser"],
  wind: ["Storm", "Sturm"], wind_snow: ["Snowstorm", "Schneesturm"], snow: ["Heavy snow", "Starker Schneefall"],
  wave: ["High waves", "Hoher Seegang"], tide: ["Storm surge", "Sturmflut"], thunder: ["Thunderstorm", "Gewitter"],
  snow_melting: ["Snowmelt", "Schneeschmelze"], cold: ["Low temperature", "Kälte"], frost: ["Frost", "Frost"],
  ice_accretion: ["Icing", "Vereisung"], snow_accretion: ["Snow accretion", "Schneelast"]
}
var JMA_LEVELS = {
  20: ["advisory", "Hinweis", "minor"], 30: ["warning", "Warnung", "moderate"],
  40: ["danger warning", "Gefahrenwarnung", "severe"], 50: ["emergency warning", "Unwetterwarnung", "extreme"]
}

// Current warnings for one municipality from an office's warning file: per
// kind the latest report counts, issued (発表) or continued (継続).
function jmaAlertReport(raw, areaCode) {
  var parsed
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw } catch (e) { return null }
  var reports = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : [])
  if (!reports.length) return null
  var latest = {}
  for (var r = 0; r < reports.length; ++r) {
    var report = reports[r] || {}
    var stamp = new Date(report.reportDatetime).getTime()
    var items = report.warning && Array.isArray(report.warning.class20Items) ? report.warning.class20Items : []
    for (var i = 0; i < items.length; ++i) {
      if (String(items[i].areaCode) !== String(areaCode)) continue
      var kinds = items[i].kinds || []
      for (var k = 0; k < kinds.length; ++k) {
        var code = kinds[k].code
        if (!code) continue
        if (!latest[code] || stamp >= latest[code].stamp)
          latest[code] = { stamp: stamp, status: String(kinds[k].status || ""), time: String(report.reportDatetime || "") }
      }
    }
  }
  var alerts = []
  for (var kind in latest) {
    var entry = latest[kind]
    if (entry.status !== "発表" && entry.status !== "継続") continue
    var info = JMA_KINDS[kind] || ["", 20]
    // Below warning level a gale (強風) and wind with snow (風雪) are the
    // milder forms of storm and snowstorm.
    var names = info[0] === "wind" && info[1] === 20 ? ["Gale", "Starkwind"]
      : (info[0] === "wind_snow" && info[1] === 20 ? ["Wind and snow", "Wind und Schnee"]
        : (JMA_NAMES[info[0]] || ["Weather", "Wetter"]))
    var level = JMA_LEVELS[info[1]] || JMA_LEVELS[20]
    var english = names[0] + " " + level[0]
    var german = level[1] + " " + names[1]
    alerts.push({
      alert_id: "jma-" + areaCode + "-" + kind,
      status: "actual",
      category: "met",
      severity: level[2],
      event_en: english,
      event_de: german,
      headline_en: english,
      headline_de: german,
      description_en: "",
      description_de: "",
      instruction_en: "",
      instruction_de: "",
      onset: entry.time,
      expires: "",
      web: "https://www.jma.go.jp/bosai/warning/#area_type=class20s&area_code=" + areaCode + "&lang=en",
      _level: info[1]
    })
  }
  alerts.sort(function(a, b) { return b._level - a._level })
  return { alerts: alerts, _providerId: "jma" }
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
  var currentTime = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  if (isNaN(currentTime)) currentTime = Date.now()
  var firstAllowed = currentTime - Math.max(1, parseFloat(hours) || 2) * 60 * 60 * 1000 - 10 * 60 * 1000
  var lastAllowed = currentTime + 10 * 60 * 1000
  var stamps = []
  if (specification.indexOf("/") >= 0) {
    var parts = specification.split("/")
    var start = new Date(parts[0]).getTime()
    var end = new Date(parts[1]).getTime()
    var step = isoDurationMilliseconds(parts[2])
    // Long ranges (FMI lists a week in 5-minute steps) start at the first
    // step inside the window instead of at the range's beginning.
    if (!isNaN(start) && !isNaN(end) && step > 0) {
      var first = start + Math.max(0, Math.ceil((firstAllowed - start) / step)) * step
      for (var stamp = first; stamp <= end && stamps.length < 500; stamp += step) stamps.push(stamp)
    }
  } else {
    var values = specification.split(",")
    for (var i = 0; i < values.length; ++i) {
      var parsed = new Date(values[i]).getTime()
      if (!isNaN(parsed)) stamps.push(parsed)
    }
  }
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
  // A frame far from now (a report that could not be renewed) says nothing
  // about whether it rains at the moment.
  var target = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  if (Math.abs(new Date(snapshot.timestamp).getTime() - target) > 10 * 60 * 1000) return ""
  var value = radarFrameAmount({ precipitation_5: snapshot.grid })
  if (isNaN(value)) return ""
  return (value * 12 / 100).toFixed(1)
}

function hourlyTemp(hour, scale) {
  if (!hour) return ""
  return tempBare(hour.tempC, hour.tempF, scale)
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

function bareTempForDay(day, kind, scale) {
  if (!day) return ""
  return tempBare(kind === "max" ? day.maxtempC : day.mintempC,
    kind === "max" ? day.maxtempF : day.mintempF, scale)
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

// Lit share of the disc in percent, from the phase angle: 0 at new moon,
// 50 at the quarters, 100 at full moon.
function moonIlluminationPercent(date) {
  return Math.round((1 - Math.cos(2 * Math.PI * moonPhaseFraction(date))) / 2 * 100)
}

// The Moon one sees on a forecast day's evening: phase at 22:00 local time
// of that calendar day ("YYYY-MM-DD"). Null for a date that does not parse.
function moonEveningDate(dateText) {
  var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateText || ""))
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 22, 0, 0)
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

// ---- Map geometry. Every map picture is requested at MAP_IMAGE_WIDTH x
//      MAP_IMAGE_HEIGHT for an extent with the same proportions in km, so one
//      kilometre is equally long east-west and north-south. Views show the
//      picture with Image.PreserveAspectCrop; overlays place points with
//      mapViewport so they land where the picture puts them.

var MAP_IMAGE_WIDTH = 480
var MAP_IMAGE_HEIGHT = 250

// North-south half extent in km for an east-west half extent.
function mapLatitudeRadiusKm(radiusKm) {
  return radiusKm * MAP_IMAGE_HEIGHT / MAP_IMAGE_WIDTH
}

// Where the cropped map picture lies in a view of the given size.
function mapViewport(viewWidth, viewHeight, radiusKm) {
  var scale = Math.max(viewWidth / MAP_IMAGE_WIDTH, viewHeight / MAP_IMAGE_HEIGHT)
  var renderedWidth = MAP_IMAGE_WIDTH * scale
  var renderedHeight = MAP_IMAGE_HEIGHT * scale
  return {
    renderedWidth: renderedWidth,
    renderedHeight: renderedHeight,
    offsetX: (viewWidth - renderedWidth) / 2,
    offsetY: (viewHeight - renderedHeight) / 2,
    pixelsPerKm: renderedWidth / Math.max(0.001, 2 * radiusKm)
  }
}

function mapPoint(viewport, latitude, longitude, west, east, south, north) {
  return {
    x: viewport.offsetX + (Number(longitude) - west) / Math.max(0.000001, east - west) * viewport.renderedWidth,
    y: viewport.offsetY + (north - Number(latitude)) / Math.max(0.000001, north - south) * viewport.renderedHeight
  }
}

// RainViewer's 512 px coordinate tile at zoom z spans 40075 km * cos(lat) / 2^z
// (checked against DWD radar: 0.80 km/px measured, 0.814 expected at z 6).
// The zoom is rounded down so the tile always covers the map's width; it is
// drawn at tileKm * pixelsPerKm instead of being stretched over the view.
function rainViewerTile(radiusKm, latitude) {
  var circumference = 40075 * Math.max(0.2, Math.cos(Number(latitude) * Math.PI / 180))
  var zoom = Math.floor(Math.log(circumference / Math.max(1, radiusKm * 2)) / Math.LN2)
  zoom = Math.max(1, Math.min(7, zoom))
  return { zoom: zoom, sizeKm: circumference / Math.pow(2, zoom) }
}

// The current condition with its precipitation checked against the radar
// (radarCurrentIntensity, mm/h, "" without a fresh frame). The symbol's row
// is often still MOSMIX's forecast for the hour: on 2026-09-16 it showed a
// thunderstorm at 16:09 while the radar was dry until 16:15. The sky (clear,
// cloudy, fog) stays the forecast's; whether it rains is the radar's.
// Dry radar turns precipitation and thunderstorms into overcast; wet radar
// shows light or moderate rain by intensity, keeps snow the forecast names,
// and shows a thunderstorm only when one is confirmed (thunderstormConfirmed).
function radarAdjustedCondition(current, radarIntensity, thunderConfirmed) {
  if (!current || radarIntensity === "" || radarIntensity === null || radarIntensity === undefined) return current
  if (current.openMeteoWeatherCode === undefined || current.openMeteoWeatherCode === null) return current
  var intensity = parseFloat(radarIntensity)
  if (isNaN(intensity)) return current
  var code = Number(current.openMeteoWeatherCode)
  var snow = [71, 73, 75, 77, 85, 86].indexOf(code) >= 0
  var thunder = code >= 95
  var precipitating = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || snow || thunder
  var next = code
  if (intensity < 0.1) {
    if (precipitating) next = 3
  } else if (thunderConfirmed && !snow) {
    next = 95
  } else if (!snow) {
    next = intensity < 0.5 ? 61 : 63
  }
  if (next === code) return current
  var adjusted = {}
  for (var key in current) adjusted[key] = current[key]
  adjusted.openMeteoWeatherCode = next
  return adjusted
}

// Whether a thunderstorm is confirmed at the place rather than only forecast:
// an official warning naming thunderstorms that is in force or starts within
// 30 minutes, or a station observation of one in the last 90 minutes (a
// Bright Sky row whose source is not a forecast). MOSMIX often names a
// thunderstorm as the hour's most significant weather on merely showery
// days, which put a lightning bolt on plain rain.
function thunderstormConfirmed(alertReport, mosmixReport, now) {
  var nowMs = (now instanceof Date ? now : new Date(now || Date.now())).getTime()
  var alerts = alertReport && alertReport.alerts ? alertReport.alerts : []
  for (var i = 0; i < alerts.length; ++i) {
    var alert = alerts[i] || {}
    if (alert.status && alert.status !== "actual") continue
    var names = String(alert.event_en || "") + " " + String(alert.event_de || "")
    if (!/thunder|gewitter/i.test(names)) continue
    var onset = new Date(alert.onset || alert.effective || 0).getTime()
    var expires = alert.expires ? new Date(alert.expires).getTime() : Infinity
    if ((isNaN(onset) || onset <= nowMs + 30 * 60 * 1000) && (isNaN(expires) || expires > nowMs)) return true
  }
  var rows = mosmixReport && mosmixReport.weather ? mosmixReport.weather : []
  var sourceTypes = {}
  var sources = mosmixReport && mosmixReport.sources ? mosmixReport.sources : []
  for (var s = 0; s < sources.length; ++s) sourceTypes[sources[s].id] = sources[s].observation_type
  for (var r = 0; r < rows.length; ++r) {
    var type = sourceTypes[rows[r].source_id]
    if (!type || type === "forecast") continue
    var stamp = new Date(rows[r].timestamp).getTime()
    if (isNaN(stamp) || stamp > nowMs || nowMs - stamp > 90 * 60 * 1000) continue
    if (rows[r].icon === "thunderstorm" || rows[r].condition === "thunderstorm") return true
  }
  return false
}

// DWD's radar colour scale ("Niederschlagsradar" legend, mm/h intervals),
// so a rain chart bar has the colour the same intensity has on the DWD radar
// map. Below 0.1 mm/h the radar shows nothing: "".
var DWD_RADAR_COLORS = [
  [0.1, "#33FFFF"], [0.2, "#1ACC9A"], [0.4, "#019934"], [1, "#4DB31B"],
  [2, "#99CC01"], [3, "#CCE601"], [5, "#FFFF01"], [7.5, "#FFC401"],
  [10, "#FF8901"], [15, "#FF4501"], [30, "#FE0000"], [45, "#E5004C"],
  [75, "#CC0098"], [100, "#6600CB"], [150, "#0000FE"]
]

function dwdRadarColor(mmPerHour) {
  var value = Number(mmPerHour)
  if (!isFinite(value) || value < 0.1) return ""
  var color = DWD_RADAR_COLORS[0][1]
  for (var i = 0; i < DWD_RADAR_COLORS.length; ++i) if (value >= DWD_RADAR_COLORS[i][0]) color = DWD_RADAR_COLORS[i][1]
  return color
}

// Label for a drift time in 15-minute steps: "+45 min", "+1h", "+1h 30".
function driftTimeLabel(minutes) {
  if (minutes < 60) return "+" + minutes + " min"
  var hours = Math.floor(minutes / 60)
  var rest = minutes % 60
  return "+" + hours + "h" + (rest ? " " + rest : "")
}

// The drift arrow in view pixels, ending at the view centre. Its tail is
// where the rain was `minutes` earlier than it reaches the place, at the true
// map scale: the longest round step that still fits (see below), with a
// middle mark when half of it is a multiple of 5 minutes. Returns null
// without a drift; `minutes` is 0 when not even 5 minutes fit (no labels).
function driftArrow(drift, pixelsPerKm, viewWidth, viewHeight, marginX, marginY) {
  if (!drift) return null
  var speed = Math.max(0, Number(drift.speedKmh) || 0)
  var toward = ((Number(drift.directionFrom) || 0) + 180) * Math.PI / 180
  var dx = Math.sin(toward)
  var dy = -Math.cos(toward)
  var reach = Infinity
  if (Math.abs(dx) > 0.001) reach = Math.min(reach, (viewWidth / 2 - marginX) / Math.abs(dx))
  if (Math.abs(dy) > 0.001) reach = Math.min(reach, (viewHeight / 2 - marginY) / Math.abs(dy))
  reach = Math.max(0, reach)
  var perMinute = speed / 60 * pixelsPerKm
  // The longest round time up to two hours that fits, down to 5 minutes
  // when zoomed in on fast rain; zoomed out on slow rain, 3 or 4 hours when
  // two would leave the arrow too short for a label.
  var steps = [120, 90, 60, 45, 30, 20, 15, 10, 5]
  var minutes = 0
  for (var s = 0; s < steps.length; ++s) {
    if (perMinute * steps[s] <= reach) { minutes = steps[s]; break }
  }
  if (minutes === 120 && perMinute * 120 < 36) {
    if (perMinute * 240 <= reach) minutes = 240
    else if (perMinute * 180 <= reach) minutes = 180
  }
  var length = minutes ? perMinute * minutes : reach
  var marks = []
  if (minutes) {
    marks.push({ minutes: minutes, fraction: 1 })
    if (minutes >= 20 && (minutes / 2) % 5 === 0) marks.push({ minutes: minutes / 2, fraction: 0.5 })
  }
  return { dx: dx, dy: dy, length: length, minutes: minutes, marks: marks }
}

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
  "precipitation_probability", "wind_speed", "relative_humidity", "icon", "source_id"]

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
  // Which rows are station observations rather than forecast
  // (thunderstormConfirmed).
  var sources = []
  var reportSources = Array.isArray(report.sources) ? report.sources : []
  for (var j = 0; j < reportSources.length; ++j)
    sources.push(pickFields(reportSources[j], ["id", "observation_type"]))
  return { weather: rows, sources: sources }
}


if (typeof module !== "undefined") {
  module.exports = {
    rainDriftAt: rainDriftAt,
    withPlaceOffsets: withPlaceOffsets,
    radarFrameAmount: radarFrameAmount,
    radarAdjustedCondition: radarAdjustedCondition,
    dwdRadarColor: dwdRadarColor,
    thunderstormConfirmed: thunderstormConfirmed,
    radarCurrentIntensity: radarCurrentIntensity,
    mapLatitudeRadiusKm: mapLatitudeRadiusKm,
    mapViewport: mapViewport,
    mapPoint: mapPoint,
    rainViewerTile: rainViewerTile,
    driftTimeLabel: driftTimeLabel,
    driftArrow: driftArrow,
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
    temperatureScale: temperatureScale,
    tempNumber: tempNumber,
    tempUnitLabel: tempUnitLabel,
    tempWithUnit: tempWithUnit,
    tempBare: tempBare,
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
    capAlerts: capAlerts,
    capFeedEntries: capFeedEntries,
    withoutSupersededAlerts: withoutSupersededAlerts,
    alertHubFeeds: alertHubFeeds,
    inmetAlertReport: inmetAlertReport,
    bomAlertReport: bomAlertReport,
    jmaAreaCandidates: jmaAreaCandidates,
    jmaAreaContains: jmaAreaContains,
    jmaOfficeCode: jmaOfficeCode,
    jmaAlertReport: jmaAlertReport,
    mergedModelForecast: mergedModelForecast,
    metNowcastPoints: metNowcastPoints,
    geosphereNowcastPoints: geosphereNowcastPoints,
    buienradarNowcastPoints: buienradarNowcastPoints,
    windUnitFor: windUnitFor,
    windValue: windValue,
    dayLengthMinutes: dayLengthMinutes,
    dayLengthFor: dayLengthFor,
    nextMoonEvent: nextMoonEvent,
    yesterdayTemperatureChange: yesterdayTemperatureChange,
    jmaTimeMs: jmaTimeMs,
    jmaTargetTimes: jmaTargetTimes,
    mercatorTile: mercatorTile,
    mercatorTileBounds: mercatorTileBounds,
    jmaTileUrl: jmaTileUrl,
    jmaTilesFor: jmaTilesFor,
    inflateBytes: inflateBytes,
    pngPixelIndex: pngPixelIndex,
    jmaTileRainRate: jmaTileRainRate,
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
    moonIlluminationPercent: moonIlluminationPercent,
    moonEveningDate: moonEveningDate,
    neutralWeatherGlyph: neutralWeatherGlyph,
    nightCompositeSymbol: nightCompositeSymbol,
    isMoonPhaseGlyph: isMoonPhaseGlyph,
    moonMirroredAt: moonMirroredAt,
    moonLitOnLeft: moonLitOnLeft,
    iconForCode: iconForCode
  }
}
