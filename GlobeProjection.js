.pragma library
.import "Globe.js" as Globe
.import "GlobeView.js" as GlobeView
.import "EqualEarth.js" as EqualEarth

// The globe section's two map styles behind one interface, so the views
// (WeatherGlobe*.qml) draw, hit-test and move without asking which one
// shows (GLOBE-PROJECTION.md):
//   ortho(view, width, height, options)  the globe (Globe.js, GlobeView.js)
//   flat(view, width, height, options)   the Equal Earth map (EqualEarth.js)
// `view` is { lat, lon, zoom }: the place in the middle and the zoom level
// z0 … z5 (each level doubles the scale; z0 the whole disc or the whole
// map). Both return an object with the same members. Pixels are canvas
// pixels: origin at the viewport's top left, x to the right, y down. Paths
// are flat arrays [x0, y0, x1, y1, ...] in those pixels; fills are meant
// for the even-odd rule (Qt.OddEvenFill).
//
// The flat map keeps longitude 0 in the middle of the map (Equal Earth's
// central meridian never moves, so the ±180° seam stays the map's edge);
// z0 shows the whole map, fitted into the viewport (to its width when the
// viewport is at least as tall as the map, FLAT_ASPECT), and does not pan.
// From z1 the centre pans; it is clamped so that the map covers the
// viewport along each axis where it can (the centre at least half a
// viewport from the map's bounding box) and never leaves the map's outline.
//
// Pure functions, tested in Node (tests/globe-projection.test.mjs).

var RAD = Math.PI / 180
// Room round the whole disc for the moon (WeatherGlobe's `lift`).
var DEFAULT_LIFT = 1.18
// Edges longer than this (degrees) are sampled before projecting.
var SAMPLE = 2

// Equal Earth's constants (EqualEarth.js; copied so the row-wise inverse
// below runs the very same arithmetic as EqualEarth.unproject).
var A1 = 1.340264
var A2 = -0.081106
var A3 = 0.000893
var A4 = 0.003796
var M = Math.sqrt(3) / 2
var X_MAX = 2.7066299836960743
var Y_MAX = 1.3173627591574133
// The flat map's height over its width.
var FLAT_ASPECT = Y_MAX / X_MAX

function clampNumber(value, lo, hi) {
  return value < lo ? lo : (value > hi ? hi : value)
}

function wrapLon(lon) {
  return ((Number(lon) + 180) % 360 + 360) % 360 - 180
}

// A longitude for the flat map: as it is within ±180 (both edges kept),
// else wrapped.
function mapLon(lon) {
  var value = Number(lon) || 0
  return value >= -180 && value <= 180 ? value : wrapLon(value)
}

// The angle between two places in degrees.
function angularDistance(lat0, lon0, lat1, lon1) {
  var p0 = lat0 * RAD, p1 = lat1 * RAD, d = (lon1 - lon0) * RAD
  var c = Math.sin(p0) * Math.sin(p1) + Math.cos(p0) * Math.cos(p1) * Math.cos(d)
  return Math.acos(clampNumber(c, -1, 1)) / RAD
}

// ---- Equal Earth by rows: the parametric latitude θ for a map y (Newton,
//      as EqualEarth.unproject), and what goes with it.

function thetaOfY(y) {
  var theta = y
  for (var i = 0; i < 12; i++) {
    var t2 = theta * theta
    var t6 = t2 * t2 * t2
    var fy = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) - y
    var fpy = A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)
    var delta = fy / fpy
    theta -= delta
    if (Math.abs(delta) < 1e-9) break
  }
  return theta
}

function lonPoly(theta) {
  var u2 = theta * theta
  var u6 = u2 * u2 * u2
  return A1 + 3 * A2 * u2 + u6 * (7 * A3 + 9 * A4 * u2)
}

function latOfY(y) {
  var theta = thetaOfY(clampNumber(y, -Y_MAX, Y_MAX))
  return Math.asin(clampNumber(Math.sin(theta) / M, -1, 1)) / RAD
}

// Half the map's width at a map y (the ±180° meridians).
function edgeXOfY(y) {
  var theta = thetaOfY(clampNumber(y, -Y_MAX, Y_MAX))
  return Math.PI * Math.cos(theta) / (M * lonPoly(theta))
}

// A map point inside the outline as { lat, lon } (lon within ±180).
function mapToLatLon(x, y) {
  var theta = thetaOfY(clampNumber(y, -Y_MAX, Y_MAX))
  var lat = Math.asin(clampNumber(Math.sin(theta) / M, -1, 1)) / RAD
  var lon = M * x * lonPoly(theta) / Math.cos(theta) / RAD
  return { lat: lat, lon: clampNumber(lon, -180, 180) }
}

// ---- The flat view: scale and centre in map units.

function flatBaseScale(w, h, fit) {
  return Math.min(w / (2 * X_MAX), h / (2 * Y_MAX)) * fit
}

// The centre (map units) clamped for a viewport w × h px at scale s.
function clampMap(x, y, w, h, s) {
  var hw = w / 2 / s, hh = h / 2 / s
  var cx = hw >= X_MAX ? 0 : clampNumber(x, hw - X_MAX, X_MAX - hw)
  var cy = hh >= Y_MAX ? 0 : clampNumber(y, hh - Y_MAX, Y_MAX - hh)
  var edge = edgeXOfY(cy)
  cx = clampNumber(cx, -edge, edge)
  return { x: cx, y: cy }
}

