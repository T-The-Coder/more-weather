.pragma library

// The globes of the More plugins (shared, tools/sync-shared.sh). Below, the
// tilted, zoomable view; first More Time's World tab globe: an orthographic
// view of the earth with the equator through the middle, turned about the
// polar axis so that longitude `centerLon` faces the viewer. Coordinates are relative to the globe's
// centre, y to the north; the view flips y when it draws.
//
// Horizon clipping: with the view on the equator, the front hemisphere is
// exactly the band of longitudes centerLon ± 90°, at every latitude, and its
// horizon (the rim) is the pair of meridians centerLon ± 90°. So polygons are
// clipped in latitude/longitude, as on a plain lat/lon grid, against that
// band (once for each copy of it 360° apart that a ring touches):
//  - fills (zones, land, night, twilight): Sutherland–Hodgman against the
//    two meridians; the cut runs along the rim, where the new edges are
//    sampled every few degrees so they follow the circle. A concave ring
//    may leave a zero-width bridge along the rim; it has no area and lies
//    under the rim's stroke. Clipping commutes with the even-odd rule, so
//    holes and the twilight bands stay right.
//  - strokes (coastlines): the ring is cut into the visible runs of its
//    edges, never joined along the rim, and edges that are seams of the
//    data (along ±180° or a pole) are left out.
// Every edge is sampled to at most STEP degrees before projecting, so
// parallels and meridians (straight in the data) come out as curves.

var RAD = Math.PI / 180
var STEP = 2

// Longitude in [-180, 180).
function wrapLon(lon) {
  return ((lon + 180) % 360 + 360) % 360 - 180
}

function projectOrtho(lat, lon, centerLon, radius) {
  var phi = lat * RAD
  var d = (lon - centerLon) * RAD
  var c = Math.cos(phi)
  return { x: radius * c * Math.sin(d), y: radius * Math.sin(phi), visible: c * Math.cos(d) >= -1e-9 }
}

// The place under a point of the view, null off the globe.
function unprojectOrtho(x, y, centerLon, radius) {
  if (!(radius > 0)) return null
  var r2 = x * x + y * y
  if (r2 > radius * radius) return null
  var z = Math.sqrt(radius * radius - r2)
  var lat = Math.asin(Math.max(-1, Math.min(1, y / radius))) / RAD
  return { lat: lat, lon: wrapLon(centerLon + Math.atan2(x, z) / RAD) }
}

// The signed turn from one longitude to another the short way round.
function shortestTurn(fromLon, toLon) {
  return wrapLon(toLon - fromLon)
}

// ---- The data file's rings, once in lat/lon ----

// A ring of data/worldmap.json (projected integers × scale) as a flat
// [lat0, lon0, lat1, lon1, ...] array, edges sampled to STEP degrees.
// `unproject` is WorldMap.unproject; points a rounding step outside the
// map's outline are pulled in.
function ringLatLon(ring, scale, unproject) {
  var out = []
  var last = null
  for (var i = 0; i < ring.length; i += 2) {
    var x = ring[i] / scale
    var y = ring[i + 1] / scale
    var p = unproject(x, y)
    if (!p) p = unproject(x * 0.9999, y * 0.9999)
    if (!p) continue
    var lat = Math.max(-90, Math.min(90, p.lat))
    var lon = Math.max(-180, Math.min(180, p.lon))
    if (Math.abs(lon) > 179.95) lon = lon < 0 ? -180 : 180
    if (Math.abs(lat) > 89.95) lat = lat < 0 ? -90 : 90
    if (last) appendSampled(out, last[0], last[1], lat, lon)
    out.push(lat, lon)
    last = [lat, lon]
  }
  if (last && out.length > 2) appendSampled(out, last[0], last[1], out[0], out[1])
  return out
}

// The points strictly between two, every STEP degrees at most.
function appendSampled(out, lat0, lon0, lat1, lon1) {
  var n = Math.ceil(Math.max(Math.abs(lat1 - lat0), Math.abs(lon1 - lon0)) / STEP)
  for (var k = 1; k < n; k++) out.push(lat0 + (lat1 - lat0) * k / n, lon0 + (lon1 - lon0) * k / n)
}

