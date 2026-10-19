// The map picture store's PNG rewriter (Model.pngSanitized): downloaded
// pictures keep their header, palette, transparency and image data, lose
// every other chunk, and anything malformed or oversized is refused at once.
// Also the store's base64 helpers (Model.base64Decoded / base64Encoded).
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { deflateSync, crc32 } from "node:zlib"
import { load, root } from "./load.mjs"

const M = load("Model.js")

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
function ihdr(width, height, depth, colourType, interlace = 0) {
  const d = Buffer.alloc(13)
  d.writeUInt32BE(width, 0); d.writeUInt32BE(height, 4); d[8] = depth; d[9] = colourType; d[12] = interlace
  return chunk("IHDR", d)
}
// Chunks of an 8-bit RGBA picture, without signature and IEND.
function rgbaParts(width, height) {
  const rows = []
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 4 + 1)
    for (let x = 0; x < width; x++) row.set([x & 255, y & 255, (x + y) & 255, 200], 1 + x * 4)
    rows.push(row)
  }
  const data = deflateSync(Buffer.concat(rows))
  return { head: ihdr(width, height, 8, 6), idat: [chunk("IDAT", data.subarray(0, 100)), chunk("IDAT", data.subarray(100))] }
}
const IEND = chunk("IEND", Buffer.alloc(0))
const png = (...parts) => bigText(Buffer.concat([SIGNATURE, ...parts]))
const types = (text) => {
  const out = []
  for (let p = 8; p + 8 <= text.length;) {
    const n = ((text.charCodeAt(p) << 24) | (text.charCodeAt(p + 1) << 16) | (text.charCodeAt(p + 2) << 8) | text.charCodeAt(p + 3)) >>> 0
    out.push(text.slice(p + 4, p + 8))
    p += 12 + n
  }
  return out
}
const fast = (fn, ms = 300) => {
  const start = performance.now()
  const result = fn()
  const took = performance.now() - start
  assert.ok(took < ms, `took ${took.toFixed(1)} ms`)
  return result
}
const sanitize = (text) => M.pngSanitized(text, 2048, 4 * 1024 * 1024, 4 * 1024 * 1024)

test("a real JMA tile comes through byte for byte, every pixel the same", () => {
  const tile = bigText(readFileSync(join(root, "tests/fixtures/jma-tile-6-54-27.png")))
  const clean = sanitize(tile)
  assert.equal(clean, tile)
  for (let y = 0; y < 256; y += 17)
    for (let x = 0; x < 256; x += 13)
      assert.equal(M.pngPixelIndex(clean, x, y), M.pngPixelIndex(tile, x, y))
})

test("ancillary chunks are dropped, the picture stays", () => {
  const { head, idat } = rgbaParts(64, 32)
  const text = (k, v) => chunk(k, Buffer.from(v, "latin1"))
  const original = png(head, text("tEXt", "Comment\0hello"), text("gAMA", "\0\0\xb1\x8f"),
    text("iCCP", "p\0\0" + "x".repeat(40)), text("pHYs", "123456789"), text("eXIf", "MM\0*"),
    text("acTL", "\0\0\0\x01\0\0\0\0"), text("fcTL", "x".repeat(26)), ...idat,
    text("fdAT", "\0\0\0\x01abc"), text("zTXt", "k\0\0xyz"), text("prVt", "private"), IEND)
  const clean = sanitize(original)
  assert.deepEqual(types(clean), ["IHDR", "IDAT", "IDAT", "IEND"])
  assert.equal(clean, png(head, ...idat, IEND))
})

test("10,000 zTXt chunks never reach the output (the chunk cap refuses them)", () => {
  const { head, idat } = rgbaParts(8, 8)
  const bomb = chunk("zTXt", Buffer.concat([Buffer.from("Comment\0\0", "latin1"), deflateSync(Buffer.alloc(100000))]))
  const many = Array(10000).fill(bomb)
  assert.equal(fast(() => sanitize(png(head, ...many, ...idat, IEND))), null)
  // Below the cap they are simply left out.
  const clean = sanitize(png(head, ...Array(100).fill(bomb), ...idat, IEND))
  assert.deepEqual(types(clean), ["IHDR", "IDAT", "IDAT", "IEND"])
})

test("palette and transparency are kept once each, before the data", () => {
  const plte = chunk("PLTE", Buffer.from([0, 0, 0, 255, 0, 0]))
  const trns = chunk("tRNS", Buffer.from([0, 255]))
  const data = chunk("IDAT", deflateSync(Buffer.from([0, 0x01, 0, 0x10])))
  const ok = png(ihdr(8, 2, 1, 3), plte, trns, data, IEND)
  assert.equal(sanitize(ok), ok)
  assert.equal(M.pngPixelIndex(sanitize(ok), 7, 0), 1)
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), plte, plte, data, IEND)), null)
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), plte, trns, trns, data, IEND)), null)
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), data, plte, IEND)), null)
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), data, IEND)), null, "a palette picture without palette")
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), chunk("PLTE", Buffer.alloc(771)), data, IEND)), null)
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), chunk("PLTE", Buffer.alloc(4)), data, IEND)), null)
  assert.equal(sanitize(png(ihdr(8, 2, 1, 3), plte, chunk("tRNS", Buffer.alloc(257)), data, IEND)), null)
})

