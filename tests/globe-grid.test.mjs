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
  assert.equal(F.ticks("temperature", false).length, 5)
  assert.deepEqual(plain(F.ticks("temperature", true).map((t) => t.value)), [-40, -2, 37, 75, 113])
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
  assert.deepEqual(plain(F.ticks("sst", false).map((t) => t.value)), [-2, 7, 15, 24, 32])
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
