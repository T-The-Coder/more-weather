// The globe's weather grid (GlobeGrid.js) and wash scales (GlobeFields.js):
// point counts and batches, tiles and their keys, the request, the budget,
// the compact form, lattices and buckets.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const G = load("GlobeGrid.js")
const F = load("GlobeFields.js")
const plain = (value) => JSON.parse(JSON.stringify(value))

test("510 global points in seven interleaved batches", () => {
  const all = G.globalPoints()
  assert.equal(all.length, 510)
  assert.deepEqual(plain(all[0]), { lat: -90, lon: 0, ring: 0 })
  assert.equal(all[all.length - 1].lat, 90)
  let total = 0
  const seen = new Set()
  for (let k = 0; k < 7; k++) {
    const batch = G.batchPoints(k)
    assert.ok(batch.length <= 75, `batch ${k}: ${batch.length}`)
    for (const p of batch) { assert.equal(p.index % 7, k); seen.add(p.index) }
    total += batch.length
    // Each batch reaches from pole to pole, so the first already covers the earth.
    assert.ok(Math.min(...batch.map((p) => p.lat)) <= -72 && Math.max(...batch.map((p) => p.lat)) >= 72)
  }
  assert.equal(total, 510)
  assert.equal(seen.size, 510)
  assert.equal(G.ringCount(0), 40)
  assert.equal(G.ringCount(81), 6)
})

test("tiles: keys, bounds, 4 × 4 points with shared edges", () => {
  const key = G.tileAt(47.3, 8.5, 3)
  assert.match(key, /^T3:\d+:\d+$/)
  const b = G.tileBounds(key)
  assert.ok(b.south <= 47.3 && b.north > 47.3 && b.west <= 8.5 && b.east > 8.5)
  assert.equal(b.north - b.south, 7.5)
  assert.ok(b.east - b.west > 7.5)
  const points = G.tilePoints(key)
  assert.equal(points.length, 16)
  assert.deepEqual([points[0].lat, points[0].lon], [b.south, b.west])
  assert.deepEqual([points[15].lat, points[15].lon], [b.north, b.east])
  // The neighbour east starts where this one ends.
  const t = G.parseTileKey(key)
  const east = G.tileBounds(G.tileKey(3, t.row, t.col + 1))
  assert.equal(east.west, b.east)
  // A box over two tiles needs both, and the date line wraps.
  const keys = G.tilesFor({ south: 46, north: 48, west: b.east - 1, east: b.east + 1 }, 3)
  assert.equal(keys.length, 2)
  const across = G.tilesFor({ south: 0, north: 1, west: 178, east: 182 }, 4)
  assert.ok(across.some((k) => G.tileBounds(k).west < -170))
})

test("the request asks for the nine variables and stays short", () => {
  const global = G.forecastRequest(G.batchPoints(0), "global")
  assert.match(global.url, /temporal_resolution=hourly_3&forecast_hours=120/)
  assert.match(global.url, /timeformat=unixtime/)
  assert.ok(global.url.includes(G.VARIABLES.join(",")))
  assert.ok(global.url.length < 2000, `URL ${global.url.length} long`)
  assert.ok(global.maxBytes >= 75 * 2700 * 2)
  const tile = G.forecastRequest(G.tilePoints(G.tileAt(47, 8, 5)), "tile")
  assert.match(tile.url, /forecast_hours=48/)
  assert.doesNotMatch(tile.url, /hourly_3/)
})

test("the daily budget", () => {
  assert.equal(G.budgetState(1999), "ok")
  assert.equal(G.budgetState(2000), "manual")
  assert.equal(G.budgetState(3000), "stop")
  assert.equal(G.mayLoad(2500, false), false)
  assert.equal(G.mayLoad(2500, true), true)
  assert.equal(G.mayLoad(3100, true), false)
  const day = Date.UTC(2026, 9, 3, 12)
  assert.deepEqual(plain(G.countedCalls({ utcDay: "2026-10-03", count: 100 }, 75, day)), { utcDay: "2026-10-03", count: 175 })
  assert.deepEqual(plain(G.countedCalls({ utcDay: "2026-10-02", count: 900 }, 16, day)), { utcDay: "2026-10-03", count: 16 })
  const lru = G.touchedLru(["a", "b", "c"], "d", 3)
  assert.deepEqual(plain(lru.list), ["d", "a", "b"])
  assert.deepEqual(plain(lru.evicted), ["c"])
})