test("interlaced pictures and every colour type pass", () => {
  const data = chunk("IDAT", deflateSync(Buffer.alloc(64)))
  for (const [depth, colourType] of [[8, 0], [16, 0], [8, 2], [16, 2], [8, 4], [8, 6], [16, 6]])
    for (const interlace of [0, 1]) {
      const p = png(ihdr(4, 4, depth, colourType, interlace), data, IEND)
      assert.equal(sanitize(p), p, `${depth}/${colourType}/${interlace}`)
    }
  assert.equal(sanitize(png(ihdr(4, 4, 8, 0, 2), data, IEND)), null)
  assert.equal(sanitize(png(ihdr(4, 4, 4, 2), data, IEND)), null)
  assert.equal(sanitize(png(ihdr(4, 4, 8, 5), data, IEND)), null)
})

test("an IDAT claiming 4 GiB is refused at once", () => {
  const head = Buffer.alloc(8)
  head.writeUInt32BE(0xffffffff, 0); head.write("IDAT", 4, "latin1")
  assert.equal(fast(() => sanitize(png(ihdr(4, 4, 8, 0), head, Buffer.alloc(64)))), null)
})

test("too much image data, too many pixels or too wide a picture is refused", () => {
  const big = Buffer.alloc(1024 * 1024)
  const idat = chunk("IDAT", big)
  // Four MiB and a little more of image data, the file itself within PNG_MAX_FILE.
  assert.equal(fast(() => sanitize(png(ihdr(2048, 2048, 8, 6), idat, idat, idat, idat, chunk("IDAT", Buffer.alloc(100)), IEND)), 1000), null)
  assert.notEqual(sanitize(png(ihdr(2048, 2048, 8, 6), idat, idat, idat, chunk("IDAT", Buffer.alloc(100)), IEND)), null)
  assert.notEqual(M.pngSanitized(png(ihdr(64, 64, 8, 0), chunk("IDAT", Buffer.alloc(100)), IEND), 2048, 4096, 1000), null)
  assert.equal(M.pngSanitized(png(ihdr(64, 64, 8, 0), chunk("IDAT", Buffer.alloc(100)), IEND), 2048, 4095, 1000), null)
  assert.equal(M.pngSanitized(png(ihdr(64, 64, 8, 0), chunk("IDAT", Buffer.alloc(100)), IEND), 2048, 4096, 99), null)
  assert.equal(sanitize(png(ihdr(2049, 1, 8, 0), chunk("IDAT", Buffer.alloc(100)), IEND)), null)
  assert.equal(sanitize(png(ihdr(0, 1, 8, 0), chunk("IDAT", Buffer.alloc(100)), IEND)), null)
})

test("APNG frames are dropped: the default image alone remains", () => {
  const { head, idat } = rgbaParts(16, 16)
  const fdat = chunk("fdAT", Buffer.concat([Buffer.from([0, 0, 0, 1]), deflateSync(Buffer.alloc(16 * 65))]))
  const clean = sanitize(png(head, chunk("acTL", Buffer.from([0, 0, 0, 2, 0, 0, 0, 0])), chunk("fcTL", Buffer.alloc(26)),
    ...idat, chunk("fcTL", Buffer.alloc(26)), fdat, IEND))
  assert.deepEqual(types(clean), ["IHDR", "IDAT", "IDAT", "IEND"])
  // Image data split by another chunk is not one run.
  assert.equal(sanitize(png(head, idat[0], chunk("tEXt", Buffer.from("a\0b")), idat[1], IEND)), null)
})

test("not a PNG, truncated, out of order or with odd chunk names: null", () => {
  const { head, idat } = rgbaParts(8, 8)
  const good = png(head, ...idat, IEND)
  assert.equal(sanitize(good), good)
  assert.equal(sanitize("\xff\xd8\xff\xe0" + "x".repeat(100)), null, "JPEG")
  assert.equal(sanitize("RIFF\0\0\0\0WEBPVP8 " + "x".repeat(100)), null, "WebP")
  assert.equal(sanitize("GIF89a" + "x".repeat(100)), null, "GIF")
  assert.equal(sanitize(""), null)
  assert.equal(sanitize(null), null)
  assert.equal(sanitize(good.slice(0, good.length - 12)), null, "no IEND")
  assert.equal(sanitize(good.slice(0, good.length - 20)), null, "cut in the data")
  assert.equal(sanitize(png(...idat, head, IEND)), null, "IHDR not first")
  assert.equal(sanitize(png(head, head, ...idat, IEND)), null, "IHDR twice")
  assert.equal(sanitize(png(head, IEND)), null, "no image data")
  assert.equal(sanitize(png(head, chunk("tE1t", Buffer.from("x")), ...idat, IEND)), null, "chunk name")
  assert.equal(sanitize(png(head, ...idat, chunk("IEND", Buffer.from("x")))), null, "IEND with data")
  // Whatever follows IEND is left behind.
  assert.equal(sanitize(good + "trailing garbage"), good)
})

test("base64 both ways, byte for byte", () => {
  const all = bigText(Array.from({ length: 256 }, (_, i) => i))
  for (const text of ["", "a", "ab", "abc", "abcd", all, all.repeat(97)]) {
    const encoded = M.base64Encoded(text)
    assert.equal(encoded, Buffer.from(text, "latin1").toString("base64"))
    assert.equal(M.base64Decoded(encoded), text)
    assert.equal(M.base64Decoded(encoded.replace(/(.{76})/g, "$1\n")), text)
  }
  const tile = readFileSync(join(root, "tests/fixtures/jma-tile-6-54-27.png"))
  assert.equal(M.base64Decoded(tile.toString("base64")), bigText(tile))
})
