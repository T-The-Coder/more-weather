// The JMA tiles' PNG reader (Model.pngPixelIndex, jmaTileRainRate) and its
// DEFLATE (Model.inflateBytes): valid tiles decode as before; truncated,
// forged or oversized ones are refused at once, with bounded work.
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { deflateSync, deflateRawSync, crc32 } from "node:zlib"
import { load, root } from "./load.mjs"

const M = load("Model.js")

// A string of byte values, as the request hands it over.
const asText = (bytes) => String.fromCharCode(...bytes)
const bigText = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return s }

function chunk(type, data) {
  const head = Buffer.alloc(8)
  head.writeUInt32BE(data.length, 0)
  head.write(type, 4, "latin1")
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "latin1"), data])) >>> 0, 0)
  return Buffer.concat([head, data, crc])
}
const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
function ihdr(width, height, depth, colourType) {
  const d = Buffer.alloc(13)
  d.writeUInt32BE(width, 0); d.writeUInt32BE(height, 4); d[8] = depth; d[9] = colourType
  return chunk("IHDR", d)
}
// An 8-bit grey picture with the given filter per row (value = (x * 7 + y * 13) & 255).
function greyPng(width, height, filterOf) {
  const rows = []
  let previous = Buffer.alloc(width)
  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(width)
    for (let x = 0; x < width; x++) line[x] = (x * 7 + y * 13) & 255
    const f = filterOf(y)
    const out = Buffer.alloc(width + 1)
    out[0] = f
    for (let x = 0; x < width; x++) {
      const a = x ? line[x - 1] : 0, b = previous[x], c = x ? previous[x - 1] : 0
      let pred = 0
      if (f === 1) pred = a
      else if (f === 2) pred = b
      else if (f === 3) pred = (a + b) >> 1
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        pred = pa <= pb && pa <= pc ? a : (pb <= pc ? b : c)
      }
      out[x + 1] = (line[x] - pred) & 255
    }
    rows.push(out)
    previous = line
  }
  return Buffer.concat([SIGNATURE, ihdr(width, height, 8, 0), chunk("IDAT", deflateSync(Buffer.concat(rows))), chunk("IEND", Buffer.alloc(0))])
}
const fast = (fn, ms = 200) => {
  const start = performance.now()
  const result = fn()
  const took = performance.now() - start
  assert.ok(took < ms, `took ${took.toFixed(1)} ms`)
  return result
}

test("a real JMA tile: 4-bit palette, the rain rates at known pixels", () => {
  const tile = bigText(readFileSync(join(root, "tests/fixtures/jma-tile-6-54-27.png")))
  // Indices found with Python's zlib in the same tile (6/54/27, 2026-10-11 23:40 UTC).
  const expected = [[0, 0, 0], [147, 0, 1], [168, 0, 2], [179, 0, 3], [180, 0, 4], [181, 0, 5],
    [182, 0, 6], [184, 0, 7], [185, 1, 8], [185, 0, 9]]
  for (const [x, y, index] of expected) {
    assert.equal(M.pngPixelIndex(tile, x, y), index, `${x},${y}`)
    assert.equal(M.jmaTileRainRate(tile, x, y), M.JMA_RAIN_RATES[index])
  }
})

test("all five row filters decode", () => {
  const png = asText(greyPng(64, 10, (y) => y % 5))
  for (const [x, y] of [[0, 0], [5, 3], [63, 9], [17, 4]])
    assert.equal(M.pngPixelIndex(png, x, y), (x * 7 + y * 13) & 255)
})

test("a forged IDAT length beyond the data is refused at once", () => {
  const good = greyPng(16, 4, () => 0)
  const forged = Buffer.from(good)
  const idat = forged.indexOf("IDAT", 0, "latin1") - 4
  forged.writeUInt32BE(0xfffffff0, idat)
  assert.equal(fast(() => M.pngPixelIndex(asText(forged), 1, 1)), null)
  // A tiny file that claims 4 GiB of image data.
  const tiny = Buffer.concat([SIGNATURE, ihdr(256, 256, 8, 0), Buffer.from([0xff, 0xff, 0xff, 0xff]), Buffer.from("IDAT", "latin1"), Buffer.alloc(40)])
  assert.equal(fast(() => M.pngPixelIndex(asText(tiny), 0, 0)), null)
})