function flatState(view, w, h, fit) {
  var zoom = GlobeView.clampZoom(view && view.zoom)
  var s = flatBaseScale(w, h, fit) * Math.pow(2, zoom)
  var lat = clampNumber(Number(view && view.lat) || 0, -90, 90)
  var p = EqualEarth.project(lat, mapLon(view && view.lon))
  var c = clampMap(p.x, p.y, w, h, s)
  var ll = mapToLatLon(c.x, c.y)
  return { zoom: zoom, s: s, x: c.x, y: c.y, lat: ll.lat, lon: ll.lon }
}

// ---- Lat/lon rings on the flat map (map units), cached per ring.

function isPoleEdge(lat0, lat1) {
  return Math.abs(lat0) >= 89.99 && Math.abs(lat1) >= 89.99
}

// An edge of the data that is a seam, not a coast (as Globe.js): along a
// pole or along ±180°.
function isSeamEdge(lat0, lon0, lat1, lon1) {
  if (isPoleEdge(lat0, lat1)) return true
  return Math.abs(lon0) >= 179.99 && Math.abs(lon1) >= 179.99 && lon0 * lon1 > 0
}

function pushMap(out, lat, lon) {
  var p = EqualEarth.project(lat, lon)
  out.push(p.x, p.y)
}

// The points after (lat0, lon0) up to (lat1, lon1), the end with it unless
// `open`, sampled to SAMPLE degrees. Parallels are straight on the map:
// one edge.
function pushEdge(out, lat0, lon0, lat1, lon1, open) {
  var dLat = lat1 - lat0, dLon = lon1 - lon0
  if (dLat !== 0) {
    var k = Math.ceil(Math.max(Math.abs(dLat), Math.abs(dLon)) / SAMPLE)
    for (var s = 1; s < k; s++) pushMap(out, lat0 + dLat * s / k, lon0 + dLon * s / k)
  }
  if (!open) pushMap(out, lat1, lon1)
}

// A closed lat/lon ring [lat0, lon0, ...] in map units, edges sampled.
function projectRing(flat) {
  var out = []
  var n = flat.length / 2
  if (!n) return out
  pushMap(out, flat[0], flat[1])
  for (var i = 0; i < n; i++) {
    var j = (i + 1) % n
    pushEdge(out, flat[i * 2], flat[i * 2 + 1], flat[j * 2], flat[j * 2 + 1], j === 0)
  }
  return out
}

// Longitudes made continuous (each edge the short way round, edges along a
// pole as they are unless `strict`); `turn` is the net change round the
// ring (±360 for a ring round a pole).
function unwrapRing(flat, strict) {
  var n = flat.length / 2
  var out = []
  if (!n) return { p: out, turn: 0 }
  var last = flat[1]
  var turn = 0
  out.push(flat[0], last)
  for (var i = 1; i <= n; i++) {
    var k = i % n
    var lat = flat[k * 2], raw = flat[k * 2 + 1]
    var prevLat = flat[(i - 1) * 2], prevRaw = flat[(i - 1) * 2 + 1]
    var d = raw - prevRaw
    if (strict || !isPoleEdge(prevLat, lat)) {
      while (d > 180) d -= 360
      while (d < -180) d += 360
    }
    turn += d
    if (i < n) {
      last += d
      out.push(lat, last)
    }
  }
  return { p: out, turn: turn }
}

// A ring that goes once round a pole closed along it: on to where it
// started (a turn further), to the pole, along it and back.
function closeViaPole(flat, turn, pole) {
  var out = flat.slice()
  var lat0 = flat[0], lon0 = flat[1]
  out.push(lat0, lon0 + turn, pole, lon0 + turn, pole, lon0)
  return out
}

// One Sutherland–Hodgman pass over [lat0, lon0, ...]: keep lon ≥ limit
// (side 1) or lon ≤ limit (side −1).
function clipLon(flat, limit, side) {
  var out = []
  var n = flat.length / 2
  if (n < 3) return out
  for (var i = 0; i < n; i++) {
    var j = (i + n - 1) % n
    var lat0 = flat[j * 2], lon0 = flat[j * 2 + 1]
    var lat1 = flat[i * 2], lon1 = flat[i * 2 + 1]
    var in0 = (lon0 - limit) * side >= 0
    var in1 = (lon1 - limit) * side >= 0
    if (in0 !== in1) {
      var t = (limit - lon0) / (lon1 - lon0)
      out.push(lat0 + (lat1 - lat0) * t, limit)
    }
    if (in1) out.push(lat1, lon1)
  }
  return out
}

function areaOf(xy) {
  var total = 0
  for (var i = 0, j = xy.length - 2; i < xy.length; j = i, i += 2) total += xy[j] * xy[i + 1] - xy[i] * xy[j + 1]
  return Math.abs(total) / 2
}

// An unwrapped closed lat/lon ring as map polygons: one per copy 360°
// apart that reaches into −180 … 180, each cut at the map's edge (the cut
// follows the curved edge). The copies do not overlap, so the even-odd
// rule over all of them is the ring's inside.
function mapPolygons(u) {
  var lo = Infinity, hi = -Infinity
  for (var i = 1; i < u.length; i += 2) {
    if (u[i] < lo) lo = u[i]
    if (u[i] > hi) hi = u[i]
  }
  var result = []
  if (lo >= -180 && hi <= 180) {
    var whole = projectRing(u)
    if (areaOf(whole) > 1e-12) result.push(whole)
    return result
  }
  var first = Math.ceil((lo - 180) / 360)
  var last = Math.floor((hi + 180) / 360)
  for (var k = first; k <= last; k++) {
    var shift = -360 * k
    var copy = new Array(u.length)
    for (var c = 0; c < u.length; c += 2) {
      copy[c] = u[c]
      copy[c + 1] = u[c + 1] + shift
    }
    if (lo + shift < -180) copy = clipLon(copy, -180, 1)
    if (hi + shift > 180) copy = clipLon(copy, 180, -1)
    if (copy.length < 6) continue
    var xy = projectRing(copy)
    if (areaOf(xy) > 1e-12) result.push(xy)
  }
  return result
}