// A response for given points: temperature by latitude, cloud by longitude.
function fixture(points, steps) {
  const times = Array.from({ length: steps }, (_, i) => 1791000000 + i * 10800)
  return JSON.stringify(points.map((p) => ({
    latitude: p.lat, longitude: p.lon,
    hourly: Object.fromEntries([["time", times]].concat(G.VARIABLES.map((v) => [v, times.map((_, i) =>
      v === "temperature_2m" ? 30 - Math.abs(p.lat) / 2 + i : v === "cloud_cover" ? (p.lon + 180) / 3.6
        : v === "precipitation" ? 3 : 1)])))
  })))
}

test("the compact form keeps the values, scaled", () => {
  const points = G.batchPoints(2)
  const compact = G.compactFromResponse(fixture(points, 4), points, "global", "G9:2", 5)
  assert.equal(compact.key, "G9:2")
  assert.equal(compact.times.length, 4)
  const p = 10
  assert.ok(Math.abs(G.compactValue(compact, "temperature_2m", p, 1) - (31 - Math.abs(points[p].lat) / 2)) < 0.06)
  assert.equal(G.rateValue(compact, "precipitation", p, 0), 1)
  assert.equal(G.nearestStep(compact.times, (1791000000 + 10800 * 2.4) * 1000), 2)
  assert.equal(G.compactFromResponse(fixture(points.slice(1), 4), points, "global", "G9:2", 5), null)
})

test("the global lattice follows the rings and fills between them", () => {
  const batches = [0, 1, 2, 3, 4, 5, 6].map((k) => {
    const points = G.batchPoints(k)
    return G.compactFromResponse(fixture(points, 2), points, "global", "G9:" + k, 0)
  })
  const ms = 1791000000 * 1000
  const lattice = G.globalLattice(batches, "temperature_2m", ms)
  assert.equal(lattice.values.length, 145 * 73)
  // 30 − |lat| / 2 is linear between rings: the lattice reproduces it.
  for (const lat of [-60, -4.5, 0, 22.5, 47.5]) {
    const v = G.latticeValue(lattice, lat, 11)
    assert.ok(Math.abs(v - (30 - Math.abs(lat) / 2)) < 0.6, `${lat}: ${v}`)
  }
  // One batch alone still covers the earth.
  const coarse = G.globalLattice([batches[3]], "cloud_cover", ms)
  assert.ok(coarse.values.every((v) => Number.isFinite(v)))
})

test("a region takes its tiles and the global lattice where none is loaded", () => {
  const key = G.tileAt(47, 8, 3)
  const tilePoints = G.tilePoints(key)
  const tile = G.compactFromResponse(fixture(tilePoints, 1).replace(/"temperature_2m":\[[^\]]*\]/g, '"temperature_2m":[-5]'),
    tilePoints, "tile", key, 0)
  const global = { south: -90, north: 90, west: -180, east: 180, cols: 2, rows: 2, values: [20, 20, 20, 20], wrap: true }
  const box = { south: 40, north: 55, west: 0, east: 20 }
  const at = tile.times[0] * 1000
  const region = G.regionLattice({ [key]: tile }, global, "temperature_2m", at, box, 3, 21, 16)
  assert.ok(Math.abs(G.latticeValue(region, 47, 8) + 5) < 0.01)
  assert.ok(Math.abs(G.latticeValue(region, 41, 1) - 20) < 0.01)
  // Past the tile's hours the global data stands in.
  const later = at + (tile.times[tile.times.length - 1] - tile.times[0]) * 1000 + 3 * 3600 * 1000
  const beyond = G.regionLattice({ [key]: tile }, global, "temperature_2m", later, box, 3, 21, 16)
  assert.ok(Math.abs(G.latticeValue(beyond, 47, 8) - 20) < 0.01)
})

