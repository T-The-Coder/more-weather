.pragma library

// Wind particles on the sphere for the globe section: the arithmetic only,
// no drawing. Pure functions, tested in Node (tests/globe-streaks.test.mjs).
//
// Units: the u and v lattices hold the wind's east and north components in
// m/s (uvLattices() makes them from Open-Meteo's wind_speed_10m in km/h and
// wind_direction_10m in degrees). Times are seconds, angles degrees.
//
// A particle is { lat, lon, age, life } (age and life in seconds of real
// time). step() moves every particle along the wind for dt × speedScale
// seconds of simulated time (a 10 m/s wind and speedScale 10000 cover
// 100 km, about 0.9°, per second) and returns the segments to draw;
// particles that grow old, leave the box, meet unknown wind or come within
// 2° of a pole start again at a random place.
//
// A box is { south, north, west, east } in degrees (west > east crosses the
// date line); null is the whole globe.

var EARTH_RADIUS_M = 6371000
var RAD = Math.PI / 180
var MAX_LAT = 88
var LIFE_MIN = 3
var LIFE_MAX = 8

// A small seeded random generator (mulberry32) for tests and repeatable
// pictures: a function returning 0 ≤ x < 1.
function seededRandom(seed) {
  var state = (Number(seed) || 0) >>> 0
  return function () {
    state = (state + 0x6D2B79F5) >>> 0
    var t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function normalizeLon(lon) {
  return ((lon + 180) % 360 + 360) % 360 - 180
}

// The box's longitudes eastwards from west, in degrees (0 … 360].
function lonSpan(box) {
  var span = box.east - box.west
  return span > 0 ? span : span + 360
}

function inBox(box, lat, lon) {
  if (Math.abs(lat) > MAX_LAT) return false
  if (!box) return true
  if (lat < box.south || lat > box.north) return false
  var east = ((lon - box.west) % 360 + 360) % 360
  return east <= lonSpan(box) + 1e-9
}

// A place uniform by area on the sphere (or in the box), within ±88°.
function randomPlace(box, random) {
  var south = Math.max(-MAX_LAT, box ? box.south : -MAX_LAT)
  var north = Math.min(MAX_LAT, box ? box.north : MAX_LAT)
  var s0 = Math.sin(south * RAD), s1 = Math.sin(north * RAD)
  var lat = Math.asin(s0 + random() * (s1 - s0)) / RAD
  var lon = box ? normalizeLon(box.west + random() * lonSpan(box)) : -180 + random() * 360
  return { lat: lat, lon: lon }
}

// A fresh particle; `staggered` starts it part-way through its life, so a
// newly seeded field does not die all at once.
function spawn(box, random, staggered) {
  var place = randomPlace(box, random)
  var life = LIFE_MIN + random() * (LIFE_MAX - LIFE_MIN)
  return { lat: place.lat, lon: place.lon, age: staggered ? random() * life : 0, life: life }
}

// `count` particles uniform by area, ages spread over their lives.
function seed(count, box, random) {
  random = random || Math.random
  var particles = []
  for (var i = 0; i < count; i++) particles.push(spawn(box || null, random, true))
  return particles
}

// Bilinear value at (lat, lon); NaN outside a box lattice or where a corner
// is unknown. A wrapping lattice takes any longitude.
function valueAt(lattice, lat, lon) {
  if (!lattice || !lattice.values) return NaN
  var cols = lattice.cols, rows = lattice.rows
  var fy = (lat - lattice.south) / (lattice.north - lattice.south) * (rows - 1)
  if (!(fy >= 0 && fy <= rows - 1)) return NaN
  var fx
  var ring = cols
  if (lattice.wrap) {
    var dx = (lattice.east - lattice.west) / (cols - 1)
    if (Math.abs(lattice.east - lattice.west - 360) < 1e-6) ring = cols - 1
    fx = (((lon - lattice.west) % 360) + 360) % 360 / dx
    if (fx >= ring) fx -= ring
  } else {
    fx = (lon - lattice.west) / (lattice.east - lattice.west) * (cols - 1)
    if (!(fx >= 0 && fx <= cols - 1)) return NaN
  }
  var x0 = Math.floor(fx), y0 = Math.floor(fy)
  var x1 = lattice.wrap ? (x0 + 1) % ring : Math.min(x0 + 1, cols - 1)
  var y1 = Math.min(y0 + 1, rows - 1)
  var tx = fx - x0, ty = fy - y0
  var v = lattice.values
  var a = v[y0 * cols + x0], b = v[y0 * cols + x1], c = v[y1 * cols + x0], d = v[y1 * cols + x1]
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty
}

// Moves every particle (in place) and returns the segments to draw:
// [[lat0, lon0, lat1, lon1, speed], …] with speed the wind in m/s. lon1 is
// lon0 plus the step, not wrapped, so a segment across the date line stays
// short; the particle itself keeps its longitude within −180 … 180.
// Particles re-seeded in this step draw nothing.
function step(particles, uLattice, vLattice, dtSeconds, speedScale, box, random) {
  random = random || Math.random
  box = box || null
  var segments = []
  var dt = Number(dtSeconds) || 0
  var seconds = dt * (Number(speedScale) || 1)
  var minCos = Math.cos(89 * RAD)
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i]
    p.age += dt
    var u = valueAt(uLattice, p.lat, p.lon), v = valueAt(vLattice, p.lat, p.lon)
    if (p.age > p.life || u !== u || v !== v || !inBox(box, p.lat, p.lon)) {
      particles[i] = spawn(box, random, false)
      continue
    }
    var dLat = v * seconds / EARTH_RADIUS_M / RAD
    var dLon = u * seconds / (EARTH_RADIUS_M * Math.max(minCos, Math.cos(p.lat * RAD))) / RAD
    var lat1 = p.lat + dLat, lon1 = p.lon + dLon
    if (!inBox(box, lat1, lon1)) {
      particles[i] = spawn(box, random, false)
      continue
    }
    segments.push([p.lat, p.lon, lat1, lon1, Math.sqrt(u * u + v * v)])
    p.lat = lat1
    p.lon = normalizeLon(lon1)
  }
  return segments
}

