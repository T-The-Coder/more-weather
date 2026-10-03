// The globe's overlays as the worker builds them (GlobeLayers.js with the
// files GlobeWorker.js includes, all in one context as Qt.include does):
// the store, marine answers, wind vectors, isobars, storms and the cache.
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import vm from "node:vm"
import { root } from "./load.mjs"

const plain = (value) => JSON.parse(JSON.stringify(value))

// The worker's scope: its Qt.include lines, in order.
function workerScope() {
  const worker = readFileSync(join(root, "GlobeWorker.js"), "utf8")
  const context = vm.createContext({ console })
  for (const match of worker.matchAll(/^Qt\.include\("([^"]+)"\)$/gm)) {
    const source = readFileSync(join(root, match[1]), "utf8").replace(/^\.pragma\b.*$/gm, "")
    vm.runInContext(source, context, { filename: match[1] })
  }
  return context
}
const W = workerScope()

// A global batch over the ring points of batch k with values from f(lat, lon).
function batch(k, fields) {
  const points = W.batchPoints(k)
  const vars = {}
  for (const [name, f] of Object.entries(fields)) {
    const scale = W.scaleOf(name)
    vars[name] = points.map((p) => Math.round(f(p.lat, p.lon) * scale))
  }
  return { v: 1, kind: "global", key: W.batchKey(k), at: 0, points: points.map((p) => [p.lat, p.lon]), times: [0], vars }
}
function fullStore(fields) {
  const store = W.newStore()
  for (let k = 0; k < W.BATCHES; k++) W.keep(store, batch(k, fields))
  return store
}

test("marine answers become compact data, land as null", () => {
  const text = readFileSync(join(root, "tests/fixtures/marine.json"), "utf8")
  const points = [{ lat: 30, lon: -40 }, { lat: 50, lon: 10 }, { lat: 38, lon: 19 }]
  const c = W.compactFromMarine(text, points, "S9:0", 5)
  assert.equal(c.kind, "marine")
  assert.ok(c.times.length >= 4)
  assert.ok(c.times[0] > 1e9 && c.times[0] < 1e10)
  assert.ok(Number.isFinite(W.compactValue(c, "sea_surface_temperature", 0, 0)))
  assert.ok(Number.isNaN(W.compactValue(c, "sea_surface_temperature", 1, 0)))
  assert.equal(W.compactFromMarine("broken", points, "S9:0", 5), null)
  // Kept with the batches: the sea's lattice has values out at sea.
  const store = W.newStore()
  assert.ok(W.keep(store, c))
  assert.ok("S9:0" in store.batches)
  const sst = W.globalFor(store, "sea_surface_temperature", c.times[0] * 1000)
  assert.ok(sst.values.some((v) => Number.isFinite(v)))
})

test("wind vectors blend as u and v, not as angles", () => {
  // A west wind (from 270°) of 36 km/h everywhere, but the direction
  // written as 269° and 271° on alternate points: blended angles would be
  // fine here; 359°/1° would not.
  const store = fullStore({
    wind_speed_10m: () => 36,
    wind_direction_10m: (lat, lon) => (Math.round(lon) % 2 ? 359 : 1)
  })
  const layers = W.layersFor(store, { ms: 0, box: null, streaks: true, height: "10m" })
  const i = 36 * 145 + 72
  // From the north: towards the south, 10 m/s.
  assert.ok(Math.abs(layers.v.values[i] + 10) < 0.2, layers.v.values[i])
  assert.ok(Math.abs(layers.u.values[i]) < 0.5, layers.u.values[i])
})

test("isobars, centres, storms and thunderstorms from the store", () => {
  const store = fullStore({
    pressure_msl: (lat, lon) => 1012 + 20 * Math.exp(-((lat - 45) ** 2 + (lon - 10) ** 2) / 200),
    wind_gusts_10m: (lat, lon) => (Math.abs(lat - 50) < 6 && Math.abs(lon + 20) < 6 ? 120 : 30),
    weather_code: (lat, lon) => (Math.abs(lat - 9) < 3 && Math.abs(lon - 30) < 6 ? 95 : 3),
    cape: () => 100,
    precipitation: () => 0
  })
  const layers = plain(W.layersFor(store, { ms: 0, box: null, isobars: true, storms: true }))
  assert.ok(layers.isobars.length >= 3)
  assert.ok(layers.isobars.every((l) => (l.level - 1000) % 4 === 0))
  const high = layers.centres.find((c) => c.kind === "high")
  assert.ok(high && Math.abs(high.lat - 45) < 5 && Math.abs(high.lon - 10) < 6, JSON.stringify(layers.centres))
  assert.ok(layers.storms.some((s) => s.level === 2 && Math.abs(s.lat - 50) < 6), JSON.stringify(layers.storms))
  assert.ok(layers.thunderstorms.some((s) => Math.abs(s.lat - 9) < 5 && Math.abs(s.lon - 30) < 8),
    JSON.stringify(layers.thunderstorms))
  // Kept per hour until new data comes.
  const again = W.layersFor(store, { ms: 0, box: null, isobars: true })
  assert.equal(again.isobars, W.layersFor(store, { ms: 0, box: null, isobars: true }).isobars)
  // Storms too, per hour and box (the timeline's look-ahead fills these).
  const s1 = W.layersFor(store, { ms: 0, box: null, storms: true }).storms
  assert.equal(W.layersFor(store, { ms: 0, box: null, storms: true }).storms, s1)
  assert.notEqual(W.layersFor(store, { ms: 3 * 3600000, box: null, storms: true }).storms, s1)
  W.keep(store, batch(0, { pressure_msl: () => 1000 }))
  assert.notEqual(W.layersFor(store, { ms: 0, box: null, isobars: true }).isobars, again.isobars)
})

test("a box reads the tiles of its height", () => {
  const store = fullStore({ wind_speed_10m: () => 10, wind_direction_10m: () => 270 })
  const key = W.tileAt(47, 9, 3)
  const points = W.tilePoints(key)
  const times = [0]
  const tile = (suffix, speed) => ({ v: 1, kind: "tile", key: key + suffix, at: 0, points: points.map((p) => [p.lat, p.lon]), times,
    vars: { ["wind_speed_" + height(suffix)]: points.map(() => speed * W.scaleOf("wind_speed_" + height(suffix))),
      ["wind_direction_" + height(suffix)]: points.map(() => 270 * W.scaleOf("wind_direction_" + height(suffix))) } })
  const height = (suffix) => (suffix ? "850hPa" : "10m")
  W.keep(store, tile("", 20))
  W.keep(store, tile("@850hPa", 90))
  const box = { south: 44, north: 50, west: 5, east: 13 }
  const low = W.layersFor(store, { ms: 0, box, level: 3, streaks: true, height: "10m" })
  const high = W.layersFor(store, { ms: 0, box, level: 3, streaks: true, height: "850hPa" })
  const mid = 36 * 72 + 36
  assert.ok(Math.abs(low.u.values[mid] - 20 / 3.6) < 0.1, low.u.values[mid])
  assert.ok(Math.abs(high.u.values[mid] - 90 / 3.6) < 0.1, high.u.values[mid])
})
