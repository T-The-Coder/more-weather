// The globe's equirectangular picture for the GPU surface (GlobeTexture.js):
// texel positions, lattice sampling (per node and per grid), the regional
// box, and the colours composed as the Canvas wash composes them.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const T = load("GlobeTexture.js")
const F = load("GlobeFields.js")

function lattice(south, north, west, east, cols, rows, fn) {
  const values = []
  for (let r = 0; r < rows; r++) {
    const lat = south + (north - south) * r / (rows - 1)
    for (let c = 0; c < cols; c++) values.push(fn(lat, west + (east - west) * c / (cols - 1)))
  }
  return { south, north, west, east, cols, rows, values }
}
const globalOf = (fn) => lattice(-90, 90, -180, 180, 145, 73, fn)

test("texels: -180° and +90° at the top left, east to the right, south down", () => {
  assert.equal(T.texelX(-180, 1024), 0)
  assert.equal(T.texelX(0, 1024), 512)
  assert.equal(T.texelX(180, 1024), 1024)
  assert.equal(T.texelY(90, 512), 0)
  assert.equal(T.texelY(-90, 512), 512)
  assert.ok(T.texelY(50, 512) < T.texelY(10, 512))
})

test("lattice sampling: linear fields come back exactly, NaN outside a region", () => {
  const g = globalOf((lat, lon) => lat + 2 * lon)
  for (const [lat, lon] of [[0, 0], [12.3, -45.6], [-80, 170], [89, -179]])
    assert.ok(Math.abs(T.sampleLattice(g, lat, lon) - (lat + 2 * lon)) < 1e-9)
  const r = lattice(40, 60, -10, 30, 41, 21, (lat, lon) => lat * lon)
  assert.ok(Number.isNaN(T.sampleLattice(r, 30, 0)))
  assert.ok(Number.isNaN(T.sampleLattice(r, 50, 40)))
  assert.equal(T.sampleLattice(r, 50, 10), 500)
})

test("grid sampling agrees with per-node sampling, region first", () => {
  const pair = {
    global: globalOf((lat, lon) => Math.sin(lat / 20) + Math.cos(lon / 30)),
    region: lattice(40, 60, -10, 30, 41, 21, (lat, lon) => 100 + lat - lon)
  }
  const box = { south: 30, north: 70, west: -20, east: 40 }
  const cols = 61, rows = 41, n = cols * rows
  const lats = new Array(n), lons = new Array(n), a = new Array(n), b = new Array(n)
  T.gridNodes(box, cols, rows, lats, lons)
  T.sampleInto(pair, lats, lons, a, true)
  T.sampleGrid(pair, box, cols, rows, b, true)
  for (let i = 0; i < n; i++) assert.ok(Math.abs(a[i] - b[i]) < 1e-9, `${i}: ${a[i]} ${b[i]}`)
  // A node in the region reads the region, one outside the global lattice.
  const at = (lat, lon) => b[Math.round((70 - lat) / 40 * (rows - 1)) * cols + Math.round((lon + 20) / 60 * (cols - 1))]
  assert.ok(Math.abs(at(50, 10) - 140) < 1e-9)
  assert.ok(Math.abs(at(35, -15) - (Math.sin(35 / 20) + Math.cos(-15 / 30))) < 1e-9)
})

test("the regions' box: union, finest step", () => {
  const lattices = {
    temperature: { global: null, region: lattice(40, 60, -10, 30, 41, 21, () => 0) },
    cloud: { global: null, region: lattice(45, 65, 0, 20, 81, 81, () => 0) },
    wind: { global: null, region: null }
  }
  const box = T.regionBox(["temperature", "cloud", "wind"], lattices)
  assert.deepEqual([box.south, box.north, box.west, box.east], [40, 65, -10, 30])
  assert.equal(box.step, 0.25)
  assert.equal(T.regionBox(["wind"], lattices), null)
})

// The wash's per-node colour (WeatherGlobeWash.qml), for comparison.
function washColour(pal, kind, value) {
  const r = F.range(kind, 100), count = F.bucketCount(kind)
  const x = (value - r.min) * count / (r.max - r.min) - 0.5
  const P = pal[kind]
  const i0 = x <= 0 ? 0 : (x >= count - 1 ? count - 2 : Math.floor(x))
  const t = x <= 0 ? 0 : (x >= count - 1 ? 1 : x - i0)
  const a = i0 * 4, b = Math.min(count - 1, i0 + 1) * 4
  return [0, 1, 2, 3].map((k) => P[a + k] * (1 - t) + P[b + k] * t)
}

test("composed colours: the wash's, within the tables' step", () => {
  const pal = T.palettes(null)
  const n = 200
  const temperature = Array.from({ length: n }, (_, i) => -45 + i * 0.47)
  const px = new Array(n * 4).fill(-1)
  T.compose({ temperature }, null, pal, 100, px, n)
  for (let i = 0; i < n; i++) {
    const want = washColour(pal, "temperature", temperature[i])
    for (let k = 0; k < 4; k++) assert.ok(Math.abs(px[i * 4 + k] - want[k]) < 1.5, `${temperature[i]} ${k}: ${px[i * 4 + k]} ${want[k]}`)
  }
})

test("composed layers: nothing where unknown, cloud's veil, rain from 0.1 mm/h", () => {
  const pal = T.palettes(null)
  const px = new Array(16).fill(-1)
  T.compose({ cloud: [NaN, 100, 0, 50], precipitation: [NaN, NaN, 0.05, 25] }, null, pal, 100, px, 4)
  assert.deepEqual(px.slice(0, 4), [0, 0, 0, 0])
  assert.deepEqual(px.slice(4, 8).map(Math.round), [255, 255, 255, 179])
  assert.equal(px[11], 0)
  // Heavy rain over a half veil: the last step's red shows through.
  assert.ok(px[12] > 200 && px[13] < 120 && px[15] > 200, String(px.slice(12)))
})

test("sea's temperature over the ocean, the air's over land", () => {
  const pal = T.palettes(null)
  const px = new Array(8).fill(0)
  T.compose({ temperature: [30, 30], sst: [0, 0] }, [0, 1], pal, 100, px, 2)
  const sea = washColour(pal, "sst", 0), air = washColour(pal, "temperature", 30)
  assert.ok(Math.abs(px[0] - sea[0]) < 1.5 && Math.abs(px[4] - air[0]) < 1.5)
})
