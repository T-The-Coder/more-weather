.pragma library
.import "Sky.js" as Sky

// The Equal Earth projection (Šavrič, Patterson, Jenny 2018) for the More
// plugins' flat world maps, shared (tools/sync-shared.sh): places to map
// units and back, the map's outline and graticule, the day/night line and
// twilight areas as flat polygons, and land rings (data/globe-land.json)
// for drawing. Map units: x east, y north, |x| ≤ X_MAX, |y| ≤ Y_MAX; the
// view scales them and flips y. Pure, so the tests load it in Node.

var A1 = 1.340264
var A2 = -0.081106
var A3 = 0.000893
var A4 = 0.003796
var M = Math.sqrt(3) / 2
var RAD = Math.PI / 180

// Half width and half height of the whole map in projected units.
var X_MAX = 2.7066299836960743
var Y_MAX = 1.3173627591574133

function project(lat, lon) {
  var lam = lon * RAD
  var phi = Math.max(-90, Math.min(90, lat)) * RAD
  var theta = Math.asin(M * Math.sin(phi))
  var t2 = theta * theta
  var t6 = t2 * t2 * t2
  var x = 2 * Math.sqrt(3) * lam * Math.cos(theta) / (3 * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
  var y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
  return { x: x, y: y }
}

// The inverse, for hovering over the map: Newton's method on y, as in the
// published reference implementation. Null outside the map's outline.
function unproject(x, y) {
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
  var u2 = theta * theta
  var u6 = u2 * u2 * u2
  var lam = M * x * (A1 + 3 * A2 * u2 + u6 * (7 * A3 + 9 * A4 * u2)) / Math.cos(theta)
  var s = Math.sin(theta) / M
  if (Math.abs(s) > 1 || Math.abs(lam) > Math.PI + 1e-9) return null
  return { lat: Math.asin(s) / RAD, lon: lam / RAD }
}

// The map's outline: the ±180° meridians and the flat poles.
function outline() {
  var points = []
  for (var lat = -90; lat <= 90; lat += 2) points.push(project(lat, 180))
  for (lat = 90; lat >= -90; lat -= 2) points.push(project(lat, -180))
  return points
}

// Meridians every `stepDeg` degrees (15 when left out: one per hour of the
// ideal zones; the ±180° outline left out) and parallels every twice that
// (the poles left out), as point lists.
function graticule(stepDeg) {
  var step = Number(stepDeg) > 0 ? Number(stepDeg) : 15
  var lines = []
  for (var lon = -180 + step; lon < 180; lon += step) {
    var meridian = []
    for (var lat = -90; lat <= 90; lat += 3) meridian.push(project(lat, lon))
    lines.push(meridian)
  }
  for (lat = -90 + 2 * step; lat < 90; lat += 2 * step) {
    var parallel = []
    for (lon = -180; lon <= 180; lon += 3) parallel.push(project(lat, lon))
    lines.push(parallel)
  }
  return lines
}

// Where the sun stands below `elevationDeg`, as one closed polygon in
// projected units, for an even-odd fill clipped to the map's outline: 0 is
// the night side, −4 the end of the golden hour, −8 the end of the blue hour.
// The area is a cap around the point opposite the sun, of angular radius
// 90° + elevation. Its edge is traced every 2° of bearing with continuous
// longitudes; three copies, 360° apart, cover the map whatever the edge
// crosses (the outline clips them), joined by bridges that are walked there
// and back so they cancel out. An edge round a pole is closed along that
// pole; a cap holding both poles is the whole map minus the edge's loop.
// The signature is shared with the globe view; keep it stable.
function twilightPolygon(utcMs, elevationDeg) {
  var sun = Sky.subsolarPoint(utcMs)
  var lat0 = -sun.lat * RAD
  var lon0 = ((sun.lon + 360) % 360 - 180) * RAD
  var radius = Math.max(0.5, Math.min(179.5, 90 + Number(elevationDeg || 0))) * RAD
  // Points from the antisolar point at `radius`, longitudes unwrapped.
  var edge = []
  var previous = null
  var turn = 0
  for (var b = 0; b < 360; b += 2) {
    var bearing = b * RAD
    var lat = Math.asin(Math.sin(lat0) * Math.cos(radius) + Math.cos(lat0) * Math.sin(radius) * Math.cos(bearing))
    var lon = lon0 + Math.atan2(Math.sin(bearing) * Math.sin(radius) * Math.cos(lat0),
      Math.cos(radius) - Math.sin(lat0) * Math.sin(lat))
    lon = lon / RAD
    if (previous !== null) {
      while (lon - previous > 180) lon -= 360
      while (lon - previous < -180) lon += 360
      turn += lon - previous
    }
    edge.push({ lat: lat / RAD, lon: lon })
    previous = lon
  }
  var closing = edge[0].lon - previous
  while (closing > 180) closing -= 360
  while (closing < -180) closing += 360
  turn += closing

  var ring = edge
  var northInside = 90 - lat0 / RAD < 90 + Number(elevationDeg || 0)
  var southInside = 90 + lat0 / RAD < 90 + Number(elevationDeg || 0)
  if (Math.abs(turn) > 180) {
    // Round one pole: close along it, back to where the edge started.
    var pole = northInside ? 90 : -90
    var end = edge[edge.length - 1].lon + closing
    // Down the meridian, along the pole, up again: sampled, since a
    // meridian is curved on the map and copies meet along it.
    var down = pole > edge[0].lat ? 2 : -2
    ring = edge.slice()
    for (var m = edge[0].lat; (pole - m) * down > 0; m += down) ring.push({ lat: m, lon: end })
    var step = end > edge[0].lon ? -4 : 4
    for (var l = end; (l - edge[0].lon) * step < 0; l += step) ring.push({ lat: pole, lon: l })
    for (var u = pole; (u - edge[0].lat) * down > 0; u -= down) ring.push({ lat: u, lon: edge[0].lon })
  }

  var copies = []
  for (var c = -1; c <= 1; c++) {
    var copy = []
    for (var i = 0; i < ring.length; i++) copy.push(project(ring[i].lat, ring[i].lon + 360 * c))
    copy.push(copy[0])
    copies.push(copy)
  }
  var points = []
  // Holding both poles: the whole map, with the loop cut out.
  if (Math.abs(turn) <= 180 && northInside && southInside) {
    points.push({ x: -3 * X_MAX, y: -2 * Y_MAX }, { x: 3 * X_MAX, y: -2 * Y_MAX },
      { x: 3 * X_MAX, y: 2 * Y_MAX }, { x: -3 * X_MAX, y: 2 * Y_MAX }, { x: -3 * X_MAX, y: -2 * Y_MAX })
  }
  var anchors = []
  for (var k = 0; k < copies.length; k++) {
    anchors.push(copies[k][0])
    points = points.concat(copies[k])
  }
  // Back along the bridges to the start.
  for (var a = anchors.length - 2; a >= 0; a--) points.push(anchors[a])
  if (points.length && (points[0] !== anchors[0])) points.push(points[0])
  return points
}

// The night side (the sun below the horizon), see twilightPolygon.
function nightPolygon(utcMs) {
  return twilightPolygon(utcMs, 0)
}

// A lat/lon ring ([lon0, lat0, lon1, lat1, ...] divided by `scale`, 1 when
// left out; the rings of data/globe-land.json with scale 100) in map units:
//   { fill: [x0, y0, ...] the whole ring, to fill (a ring that does not jump
//     across ±180°, as the file's never do),
//     lines: [[x0, y0, ...], ...] the coast to stroke: cut where an edge
//     jumps across ±180° and without the edges along the outline (±180°)
//     or a pole, which are seams of the data, not coast }.
function ringToMap(ring, scale) {
  var s = Number(scale) > 0 ? Number(scale) : 1
  var n = Math.floor(ring.length / 2)
  var fill = []
  var lines = []
  var line = null
  for (var i = 0; i < n; i++) {
    var lon = ring[i * 2] / s, lat = ring[i * 2 + 1] / s
    var p = project(lat, lon)
    fill.push(p.x, p.y)
  }
  // Start after a break, so no line is split at the ring's end.
  var start = 0
  for (var k = 0; k < n; k++) {
    var prev = (k + n - 1) % n
    if (mapSeam(ring, prev, k, s)) { start = k; break }
  }
  for (var e = 0; e < n; e++) {
    var a = (start + e) % n
    var b = (a + 1) % n
    if (mapSeam(ring, a, b, s)) {
      if (line && line.length >= 4) lines.push(line)
      line = null
      continue
    }
    if (!line) line = [fill[a * 2], fill[a * 2 + 1]]
    line.push(fill[b * 2], fill[b * 2 + 1])
  }
  if (line && line.length >= 4) lines.push(line)
  return { fill: fill, lines: lines }
}

// Whether edge a → b of a ring is no coast: it jumps across ±180°, or runs
// along the outline or a pole.
function mapSeam(ring, a, b, s) {
  var lon0 = ring[a * 2] / s, lat0 = ring[a * 2 + 1] / s
  var lon1 = ring[b * 2] / s, lat1 = ring[b * 2 + 1] / s
  if (Math.abs(lon1 - lon0) > 180) return true
  if (Math.abs(lat0) >= 89.99 && Math.abs(lat1) >= 89.99) return true
  return Math.abs(lon0) >= 179.99 && Math.abs(lon1) >= 179.99 && lon0 * lon1 > 0
}

if (typeof module !== "undefined") module.exports = {
  project: project, unproject: unproject, X_MAX: X_MAX, Y_MAX: Y_MAX, outline: outline, graticule: graticule,
  twilightPolygon: twilightPolygon, nightPolygon: nightPolygon, ringToMap: ringToMap
}