test("truncated, out of order and oversized pictures are refused", () => {
  const good = greyPng(32, 8, () => 1)
  assert.notEqual(M.pngPixelIndex(asText(good), 3, 3), null)
  for (const cut of [20, 40, good.length - 20, good.length - 1])
    assert.equal(fast(() => M.pngPixelIndex(asText(good.subarray(0, cut)), 3, 3)), null, `cut at ${cut}`)
  // IHDR not first, IHDR twice.
  const body = good.subarray(8)
  const ihdrChunk = body.subarray(0, 25)
  const rest = body.subarray(25)
  assert.equal(M.pngPixelIndex(asText(Buffer.concat([SIGNATURE, chunk("tEXt", Buffer.from("a")), body])), 3, 3), null)
  assert.equal(M.pngPixelIndex(asText(Buffer.concat([SIGNATURE, ihdrChunk, ihdrChunk, rest])), 3, 3), null)
  // Sides above 2048 or 4 Mi pixels, with a valid small stream behind them.
  const idat = chunk("IDAT", deflateSync(Buffer.alloc(10)))
  const end = chunk("IEND", Buffer.alloc(0))
  for (const [w, h] of [[4096, 1], [1, 100000], [2048, 2048 + 1], [0, 5]])
    assert.equal(fast(() => M.pngPixelIndex(asText(Buffer.concat([SIGNATURE, ihdr(w, h, 8, 0), idat, end])), 0, 0)), null, `${w}×${h}`)
  // The rows shorter or longer than the header says.
  const short = Buffer.concat([SIGNATURE, ihdr(32, 8, 8, 0), chunk("IDAT", deflateSync(Buffer.alloc(33 * 7))), end])
  assert.equal(M.pngPixelIndex(asText(short), 0, 0), null)
  const long = Buffer.concat([SIGNATURE, ihdr(32, 8, 8, 0), chunk("IDAT", deflateSync(Buffer.alloc(33 * 9))), end])
  assert.equal(M.pngPixelIndex(asText(long), 0, 0), null)
  // An unknown row filter.
  const rows = Buffer.alloc(33 * 8); rows[0] = 7
  assert.equal(M.pngPixelIndex(asText(Buffer.concat([SIGNATURE, ihdr(32, 8, 8, 0), chunk("IDAT", deflateSync(rows)), end])), 0, 0), null)
})

test("inflate: valid streams, capped output, malformed streams fail fast", () => {
  const plain = Buffer.from("the quick brown fox ".repeat(50))
  assert.deepEqual(Buffer.from(M.inflateBytes([...deflateRawSync(plain)], 0)), plain)
  assert.deepEqual(Buffer.from(M.inflateBytes([...deflateRawSync(plain, { level: 0 })], 0)), plain)
  // A bomb: 4 MiB of zeros from a few KiB; refused past the cap.
  const bomb = [...deflateRawSync(Buffer.alloc(4 * 1024 * 1024))]
  assert.throws(() => fast(() => M.inflateBytes(bomb, 0, 1024 * 1024), 1000), /too large/)
  // Stored block whose length is not matched by its complement, or longer than the data.
  assert.throws(() => M.inflateBytes([1, 10, 0, 0, 0, 1, 2], 0), /stored/)
  assert.throws(() => M.inflateBytes([1, 200, 0, 55, 255, 1, 2], 0), /stored/)
  // Random bytes end in an error within the input, never hang.
  let seed = 7
  const random = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) & 255
  for (let i = 0; i < 200; i++) {
    const data = Array.from({ length: 64 }, random)
    fast(() => { try { M.inflateBytes(data, 0, 65536) } catch (e) { /* refused */ } }, 100)
  }
})