// A prepared ring: the flat array and its longitude range.
function prepare(flat) {
  var lo = Infinity
  var hi = -Infinity
  for (var i = 1; i < flat.length; i += 2) {
    if (flat[i] < lo) lo = flat[i]
    if (flat[i] > hi) hi = flat[i]
  }
  // Sines and cosines per point, so a ring wholly on the front projects
  // with multiplications only, frame after frame.
  var n = flat.length / 2
  var cosLat = new Array(n), sinLat = new Array(n), cosLon = new Array(n), sinLon = new Array(n)
  for (var k = 0; k < n; k++) {
    cosLat[k] = Math.cos(flat[k * 2] * RAD)
    sinLat[k] = Math.sin(flat[k * 2] * RAD)
    cosLon[k] = Math.cos(flat[k * 2 + 1] * RAD)
    sinLon[k] = Math.sin(flat[k * 2 + 1] * RAD)
  }
  var seams = false
  for (var m = 0; m < n && !seams; m++) {
    var m2 = (m + 1) % n
    seams = seam(flat[m * 2], flat[m * 2 + 1], flat[m2 * 2], flat[m2 * 2 + 1])
  }
  return { p: flat, lo: lo, hi: hi, seams: seams, cosLat: cosLat, sinLat: sinLat, cosLon: cosLon, sinLon: sinLon }
}

// A ring wholly on the front, projected from its cached sines and cosines.
function projectWhole(ring, centerLon, radius) {
  var cc = Math.cos(centerLon * RAD)
  var sc = Math.sin(centerLon * RAD)
  var n = ring.cosLat.length
  var xy = new Array(n * 2)
  for (var i = 0; i < n; i++) {
    xy[i * 2] = radius * ring.cosLat[i] * (ring.sinLon[i] * cc - ring.cosLon[i] * sc)
    xy[i * 2 + 1] = radius * ring.sinLat[i]
  }
  return xy
}

// From a list of {lat, lon} points (WorldMap.twilightRings).
function prepareLatLon(points) {
  var flat = []
  for (var i = 0; i < points.length; i++) {
    if (i > 0) appendSampled(flat, points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon)
    flat.push(points[i].lat, points[i].lon)
  }
  if (points.length > 2) appendSampled(flat, points[points.length - 1].lat, points[points.length - 1].lon, points[0].lat, points[0].lon)
  return prepare(flat)
}

// The whole data file in lat/lon, cached for the process (a .pragma
// library is shared by every view). The key is cheap but tells files apart.
var cache = { key: "", land: null, zones: null }

function dataKey(data) {
  var first = data.land && data.land[0] ? data.land[0].slice(0, 4).join(",") : ""
  return [data.version, data.scale, data.land ? data.land.length : 0, data.zones ? data.zones.length : 0, first].join("|")
}

function prepareData(data, unproject) {
  if (!data || !data.land || !data.zones) return null
  var key = dataKey(data)
  if (cache.key === key && cache.land) return cache
  var scale = data.scale || 10000
  var land = []
  for (var l = 0; l < data.land.length; l++) land.push(prepare(ringLatLon(data.land[l], scale, unproject)))
  var zones = []
  for (var z = 0; z < data.zones.length; z++) {
    var rings = []
    for (var r = 0; r < data.zones[z].r.length; r++) rings.push(prepare(ringLatLon(data.zones[z].r[r], scale, unproject)))
    zones.push({ o: data.zones[z].o, rings: rings })
  }
  cache = { key: key, land: land, zones: zones }
  return cache
}

// ---- Clipping to the front hemisphere ----

// The copies k of the visible band [c − 90 + 360k, c + 90 + 360k] that a
// longitude range touches.
function bands(lo, hi, centerLon) {
  var c = wrapLon(centerLon)
  var list = []
  var first = Math.ceil((lo - c - 90) / 360)
  var last = Math.floor((hi - c + 90) / 360)
  for (var k = first; k <= last; k++) list.push([c - 90 + 360 * k, c + 90 + 360 * k])
  return list
}

