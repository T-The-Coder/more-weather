// Sea surface temperature from Open-Meteo's Marine API (GlobeMarine.js):
// the request, a recorded answer (tests/fixtures/marine.json: mid-Atlantic,
// central Germany, the Ionian Sea; 4 hours), and which places are sea.
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const M = load("GlobeMarine.js")
const fixture = readFileSync(join(root, "tests/fixtures/marine.json"), "utf8")
const land = JSON.parse(readFileSync(join(root, "data/globe-land.json"), "utf8"))
const points = [{ lat: 30, lon: -40 }, { lat: 50.5, lon: 10 }, { lat: 35, lon: 18 }]

test("the request names every place with two decimals", () => {
  const req = M.request([{ lat: 30, lon: -40 }, { lat: 50.456, lon: 9.999 }])
  assert.equal(req.url, "https://marine-api.open-meteo.com/v1/marine?latitude=30.00,50.46&longitude=-40.00,10.00" +
                        "&hourly=sea_surface_temperature&forecast_days=1&timeformat=unixtime")
  assert.ok(req.maxBytes >= 2 * 700)
  const many = M.requests(Array.from({ length: 250 }, (_, i) => ({ lat: 0, lon: i / 2 })))
  assert.deepStrictEqual([...many].map((r) => r.points.length), [100, 100, 50])
  assert.equal(many[2].points[0].lon, 100)
})

test("a recorded answer: sea has values, land is unknown", () => {
  const result = M.parse(fixture, points)
  assert.deepStrictEqual([...result.times], [1790985600000, 1790989200000, 1790992800000, 1790996400000])
  assert.deepStrictEqual([...result.values[0]], [27.8, 27.7, 27.7, 27.7])
  assert.ok(result.values[1].every(Number.isNaN))
  assert.deepStrictEqual([...result.values[2]], [26, 26, 25.9, 25.9])
})

test("a single place answers as one object", () => {
  const one = JSON.parse(fixture)[2]
  delete one.location_id
  const result = M.parse(JSON.stringify(one), [points[2]])
  assert.equal(result.values.length, 1)
  assert.deepStrictEqual([...result.values[0]], [26, 26, 25.9, 25.9])
})

test("broken or short answers do not throw", () => {
  for (const text of ["", "not json", "{}", "null", '{"error":true,"reason":"x"}']) {
    const result = M.parse(text, points)
    assert.equal(result.times.length, 0)
    assert.equal(result.values.length, 3)
  }
  // Fewer answers than places: the rest stay unknown.
  const two = JSON.stringify(JSON.parse(fixture).slice(0, 1))
  const result = M.parse(two, points)
  assert.equal(result.values.length, 3)
  assert.ok(result.values[2].every(Number.isNaN))
})

test("sea and land", () => {
  assert.equal(M.isOcean(land, 30, -40), true, "mid-Atlantic")
  assert.equal(M.isOcean(land, 51, 10), false, "central Germany")
  assert.equal(M.isOcean(land, 35, 18), true, "Mediterranean")
  assert.equal(M.isOcean(land, 38, 5), true, "western Mediterranean")
  assert.equal(M.isOcean(land, -80, 0), false, "Antarctica")
  assert.equal(M.isOcean(land, -85, 150), false, "Antarctica, east")
  assert.equal(M.isOcean(land, 0, -150), true, "Pacific")
  assert.equal(M.isOcean(land, -25, 135), false, "Australia")
  assert.equal(M.isOcean(land, 40, -100), false, "North America")
  assert.equal(M.isOcean(null, 51, 10), true, "without land data everything is sea")
  const sea = M.oceanPoints(points, land)
  assert.deepStrictEqual([...sea].map((p) => p.lat), [30, 35])
})
