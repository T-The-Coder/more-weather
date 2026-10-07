// The globe's radar layer (GlobeRadar.js): tiles per view, web mercator
// to equirectangular, frames by time, a place's colour.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const R = load("GlobeRadar.js")
const plain = (value) => JSON.parse(JSON.stringify(value))
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`)

test("mercator rows and latitudes round trip; tile boxes", () => {
  for (const lat of [-80, -45, 0, 33.3, 60, 85]) near(R.latOfY(R.mercatorY(lat, 5), 5), lat)
  near(R.mercatorY(0, 3), 4)
  const box = plain(R.tileBox(3, 4, 2))
  near(box.west, 0); near(box.east, 45)
  near(box.north, R.latOfY(2, 3)); near(box.south, R.latOfY(3, 3))
  assert.ok(box.north > 66 && box.north < 67 && box.south > 40 && box.south < 41)
  assert.equal(R.tileZoomFor(2), 3)
  assert.equal(R.tileZoomFor(5), 6)
  assert.equal(R.tileZoomFor(7), 7)
})

test("tiles for a view: centre first, at most 16, wrapping at 180°, zooming out when too many", () => {
  const alps = { south: 44, north: 50, west: 5, east: 14 }
  const tiles = plain(R.tilesFor(alps, 6))
  assert.ok(tiles.length >= 1 && tiles.length <= 16)
  assert.ok(tiles.every((t) => t.z === 6))
  const first = R.tileBox(6, tiles[0].x, tiles[0].y)
  assert.ok(first.west <= 9.5 && first.east >= 9.5 && first.south <= 47 && first.north >= 47, "the centre's tile first")
  // Across the date line: tiles on both sides.
  const pacific = plain(R.tilesFor({ south: -10, north: 10, west: 170, east: 190 }, 5))
  const xs = new Set(pacific.map((t) => t.x))
  assert.ok(xs.has(31) && xs.has(0))
  // A box too large for 16 tiles at zoom 6 comes at a lower zoom.
  const europe = plain(R.tilesFor({ south: 30, north: 70, west: -20, east: 40 }, 6))
  assert.ok(europe.length <= 16 && europe[0].z < 6)
  assert.match(R.tileUrl("https://tilecache.rainviewer.com", "/v2/radar/123", 5, 16, 10), /^https:\/\/tilecache\.rainviewer\.com\/v2\/radar\/123\/512\/5\/16\/10\/2\/1_1\.png$/)
})

test("reprojection: each output row reads the mercator row of its latitude", () => {
  const map = plain(R.rowMap(3, 2, 128, 512))
  assert.equal(map.length, 128)
  for (let i = 1; i < map.length; i++) assert.ok(map[i] >= map[i - 1], "monotone")
  // The row at the box's middle latitude reads below the mercator middle
  // (mercator stretches the north of a northern tile).
  const box = R.tileBox(3, 0, 2)
  const midLat = (box.north + box.south) / 2
  const expect = Math.floor((R.mercatorY(midLat, 3) - 2) * 512)
  assert.ok(Math.abs(map[64] - expect) <= 3)
  assert.ok(map[64] > 256)
  assert.ok(map[0] < 5 && map[127] > 507)
})

test("frames: the nearest within the radar's span, else the latest", () => {
  const t0 = Date.UTC(2026, 9, 8, 10)
  const frames = [0, 10, 20].map((m) => ({ timestamp: new Date(t0 + m * 60000).toISOString(), id: m }))
  assert.deepEqual(plain(R.frameFor(frames, t0 + 12 * 60000)), { frame: frames[1], inRange: true })
  assert.deepEqual(plain(R.frameFor(frames, t0 + 3 * 3600000)), { frame: frames[2], inRange: false })
  assert.deepEqual(plain(R.frameFor([], t0)), { frame: null, inRange: false })
})

test("a place's colour from the reprojected tiles", () => {
  const z = 4, x = R.tileX(9, z), y = Math.floor(R.mercatorY(47, z))
  const size = 4
  const rgba = []
  for (let i = 0; i < size * size; i++) rgba.push(i, 0, 0, 255)
  const raster = { z, tiles: { [R.tileKey(z, x, y)]: { box: R.tileBox(z, x, y), size, rgba } } }
  const out = [0, 0, 0, 0]
  assert.ok(R.sample(raster, 47, 9, out))
  assert.equal(out[3], 255)
  assert.ok(!R.sample(raster, -30, 100, out))
})

test("the z2 box picture: the tiles' union, across ±180° too, and each tile's rectangle", () => {
  const tile = (z, x, y) => ({ box: R.tileBox(z, x, y), size: 4, rgba: [] })
  const raster = { z: 3, tiles: { "3/4/2": tile(3, 4, 2), "3/5/2": tile(3, 5, 2), "3/4/3": tile(3, 4, 3) } }
  const box = plain(R.rasterBox(raster, 20))
  near(box.west, 0); near(box.east, 90)
  near(box.north, R.latOfY(2, 3)); near(box.south, R.latOfY(4, 3))
  const rect = plain(R.tileRect(R.tileBox(3, 5, 2), box, 1024, 1024))
  near(rect.x, 512); near(rect.width, 512); near(rect.y, 0)
  assert.ok(rect.height > 0 && rect.height < 1024)
  // Across the date line: the tiles east of 180° join those west of it.
  const pacific = { z: 3, tiles: { "3/7/3": tile(3, 7, 3), "3/0/3": tile(3, 0, 3) } }
  const pbox = plain(R.rasterBox(pacific, 179))
  near(pbox.west, 135); near(pbox.east, 225)
  near(plain(R.tileRect(R.tileBox(3, 0, 3), pbox, 1024, 1024)).x, 512)
})

test("a mercator tile in strips of equal latitude covers its source rows in order", () => {
  const parts = plain(R.strips(3, 2, 48, 512))
  assert.equal(parts.length, 48)
  near(parts[0].sy, 0, 1e-6)
  const last = parts[47]
  near(last.sy + last.sh, 512, 1e-6)
  for (let i = 1; i < 48; i++) near(parts[i].sy, parts[i - 1].sy + parts[i - 1].sh, 1e-6)
  // Mercator stretches the north: the top strip reads more source rows.
  assert.ok(parts[0].sh > parts[47].sh)
  near(parts.reduce((s, p) => s + p.dh, 0), 1, 1e-9)
})