// One Sutherland–Hodgman pass over a flat lat/lon ring: keep lon ≥ limit
// (side 1) or lon ≤ limit (side −1).
function clipPass(flat, limit, side) {
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

// Fills: a prepared ring as polygons on the front, each a flat [x0, y0, ...]
// array relative to the centre, y north. Edges along the cut follow the rim.
function frontPolygons(ring, centerLon, radius) {
  var result = []
  var copies = bands(ring.lo, ring.hi, centerLon)
  for (var b = 0; b < copies.length; b++) {
    var lo = copies[b][0]
    var hi = copies[b][1]
    if (ring.lo >= lo && ring.hi <= hi) {
      var whole = projectWhole(ring, centerLon, radius)
      if (polygonArea(whole) > 1e-6 * radius * radius) result.push(whole)
      continue
    }
    var flat = ring.p
    if (ring.lo < lo) flat = clipPass(flat, lo, 1)
    if (ring.hi > hi) flat = clipPass(flat, hi, -1)
    var n = flat.length / 2
    if (n < 3) continue
    var xy = []
    var cLon = (lo + hi) / 2
    for (var i = 0; i < n; i++) {
      var lat = flat[i * 2], lon = flat[i * 2 + 1]
      var j = (i + 1) % n
      var nextLat = flat[j * 2], nextLon = flat[j * 2 + 1]
      pushOrtho(xy, lat, lon, cLon, radius)
      // Along the rim: sample the cut so it bends with the circle.
      if ((lon === lo && nextLon === lo) || (lon === hi && nextLon === hi)) {
        var steps = Math.ceil(Math.abs(nextLat - lat) / STEP)
        for (var k = 1; k < steps; k++) pushOrtho(xy, lat + (nextLat - lat) * k / steps, lon, cLon, radius)
      }
    }
    if (polygonArea(xy) > 1e-6 * radius * radius) result.push(xy)
  }
  return result
}

function pushOrtho(xy, lat, lon, centerLon, radius) {
  var phi = lat * RAD
  var c = Math.cos(phi)
  xy.push(radius * c * Math.sin((lon - centerLon) * RAD), radius * Math.sin(phi))
}

function pushCached(xy, ring, i, cc, sc, radius) {
  xy.push(radius * ring.cosLat[i] * (ring.sinLon[i] * cc - ring.cosLon[i] * sc), radius * ring.sinLat[i])
}

function polygonArea(xy) {
  var total = 0
  for (var i = 0, j = xy.length - 2; i < xy.length; j = i, i += 2) total += xy[j] * xy[i + 1] - xy[i] * xy[j + 1]
  return Math.abs(total) / 2
}

// An edge of the data that is a seam, not a coast: along ±180° or a pole.
function seam(lat0, lon0, lat1, lon1) {
  if (Math.abs(lat0) >= 89.99 && Math.abs(lat1) >= 89.99) return true
  return Math.abs(lon0) >= 179.99 && Math.abs(lon1) >= 179.99 && lon0 * lon1 > 0
}

// Strokes: a prepared ring as the visible runs of its edges, each a flat
// [x0, y0, ...] polyline. Nothing is drawn along the rim.
function frontLines(ring, centerLon, radius) {
  var result = []
  var copies = bands(ring.lo, ring.hi, centerLon)
  var flat = ring.p
  var n = flat.length / 2
  for (var b = 0; b < copies.length; b++) {
    var lo = copies[b][0]
    var hi = copies[b][1]
    var cLon = (lo + hi) / 2
    if (ring.lo >= lo && ring.hi <= hi && !ring.seams) {
      var whole = projectWhole(ring, centerLon, radius)
      whole.push(whole[0], whole[1])
      result.push(whole)
      continue
    }
    var line = null
    var cc = Math.cos(centerLon * RAD)
    var sc = Math.sin(centerLon * RAD)
    for (var i = 0; i < n; i++) {
      var j = (i + 1) % n
      var lat0 = flat[i * 2], lon0 = flat[i * 2 + 1]
      var lat1 = flat[j * 2], lon1 = flat[j * 2 + 1]
      var t0 = 0
      var t1 = 1
      if (seam(lat0, lon0, lat1, lon1)) t0 = 2
      else if (lon1 === lon0) {
        if (lon0 < lo || lon0 > hi) t0 = 2
      } else {
        var ta = (lo - lon0) / (lon1 - lon0)
        var tb = (hi - lon0) / (lon1 - lon0)
        t0 = Math.max(0, Math.min(ta, tb))
        t1 = Math.min(1, Math.max(ta, tb))
      }
      if (t0 >= t1) {
        if (line && line.length >= 4) result.push(line)
        line = null
        continue
      }
      if (!line || t0 > 0) {
        if (line && line.length >= 4) result.push(line)
        line = []
        if (t0 === 0) pushCached(line, ring, i, cc, sc, radius)
        else pushOrtho(line, lat0 + (lat1 - lat0) * t0, lon0 + (lon1 - lon0) * t0, cLon, radius)
      }
      if (t1 === 1) pushCached(line, ring, j, cc, sc, radius)
      else pushOrtho(line, lat0 + (lat1 - lat0) * t1, lon0 + (lon1 - lon0) * t1, cLon, radius)
      if (t1 < 1) {
        if (line.length >= 4) result.push(line)
        line = null
      }
    }
    if (line && line.length >= 4) result.push(line)
  }
  return result
}

// The meridians every `step` degrees and the equator, as polylines on the
// front.
function gridLines(centerLon, radius, step) {
  var lines = []
  for (var lon = -180; lon < 180; lon += step) {
    var d = shortestTurn(centerLon, lon)
    if (Math.abs(d) > 90) continue
    var meridian = []
    for (var lat = -90; lat <= 90; lat += 3) pushOrtho(meridian, lat, d, 0, radius)
    lines.push(meridian)
  }
  var equator = []
  for (var e = -90; e <= 90; e += 3) pushOrtho(equator, 0, e, 0, radius)
  lines.push(equator)
  return lines
}

// ---- The tilted, zoomable view (More Weather's globe) ----
//
// The functions above keep the equator through the middle. These look at
// any point (centerLat, centerLon), the poles included, and work in 3D:
// a place is a unit vector (x towards 0° 0°, y towards 0° 90° E, z to the
// north pole), the view's 3×3 matrix (viewMatrix) turns it into x′ (east at
// the centre, to the right), y′ (north, up) and z′ (towards the viewer).
// The front is z′ ≥ 0 and its edge, the rim, the circle x′² + y′² = 1.
// Projected points are px relative to the disc's centre, y up (the view
// flips y when it draws). Zooming in is a radius larger than the viewport;
// clipping to the viewport is left to the caller.
//
// Rings are prepared once (prepareVectors): edges sampled to STEP degrees
// of latitude and longitude, wound counter-clockwise in longitude/latitude
// so their inside lies to the left as seen from outside, and bounded by a
// cap around their centre, so a ring wholly on the front or the back costs
// one dot product per frame. Clipping cuts each edge where z′ changes sign;
// fills join the cuts along the rim, counter-clockwise from where the ring
// leaves the front to where it comes back (frontPolygonsView).

// The view looking at (centerLat, centerLon): the rows are the unit vectors
// east, north and forward (towards the viewer) at that point.
function viewMatrix(centerLat, centerLon) {
  var p = Math.max(-90, Math.min(90, Number(centerLat) || 0)) * RAD
  var l = (Number(centerLon) || 0) * RAD
  var sp = Math.sin(p), cp = Math.cos(p), sl = Math.sin(l), cl = Math.cos(l)
  return [-sl, cl, 0, -sp * cl, -sp * sl, cp, cp * cl, cp * sl, sp]
}

// A ring for the view: points as [lat0, lon0, lat1, lon1, ...] (as
// ringLatLon gives them) or [{ lat, lon }, ...], the inside of the ring as a
// plain lat/lon polygon (as on a flat map). Returns
//   { v: Float32Array [x, y, z, ...], n, seam: Uint8Array (edge i → i+1 is
//     a seam of the data, along ±180° or a pole: never stroked),
//     c: [x, y, z] the centre, sinMax: sine of the largest angle from it
//     (−1 when the ring is wider than a hemisphere), inner: whether the
//     inside holds the centre }.
function prepareVectors(points) {
  var flat = []
  var i
  if (points.length && typeof points[0] === "object") {
    for (i = 0; i < points.length; i++) flat.push(points[i].lat, points[i].lon)
  } else {
    for (i = 0; i < points.length; i++) flat.push(Number(points[i]))
  }
  var count = flat.length / 2
  // Counter-clockwise in longitude (x) and latitude (y).
  var area = 0
  for (i = 0; i < count; i++) {
    var j = (i + 1) % count
    area += flat[i * 2 + 1] * flat[j * 2] - flat[j * 2 + 1] * flat[i * 2]
  }
  if (area < 0) {
    var reversed = []
    for (i = count - 1; i >= 0; i--) reversed.push(flat[i * 2], flat[i * 2 + 1])
    flat = reversed
  }
  // Sampled to STEP degrees; edges along a pole stay one edge.
  var sampled = []
  var seams = []
  for (i = 0; i < count; i++) {
    var k = (i + 1) % count
    var lat0 = flat[i * 2], lon0 = flat[i * 2 + 1], lat1 = flat[k * 2], lon1 = flat[k * 2 + 1]
    var isSeam = seam(lat0, lon0, lat1, lon1)
    sampled.push(lat0, lon0)
    seams.push(isSeam ? 1 : 0)
    if (Math.abs(lat0) >= 89.99 && Math.abs(lat1) >= 89.99) continue
    var before = sampled.length
    appendSampled(sampled, lat0, lon0, lat1, lon1)
    for (var s = before; s < sampled.length; s += 2) seams.push(isSeam ? 1 : 0)
  }
  var n = sampled.length / 2
  var v = new Float32Array(n * 3)
  var cx = 0, cy = 0, cz = 0
  for (i = 0; i < n; i++) {
    var phi = sampled[i * 2] * RAD
    var lam = sampled[i * 2 + 1] * RAD
    var x = Math.cos(phi) * Math.cos(lam), y = Math.cos(phi) * Math.sin(lam), z = Math.sin(phi)
    v[i * 3] = x; v[i * 3 + 1] = y; v[i * 3 + 2] = z
    cx += x; cy += y; cz += z
  }
  var length = Math.sqrt(cx * cx + cy * cy + cz * cz)
  var c = length > 1e-9 ? [cx / length, cy / length, cz / length] : [0, 0, 1]
  var minDot = 1
  for (i = 0; i < n; i++) minDot = Math.min(minDot, v[i * 3] * c[0] + v[i * 3 + 1] * c[1] + v[i * 3 + 2] * c[2])
  // Seen from outside above its centre, an inside on the centre's side runs
  // counter-clockwise.
  var inner = true
  var sinMax = -1
  if (length > 1e-9 && minDot > 0) {
    sinMax = Math.sqrt(Math.max(0, 1 - minDot * minDot))
    var m = viewMatrix(Math.asin(Math.max(-1, Math.min(1, c[2]))) / RAD, Math.atan2(c[1], c[0]) / RAD)
    var turn = 0
    for (i = 0; i < n; i++) {
      var a = (i + n - 1) % n
      turn += dotRow(m, 0, v, a) * dotRow(m, 3, v, i) - dotRow(m, 0, v, i) * dotRow(m, 3, v, a)
    }
    inner = turn >= 0
  }
  return { v: v, n: n, seam: new Uint8Array(seams), c: c, sinMax: sinMax, inner: inner }
}

// Every land ring of data/globe-land.json ({ scale, land: [[lon, lat, ...]] }),
// prepared once for the process; null without data.
var landCache = { key: "", rings: null }

function prepareLand(data) {
  if (!data || !data.land) return null
  var first = data.land[0] ? data.land[0].slice(0, 4).join(",") : ""
  var key = [data.version, data.scale, data.land.length, first].join("|")
  if (landCache.key === key && landCache.rings) return landCache.rings
  var scale = data.scale || 100
  var rings = []
  for (var r = 0; r < data.land.length; r++) {
    var ring = data.land[r]
    var flat = []
    for (var i = 0; i < ring.length; i += 2) flat.push(ring[i + 1] / scale, ring[i] / scale)
    rings.push(prepareVectors(flat))
  }
  landCache = { key: key, rings: rings }
  return rings
}

function dotRow(m, row, v, i) {
  return m[row] * v[i * 3] + m[row + 1] * v[i * 3 + 1] + m[row + 2] * v[i * 3 + 2]
}

// A place in the view: projectView(lat, lon, matrix, radius) or
// projectView([x, y, z], matrix, radius). { x, y, visible }, y up.
function projectView(a, b, c, d) {
  var vec, m, radius
  if (typeof a === "number") {
    var phi = a * RAD, lam = b * RAD
    vec = [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)]
    m = c
    radius = d
  } else {
    vec = a
    m = b
    radius = c
  }
  var x = m[0] * vec[0] + m[1] * vec[1] + m[2] * vec[2]
  var y = m[3] * vec[0] + m[4] * vec[1] + m[5] * vec[2]
  var z = m[6] * vec[0] + m[7] * vec[1] + m[8] * vec[2]
  return { x: radius * x, y: radius * y, visible: z >= -1e-9 }
}