// A closed or open lat/lon line as map polylines: cut where an edge
// crosses ±180° (at the crossing), seams (`seams[i]` for edge i → i+1, or
// the rule of isSeamEdge without the array) left out.
function mapLines(flat, seams, closed) {
  var n = flat.length / 2
  var lines = []
  if (n < 2) return lines
  var edges = closed ? n : n - 1
  function kind(i) {
    var j = (i + 1) % n
    var lat0 = flat[i * 2], lon0 = flat[i * 2 + 1], lat1 = flat[j * 2], lon1 = flat[j * 2 + 1]
    if (seams ? seams[i] : isSeamEdge(lat0, lon0, lat1, lon1)) return 1
    if (Math.abs(lon1 - lon0) > 180 && !isPoleEdge(lat0, lat1)) return 2
    return 0
  }
  var start = 0
  if (closed) {
    start = -1
    for (var s = 0; s < n && start < 0; s++) if (kind((s + n - 1) % n) !== 0) start = s
    if (start < 0) {
      var whole = []
      pushMap(whole, flat[0], flat[1])
      for (var w = 0; w < n; w++) {
        var b0 = (w + 1) % n
        pushEdge(whole, flat[w * 2], flat[w * 2 + 1], flat[b0 * 2], flat[b0 * 2 + 1])
      }
      return [whole]
    }
  }
  var line = null
  for (var e = 0; e < edges; e++) {
    var a = (start + e) % n
    var b = (a + 1) % n
    var what = kind(a)
    if (what === 1) {
      if (line && line.length >= 4) lines.push(line)
      line = null
      continue
    }
    var lat0 = flat[a * 2], lon0 = flat[a * 2 + 1], lat1 = flat[b * 2], lon1 = flat[b * 2 + 1]
    if (!line) {
      line = []
      pushMap(line, lat0, lon0)
    }
    if (what === 2) {
      var lon1u = lon1 + (lon1 < lon0 ? 360 : -360)
      var limit = lon1u > lon0 ? 180 : -180
      var t = (limit - lon0) / (lon1u - lon0)
      var latc = lat0 + (lat1 - lat0) * t
      pushEdge(line, lat0, lon0, latc, limit)
      if (line.length >= 4) lines.push(line)
      line = []
      pushMap(line, latc, -limit)
      pushEdge(line, latc, -limit, lat1, lon1)
      continue
    }
    pushEdge(line, lat0, lon0, lat1, lon1)
  }
  if (line && line.length >= 4) lines.push(line)
  return lines
}

function boxed(list) {
  var out = []
  for (var i = 0; i < list.length; i++) {
    var xy = list[i]
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (var k = 0; k < xy.length; k += 2) {
      if (xy[k] < x0) x0 = xy[k]
      if (xy[k] > x1) x1 = xy[k]
      if (xy[k + 1] < y0) y0 = xy[k + 1]
      if (xy[k + 1] > y1) y1 = xy[k + 1]
    }
    out.push({ xy: xy, x0: x0, y0: y0, x1: x1, y1: y1 })
  }
  return out
}

// A ring in any accepted form as { p: [lat0, lon0, ...], seams }:
// Globe.prepareVectors' result (unit vectors, its seam flags), a list of
// { lat, lon }, or a flat [lat0, lon0, ...] array.
function latLonOf(ring) {
  var p = []
  var i
  if (ring && ring.v && ring.n) {
    var v = ring.v
    for (i = 0; i < ring.n; i++) {
      var x = v[i * 3], y = v[i * 3 + 1], z = v[i * 3 + 2]
      p.push(Math.atan2(z, Math.sqrt(x * x + y * y)) / RAD, Math.atan2(y, x) / RAD)
    }
    return { p: p, seams: ring.seam || null }
  }
  if (ring && ring.length && typeof ring[0] === "object") {
    for (i = 0; i < ring.length; i++) p.push(Number(ring[i].lat), Number(ring[i].lon))
    return { p: p, seams: null }
  }
  for (i = 0; ring && i < ring.length; i++) p.push(Number(ring[i]))
  return { p: p, seams: null }
}

// The ring on the flat map, made once and kept on the ring object:
// { fills: [{ xy, x0, y0, x1, y1 }], lines: [...] } in map units.
function flatGeometry(ring) {
  if (ring && ring.__flatMap) return ring.__flatMap
  // Through Globe.prepareVectors, so a ring means on the map what it means
  // on the globe (edges sampled in latitude and longitude, its seams).
  var src = latLonOf(vectorsOf(ring))
  var geometry = { fills: [], lines: [] }
  if (src.p.length >= 6) {
    var u = unwrapRing(src.p)
    var closed = u.p
    if (Math.abs(u.turn) > 180) {
      var mean = 0
      for (var i = 0; i < src.p.length; i += 2) mean += src.p[i]
      closed = closeViaPole(u.p, u.turn, mean >= 0 ? 90 : -90)
    }
    geometry.fills = boxed(mapPolygons(closed))
    geometry.lines = boxed(mapLines(src.p, src.seams, true))
  }
  try {
    if (ring && typeof ring === "object") ring.__flatMap = geometry
  } catch (e) {}
  return geometry
}

// For the globe: the ring as Globe.prepareVectors gives it, kept on the
// ring object when it had to be made.
function vectorsOf(ring) {
  if (ring && ring.v && ring.n) return ring
  if (ring && ring.__globeVectors) return ring.__globeVectors
  var prepared = Globe.prepareVectors(ring)
  try {
    if (ring && typeof ring === "object") ring.__globeVectors = prepared
  } catch (e) {}
  return prepared
}

