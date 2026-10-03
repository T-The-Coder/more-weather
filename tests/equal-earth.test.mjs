// The Equal Earth projection and the flat twilight polygons (EqualEarth.js),
// with the sun of Sky.js. Shared by the More plugins (tools/sync-shared.sh).
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const E = load("EqualEarth.js")
const S = load("Sky.js")
const land = JSON.parse(readFileSync(join(root, "data/globe-land.json"), "utf8"))
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)
// Even-odd point in a ring [x0, y0, x1, y1, ...] given in map units × scale.
const insideRing = (ring, x, y, scale) => {
  let inside = false
  const px = x * scale, py = y * scale
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
// Whether a point (lat, lon) lies in a flat-map polygon (projected points),
// by the even-odd rule the map fills with.
const insideFlat = (polygon, lat, lon) => {
  const p = E.project(lat, lon)
  return insideRing(polygon.flatMap((q) => [q.x, q.y]), p.x, p.y, 1)
}

test("projection matches tools/build-worldmap.py", () => {
  // Values printed by the Python build's project().
  near(E.project(52.5, 13.4).x, 0.1627644995627186)
  near(E.project(52.5, 13.4).y, 0.9803646718999339)
  near(E.project(40.7, -74).x, -0.9818620901576243)
  near(E.project(0, 180).x, E.X_MAX)
  near(E.project(90, 0).y, E.Y_MAX)
})

test("inverse projection round trips", () => {
  for (const [lat, lon] of [[0, 0], [52.5, 13.4], [-33.9, 151.2], [70, -150]]) {
    const p = E.project(lat, lon)
    const back = E.unproject(p.x, p.y)
    near(back.lat, lat, 1e-6)
    near(back.lon, lon, 1e-6)
  }
  assert.equal(E.unproject(E.X_MAX * 0.99, E.Y_MAX * 0.99), null)
})

test("night side", () => {
  const night = E.nightPolygon(Date.UTC(2026, 5, 21, 12))
  assert.ok(night.length > 100)
  // At that moment midnight is at 180°: the date line is dark, Greenwich not.
  const ring = night.flatMap(p => [p.x, p.y])
  assert.ok(insideRing(ring, E.project(0, 179).x, 0, 1))
  assert.ok(!insideRing(ring, E.project(0, 1).x, 0, 1))
})

test("twilight bands: nested caps around the point opposite the sun", () => {
  // An equinox (both poles in the +6° cap), a solstice and today.
  for (const ms of [Date.UTC(2026, 2, 20, 9, 30), Date.UTC(2026, 5, 21, 18), Date.UTC(2026, 9, 2, 15, 44)]) {
    const golden = E.twilightPolygon(ms, 6)
    const blue = E.twilightPolygon(ms, -4)
    const deep = E.twilightPolygon(ms, -8)
    const sun = S.subsolarPoint(ms)
    for (const poly of [golden, blue, deep, E.nightPolygon(ms)]) assert.ok(!insideFlat(poly, sun.lat, sun.lon), "sun outside")
    const anti = { lat: -sun.lat, lon: sun.lon > 0 ? sun.lon - 180 : sun.lon + 180 }
    for (const poly of [golden, blue, deep]) assert.ok(insideFlat(poly, anti.lat, anti.lon), "antipode inside")
    // Every point agrees with the sun's elevation there, and the caps nest.
    for (let lat = -84; lat <= 84; lat += 6) {
      for (let lon = -177; lon <= 177; lon += 6) {
        const e = S.sunElevation(lat, lon, ms)
        const inGolden = insideFlat(golden, lat, lon)
        const inBlue = insideFlat(blue, lat, lon)
        const inDeep = insideFlat(deep, lat, lon)
        if (Math.abs(e - 6) > 0.5) assert.equal(inGolden, e < 6, `+6° at ${lat},${lon} (${e.toFixed(1)}°)`)
        if (Math.abs(e + 4) > 0.5) assert.equal(inBlue, e < -4, `−4° at ${lat},${lon}`)
        if (Math.abs(e + 8) > 0.5) assert.equal(inDeep, e < -8, `−8° at ${lat},${lon}`)
        if (inDeep) assert.ok(inBlue)
        if (inBlue) assert.ok(inGolden)
      }
    }
  }
})

test("twilight: the flat map's polygon and the globe's rings cover the same area", () => {
  // One pole in the cap: the night side always, the bands at a solstice.
  // The flat polygon is traced differently (copies and bridges), so the
  // areas are compared point by point, away from the edge: the rings take a
  // point every 2° of longitude, coarse where the edge runs nearly north–south.
  const cases = [[Date.UTC(2026, 9, 2, 15, 44), 0], [Date.UTC(2026, 5, 21, 18), 0],
    [Date.UTC(2026, 5, 21, 18), 6], [Date.UTC(2026, 5, 21, 18), -4], [Date.UTC(2026, 11, 21, 6), -8]]
  for (const [ms, e] of cases) {
    const rings = S.twilightRings(ms, e)
    assert.equal(rings.length, 1, `one ring at ${e}°`)
    const ring = rings[0].map((p) => E.project(p.lat, p.lon))
    const polygon = E.twilightPolygon(ms, e)
    for (let lat = -84; lat <= 84; lat += 6) {
      for (let lon = -177; lon <= 177; lon += 6) {
        if (Math.abs(S.sunElevation(lat, lon, ms) - e) < 3) continue
        assert.equal(insideFlat(polygon, lat, lon), insideFlat(ring, lat, lon), `${e}° at ${lat},${lon}`)
      }
    }
  }
})

test("twilight bands along the map's outline: only where the sun is in range", () => {
  // The flat map fills a band as the even-odd of two caps; at the outline
  // (±179°) and inside (0°) membership must equal the elevation test. At
  // 17:17 UTC on 2 October the morning line runs at about −172°, nearly
  // parallel to the western outline: the gold rim seen there is real, and
  // so are the gold south and blue north pole regions near the equinoxes.
  const bands = [[6, 0], [0, -8]]
  for (const ms of [Date.UTC(2026, 5, 21, 17, 17), Date.UTC(2026, 2, 20, 17, 17), Date.UTC(2026, 9, 2, 17, 17)]) {
    for (const [high, low] of bands) {
      const upper = E.twilightPolygon(ms, high)
      const lower = E.twilightPolygon(ms, low)
      for (const lon of [-179.5, -179, -170, 0, 170, 179, 179.5]) {
        for (let lat = -89.5; lat <= 89.5; lat += 0.5) {
          const e = S.sunElevation(lat, lon, ms)
          // The edges are traced every 2° of bearing: half a degree of
          // elevation off them (more right at the poles) is left out.
          if (Math.abs(e - high) < 0.6 || Math.abs(e - low) < 0.6 || Math.abs(lat) > 88) continue
          const inBand = insideFlat(upper, lat, lon) !== insideFlat(lower, lat, lon)
          assert.equal(inBand, e < high && e >= low,
            `${new Date(ms).toISOString().slice(0, 10)} band ${high}…${low} at ${lat},${lon}: ${e.toFixed(2)}°`)
        }
      }
    }
  }
})

test("twilight layers: every cap matches the sun's elevation on the map", () => {
  for (const ms of [Date.UTC(2026, 5, 21, 18), Date.UTC(2026, 2, 20, 9, 30)]) {
    for (const e of [4, 2, -3, -6, -12]) {
      const polygon = E.twilightPolygon(ms, e)
      for (let lat = -84; lat <= 84; lat += 12) {
        for (let lon = -177; lon <= 177; lon += 12) {
          const elevation = S.sunElevation(lat, lon, ms)
          if (Math.abs(elevation - e) < 0.6) continue
          assert.equal(insideFlat(polygon, lat, lon), elevation < e, `${e}° at ${lat},${lon}`)
        }
      }
    }
  }
})

test("outline and graticule", () => {
  const outline = E.outline()
  for (const p of outline) assert.ok(Math.abs(p.x) <= E.X_MAX + 1e-9 && Math.abs(p.y) <= E.Y_MAX + 1e-9)
  near(Math.max(...outline.map((p) => p.y)), E.Y_MAX, 1e-9)
  // 23 meridians every 15° and the parallels at ±60°, ±30° and 0°.
  assert.equal(E.graticule().length, 23 + 5)
  assert.equal(E.graticule(30).length, 11 + 2)
})

test("land rings on the map: filled whole, stroked without the seams", () => {
  const scale = land.scale
  let jumps = 0
  for (const ring of land.land) {
    const { fill, lines } = E.ringToMap(ring, scale)
    assert.equal(fill.length, ring.length)
    for (let i = 0; i < fill.length; i += 2) assert.ok(Math.abs(fill[i]) <= E.X_MAX + 1e-9 && Math.abs(fill[i + 1]) <= E.Y_MAX + 1e-9)
    for (const line of lines) {
      assert.ok(line.length >= 4)
      for (let i = 2; i < line.length; i += 2) {
        // No stroke across the map, nor along its edge.
        if (Math.abs(line[i] - line[i - 2]) > E.X_MAX) jumps++
        const back0 = E.unproject(line[i - 2], line[i - 1]), back1 = E.unproject(line[i], line[i + 1])
        assert.ok(!(Math.abs(back0.lon) > 179.98 && Math.abs(back1.lon) > 179.98), "along the outline")
        assert.ok(!(back0.lat < -89.9 && back1.lat < -89.9), "along the pole")
      }
    }
  }
  assert.equal(jumps, 0)
  // Antarctica reaches the pole: filled down to it, its coast one line.
  const antarctica = land.land.find((ring) => ring.some((v, i) => i % 2 === 1 && v === -90 * scale))
  const { fill, lines } = E.ringToMap(antarctica, scale)
  assert.ok(insideRing(fill, E.project(-89, 0).x, E.project(-89, 0).y, 1))
  assert.equal(lines.length, 1)
  // A ring across the date line, as lat/lon data may hold it: two strokes.
  const across = E.ringToMap([170, -10, -170, -10, -170, 10, 170, 10])
  assert.equal(across.lines.length, 2)
  for (const line of across.lines) assert.equal(line.length, 4)
})
