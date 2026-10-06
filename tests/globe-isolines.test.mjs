// The globe's isobars and pressure centres (GlobeIsolines.js): marching
// squares joined into polylines, the ±180° seam, holes, highs and lows.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

// Results copied into this realm, so deepStrictEqual compares them.
const M = load("GlobeIsolines.js")
const plain = (value) => JSON.parse(JSON.stringify(value))
const I = Object.fromEntries(["isolines", "extrema", "levelRange"].map((n) => [n, (...a) => plain(M[n](...a))]))

// A lattice from a function of (lat, lon).
function lattice(box, cols, rows, wrap, f) {
  const values = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const lat = box.south + r * (box.north - box.south) / (rows - 1)
      const lon = box.west + c * (box.east - box.west) / (cols - 1)
      values.push(f(lat, lon))
    }
  return { ...box, cols, rows, values, wrap }
}

const box = { south: 30, north: 70, west: -20, east: 20 }
const gauss = (lat0, lon0, amp, sigma) => (lat, lon) =>
  1010 + amp * Math.exp(-((lat - lat0) ** 2 + (lon - lon0) ** 2) / (sigma * sigma))

const closedLoop = (line) => line[0] === line[line.length - 2] && line[1] === line[line.length - 1]

test("a Gaussian high gives one closed isobar per level", () => {
  const field = lattice(box, 48, 48, false, gauss(50, 0, 20, 8))
  const result = I.isolines(field, 4, 1000)
  assert.deepStrictEqual(result.map((l) => l.level), [1012, 1016, 1020, 1024, 1028])
  for (const level of result) {
    assert.equal(level.lines.length, 1, `level ${level.level}`)
    assert.ok(closedLoop(level.lines[0]), `level ${level.level} is closed`)
    // Every point of the line lies at the level's radius round the centre.
    const want = 8 * Math.sqrt(Math.log(20 / (level.level - 1010)))
    const line = level.lines[0]
    for (let i = 0; i < line.length; i += 2) {
      const r = Math.hypot(line[i + 1] - 50, line[i])
      assert.ok(Math.abs(r - want) < 0.6, `level ${level.level}: radius ${r} vs ${want}`)
    }
  }
  const centres = I.extrema(field)
  assert.equal(centres.length, 1)
  assert.equal(centres[0].kind, "high")
  assert.ok(Math.abs(centres[0].lat - 50) < 0.9 && Math.abs(centres[0].lon) < 0.9, JSON.stringify(centres[0]))
  assert.ok(Math.abs(centres[0].value - 1030) < 0.5)
})

test("a high and a low are found, strongest first", () => {
  const high = gauss(45, -10, 15, 6), low = gauss(58, 10, -28, 6)
  const field = lattice(box, 48, 48, false, (lat, lon) => high(lat, lon) + low(lat, lon) - 1010)
  const centres = I.extrema(field)
  assert.deepStrictEqual(centres.map((c) => c.kind), ["low", "high"])
  assert.ok(Math.abs(centres[0].lat - 58) < 0.9 && Math.abs(centres[0].lon - 10) < 0.9)
  assert.ok(Math.abs(centres[1].lat - 45) < 0.9 && Math.abs(centres[1].lon + 10) < 0.9)
  const levels = I.isolines(field, 4, 1000).map((l) => l.level)
  assert.deepStrictEqual(levels, [984, 988, 992, 996, 1000, 1004, 1008, 1012, 1016, 1020, 1024])
  assert.equal(I.extrema(field, { max: 1 }).length, 1)
  assert.deepStrictEqual(I.extrema(field, { minDepth: 3.5 }).map((c) => c.kind), ["low"])
})

test("a plane gradient gives straight parallel lines", () => {
  const field = lattice(box, 20, 20, false, (lat) => 1000 + (lat - 30) * 0.5)
  const result = I.isolines(field, 4, 1000)
  assert.deepStrictEqual(result.map((l) => l.level), [1004, 1008, 1012, 1016, 1020])   // 1000 only touches the southern row
  for (const level of result) {
    assert.equal(level.lines.length, 1)
    const line = level.lines[0]
    const lat = 30 + (level.level - 1000) * 2
    for (let i = 0; i < line.length; i += 2) assert.ok(Math.abs(line[i + 1] - lat) < 1e-9)
    const lons = line.filter((_, i) => i % 2 === 0).sort((a, b) => a - b)
    assert.equal(lons[0], -20)
    assert.equal(lons[lons.length - 1], 20)
    assert.ok(!closedLoop(line))
  }
  assert.deepStrictEqual(I.extrema(field), [])
})

