.pragma library
.import "Globe.js" as Globe

// The globe section's view (WeatherGlobe.qml): where it looks (centre
// latitude and longitude), how far it is zoomed (z0 … z5, the radius
// doubling per level, z0 the whole disc), and the arithmetic of turning,
// tilting and zooming towards the pointer. Pure functions, tested in Node
// (tests/globe-view.test.mjs). Pixels: x to the right, y down, both from the
// viewport's centre.

var RAD = Math.PI / 180
var EARTH_RADIUS_KM = 6371
var MIN_ZOOM = 0
var MAX_ZOOM = 5
var MAX_TILT = 80

function clampZoom(zoom) {
  var z = Math.round(Number(zoom) || 0)
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))
}

// The centre's latitude: the view tilts up to 80° north or south.
function clampLat(lat) {
  var value = Number(lat) || 0
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, value))
}

// The globe's radius in px: at z0 the disc fits the viewport (less the
// room `lift` leaves round it for the moon), doubling per level.
function radiusFor(zoom, viewPx, lift) {
  var base = Math.max(1, Number(viewPx) || 0) / 2 / (Number(lift) || 1)
  return base * Math.pow(2, clampZoom(zoom))
}

// How much of the earth the viewport spans across, in km.
function visibleWidthKm(radius, viewPx) {
  return Math.min(2 * EARTH_RADIUS_KM, Number(viewPx) / Math.max(1, Number(radius)) * EARTH_RADIUS_KM)
}

// The centre after a drag by (dx, dy) px: the surface follows the pointer
// at the centre; a drag down tilts the view north. Longitude unwrapped.
function panned(lat, lon, dx, dy, radius) {
  var r = Math.max(1, Number(radius))
  var nextLat = clampLat(Number(lat) + Number(dy) / r / RAD)
  var cos = Math.max(0.2, Math.cos(nextLat * RAD))
  return { lat: nextLat, lon: Number(lon) - Number(dx) / (r * cos) / RAD }
}

// One step of Ctrl+arrows in degrees: 15° while the whole disc shows (z0,
// z1), else a quarter of the view.
function stepDegrees(zoom, radius, viewPx) {
  if (clampZoom(zoom) <= 1) return 15
  return Number(viewPx) / 4 / Math.max(1, Number(radius)) / RAD
}

// The grid's spacing in degrees per zoom level.
function gridStep(zoom) {
  var z = clampZoom(zoom)
  return z <= 2 ? 15 : (z <= 4 ? 5 : 1)
}

// Zooming towards a pointer at (px, py): the place under it stays under it.
// Returns the new centre { lat, lon }, or the old one when the pointer is
// off the globe. Orthographic: the place's distance from the centre on the
// screen, R·sin θ, is kept, so with the radius from r0 to r1 the centre
// moves along the great circle through it to sin θ′ = sin θ · r0 / r1.
function zoomedCentre(lat, lon, r0, r1, px, py) {
  var m = Globe.viewMatrix(lat, lon)
  var place = Globe.unprojectView(px, -py, m, r0)
  if (!place) return { lat: lat, lon: lon }
  var p = unit(place.lat, place.lon)
  var c = unit(lat, lon)
  var cosTheta = Math.max(-1, Math.min(1, p[0] * c[0] + p[1] * c[1] + p[2] * c[2]))
  var theta = Math.acos(cosTheta)
  if (theta < 1e-9) return { lat: lat, lon: lon }
  var sinNext = Math.min(1, Math.sin(theta) * r0 / r1)
  var next = Math.asin(sinNext)
  // From the place towards the old centre, `next` radians along.
  var t = next / theta
  var s = Math.sin(theta)
  var a = Math.sin((1 - t) * theta) / s, b = Math.sin(t * theta) / s
  var v = [a * p[0] + b * c[0], a * p[1] + b * c[1], a * p[2] + b * c[2]]
  var newLat = Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD
  var newLon = Math.atan2(v[1], v[0]) / RAD
  // Unwrapped next to the old longitude, so an animation takes the short way.
  newLon = Number(lon) + Globe.shortestTurn(Number(lon), newLon)
  // The view keeps north up, so the place may come out a little off to
  // the side: a few drags by what is left put it back under the pointer.
  var centre = { lat: clampLat(newLat), lon: newLon }
  for (var k = 0; k < 6; k++) {
    var at = Globe.projectView(place.lat, place.lon, Globe.viewMatrix(centre.lat, centre.lon), r1)
    var dx = px - at.x, dy = py + at.y
    if (Math.abs(dx) + Math.abs(dy) < 0.05) break
    centre = panned(centre.lat, centre.lon, dx, dy, r1)
  }
  return centre
}

function unit(lat, lon) {
  var phi = lat * RAD, lam = lon * RAD
  return [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)]
}

// The lat/lon box round what the viewport (w × h px) shows, for picking
// basemap cells: { south, north, west, east }, west/east unwrapped about
// the centre; the whole range of longitudes near a pole.
function visibleBounds(lat, lon, radius, w, h) {
  var half = Math.hypot(Number(w), Number(h)) / 2
  var reach = half >= radius ? 90 : Math.asin(half / Math.max(1, radius)) / RAD
  var south = Math.max(-90, lat - reach)
  var north = Math.min(90, lat + reach)
  var widest = Math.max(Math.abs(south), Math.abs(north))
  if (widest >= 85 || reach >= 90) return { south: south, north: north, west: lon - 180, east: lon + 180 }
  var span = Math.min(180, reach / Math.max(0.05, Math.cos(widest * RAD)))
  return { south: south, north: north, west: lon - span, east: lon + span }
}

if (typeof module !== "undefined") module.exports = {
  clampZoom: clampZoom, clampLat: clampLat, radiusFor: radiusFor, visibleWidthKm: visibleWidthKm,
  panned: panned, stepDegrees: stepDegrees, gridStep: gridStep, zoomedCentre: zoomedCentre,
  visibleBounds: visibleBounds
}