// The place under a point of the view, null off the globe.
function unprojectView(x, y, m, radius) {
  if (!(radius > 0)) return null
  var u = x / radius, w = y / radius
  var q = u * u + w * w
  if (q > 1 + 1e-9) return null
  var f = Math.sqrt(Math.max(0, 1 - q))
  var vx = u * m[0] + w * m[3] + f * m[6]
  var vy = u * m[1] + w * m[4] + f * m[7]
  var vz = u * m[2] + w * m[5] + f * m[8]
  return { lat: Math.asin(Math.max(-1, Math.min(1, vz))) / RAD, lon: Math.atan2(vy, vx) / RAD }
}

// Where a prepared ring stands: 1 wholly in front, -1 wholly behind, 0 it
// may cross the rim.
function ringSide(ring, m) {
  if (ring.sinMax < 0) return 0
  var cz = m[6] * ring.c[0] + m[7] * ring.c[1] + m[8] * ring.c[2]
  if (cz >= ring.sinMax) return 1
  if (cz <= -ring.sinMax) return -1
  return 0
}

// The ring in view coordinates (unit), as three arrays.
function viewPoints(ring, m) {
  var n = ring.n, v = ring.v
  var xs = new Float64Array(n), ys = new Float64Array(n), zs = new Float64Array(n)
  for (var i = 0; i < n; i++) {
    var x = v[i * 3], y = v[i * 3 + 1], z = v[i * 3 + 2]
    xs[i] = m[0] * x + m[1] * y + m[2] * z
    ys[i] = m[3] * x + m[4] * y + m[5] * z
    zs[i] = m[6] * x + m[7] * y + m[8] * z
  }
  return { x: xs, y: ys, z: zs }
}