// ---- Spherical caps on the flat map.

// The edge of the cap round (axisLat, axisLon) of angular radius rhoDeg as
// an unwrapped lat/lon line, sampled every degree of bearing and then
// halved until each chord lies within `tol` map units of the curve.
function capEdge(axisLat, axisLon, rhoDeg, tol) {
  var p0 = axisLat * RAD, l0 = axisLon * RAD, rho = rhoDeg * RAD
  var sp0 = Math.sin(p0), cp0 = Math.cos(p0), sr = Math.sin(rho), cr = Math.cos(rho)
  function at(b) {
    var lat = Math.asin(clampNumber(sp0 * cr + cp0 * sr * Math.cos(b), -1, 1))
    var lon = l0 + Math.atan2(Math.sin(b) * sr * cp0, cr - sp0 * Math.sin(lat))
    return [lat / RAD, lon / RAD]
  }
  function near(lon, ref) {
    while (lon - ref > 180) lon -= 360
    while (lon - ref < -180) lon += 360
    return lon
  }
  // Raw points (longitudes as atan2 gives them); the chord test unwraps
  // each triple locally, so a pass close by a pole is halved until its
  // steps are short, and unwrapRing below then finds the true winding.
  var raw = []
  function refine(b0, a, b1, c, depth) {
    var bm = (b0 + b1) / 2
    var m = at(bm)
    var pa = EqualEarth.project(a[0], a[1])
    var pc = EqualEarth.project(c[0], near(c[1], a[1]))
    var pm = EqualEarth.project(m[0], near(m[1], a[1]))
    var dx = pm.x - (pa.x + pc.x) / 2, dy = pm.y - (pa.y + pc.y) / 2
    if (depth >= 14 || dx * dx + dy * dy <= tol * tol) return
    refine(b0, a, bm, m, depth + 1)
    raw.push(m[0], m[1])
    refine(bm, m, b1, c, depth + 1)
  }
  var steps = 360
  var prev = at(0)
  for (var k = 0; k < steps; k++) {
    var next = at(2 * Math.PI * (k + 1) / steps)
    raw.push(prev[0], prev[1])
    refine(2 * Math.PI * k / steps, prev, 2 * Math.PI * (k + 1) / steps, next, 0)
    prev = next
  }
  return raw
}

var capCache = { keys: [], values: {} }

// The cap as map polygons for the even-odd rule: none, one pole or both
// inside (the whole map less the cap round the opposite point).
function flatCapPolygons(axisLat, axisLon, rhoDeg, tol) {
  var rho = clampNumber(Number(rhoDeg) || 0, 0, 180)
  var key = [axisLat, axisLon, rho, Math.round(Math.log(tol) / Math.LN2 * 2)].join("|")
  if (capCache.values[key]) return capCache.values[key]
  var result = []
  if (rho >= 180 - 1e-9) {
    result.push(outlineMap(0.5))
  } else if (rho > 1e-9) {
    var distN = 90 - axisLat, distS = 90 + axisLat
    var northIn = distN <= rho, southIn = distS <= rho
    var lat = axisLat, lon = axisLon, radius = rho
    if (northIn && southIn) {
      result.push(outlineMap(0.5))
      lat = -axisLat
      lon = axisLon + 180
      radius = 180 - rho
    }
    var u = unwrapRing(capEdge(lat, lon, radius, tol), true)
    var ring = u.p
    if (Math.abs(u.turn) > 180) {
      var pole = northIn !== southIn ? (northIn ? 90 : -90) : (lat >= 0 ? 90 : -90)
      ring = closeViaPole(u.p, u.turn, pole)
    }
    var pieces = mapPolygons(ring)
    for (var i = 0; i < pieces.length; i++) result.push(pieces[i])
  }
  result = boxed(result)
  capCache.keys.push(key)
  capCache.values[key] = result
  if (capCache.keys.length > 24) delete capCache.values[capCache.keys.shift()]
  return result
}

// The map's outline in map units, every `step` degrees of latitude.
var outlineCache = {}
function outlineMap(step) {
  if (outlineCache[step]) return outlineCache[step]
  var xy = []
  var lat
  for (lat = -90; lat <= 90; lat += step) pushMap(xy, lat, 180)
  for (lat = 90; lat >= -90; lat -= step) pushMap(xy, lat, -180)
  outlineCache[step] = xy
  return xy
}

// ---- Shared by both styles.

// A sampled circle (the disc) in canvas px.
function circlePoints(cx, cy, r) {
  var step = Math.max(0.25 * RAD, Math.min(2 * RAD, r > 1 ? 2 * Math.acos(Math.max(-1, 1 - 0.5 / r)) : 2 * RAD))
  var n = Math.max(32, Math.ceil(2 * Math.PI / step))
  var xy = new Array(n * 2)
  for (var k = 0; k < n; k++) {
    var t = 2 * Math.PI * k / n
    xy[k * 2] = cx + r * Math.cos(t)
    xy[k * 2 + 1] = cy + r * Math.sin(t)
  }
  return xy
}

// Globe.js' paths (px from the disc's centre, y up) to canvas px, in place.
function globeToCanvas(list, cx, cy) {
  for (var i = 0; i < list.length; i++) {
    var xy = list[i]
    for (var k = 0; k < xy.length; k += 2) {
      xy[k] = cx + xy[k]
      xy[k + 1] = cy - xy[k + 1]
    }
  }
  return list
}

function reuseArray(old, n) {
  return old && old.length === n ? old : new Array(n)
}

// ---- The globe.

