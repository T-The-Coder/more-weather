// The globe's storm and thunderstorm symbols (GlobeSymbols.js): gust
// maxima, weather codes and CAPE with rain, de-cluttering on the lattice
// and on screen.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const M = load("GlobeSymbols.js")
const plain = (value) => JSON.parse(JSON.stringify(value))
const Y = Object.fromEntries(Object.entries(M).map(([k, f]) => [k, typeof f === "function" ? (...a) => plain(f(...a)) : f]))

const box = { south: 40, north: 60, west: 0, east: 20 }
function lattice(f, b = box, cols = 41, rows = 41, wrap = false) {
  const values = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      values.push(f(b.south + r * (b.north - b.south) / (rows - 1), b.west + c * (b.east - b.west) / (cols - 1)))
  return { ...b, cols, rows, values, wrap }
}
const blob = (lat0, lon0, peak, base, sigma) => (lat, lon) =>
  base + (peak - base) * Math.exp(-((lat - lat0) ** 2 + (lon - lon0) ** 2) / (sigma * sigma))

test("a gust blob gives one storm at its peak", () => {
  const gusts = lattice(blob(50, 10, 110, 40, 2))
  const found = Y.storms(gusts)
  assert.deepStrictEqual(found, [{ lat: 50, lon: 10, gust: 110, level: 2 }])
  const weaker = Y.storms(lattice(blob(45, 5, 90, 40, 2)))
  assert.deepStrictEqual(weaker.map((s) => s.level), [1])
  assert.deepStrictEqual(Y.storms(lattice(blob(45, 5, 70, 40, 2))), [])
})

test("storms de-clutter by cell and keep the strongest", () => {
  const two = (lat, lon) => Math.max(blob(50, 10, 110, 40, 0.6)(lat, lon), blob(50, 11, 95, 40, 0.6)(lat, lon))
  assert.equal(Y.storms(lattice(two), { cellDeg: 0.5 }).length, 2)
  const coarse = Y.storms(lattice(two), { cellDeg: 5 })
  assert.equal(coarse.length, 1)
  assert.equal(coarse[0].gust, 110)
  const many = lattice((lat, lon) => 80 + ((Math.round(lat * 2) + Math.round(lon * 2)) % 2) * 10)
  assert.ok(Y.storms(many, { cellDeg: 0.1 }).length <= 40)
  assert.equal(Y.storms(many, { cellDeg: 0.1, max: 5 }).length, 5)
})

test("a code-95 patch gives thunderstorms, codes are not blended", () => {
  const codes = lattice((lat, lon) => (Math.abs(lat - 47) <= 1 && Math.abs(lon - 7) <= 1 ? 95 : 3))
  const found = Y.thunderstorms(codes, null, null, { cellDeg: 5 })
  assert.equal(found.length, 1)
  assert.equal(found[0].strength, 1)
  assert.ok(Math.abs(found[0].lat - 47) <= 1 && Math.abs(found[0].lon - 7) <= 1)
  // Halfway between a 99 node and a 3 node the nearest one counts, never 51.
  const pair = { south: 0, north: 1, west: 0, east: 1, cols: 2, rows: 2, wrap: false, values: [99, 3, 3, 3] }
  assert.equal(Y.nearestAt(pair, 0.2, 0.3), 99)
  assert.equal(Y.nearestAt(pair, 0.2, 0.7), 3)
  assert.ok(Number.isNaN(M.nearestAt(pair, 2, 0)))
  assert.deepStrictEqual([95, 96, 99, 3, NaN].map(Y.codeStrength), [1, 2, 3, 0, 0])
  assert.ok(Y.thunderstorms(codes, null, null).length <= 24)
})

test("CAPE needs rain to count", () => {
  const codes = lattice(() => 2)
  const cape = lattice(blob(48, 6, 3000, 200, 1.5))
  const dry = lattice(() => 0.1)
  const wet = lattice(() => 1.2)
  assert.deepStrictEqual(Y.thunderstorms(codes, cape, dry), [])
  assert.deepStrictEqual(Y.thunderstorms(codes, cape, null), [])
  const found = Y.thunderstorms(codes, cape, wet, { cellDeg: 20 })
  assert.equal(found.length, 1)
  assert.equal(found[0].strength, 2)
  assert.ok(Math.abs(found[0].lat - 48) < 0.01 && Math.abs(found[0].lon - 6) < 0.01, JSON.stringify(found[0]))
})

test("global lattices skip the seam twice and the poles", () => {
  const g = { south: -90, north: 90, west: -180, east: 180 }
  const gusts = lattice((lat) => (Math.abs(lat) > 86 ? 150 : 40), g, 145, 73, true)
  assert.deepStrictEqual(Y.storms(gusts), [])
  const seam = lattice((lat, lon) => (lat === 0 && Math.abs(lon) === 180 ? 120 : 40), g, 145, 73, true)
  assert.deepStrictEqual(Y.storms(seam), [{ lat: 0, lon: -180, gust: 120, level: 2 }])
})

test("screen de-cluttering keeps visible places apart, strongest first", () => {
  const points = [
    { lat: 0, lon: 0, gust: 80 }, { lat: 0, lon: 1, gust: 120 },
    { lat: 0, lon: 5, gust: 90 }, { lat: 0, lon: 100, gust: 200 }
  ]
  const project = (lat, lon) => ({ x: lon * 10, y: lat * 10, visible: lon < 90 })
  const kept = Y.declutterScreen(points, project, 20)
  assert.deepStrictEqual(kept.map((p) => p.gust), [120, 90])
  assert.deepStrictEqual([kept[0].x, kept[0].y], [10, 0])
  assert.equal(points[1].x, undefined, "the input stays as it was")
  const strengths = Y.declutterScreen([{ lat: 0, lon: 0, strength: 1 }, { lat: 0, lon: 0.5, strength: 3 }], project, 20)
  assert.deepStrictEqual(strengths.map((p) => p.strength), [3])
})