// The angle between rim samples for a radius: at most STEP degrees, finer
// when zoomed in so the rim stays round (half a pixel off at most).
function rimStep(radius) {
  var fine = radius > 1 ? 2 * Math.acos(Math.max(-1, 1 - 0.5 / radius)) : STEP * RAD
  return Math.max(0.25 * RAD, Math.min(STEP * RAD, fine))
}

// Points along the rim from angle a, turning by `turn` (radians, either
// way), the end points left out.
function pushRim(xy, a, turn, radius) {
  var steps = Math.ceil(Math.abs(turn) / rimStep(radius))
  for (var k = 1; k < steps; k++) {
    var t = a + turn * k / steps
    xy.push(radius * Math.cos(t), radius * Math.sin(t))
  }
}

// The whole disc as a polygon, counter-clockwise.
function discPolygon(radius) {
  var xy = [radius, 0]
  pushRim(xy, 0, 2 * Math.PI, radius)
  return xy
}

function wholePolygon(p, n, radius) {
  var xy = new Array(n * 2)
  for (var i = 0; i < n; i++) {
    xy[i * 2] = radius * p.x[i]
    xy[i * 2 + 1] = radius * p.y[i]
  }
  return xy
}

function signedArea(xy) {
  var total = 0
  for (var i = 0, j = xy.length - 2; i < xy.length; j = i, i += 2) total += xy[j] * xy[i + 1] - xy[i] * xy[j + 1]
  return total / 2
}