// Newton steps on the centre until `place` projects to (px, py) (px from
// the disc's centre, y up) within a hundredth of a pixel: zoomedCentre's
// drags leave up to about a pixel when zooming out.
function settle(centre, place, px, py, R) {
  var lat = centre.lat, lon = centre.lon
  function at(a, b) {
    var p = Globe.projectView(place.lat, place.lon, Globe.viewMatrix(a, Globe.wrapLon(b)), R)
    return [p.x - px, p.y - py, p.visible]
  }
  for (var k = 0; k < 8; k++) {
    var f = at(lat, lon)
    if (Math.abs(f[0]) + Math.abs(f[1]) < 0.01) break
    var h = 1e-4
    var fa = at(lat + h, lon), fb = at(lat, lon + h)
    var j00 = (fa[0] - f[0]) / h, j10 = (fa[1] - f[1]) / h, j01 = (fb[0] - f[0]) / h, j11 = (fb[1] - f[1]) / h
    var det = j00 * j11 - j01 * j10
    if (!(Math.abs(det) > 1e-12)) break
    var nextLat = GlobeView.clampLat(lat - (j11 * f[0] - j01 * f[1]) / det)
    var nextLon = lon - (-j10 * f[0] + j00 * f[1]) / det
    var g = at(nextLat, nextLon)
    if (!g[2] || Math.abs(g[0]) + Math.abs(g[1]) >= Math.abs(f[0]) + Math.abs(f[1])) break
    lat = nextLat
    lon = nextLon
  }
  return { lat: lat, lon: lon }
}

