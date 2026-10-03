// The globe's wind particles (GlobeStreaks.js): seeding by area, moving
// along the wind on the sphere, re-seeding, and the u/v conversion.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const S = load("GlobeStreaks.js")
const close = (a, b, eps, what) => assert.ok(Math.abs(a - b) <= eps, `${what}: ${a} vs ${b}`)

function constant(value, box, wrap) {
  const cols = 9, rows = 9
  const b = box || { south: -90, north: 90, west: -180, east: 180 }
  return { ...b, cols, rows, wrap: wrap ?? !box, values: new Array(cols * rows).fill(value) }
}

const degPerMetre = 180 / Math.PI / S.EARTH_RADIUS_M

test("a west wind moves east by the expected degrees", () => {
  const u = constant(10), v = constant(0)
  for (const lat of [0, 60]) {
    const particles = [{ lat, lon: 20, age: 0, life: 100 }]
    const segments = S.step(particles, u, v, 0.5, 2000, null, S.seededRandom(1))
    const want = 10 * 1000 * degPerMetre / Math.cos(lat * Math.PI / 180)   // 10 m/s × 1000 s
    assert.equal(segments.length, 1)
    close(segments[0][3] - 20, want, 1e-9, `lat ${lat}`)
    close(segments[0][2], lat, 1e-12, "latitude kept")
    close(segments[0][4], 10, 1e-12, "speed")
    close(particles[0].lon, 20 + want, 1e-9, "particle moved")
    close(particles[0].age, 0.5, 1e-12, "aged")
  }
  close(10 * 1000 * degPerMetre, 0.0899, 1e-4, "about 0.09° per 10 km")
})

test("a south wind moves north, across the date line the particle wraps", () => {
  const north = S.step([{ lat: 10, lon: 0, age: 0, life: 9 }], constant(0), constant(20), 1, 1000, null, Math.random)
  close(north[0][2] - 10, 20 * 1000 * degPerMetre, 1e-9, "north")
  const particles = [{ lat: 0, lon: 179.95, age: 0, life: 9 }]
  const seg = S.step(particles, constant(10), constant(0), 1, 1000, null, Math.random)
  assert.ok(seg[0][3] > 180, "the segment stays continuous")
  assert.ok(particles[0].lon < -179.9, `wrapped to ${particles[0].lon}`)
})

test("particles are on the sphere and spread by area", () => {
  const particles = S.seed(4000, null, S.seededRandom(7))
  let north = 0
  for (const p of particles) {
    assert.ok(Math.abs(p.lat) <= 88 && p.lon >= -180 && p.lon < 180)
    assert.ok(p.age >= 0 && p.age <= p.life && p.life >= S.LIFE_MIN && p.life <= S.LIFE_MAX)
    if (p.lat > 30) north++
  }
  // Area north of 30°: (1 − sin 30°) / 2 of the sphere, a quarter.
  close(north / 4000, (1 - 0.5) / (1 + Math.sin(88 * Math.PI / 180)), 0.03, "share north of 30°")
  // Many steps later they are still on the sphere.
  const u = constant(30), v = constant(25)
  for (let i = 0; i < 50; i++) S.step(particles, u, v, 0.1, 20000, null, S.seededRandom(i))
  for (const p of particles) assert.ok(Math.abs(p.lat) <= 88 && p.lon >= -180 && p.lon < 180)
})

test("dead particles start again inside the box", () => {
  const box = { south: 40, north: 60, west: 170, east: -170 }   // across the date line
  const lattice = (value) => constant(value, { south: 30, north: 70, west: 160, east: 200 }, false)
  const random = S.seededRandom(3)
  const particles = S.seed(500, box, random)
  for (const p of particles) assert.ok(S.inBox(box, p.lat, p.lon), JSON.stringify(p))
  const old = { lat: 50, lon: 175, age: 9, life: 2 }
  const leaving = { lat: 59.99, lon: 175, age: 0, life: 9 }
  const set = [old, leaving]
  const segments = S.step(set, lattice(0), lattice(30), 1, 1000, box, random)
  assert.equal(segments.length, 0)
  assert.ok(set[0] !== old && set[1] !== leaving)
  for (const p of set) {
    assert.ok(S.inBox(box, p.lat, p.lon), JSON.stringify(p))
    assert.equal(p.age, 0)
  }
})

test("unknown wind and the poles re-seed", () => {
  const u = constant(0), v = constant(10)
  u.values[40] = NaN   // the node at lat 0, lon 0
  const set = [{ lat: 0, lon: 0, age: 0, life: 9 }, { lat: 87.99, lon: 0, age: 0, life: 9 }, { lat: 45, lon: 90, age: 0, life: 9 }]
  const first = set[0], second = set[1], third = set[2]
  const segments = S.step(set, u, v, 1, 1000, null, S.seededRandom(5))
  assert.equal(segments.length, 1)
  assert.ok(set[0] !== first && set[1] !== second && set[2] === third)
})

test("a seeded random repeats", () => {
  const a = S.seed(20, null, S.seededRandom(42)), b = S.seed(20, null, S.seededRandom(42))
  assert.deepStrictEqual(JSON.stringify(a), JSON.stringify(b))
  const sa = S.step(a, constant(5), constant(5), 9, 1000, null, S.seededRandom(1))
  const sb = S.step(b, constant(5), constant(5), 9, 1000, null, S.seededRandom(1))
  assert.deepStrictEqual(JSON.stringify(sa), JSON.stringify(sb))
  assert.deepStrictEqual(JSON.stringify(a), JSON.stringify(b))
  assert.notDeepStrictEqual(JSON.stringify(S.seed(5, null, S.seededRandom(1))), JSON.stringify(S.seed(5, null, S.seededRandom(2))))
})

test("directions are where the wind comes from", () => {
  const cases = { 0: [0, -10], 90: [-10, 0], 180: [0, 10], 270: [10, 0] }
  for (const [dir, [u, v]] of Object.entries(cases)) {
    const uv = S.uvFromSpeedDirection(10, Number(dir))
    close(uv.u, u, 1e-9, `u ${dir}`)
    close(uv.v, v, 1e-9, `v ${dir}`)
  }
  const speed = { south: 0, north: 10, west: 0, east: 10, cols: 2, rows: 1, wrap: false, values: [36, NaN] }
  const direction = { ...speed, values: [270, 90] }
  const uv = S.uvLattices(speed, direction)
  close(uv.u.values[0], 10, 1e-9, "36 km/h from the west")
  close(uv.v.values[0], 0, 1e-9, "no north part")
  assert.ok(Number.isNaN(uv.u.values[1]) && Number.isNaN(uv.v.values[1]))
  assert.equal(uv.u.cols, 2)
  close(S.uvLattices(speed, direction, "ms").u.values[0], 36, 1e-9, "m/s kept")
})

test("bilinear lookup wraps round a global lattice", () => {
  const values = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) values.push(c === 4 ? 0 : c)
  const lattice = { south: -90, north: 90, west: -180, east: 180, cols: 5, rows: 3, wrap: true, values }
  close(S.valueAt(lattice, 0, -135), 0.5, 1e-9, "between columns 0 and 1")
  close(S.valueAt(lattice, 0, 135), 1.5, 1e-9, "between 3 and the seam")
  close(S.valueAt(lattice, 0, 225), 0.5, 1e-9, "any longitude")
  assert.ok(Number.isNaN(S.valueAt({ ...lattice, wrap: false, west: 0, east: 10 }, 0, 20)))
})