test("wash buckets and ticks", () => {
  assert.equal(F.bucket("temperature", -60), 0)
  assert.equal(F.bucket("temperature", 60), F.bucketCount("temperature") - 1)
  assert.equal(F.bucket("precipitation", 0.05), -1)
  assert.equal(F.bucket("precipitation", 0.3), 1)
  assert.equal(F.bucket("precipitation", 50), 7)
  assert.equal(F.bucket("cloud", 100), 9)
  assert.equal(F.bucket("temperature", NaN), -1)
  assert.deepEqual(plain(F.fixedColor("cloud", 9)).slice(0, 3), [255, 255, 255])
  assert.deepEqual(plain(F.ticks("temperature", false).map((t) => t.value)), [-40, -10, 10, 25, 35, 45])
  assert.deepEqual(plain(F.ticks("temperature", true).map((t) => t.value)), [-40, 14, 50, 77, 95, 113])
  assert.equal(F.unit("precipitation", true), "in/h")
  assert.equal(F.nextWash("precipitation"), "wind")
  assert.equal(F.nextWash("sst"), "none")
  assert.equal(F.nextWash("none"), "temperature")
  // Wind: 20 steps up to the height's scale; the sea on −2 … 32 °C.
  assert.equal(F.bucket("wind", 0, 100), 0)
  assert.equal(F.bucket("wind", 99, 100), 19)
  assert.equal(F.bucket("wind", 99, 240), 8)
  assert.deepEqual(plain(F.ticks("wind", false, 240).map((t) => t.value)), [0, 60, 120, 180, 240])
  assert.equal(plain(F.fixedColor("wind", 0))[3], 170)
  assert.deepEqual(plain(F.windColor(0)), [43, 31, 143])
  assert.deepEqual(plain(F.windColor(1)), [180, 58, 214])
  assert.equal(F.bucket("sst", -5), 0)
  assert.equal(F.bucket("sst", 15), Math.floor(17 / 34 * 34))
  assert.deepEqual(plain(F.ticks("sst", false).map((t) => t.value)), [0, 10, 20, 30])
  assert.equal(F.variableFor("wind", "850hPa"), "wind_speed_850hPa")
  assert.equal(F.variableFor("wind", "10m"), "wind_speed_10m")
  assert.equal(F.variableFor("sst"), "sea_surface_temperature")
})

test("colour layers: switches from the old choice, the top layer at a place", () => {
  assert.deepEqual(plain(F.switchesFor("cloud")), { globeTemperature: false, globeSst: false, globeWind: false,
    globeCloud: true, globePrecipitation: false })
  assert.ok(Object.values(plain(F.switchesFor("none"))).every((v) => v === false))
  const on = ["temperature", "cloud", "precipitation"]
  assert.equal(F.topLayer(on, { temperature: 12, cloud: 80, precipitation: 1.2 }), "precipitation")
  assert.equal(F.topLayer(on, { temperature: 12, cloud: 80, precipitation: 0.02 }), "temperature")
  assert.equal(F.topLayer(on, { temperature: NaN, cloud: 80, precipitation: 0 }), "cloud")
  assert.equal(F.topLayer(["wind", "sst"], { wind: 20, sst: 18 }), "sst")
  assert.equal(F.topLayer([], {}), "")
  assert.deepEqual(plain(F.LAYERS), ["temperature", "sst", "wind", "cloud", "precipitation"])
})

test("wind: one layer with a mode, migrated from the two switches", () => {
  const m = (o) => plain(F.migratedWind(o))
  assert.deepEqual(m({ globeStreaks: true, globeWind: false, x: 1 }), { globeWind: true, globeWindMode: "lines", x: 1 })
  assert.deepEqual(m({ globeStreaks: false, globeWind: true }), { globeWind: true, globeWindMode: "colour" })
  assert.deepEqual(m({ globeStreaks: true, globeWind: true }), { globeWind: true, globeWindMode: "both" })
  assert.deepEqual(m({ globeStreaks: false }), { globeWind: false, globeWindMode: "lines" })
  // Already new, or nothing stored: unchanged.
  assert.deepEqual(m({ globeWind: true, globeWindMode: "colour", globeStreaks: true }),
    { globeWind: true, globeWindMode: "colour", globeStreaks: true })
  assert.deepEqual(m({ globeWind: true }), { globeWind: true })
  // The chips: colour layers first, then the overlays; free shortcut letters.
  assert.deepEqual(plain(F.CHIPS.map((c) => c.layer).filter((l) => l)), ["temperature", "sst", "cloud", "precipitation", "wind"])
  assert.equal(F.chipForShortcut("i").key, "globeIsobars")
  assert.equal(F.chipForShortcut("w"), null)
})

