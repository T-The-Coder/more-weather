import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

// Moon.js is shared by the More plugins (tools/sync-shared.sh).
const Moon = load("Moon.js")
const near = (a, b, eps) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)
const wrap = (d) => ((d % 360) + 540) % 360 - 180

test("moon: phase at a known full and new moon", () => {
  // Full moon 7 Oct 2025 03:47 UTC, new moon 21 Oct 2025 12:25 UTC.
  const full = Moon.moonPosition(Date.UTC(2025, 9, 7, 3, 47))
  const fresh = Moon.moonPosition(Date.UTC(2025, 9, 21, 12, 25))
  near(full.phase, 0.5, 0.01)
  assert.ok(full.illuminated > 0.99)
  assert.ok(Math.min(fresh.phase, 1 - fresh.phase) < 0.01)
  assert.ok(fresh.illuminated < 0.01)
  near(Moon.moonPhaseFraction(Date.UTC(2025, 9, 7, 3, 47)), full.phase, 1e-12)
  assert.equal(Moon.moonPosition(Date.UTC(2025, 9, 10)).waxing, false)
  assert.equal(Moon.moonPosition(Date.UTC(2025, 9, 1)).waxing, true)
})

test("moon: where it stands at the zenith", () => {
  // Within the Moon's range of declination, a month long.
  for (let d = 0; d < 30; d++) assert.ok(Math.abs(Moon.moonPosition(Date.UTC(2026, 0, 1) + d * 86400000).lat) <= 28.7)
  // Westward by about 14.5° an hour (a lunar day is 24 h 50 min).
  const a = Moon.moonPosition(Date.UTC(2026, 9, 2, 12))
  const b = Moon.moonPosition(Date.UTC(2026, 9, 2, 13))
  near(wrap(b.lon - a.lon), -14.5, 0.3)
  // A full moon stands opposite the Sun, whose zenith at 03:47 UTC lies
  // near 126° E (noon there, with the equation of time); a new moon beside
  // it, near 3° W at 12:25 UTC.
  assert.ok(Math.abs(wrap(Moon.moonPosition(Date.UTC(2025, 9, 7, 3, 47)).lon - 126)) > 165)
  assert.ok(Math.abs(wrap(Moon.moonPosition(Date.UTC(2025, 9, 21, 12, 25)).lon + 3)) < 15)
})

test("moon: the way towards the Sun, for the lit side", () => {
  near(Moon.towards(0, 0, 0, 90, 45).lon, 45, 1e-9)
  near(Moon.towards(0, 0, 90, 0, 30).lat, 30, 1e-9)
  // On a flat projection (lon to x, lat up), the Sun due east lights the right.
  const angle = Moon.moonLitAngle({ lat: 0, lon: 170 }, { lat: 0, lon: -100 }, (lat, lon) => ({ x: lon, y: -lat }))
  near(angle, 0, 1e-9)
  assert.equal(Moon.rgbText({ r: 1, g: 0.5, b: 0 }), "255,128,0")
})

test("moon: drawing styles, from space and as seen from Earth", () => {
  const waxing = { waxing: true }
  const waning = { waxing: false }
  // As seen from Earth: waxing lit on the right in the north, on the left
  // in the south; waning the other way round. The equator counts as north.
  assert.equal(Moon.moonLitAngleFor("earth", waxing, 1.23, 48.3), 0)
  assert.equal(Moon.moonLitAngleFor("earth", waning, 1.23, 48.3), Math.PI)
  assert.equal(Moon.moonLitAngleFor("earth", waxing, 1.23, -33.9), Math.PI)
  assert.equal(Moon.moonLitAngleFor("earth", waning, 1.23, -33.9), 0)
  assert.equal(Moon.moonLitAngleFor("earth", waxing, 1.23, 0), 0)
  // From space (and any other or missing style): the angle towards the Sun.
  for (const style of ["space", "", undefined]) {
    assert.equal(Moon.moonLitAngleFor(style, waxing, 1.23, 48.3), 1.23)
    assert.equal(Moon.moonLitAngleFor(style, waning, -2.5, -33.9), -2.5)
  }
  // With a real moon: a few days after the new moon of 2026-10-10 it waxes.
  const moon = Moon.moonPosition(Date.UTC(2026, 9, 14, 12))
  assert.ok(moon.waxing)
  assert.equal(Moon.moonLitAngleFor("earth", moon, 0.5, 52.5), 0)
})

test("moon: earthshine lights the night side of a thin crescent", () => {
  const fake = () => {
    const fills = []
    let style = ""
    const ctx = new Proxy({}, {
      get: (_, name) => name === "fillStyle" ? style : (name === "fill" ? () => fills.push(style)
        : (name === "createRadialGradient" ? () => ({ addColorStop() {} }) : () => {})),
      set: (_, name, value) => { if (name === "fillStyle") style = value; return true }
    })
    return { ctx, fills }
  }
  const plain = fake()
  Moon.paintMoon(plain.ctx, 10, 10, 8, 0, 0.1, "238,236,226", "20,20,40", "200,200,200")
  const lit = fake()
  Moon.paintMoon(lit.ctx, 10, 10, 8, 0, 0.1, "238,236,226", "20,20,40", "200,200,200", true)
  assert.equal(lit.fills.length, plain.fills.length + 1)
  assert.ok(lit.fills.some((s) => String(s).startsWith("rgba(" + Moon.EARTHSHINE)))
  assert.ok(!plain.fills.some((s) => String(s).startsWith("rgba(" + Moon.EARTHSHINE)))
})

test("moon: compass points", () => {
  assert.equal(Moon.compassPoint(0), "N")
  assert.equal(Moon.compassPoint(22.4), "N")
  assert.equal(Moon.compassPoint(22.6), "NE")
  assert.equal(Moon.compassPoint(135), "SE")
  assert.equal(Moon.compassPoint(200), "S")
  assert.equal(Moon.compassPoint(359), "N")
  assert.equal(Moon.compassPoint(-90), "W")
  assert.equal(Moon.compassPoint(316), "NW")
})