function ortho(view, width, height, options) {
  var w = Math.max(1, Number(width) || 0), h = Math.max(1, Number(height) || 0)
  var opts = options || {}
  var lift = Number(opts.lift) > 0 ? Number(opts.lift) : DEFAULT_LIFT
  var viewSize = Number(opts.viewSize) > 0 ? Number(opts.viewSize) : Math.min(w, h)
  var zoom = GlobeView.clampZoom(view && view.zoom)
  var lat = GlobeView.clampLat(view && view.lat)
  var lon = Number(view && view.lon) || 0
  var R = GlobeView.radiusFor(zoom, viewSize, lift)
  var m = Globe.viewMatrix(lat, Globe.wrapLon(lon))
  var cx = w / 2, cy = h / 2
  var self = {
    kind: "ortho",
    isDisc: true,
    width: w,
    height: h,
    view: { lat: lat, lon: lon, zoom: zoom },
    zoom: zoom,
    // px per earth radius (the disc's radius).
    scale: R,
    radius: R,
    pxPerRadian: R,
    matrix: m,
    centerX: cx,
    centerY: cy,
    disc: { x: cx, y: cy, r: R },
    viewport: { x: 0, y: 0, width: w, height: h },
    gridStep: GlobeView.gridStep(zoom)
  }
  var clipCache = null
  Object.defineProperty(self, "clipPoints", {
    get: function() { return clipCache || (clipCache = circlePoints(cx, cy, R)) }
  })

  self.project = function(plat, plon) {
    var p = Globe.projectView(plat, plon, m, R)
    return { x: cx + p.x, y: cy - p.y, visible: p.visible }
  }
  self.unproject = function(x, y) {
    return Globe.unprojectView(x - cx, cy - y, m, R)
  }
  self.fillPaths = function(ring) {
    return globeToCanvas(Globe.frontPolygonsView(vectorsOf(ring), m, R), cx, cy)
  }
  self.strokePaths = function(ring) {
    return globeToCanvas(Globe.frontLinesView(vectorsOf(ring), m, R), cx, cy)
  }
  self.capPaths = function(axisLat, axisLon, angularRadiusDeg) {
    return globeToCanvas(Globe.capPolygonView(axisLat, axisLon, angularRadiusDeg, m, R), cx, cy)
  }
  // An open line [lon0, lat0, ...] (the worker's isobars): runs on the
  // front, cut where it turns behind or jumps across ±180°.
  self.linePaths = function(lonLat) {
    var lines = []
    var line = null
    var lastLon = 0
    for (var i = 0; i + 1 < lonLat.length; i += 2) {
      var p = Globe.projectView(lonLat[i + 1], lonLat[i], m, R)
      if (!p.visible || (line && Math.abs(lonLat[i] - lastLon) > 180)) {
        if (line && line.length >= 4) lines.push(line)
        line = null
        if (!p.visible) continue
      }
      if (!line) line = []
      line.push(cx + p.x, cy - p.y)
      lastLon = lonLat[i]
    }
    if (line && line.length >= 4) lines.push(line)
    return lines
  }
  self.visibleBox = function() {
    var b = GlobeView.visibleBounds(lat, Globe.wrapLon(lon), R, w, h)
    return { south: b.south, north: b.north, west: b.west, east: b.east, wraps: b.west < -180 || b.east > 180 }
  }
  // Meridians and parallels: on the whole disc (z0–z2) Globe.gridLinesView;
  // closer only those in view, sampled finely (as WeatherGlobe's traceGrid).
  self.gridPaths = function(stepDeg) {
    var step = Number(stepDeg) > 0 ? Number(stepDeg) : self.gridStep
    if (zoom <= 2) return globeToCanvas(Globe.gridLinesView(m, R, step), cx, cy)
    var box = self.visibleBox()
    var sample = step / 4
    var lines = []
    function add(points) {
      var line = null
      for (var i = 0; i < points.length; i += 2) {
        var p = Globe.projectView(points[i], points[i + 1], m, R)
        if (!p.visible) {
          if (line && line.length >= 4) lines.push(line)
          line = null
          continue
        }
        if (!line) line = []
        line.push(cx + p.x, cy - p.y)
      }
      if (line && line.length >= 4) lines.push(line)
    }
    var la, lo, pts
    for (lo = Math.floor(box.west / step) * step; lo <= box.east; lo += step) {
      pts = []
      for (la = box.south; la <= box.north + sample; la += sample) pts.push(Math.min(90, la), lo)
      add(pts)
    }
    for (la = Math.ceil(box.south / step) * step; la <= box.north; la += step) {
      if (Math.abs(la) >= 90) continue
      pts = []
      for (lo = box.west; lo <= box.east + sample; lo += sample) pts.push(la, lo)
      add(pts)
    }
    return lines
  }
  // Degrees of arc per px round a place: the side of a pixel's area on the
  // earth (foreshortened towards the rim); Infinity behind the globe.
  self.degPerPixelAt = function(plat, plon) {
    var phi = plat * RAD, lam = plon * RAD
    var cosC = m[6] * Math.cos(phi) * Math.cos(lam) + m[7] * Math.cos(phi) * Math.sin(lam) + m[8] * Math.sin(phi)
    if (cosC <= 1e-9) return Infinity
    return 1 / (RAD * R * Math.sqrt(cosC))
  }
  // The place under each node of a (cols + 1) × (rows + 1) lattice over the
  // viewport, node (c, r) at (c · width / cols, r · height / rows) as the
  // wash samples (plain arrays, NaN off the globe). `pad` cells past the
  // rim take the rim's place (the wash: 1.5), 0 matches unproject exactly.
  // `reuse`: the last result, whose arrays are filled again when the size
  // is the same.
  self.cellGrid = function(cols, rows, pad, reuse) {
    var nc = Math.max(1, Math.round(cols)), nr = Math.max(1, Math.round(rows))
    var nodeCols = nc + 1, nodeRows = nr + 1, n = nodeCols * nodeRows
    var lats = reuseArray(reuse && reuse.lats, n), lons = reuseArray(reuse && reuse.lons, n)
    var cellW = w / nc, cellH = h / nr
    var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8]
    var deg = 180 / Math.PI
    var reach = pad > 0 ? Math.pow(1 + pad * Math.max(cellW, cellH) / R, 2) : 1 + 1e-9
    for (var r = 0; r < nodeRows; r++) {
      var y = r * cellH
      for (var c = 0; c < nodeCols; c++) {
        var i = r * nodeCols + c
        var x = c * cellW
        var u = (x - cx) / R, v = (cy - y) / R
        var q = u * u + v * v
        if (q > reach) { lats[i] = NaN; lons[i] = NaN; continue }
        if (q > 1) { var d = Math.sqrt(q); u /= d; v /= d; q = 1 }
        var f = Math.sqrt(Math.max(0, 1 - q))
        var vx = u * m0 + v * m3 + f * m6, vy = u * m1 + v * m4 + f * m7, vz = u * m2 + v * m5 + f * m8
        lats[i] = Math.asin(Math.max(-1, Math.min(1, vz))) * deg
        lons[i] = Math.atan2(vy, vx) * deg
      }
    }
    return { cols: nc, rows: nr, nodeCols: nodeCols, nodeRows: nodeRows, cellW: cellW, cellH: cellH, lats: lats, lons: lons }
  }

  // ---- View arithmetic (GlobeView.js); views in, views out.
  function radiusOf(z) { return GlobeView.radiusFor(z, viewSize, lift) }
  self.clamp = function(v) {
    return { lat: GlobeView.clampLat(v && v.lat), lon: Number(v && v.lon) || 0, zoom: GlobeView.clampZoom(v && v.zoom) }
  }
  // A drag by (dx, dy) px from `v` (the view at the press): the surface
  // follows the pointer; longitude unwrapped.
  self.dragged = function(v, dx, dy) {
    var c = self.clamp(v)
    var next = GlobeView.panned(c.lat, c.lon, dx, dy, radiusOf(c.zoom))
    return { lat: next.lat, lon: next.lon, zoom: c.zoom }
  }
  // One zoom step (delta ±1) towards canvas point (x, y); the place under
  // it stays there. The same view when the level would not change.
  self.zoomedAt = function(v, x, y, delta) {
    var c = self.clamp(v)
    var next = GlobeView.clampZoom(c.zoom + delta)
    if (next === c.zoom) return c
    var r0 = radiusOf(c.zoom), r1 = radiusOf(next)
    var place = Globe.unprojectView(x - cx, cy - y, Globe.viewMatrix(c.lat, Globe.wrapLon(c.lon)), r0)
    var centre = GlobeView.zoomedCentre(c.lat, c.lon, r0, r1, x - cx, y - cy)
    if (place) centre = settle(centre, place, x - cx, cy - y, r1)
    return { lat: centre.lat, lon: centre.lon, zoom: next }
  }
  // Ctrl + arrows: east and north steps (15° on the whole disc, else a
  // quarter of the view), as WeatherGlobe's turnStep.
  self.keyStep = function(v, east, north) {
    var c = self.clamp(v)
    var step = GlobeView.stepDegrees(c.zoom, radiusOf(c.zoom), viewSize)
    var cos = c.zoom >= 2 ? Math.max(0.2, Math.cos(c.lat * RAD)) : 1
    return { lat: GlobeView.clampLat(c.lat + (Number(north) || 0) * step), lon: c.lon + (Number(east) || 0) * step / cos, zoom: c.zoom }
  }
  // Where an animation from `v` to a place should end: the short way round
  // (longitude unwrapped next to v's); lat null keeps v's latitude.
  self.towards = function(v, plat, plon) {
    var c = self.clamp(v)
    var nextLat = plat === null || plat === undefined || isNaN(plat) ? c.lat : GlobeView.clampLat(plat)
    return { lat: nextLat, lon: c.lon + Globe.shortestTurn(c.lon, Number(plon) || 0), zoom: c.zoom }
  }
  // The whole globe, upright, the place facing (from this view).
  self.reset = function(place) {
    var t = self.towards(self.view, 0, place ? place.lon : 0)
    return { lat: 0, lon: t.lon, zoom: 0 }
  }
  return self
}