test("a low on the date line closes across the seam", () => {
  const global = { south: -90, north: 90, west: -180, east: 180 }
  const f = (lat, lon) => {
    const d = Math.min(Math.abs(lon - 179), 360 - Math.abs(lon - 179))
    return 1011 - 24 * Math.exp(-((lat - 40) ** 2 + d * d) / 64)
  }
  const field = lattice(global, 145, 73, true, f)
  const result = I.isolines(field, 4, 1000)
  assert.deepStrictEqual(result.map((l) => l.level), [988, 992, 996, 1000, 1004, 1008])
  for (const level of result) {
    assert.equal(level.lines.length, 1, `level ${level.level}`)
    const line = level.lines[0]
    assert.ok(closedLoop(line))
    const lons = line.filter((_, i) => i % 2 === 0)
    assert.ok(lons.some((l) => l > 170) && lons.some((l) => l < -170), "both sides of the seam")
    assert.ok(lons.every((l) => l >= -180 && l <= 180))
  }
  const centres = I.extrema(field)
  assert.equal(centres.length, 1)
  assert.equal(centres[0].kind, "low")
  assert.ok(Math.abs(centres[0].lat - 40) < 2.5 && Math.abs(centres[0].lon - 179) < 2.5, JSON.stringify(centres[0]))
  // Without wrap the same field is cut at the seam into open lines.
  const cut = I.isolines({ ...field, wrap: false }, 4, 1000)
  assert.ok(cut.every((l) => l.lines.length === 2 && l.lines.every((line) => !closedLoop(line))))
})

test("unknown values leave holes without segments", () => {
  const field = lattice(box, 20, 20, false, (lat) => 1000 + (lat - 30) * 0.5)
  for (let r = 0; r < 20; r++) for (let c = 8; c < 12; c++) field.values[r * 20 + c] = NaN
  for (const level of I.isolines(field, 4, 1000).slice(1)) {
    assert.equal(level.lines.length, 2, `level ${level.level}`)
    for (const line of level.lines)
      for (let i = 0; i < line.length; i += 2)
        assert.ok(line[i] <= -20 + 7 * 40 / 19 + 1e-9 || line[i] >= -20 + 12 * 40 / 19 - 1e-9, `lon ${line[i]}`)
  }
  const empty = lattice(box, 5, 5, false, () => NaN)
  assert.deepStrictEqual(I.isolines(empty, 4, 1000), [])
  assert.deepStrictEqual(I.extrema(empty), [])
})

test("a saddle follows the cell mean", () => {
  // bl and tr high, br and tl low; the mean decides which corners join.
  const cell = (centre) => ({ south: 0, north: 1, west: 0, east: 1, cols: 2, rows: 2, wrap: false,
                              values: [10, 0, 0, 10].map((v, i) => i === 0 || i === 3 ? v + centre : v) })
  const above = I.isolines(cell(0), 4, 4)   // levels 4, 8; mean 5 → 4 joins the high corners
  assert.equal(above[0].level, 4)
  assert.equal(above[0].lines.length, 2)
  // Each line cuts off one low corner: its points stay near (1, 0) or (0, 1).
  for (const line of above[0].lines) {
    const nearBr = line[0] > 0.5 || line[1] < 0.5
    assert.ok(nearBr ? line.every((v, i) => i % 2 === 0 ? v >= 0.6 - 1e-9 : v <= 0.4 + 1e-9)
                     : line.every((v, i) => i % 2 === 0 ? v <= 0.4 + 1e-9 : v >= 0.6 - 1e-9), JSON.stringify(line))
  }
  const level8 = above[1]   // mean 5 < 8 → the high corners are cut off
  for (const line of level8.lines) {
    const nearBl = line[0] < 0.5 && line[1] < 0.5
    assert.ok(nearBl || (line[0] > 0.5 && line[1] > 0.5), JSON.stringify(line))
  }
})

test("levels are multiples of the step from the base", () => {
  assert.deepStrictEqual(I.levelRange([997, 1001, NaN, 1009], 4, 1000), { first: 1000, count: 3 })
  assert.deepStrictEqual(I.levelRange([1, 2], 0, 0), { first: 0, count: 0 })
})