// The point where edge i → j crosses z′ = 0, pushed onto the rim; returns
// its angle.
function pushCut(xy, p, i, j, radius) {
  var t = p.z[i] / (p.z[i] - p.z[j])
  var x = p.x[i] + (p.x[j] - p.x[i]) * t
  var y = p.y[i] + (p.y[j] - p.y[i]) * t
  var a = Math.atan2(y, x)
  xy.push(radius * Math.cos(a), radius * Math.sin(a))
  return a
}

// Fills: a prepared ring's part on the front as polygons, each a flat
// [x0, y0, ...] array in px, y up, filled with the non-zero or even-odd
// rule. A ring whose inside holds the whole front gives the disc (with the
// ring cut out when it is in front).
function frontPolygonsView(ring, m, radius) {
  var side = ringSide(ring, m)
  if (side < 0) return ring.inner ? [] : [discPolygon(radius)]
  var p = viewPoints(ring, m)
  var n = ring.n
  var start = -1
  for (var i = 0; i < n && start < 0; i++) if (p.z[i] < 0) start = i
  if (start < 0) {
    var whole = wholePolygon(p, n, radius)
    var inner = ring.sinMax >= 0 ? ring.inner : signedArea(whole) >= 0
    return inner ? [whole] : [discPolygon(radius), whole]
  }
  var anyFront = false
  for (i = 0; i < n && !anyFront; i++) if (p.z[i] >= 0) anyFront = true
  if (!anyFront) {
    if (ring.sinMax >= 0) return ring.inner ? [] : [discPolygon(radius)]
    // Wider than a hemisphere and wholly behind: seen from the front it
    // runs clockwise when its inside is the far side.
    return signedArea(wholePolygon(p, n, radius)) > 0 ? [discPolygon(radius)] : []
  }
  // The runs on the front, each from where it comes in to where it leaves.
  var runs = []
  var run = null
  for (var k = 0; k < n; k++) {
    var a = (start + k) % n
    var b = (a + 1) % n
    var za = p.z[a], zb = p.z[b]
    if (za < 0 && zb >= 0) {
      run = { xy: [], enter: 0, leave: 0 }
      run.enter = pushCut(run.xy, p, a, b, radius)
      if (zb > 0) run.xy.push(radius * p.x[b], radius * p.y[b])
    } else if (za >= 0 && zb >= 0) {
      if (run) run.xy.push(radius * p.x[b], radius * p.y[b])
    } else if (za >= 0 && zb < 0) {
      if (run) {
        run.leave = pushCut(run.xy, p, a, b, radius)
        runs.push(run)
      }
      run = null
    }
  }
  // Joined along the rim: from each exit counter-clockwise to the next entry.
  var result = []
  var used = new Array(runs.length)
  for (var r0 = 0; r0 < runs.length; r0++) {
    if (used[r0]) continue
    var xy = []
    var r = r0
    for (var guard = 0; guard <= runs.length; guard++) {
      used[r] = true
      var current = runs[r]
      for (var q = 0; q < current.xy.length; q++) xy.push(current.xy[q])
      var best = r0
      var bestTurn = Infinity
      for (var c = 0; c < runs.length; c++) {
        var turn = runs[c].enter - current.leave
        turn = ((turn % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        if (turn < bestTurn) { bestTurn = turn; best = c }
      }
      pushRim(xy, current.leave, bestTurn, radius)
      r = best
      if (used[r]) break
    }
    if (xy.length >= 6) result.push(xy)
  }
  return result
}

// The visible runs of a polyline of unit vectors in view coordinates p,
// edges i → i+1 (closed: the last back to the first) unless skip[i].
function visibleRuns(p, n, closed, skip, radius) {
  var lines = []
  var edges = closed ? n : n - 1
  // Start where a line breaks (a point behind, a skipped edge), so none is
  // split at the array's end.
  var start = 0
  if (closed) {
    start = -1
    for (var i = 0; i < n && start < 0; i++) if (p.z[i] < 0 || (skip && skip[i])) start = i
    if (start < 0) {
      var whole = wholePolygon(p, n, radius)
      whole.push(whole[0], whole[1])
      return [whole]
    }
  }
  var line = null
  for (var k = 0; k < edges; k++) {
    var a = (start + k) % n
    var b = (a + 1) % n
    var za = p.z[a], zb = p.z[b]
    if ((skip && skip[a]) || (za < 0 && zb < 0)) {
      if (line && line.length >= 4) lines.push(line)
      line = null
      continue
    }
    if (za < 0) {
      line = []
      pushCut(line, p, a, b, radius)
      line.push(radius * p.x[b], radius * p.y[b])
      continue
    }
    if (!line) line = [radius * p.x[a], radius * p.y[a]]
    if (zb < 0) {
      pushCut(line, p, a, b, radius)
      if (line.length >= 4) lines.push(line)
      line = null
    } else {
      line.push(radius * p.x[b], radius * p.y[b])
    }
  }
  if (line && line.length >= 4) lines.push(line)
  return lines
}

// Strokes: a prepared ring's visible runs, each a flat [x0, y0, ...]
// polyline in px; cut at the rim, never drawn along it, seams left out.
function frontLinesView(ring, m, radius) {
  if (ringSide(ring, m) < 0) return []
  return visibleRuns(viewPoints(ring, m), ring.n, true, ring.seam, radius)
}

// The spherical cap within `angularRadiusDeg` of (axisLat, axisLon), on the
// front, as polygons in px for the even-odd rule: [] when it is wholly
// behind, [disc] when it covers the front, [disc, edge] when only the
// small cap on the other side is missing, else one polygon (the cap's
// edge, then the rim inside the cap).
// The night side is the cap round the point opposite the sun with radius
// 90° + elevation (Sky.sunElevation below it).
function capPolygonView(axisLat, axisLon, angularRadiusDeg, m, radius) {
  var rho = Math.max(0, Math.min(180, Number(angularRadiusDeg))) * RAD
  var a = projectView(axisLat, axisLon, m, 1)
  var ax = a.x, ay = a.y
  var az = m[6] * Math.cos(axisLat * RAD) * Math.cos(axisLon * RAD) + m[7] * Math.cos(axisLat * RAD) * Math.sin(axisLon * RAD) + m[8] * Math.sin(axisLat * RAD)
  var theta = Math.acos(Math.max(-1, Math.min(1, az)))
  var half = Math.PI / 2
  if (theta - rho >= half) return []
  if (rho - theta >= half) return [discPolygon(radius)]
  // The edge wholly in front: the cap itself, or the disc without the
  // small cap on the other side.
  if (theta + rho <= half + 1e-12) return rho <= 0 ? [] : [circleView(ax, ay, az, rho, radius)]
  if (theta + rho >= 3 * half - 1e-12) return [discPolygon(radius), circleView(ax, ay, az, rho, radius)]
  var h = Math.sqrt(ax * ax + ay * ay)
  var cosRho = Math.cos(rho), sinRho = Math.sin(rho)
  // On the cap's edge p(t) = cos ρ·a + sin ρ·(cos t·u + sin t·w), with u
  // the direction towards the viewer across the edge: z′(t) ≥ 0 for
  // cos t ≥ −cos ρ·a_z / (sin ρ·h).
  var ux = -az * ax / h, uy = -az * ay / h, uz = h
  var wx = ay * uz - az * uy, wy = az * ux - ax * uz
  var t0 = Math.acos(Math.max(-1, Math.min(1, -cosRho * az / (sinRho * h))))
  var steps = Math.max(2, Math.ceil(2 * t0 * sinRho / rimStep(radius)))
  var xy = []
  for (var k = 0; k <= steps; k++) {
    var t = -t0 + 2 * t0 * k / steps
    var x = cosRho * ax + sinRho * (Math.cos(t) * ux + Math.sin(t) * wx)
    var y = cosRho * ay + sinRho * (Math.cos(t) * uy + Math.sin(t) * wy)
    if (k === 0 || k === steps) {
      var len = Math.sqrt(x * x + y * y) || 1
      x /= len
      y /= len
    }
    xy.push(radius * x, radius * y)
  }
  // Back along the rim through the cap's middle (angle of a′).
  var from = Math.atan2(xy[xy.length - 1], xy[xy.length - 2])
  var to = Math.atan2(xy[1], xy[0])
  var mid = Math.atan2(ay, ax)
  var turn = ((to - from) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
  var toMid = ((mid - from) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
  if (toMid > turn) turn -= 2 * Math.PI
  pushRim(xy, from, turn, radius)
  return [xy]
}

// A small circle wholly in front, as a polygon.
function circleView(ax, ay, az, rho, radius) {
  // Any two unit vectors across the axis.
  var ux, uy, uz
  if (Math.abs(az) < 0.9) { ux = -ay; uy = ax; uz = 0 } else { ux = 0; uy = -az; uz = ay }
  var lu = Math.sqrt(ux * ux + uy * uy + uz * uz)
  ux /= lu; uy /= lu; uz /= lu
  var wx = ay * uz - az * uy, wy = az * ux - ax * uz
  var cosRho = Math.cos(rho), sinRho = Math.sin(rho)
  var steps = Math.max(8, Math.ceil(2 * Math.PI * sinRho / rimStep(radius)))
  var xy = []
  for (var k = 0; k < steps; k++) {
    var t = 2 * Math.PI * k / steps
    xy.push(radius * (cosRho * ax + sinRho * (Math.cos(t) * ux + Math.sin(t) * wx)),
      radius * (cosRho * ay + sinRho * (Math.cos(t) * uy + Math.sin(t) * wy)))
  }
  return xy
}

// Meridians and parallels every `stepDeg` degrees (the poles left out), as
// polylines on the front in px.
function gridLinesView(m, radius, stepDeg) {
  var step = Number(stepDeg) > 0 ? Number(stepDeg) : 30
  var lines = []
  var lat, lon
  function add(points, closed) {
    var n = points.length / 2
    var p = { x: new Float64Array(n), y: new Float64Array(n), z: new Float64Array(n) }
    for (var i = 0; i < n; i++) {
      var phi = points[i * 2] * RAD, lam = points[i * 2 + 1] * RAD
      var x = Math.cos(phi) * Math.cos(lam), y = Math.cos(phi) * Math.sin(lam), z = Math.sin(phi)
      p.x[i] = m[0] * x + m[1] * y + m[2] * z
      p.y[i] = m[3] * x + m[4] * y + m[5] * z
      p.z[i] = m[6] * x + m[7] * y + m[8] * z
    }
    var runs = visibleRuns(p, n, closed, null, radius)
    for (var r = 0; r < runs.length; r++) lines.push(runs[r])
  }
  for (lon = -180; lon < 180; lon += step) {
    var meridian = []
    for (lat = -90; lat <= 90; lat += STEP) meridian.push(lat, lon)
    add(meridian, false)
  }
  for (lat = -90 + step; lat < 90; lat += step) {
    var parallel = []
    for (lon = -180; lon < 180; lon += STEP) parallel.push(lat, lon)
    add(parallel, true)
  }
  return lines
}

if (typeof module !== "undefined") module.exports = {
  wrapLon: wrapLon, projectOrtho: projectOrtho, unprojectOrtho: unprojectOrtho, shortestTurn: shortestTurn,
  ringLatLon: ringLatLon, prepare: prepare, prepareLatLon: prepareLatLon, prepareData: prepareData,
  frontPolygons: frontPolygons, frontLines: frontLines, gridLines: gridLines, polygonArea: polygonArea,
  viewMatrix: viewMatrix, prepareVectors: prepareVectors, prepareLand: prepareLand, projectView: projectView,
  unprojectView: unprojectView, frontPolygonsView: frontPolygonsView, frontLinesView: frontLinesView,
  capPolygonView: capPolygonView, gridLinesView: gridLinesView
}