// The wind's east (u) and north (v) components from its speed and the
// meteorological direction (where it comes FROM, degrees clockwise from
// north), in the speed's unit: a north wind (0°) blows southwards.
function uvFromSpeedDirection(speed, directionDeg) {
  var a = directionDeg * RAD
  return { u: -speed * Math.sin(a), v: -speed * Math.cos(a) }
}

// Factors from a speed unit to m/s.
var TO_MS = { "kmh": 1 / 3.6, "km/h": 1 / 3.6, "ms": 1, "m/s": 1, "kn": 0.514444, "mph": 0.44704 }

// u and v lattices (m/s) from a speed lattice (in `unit`, default km/h as
// Open-Meteo answers) and a direction lattice; the geometry is the speed
// lattice's, unknown where either is unknown.
function uvLattices(speedLattice, directionLattice, unit) {
  var factor = TO_MS[unit || "kmh"] || 1
  var n = speedLattice.values.length
  var us = new Array(n), vs = new Array(n)
  for (var i = 0; i < n; i++) {
    var s = speedLattice.values[i], d = directionLattice.values[i]
    if (typeof s !== "number" || typeof d !== "number" || s !== s || d !== d) { us[i] = NaN; vs[i] = NaN; continue }
    var uv = uvFromSpeedDirection(s * factor, d)
    us[i] = uv.u
    vs[i] = uv.v
  }
  function like(values) {
    return { south: speedLattice.south, north: speedLattice.north, west: speedLattice.west, east: speedLattice.east,
             cols: speedLattice.cols, rows: speedLattice.rows, wrap: !!speedLattice.wrap, values: values }
  }
  return { u: like(us), v: like(vs) }
}

if (typeof module !== "undefined") module.exports = {
  seededRandom: seededRandom, seed: seed, spawn: spawn, step: step, valueAt: valueAt, inBox: inBox,
  uvFromSpeedDirection: uvFromSpeedDirection, uvLattices: uvLattices,
  EARTH_RADIUS_M: EARTH_RADIUS_M, MAX_LAT: MAX_LAT, LIFE_MIN: LIFE_MIN, LIFE_MAX: LIFE_MAX
}