// ---- The flat map.

function flat(view, width, height, options) {
  var w = Math.max(1, Number(width) || 0), h = Math.max(1, Number(height) || 0)
  var opts = options || {}
  var fit = Number(opts.fit) > 0 ? Number(opts.fit) : 1
  var st = flatState(view, w, h, fit)
  var s = st.s, X = st.x, Y = st.y, zoom = st.zoom
  var hw = w / 2, hh = h / 2
  // The viewport in map units, for culling.
  var vx0 = X - hw / s, vx1 = X + hw / s, vy0 = Y - hh / s, vy1 = Y + hh / s
  var self = {
    kind: "flat",
    isDisc: false,
    width: w,
    height: h,
    view: { lat: st.lat, lon: st.lon, zoom: zoom },
    zoom: zoom,
    // px per map unit (Equal Earth on the unit sphere; equal-area, so also
    // px per radian on average).
    scale: s,
    radius: s,
    pxPerRadian: s,
    centerX: hw + (0 - X) * s,
    centerY: hh - (0 - Y) * s,
    disc: null,
    mapCenter: { x: X, y: Y },
    viewport: { x: 0, y: 0, width: w, height: h },
    gridStep: GlobeView.gridStep(zoom)
  }
  function toPixels(items, out, margin) {
    var pad = (margin || 0) / s
    for (var i = 0; i < items.length; i++) {
      var it = items[i]
      if (it.x1 < vx0 - pad || it.x0 > vx1 + pad || it.y1 < vy0 - pad || it.y0 > vy1 + pad) continue
      var src = it.xy
      var xy = new Array(src.length)
      for (var k = 0; k < src.length; k += 2) {
        xy[k] = hw + (src[k] - X) * s
        xy[k + 1] = hh - (src[k + 1] - Y) * s
      }
      out.push(xy)
    }
    return out
  }
  function mapToPx(src) {
    var xy = new Array(src.length)
    for (var k = 0; k < src.length; k += 2) {
      xy[k] = hw + (src[k] - X) * s
      xy[k + 1] = hh - (src[k + 1] - Y) * s
    }
    return xy
  }
  var clipCache = null
  Object.defineProperty(self, "clipPoints", {
    get: function() { return clipCache || (clipCache = mapToPx(outlineMap(zoom >= 3 ? 0.5 : 2))) }
  })

  self.project = function(plat, plon) {
    var p = EqualEarth.project(clampNumber(Number(plat), -90, 90), mapLon(plon))
    return { x: hw + (p.x - X) * s, y: hh - (p.y - Y) * s, visible: isFinite(p.x) && isFinite(p.y) }
  }
  self.unproject = function(x, y) {
    return EqualEarth.unproject(X + (x - hw) / s, Y - (y - hh) / s)
  }
  self.fillPaths = function(ring) {
    return toPixels(flatGeometry(ring).fills, [], 1)
  }
  self.strokePaths = function(ring) {
    return toPixels(flatGeometry(ring).lines, [], 1)
  }
  self.capPaths = function(axisLat, axisLon, angularRadiusDeg) {
    return toPixels(flatCapPolygons(Number(axisLat), Number(axisLon), angularRadiusDeg, 0.3 / s), [], 1)
  }
  self.linePaths = function(lonLat) {
    var p = []
    for (var i = 0; i + 1 < lonLat.length; i += 2) p.push(lonLat[i + 1], mapLon(lonLat[i]))
    return toPixels(boxed(mapLines(p, [], false)), [], 1)
  }
  self.visibleBox = function() {
    var top = Math.min(Y_MAX, vy1), bottom = Math.max(-Y_MAX, vy0)
    if (top < bottom) top = bottom
    var north = latOfY(top), south = latOfY(bottom)
    var xl = Math.max(-X_MAX, vx0), xr = Math.min(X_MAX, vx1)
    var ys = [top, bottom]
    if (top > 0 && bottom < 0) ys.push(0)
    var west = 180, east = -180
    for (var i = 0; i < ys.length; i++) {
      var e = edgeXOfY(ys[i])
      west = Math.min(west, clampNumber(xl / e * 180, -180, 180))
      east = Math.max(east, clampNumber(xr / e * 180, -180, 180))
    }
    return { south: south, north: north, west: west, east: east, wraps: false }
  }
  // Meridians (curved; the ±180° edge left out) and parallels (straight)
  // every `stepDeg` degrees within the view.
  self.gridPaths = function(stepDeg) {
    var step = Number(stepDeg) > 0 ? Number(stepDeg) : self.gridStep
    var box = self.visibleBox()
    var lines = []
    var sample = Math.max(0.1, Math.min(SAMPLE, (box.north - box.south) / 32))
    var la, lo
    for (lo = Math.ceil(box.west / step) * step; lo <= box.east; lo += step) {
      if (Math.abs(lo) >= 180) continue
      var meridian = []
      for (la = box.south; la < box.north + sample; la += sample) pushMap(meridian, Math.min(box.north, la), lo)
      lines.push(mapToPx(meridian))
    }
    for (la = Math.ceil(box.south / step) * step; la <= box.north; la += step) {
      if (Math.abs(la) >= 90) continue
      var parallel = []
      pushMap(parallel, la, Math.max(-180, box.west))
      pushMap(parallel, la, Math.min(180, box.east))
      lines.push(mapToPx(parallel))
    }
    return lines
  }
  // Equal Earth keeps areas: the side of a pixel's area in degrees of arc
  // is the same everywhere (shapes stretch towards the poles and edges).
  self.degPerPixelAt = function(plat, plon) {
    return 1 / (RAD * s)
  }
  // As ortho's cellGrid: nodes past the outline NaN, or up to `pad` cells
  // past it the outline's place. Each row shares its latitude (Equal
  // Earth's parallels are straight), so a node costs a multiplication.
  self.cellGrid = function(cols, rows, pad, reuse) {
    var nc = Math.max(1, Math.round(cols)), nr = Math.max(1, Math.round(rows))
    var nodeCols = nc + 1, nodeRows = nr + 1, n = nodeCols * nodeRows
    var lats = reuseArray(reuse && reuse.lats, n), lons = reuseArray(reuse && reuse.lons, n)
    var cellW = w / nc, cellH = h / nr
    var padMap = pad > 0 ? pad * Math.max(cellW, cellH) / s : 0
    var deg = 180 / Math.PI
    for (var r = 0; r < nodeRows; r++) {
      var my = Y - (r * cellH - hh) / s
      var theta = thetaOfY(my)
      var sn = Math.sin(theta) / M
      var c
      if (Math.abs(sn) > 1 && padMap > 0 && Math.abs(my) - Y_MAX <= padMap) {
        theta = thetaOfY(my > 0 ? Y_MAX : -Y_MAX)
        sn = clampNumber(Math.sin(theta) / M, -1, 1)
      }
      if (Math.abs(sn) > 1) {
        for (c = 0; c < nodeCols; c++) { lats[r * nodeCols + c] = NaN; lons[r * nodeCols + c] = NaN }
        continue
      }
      var lat = Math.asin(sn) * deg
      var poly = lonPoly(theta)
      var cosT = Math.cos(theta)
      var edge = Math.PI * cosT / (M * poly)
      for (c = 0; c < nodeCols; c++) {
        var i = r * nodeCols + c
        var mx = X + (c * cellW - hw) / s
        var lam = M * mx * poly / cosT
        if (Math.abs(lam) > Math.PI + 1e-9) {
          if (padMap > 0 && Math.abs(mx) - edge <= padMap) lam = lam > 0 ? Math.PI : -Math.PI
          else { lats[i] = NaN; lons[i] = NaN; continue }
        }
        lats[i] = lat
        lons[i] = lam * deg
      }
    }
    return { cols: nc, rows: nr, nodeCols: nodeCols, nodeRows: nodeRows, cellW: cellW, cellH: cellH, lats: lats, lons: lons }
  }

  // ---- View arithmetic in map units; views in, views out (lat/lon of the
  //      clamped centre, longitude within ±180).
  function scaleOf(z) { return flatBaseScale(w, h, fit) * Math.pow(2, z) }
  function viewAt(x, y, z) {
    var c = clampMap(x, y, w, h, scaleOf(z))
    var ll = mapToLatLon(c.x, c.y)
    return { lat: ll.lat, lon: ll.lon, zoom: z }
  }
  self.clamp = function(v) {
    var c = flatState(v, w, h, fit)
    return { lat: c.lat, lon: c.lon, zoom: c.zoom }
  }
  self.dragged = function(v, dx, dy) {
    var c = flatState(v, w, h, fit)
    return viewAt(c.x - (Number(dx) || 0) / c.s, c.y + (Number(dy) || 0) / c.s, c.zoom)
  }
  self.zoomedAt = function(v, x, y, delta) {
    var c = flatState(v, w, h, fit)
    var next = GlobeView.clampZoom(c.zoom + delta)
    if (next === c.zoom) return { lat: c.lat, lon: c.lon, zoom: c.zoom }
    var s1 = scaleOf(next)
    var px = c.x + (x - hw) / c.s, py = c.y - (y - hh) / c.s
    return viewAt(px - (x - hw) / s1, py + (y - hh) / s1, next)
  }
  // A quarter of the view per step (nothing moves where the map fits).
  self.keyStep = function(v, east, north) {
    return self.dragged(v, -(Number(east) || 0) * w / 4, (Number(north) || 0) * h / 4)
  }
  // Animations run straight across the map (never across the seam).
  self.towards = function(v, plat, plon) {
    var c = flatState(v, w, h, fit)
    var nextLat = plat === null || plat === undefined || isNaN(plat) ? c.lat : plat
    return self.clamp({ lat: nextLat, lon: plon, zoom: c.zoom })
  }
  self.reset = function(place) {
    return { lat: 0, lon: 0, zoom: 0 }
  }
  return self
}

// One of the two by name ("flat" or anything else: the globe).
function create(style, view, width, height, options) {
  return style === "flat" ? flat(view, width, height, options) : ortho(view, width, height, options)
}

// The land of data/globe-land.json, prepared once per process for both
// styles (Globe.prepareLand; the flat map's geometry is added to each ring
// the first time it is drawn flat).
function prepareLand(data) {
  return Globe.prepareLand(data)
}

// A ring for fillPaths/strokePaths from [lat0, lon0, ...] or [{ lat, lon }].
function prepareRing(points) {
  return Globe.prepareVectors(points)
}

if (typeof module !== "undefined") module.exports = {
  ortho: ortho, flat: flat, create: create, prepareLand: prepareLand, prepareRing: prepareRing,
  angularDistance: angularDistance, DEFAULT_LIFT: DEFAULT_LIFT, FLAT_ASPECT: FLAT_ASPECT
}