test("wind heights, marine keys and nearest codes", () => {
  assert.equal(G.batchKey(3, "850hPa"), "G9:3@850hPa")
  assert.equal(G.batchKey(3, "10m"), "G9:3")
  assert.equal(G.keyLevel("T3:17:40@850hPa"), "850hPa")
  assert.equal(G.baseKey("T3:17:40@850hPa"), "T3:17:40")
  assert.deepEqual(plain(G.parseTileKey("T3:17:40@850hPa")), { level: 3, row: 17, col: 40 })
  assert.equal(G.withLevel("T3:1:2", "120m"), "T3:1:2@120m")
  assert.equal(G.ttlOf("S9:0"), G.MARINE_TTL_MS)
  assert.equal(G.retryAfterMs(1), 10 * 60 * 1000)
  assert.equal(G.retryAfterMs(3), 40 * 60 * 1000)
  assert.equal(G.retryAfterMs(20), 6 * 60 * 60 * 1000)
  assert.equal(G.ttlOf("G9:0@850hPa"), G.GLOBAL_TTL_MS)
  const r = G.forecastRequest([{ lat: 1, lon: 2 }], "global", G.levelVariables("850hPa"))
  assert.match(r.url, /hourly=wind_speed_850hPa,wind_direction_850hPa&/)
  // A height's answer keeps its two variables, in tenths.
  const text = JSON.stringify({ hourly: { time: [0, 10800], wind_speed_850hPa: [12.34, 20], wind_direction_850hPa: [270, 90] } })
  const c = G.compactFromResponse(text, [{ lat: 0, lon: 0 }], "global", "G9:0@850hPa", 0, G.levelVariables("850hPa"))
  assert.equal(G.compactValue(c, "wind_speed_850hPa", 0, 0), 12.3)
  assert.equal(G.compactValue(c, "wind_direction_850hPa", 0, 1), 90)
  assert.ok(Number.isNaN(G.compactValue(c, "temperature_2m", 0, 0)))
  // Weather codes are never blended: the nearer ring's, the nearer point's.
  const a = { kind: "global", key: "G9:0", at: 0, points: [[0, 0], [9, 0]], times: [0],
    vars: { weather_code: [95, 3] } }
  const codes = G.globalLattice([a], "weather_code", 0)
  const atNode = (lat) => codes.values[Math.round((lat + 90) / 2.5) * 145 + 72]
  assert.equal(atNode(2.5), 95)
  assert.equal(atNode(5), 3)
  assert.equal(G.latticeValue(codes, 2.4, 0.3, true), 95)
})

test("the dense rain set: rings every 4.5°, about 2,000 points, sectors facing the view", () => {
  const all = G.rainPoints()
  assert.ok(all.length > 1900 && all.length < 2100, `${all.length} points`)
  const lats = [...new Set(all.map((p) => p.lat))]
  assert.equal(lats.length, 39)
  assert.equal(Math.min(...lats), -85.5)
  assert.equal(Math.max(...lats), 85.5)
  assert.equal(all.filter((p) => p.lat === 0).length, 80)
  // Cells of 15° × 15°, at most 16 points each.
  const cells = [...new Set(all.map((p) => p.cell))]
  assert.ok(cells.length > 250 && cells.length <= 288, `${cells.length} cells`)
  const sizes = cells.map((c) => G.rainCellPoints(c).length)
  assert.ok(sizes.every((n) => n >= 1 && n <= 16), sizes.join(","))
  assert.equal(sizes.reduce((a, b) => a + b, 0), all.length)
  // Facing a view: the disc's inner part, the cell under the centre first.
  const facing = G.rainPointsFacing(20, 10)
  assert.ok(facing.length > 700 && facing.length < 1000, `${facing.length} facing`)
  const near = plain(G.rainCellsFor(20, 10))
  assert.equal(near[0], "R9:7:12")
  assert.ok(!near.includes("R9:7:0"), "the far side is not asked")
  // Paced: 600 places a minute.
  assert.equal(G.pacingMs(50), 5000)
  assert.equal(G.ttlOf("R9:7:12"), 3 * 3600 * 1000)
  const request = G.forecastRequest(G.rainCellPoints("R9:7:12"), "rain")
  assert.match(request.url, /hourly=precipitation,rain,showers,snowfall,weather_code&forecast_hours=48/)
})

test("the dense rain lattice lies over the coarse one where it is known, within its 48 hours", () => {
  const now = Date.UTC(2026, 9, 7, 12)
  const times = Array.from({ length: 48 }, (_, i) => now / 1000 + i * 3600)
  // Four cells loaded (0° … 30° N, 180° … 150° W), 0.5 mm/h everywhere in them.
  const batches = ["R9:6:0", "R9:6:1", "R9:7:0", "R9:7:1"].map((key) => {
    const points = G.rainCellPoints(key)
    const values = []
    for (let p = 0; p < points.length; p++) for (let t = 0; t < 48; t++) values.push(50)
    return { v: 1, kind: "rain", key: key, at: now, points: points.map((p) => [p.lat, p.lon]), times,
      vars: { precipitation: values, weather_code: values.map(() => 61) } }
  })
  const dense = G.rainLattice(batches, "precipitation", now)
  assert.ok(Math.abs(G.latticeValue(dense, 10, -165) - 0.5) < 1e-9)
  assert.ok(Number.isNaN(G.latticeValue(dense, 10, 20)), "away from the sectors: unknown")
  assert.equal(G.rainLattice(batches, "temperature_2m", now), null)
  assert.equal(G.rainLattice(batches, "precipitation", now + 72 * 3600 * 1000), null)
  const coarse = { south: -90, north: 90, west: -180, east: 180, cols: 145, rows: 73, values: new Array(145 * 73).fill(2), wrap: true }
  const merged = G.withDense(coarse, dense)
  assert.ok(Math.abs(G.latticeValue(merged, 10, -165) - 0.5) < 1e-9)
  assert.equal(G.latticeValue(merged, 10, 20), 2)
})

test("the dense lattice from its node plan equals the ring-by-ring one", () => {
  const now = Date.UTC(2026, 9, 7, 12)
  const times = Array.from({ length: 4 }, (_, i) => now / 1000 + i * 3600)
  const keys = ["R9:6:0", "R9:6:1", "R9:7:0", "R9:8:12", "R9:8:13"]
  const batches = keys.map((key) => {
    const points = G.rainCellPoints(key)
    const values = []
    points.forEach((p, i) => times.forEach((_, t) => values.push(Math.round(100 * Math.abs(Math.sin(i * 1.7 + t + p.lat))))))
    return { v: 1, kind: "rain", key, at: now, points: points.map((p) => [p.lat, p.lon]), times, vars: { precipitation: values } }
  })
  const viaPlan = G.rainLattice(batches, "precipitation", now + 3600 * 1000)
  const gap = (lat) => 2.01 * 360 / Math.max(1, Math.round(80 * Math.cos(lat * Math.PI / 180)))
  const direct = G.globalLattice(batches, "precipitation", now + 3600 * 1000, gap)
  let known = 0
  for (let i = 0; i < direct.values.length; i++) {
    const a = viaPlan.values[i], b = direct.values[i]
    if (Number.isNaN(b)) { assert.ok(Number.isNaN(a), `node ${i}`); continue }
    known++
    assert.ok(Math.abs(a - b) < 1e-9, `node ${i}: ${a} vs ${b}`)
  }
  assert.ok(known > 50)
})

test("dry dense cells are not asked; the dense set keeps 600 calls of room", () => {
  const now = Date.UTC(2026, 9, 8, 0)
  const times = Array.from({ length: 20 }, (_, i) => now / 1000 + i * 3 * 3600)
  const points = G.globalPoints()
  // Rain (1 mm in 3 h) only near 45° N 9° E, a thunderstorm code near 27° N 81° W.
  const precipitation = [], codes = []
  for (const p of points) for (const t of times) {
    const wet = Math.abs(p.lat - 45) < 5 && Math.abs(p.lon - 9) < 10
    precipitation.push(wet ? 100 : 0)
    codes.push(Math.abs(p.lat - 27) < 5 && Math.abs(p.lon + 81) < 10 ? 95 : 3)
  }
  const batch = { v: 1, kind: "global", key: "G9:0", at: now, points: points.map((p) => [p.lat, p.lon]), times,
    vars: { precipitation, weather_code: codes } }
  assert.ok(G.rainCellWet([batch], G.rainCellOf(46, 10), now), "the rain's own cell")
  assert.ok(G.rainCellWet([batch], G.rainCellOf(46, 25), now), "a neighbour within a ring's step")
  assert.ok(G.rainCellWet([batch], G.rainCellOf(28, -80), now), "a thunderstorm code")
  assert.ok(!G.rainCellWet([batch], G.rainCellOf(-30, 140), now), "dry far away")
  assert.ok(!G.rainCellWet([batch], G.rainCellOf(46, 10), now + 4 * 86400 * 1000), "outside the next 48 hours")
  assert.ok(G.rainCellWet([], G.rainCellOf(-30, 140), now), "no base data: asked")
  assert.ok(G.mayLoadRain(1300, 100))
  assert.ok(!G.mayLoadRain(1350, 100))
})
