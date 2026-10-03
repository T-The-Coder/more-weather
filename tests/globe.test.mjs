// The globe's projection and clipping (Globe.js), with the land outline of
// data/globe-land.json and the sun of Sky.js. Shared by the More plugins
// (tools/sync-shared.sh); tests that need More Time's flat map data are in
// its tests/globe-time.test.mjs.
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const G = load("Globe.js")
const S = load("Sky.js")
const land = JSON.parse(readFileSync(join(root, "data/globe-land.json"), "utf8"))
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)
const R = 100

test("orthographic projection round trips", () => {
  for (const center of [0, 13.4, -150, 179]) {
    for (const [lat, lon] of [[0, center], [52.5, center + 40], [-33.9, center - 70], [80, center + 10]]) {
      const p = G.projectOrtho(lat, lon, center, R)
      assert.ok(p.visible)
      const back = G.unprojectOrtho(p.x, p.y, center, R)
      near(back.lat, lat, 1e-6)
      near(G.shortestTurn(back.lon, lon), 0, 1e-6)
    }
  }
  assert.equal(G.unprojectOrtho(R, R, 0, R), null)
  // The centre faces the viewer; the north pole is at the top of the rim.
  near(G.projectOrtho(0, 30, 30, R).x, 0)
  near(G.projectOrtho(90, 0, 30, R).y, R)
})

test("visible within 90° of the centre", () => {
  for (const center of [0, 100, -170]) {
    assert.ok(G.projectOrtho(0, center + 89, center, R).visible)
    assert.ok(G.projectOrtho(0, center - 89, center, R).visible)
    assert.ok(G.projectOrtho(0, center + 90, center, R).visible, "on the rim")
    assert.ok(!G.projectOrtho(0, center + 91, center, R).visible)
    assert.ok(!G.projectOrtho(40, center - 91, center, R).visible)
    near(Math.abs(G.projectOrtho(0, center + 90, center, R).x), R)
  }
})

test("shortest turn across the date line", () => {
  near(G.shortestTurn(170, -170), 20)
  near(G.shortestTurn(-170, 170), -20)
  near(G.shortestTurn(10, 50), 40)
  near(G.shortestTurn(0, 190), -170)
  near(G.shortestTurn(720 + 5, 0), -5)
  assert.ok(Math.abs(G.shortestTurn(0, 180)) === 180)
})

const square = (lat0, lon0, lat1, lon1) => G.prepareLatLon([
  { lat: lat0, lon: lon0 }, { lat: lat0, lon: lon1 }, { lat: lat1, lon: lon1 }, { lat: lat1, lon: lon0 }])

test("a ring behind the globe yields nothing", () => {
  const ring = square(-20, 150, 20, 170)
  assert.deepEqual(G.frontPolygons(ring, 0, R), [])
  assert.deepEqual(G.frontLines(ring, 0, R), [])
  assert.equal(G.frontPolygons(ring, 160, R).length, 1)
})

test("clipping at the horizon stays on the disc and follows the rim", () => {
  // Half in front, half behind: cut at lon 90, along the rim.
  const ring = square(-60, 40, 60, 140)
  const polys = G.frontPolygons(ring, 0, R)
  assert.equal(polys.length, 1)
  let onRim = 0
  for (let i = 0; i < polys[0].length; i += 2) {
    const r = Math.hypot(polys[0][i], polys[0][i + 1])
    assert.ok(r <= R + 1e-6)
    if (Math.abs(r - R) < 1e-6) onRim++
  }
  assert.ok(onRim > 30, "the cut is sampled along the rim")
  // Lines never run along the rim: no consecutive points both on it.
  for (const line of G.frontLines(ring, 0, R)) {
    for (let i = 2; i < line.length; i += 2) {
      const a = Math.hypot(line[i - 2], line[i - 1]), b = Math.hypot(line[i], line[i + 1])
      assert.ok(!(Math.abs(a - R) < 1e-6 && Math.abs(b - R) < 1e-6))
    }
  }
})

test("a ring across the date line shows whole when facing it", () => {
  // A zone from 170° E to 190° (−170°) as the data would store it, and the
  // same as two halves at ±180°.
  const ring = square(-10, 170, 10, 190)
  const polys = G.frontPolygons(ring, -175, R)
  assert.equal(polys.length, 1)
  near(G.polygonArea(polys[0]), G.polygonArea(G.frontPolygons(square(-10, -15, 10, 5), 0, R)[0]), 1e-6)
})

// ---- The tilted, zoomable view ----

// Even-odd point in polygons, flat [x0, y0, ...] arrays.
const insideAny = (polys, x, y) => {
  let inside = false
  for (const ring of polys) {
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}
// The land rings as flat [lon, lat, ...] in degrees, for lookups on the
// plain lat/lon plane (where the file's rings are simple polygons).
const landLonLat = land.land.map((ring) => ring.map((v) => v / land.scale))
const onLand = (lat, lon) => landLonLat.some((ring) => insideAny([ring], lon, lat))
const antarctica = land.land.findIndex((ring) => ring.some((v, i) => i % 2 === 1 && v === -90 * land.scale))
const views = [[0, 13], [45, -100], [-60, 150], [80, 30], [90, 0], [-90, 0], [-30, 179.5]]

test("globe land data: lat/lon rings, counter-clockwise, small", () => {
  assert.equal(land.scale, 100)
  assert.equal(land.land.length, 347)
  assert.ok(readFileSync(join(root, "data/globe-land.json")).length < 120 * 1024)
  for (const ring of land.land) {
    assert.ok(ring.length >= 6 && ring.length % 2 === 0)
    let area = 0
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      assert.ok(Number.isInteger(ring[i]) && Math.abs(ring[i]) <= 18000 && Math.abs(ring[i + 1]) <= 9000)
      area += ring[j] * ring[i + 1] - ring[i] * ring[j + 1]
    }
    assert.ok(area > 0, "counter-clockwise")
  }
  assert.ok(antarctica >= 0, "Antarctica reaches the pole")
  const rings = G.prepareLand(land)
  assert.equal(rings.length, 347)
  assert.equal(G.prepareLand(JSON.parse(JSON.stringify(land))), rings, "cached")
})

test("view: projection round trips at any tilt, the poles included", () => {
  for (const [cLat, cLon] of views) {
    const m = G.viewMatrix(cLat, cLon)
    // The centre faces the viewer, north is up (or the view is at a pole).
    const centre = G.projectView(cLat, cLon, m, R)
    near(centre.x, 0, 1e-9)
    near(centre.y, 0, 1e-9)
    for (let lat = -85; lat <= 85; lat += 17) {
      for (let lon = -180; lon < 180; lon += 23) {
        const p = G.projectView(lat, lon, m, R)
        if (!p.visible) continue
        assert.ok(Math.hypot(p.x, p.y) <= R + 1e-9)
        const back = G.unprojectView(p.x, p.y, m, R)
        near(back.lat, lat, 1e-6)
        near(G.shortestTurn(back.lon, lon), 0, 1e-6)
      }
    }
  }
  assert.equal(G.unprojectView(R, R, G.viewMatrix(20, 0), R), null)
  // Vectors work as well as lat/lon.
  const m = G.viewMatrix(45, -100)
  const p = G.projectView([0, 0, 1], m, R)
  near(p.y, R * Math.cos(45 * Math.PI / 180), 1e-9)
  near(p.x, 0, 1e-9)
})

test("view: at tilt 0 it is the equatorial view", () => {
  for (const cLon of [0, 13.4, -150, 179]) {
    const m = G.viewMatrix(0, cLon)
    for (const [lat, lon] of [[0, cLon], [52.5, cLon + 40], [-33.9, cLon - 70], [10, cLon + 120]]) {
      const a = G.projectView(lat, lon, m, R)
      const b = G.projectOrtho(lat, lon, cLon, R)
      near(a.x, b.x, 1e-9)
      near(a.y, b.y, 1e-9)
      assert.equal(a.visible, b.visible)
    }
  }
  // From above the north pole: the equator is the rim, 45° N at cos 45°.
  const top = G.viewMatrix(90, 0)
  near(Math.hypot(G.projectView(0, 77, top, R).x, G.projectView(0, 77, top, R).y), R, 1e-9)
  near(Math.hypot(G.projectView(45, -20, top, R).x, G.projectView(45, -20, top, R).y), R * Math.SQRT1_2, 1e-9)
  assert.ok(!G.projectView(-1, 0, top, R).visible)
})

test("view: land fills at tilt 0 match the equatorial clipping", () => {
  const rings = G.prepareLand(land)
  for (const cLon of [13, -75, 140, 180]) {
    let before = 0
    let after = 0
    for (let r = 0; r < land.land.length; r++) {
      const points = []
      for (let i = 0; i < land.land[r].length; i += 2) points.push({ lat: land.land[r][i + 1] / 100, lon: land.land[r][i] / 100 })
      const old = G.frontPolygons(G.prepareLatLon(points), cLon, R).reduce((a, p) => a + G.polygonArea(p), 0)
      const now = G.frontPolygonsView(rings[r], G.viewMatrix(0, cLon), R).reduce((a, p) => a + G.polygonArea(p), 0)
      before += old
      after += now
      if (old > 0.01 * Math.PI * R * R) near(now / old, 1, 0.005)
    }
    assert.ok(before > 0.1 * Math.PI * R * R)
    near(after / before, 1, 0.005)
  }
})

test("view: land fills agree with the land at every point, at any tilt", () => {
  const rings = G.prepareLand(land)
  for (const [cLat, cLon] of views) {
    const m = G.viewMatrix(cLat, cLon)
    const polys = rings.flatMap((ring) => G.frontPolygonsView(ring, m, R))
    for (const poly of polys) for (let i = 0; i < poly.length; i += 2) assert.ok(Math.hypot(poly[i], poly[i + 1]) <= R + 1e-6)
    let points = 0
    let wrong = 0
    for (let x = -R + 1; x < R; x += 4) {
      for (let y = -R + 1; y < R; y += 4) {
        const place = G.unprojectView(x, y, m, R)
        if (!place) continue
        points++
        if (insideAny(polys, x, y) !== onLand(place.lat, place.lon)) wrong++
      }
    }
    assert.ok(wrong / points < 0.005, `${cLat},${cLon}: ${wrong} of ${points} points wrong`)
  }
})

test("view: Antarctica from above and below the poles, and tilted", () => {
  const ring = G.prepareLand(land)[antarctica]
  assert.deepEqual(G.frontPolygonsView(ring, G.viewMatrix(90, 0), R), [])
  assert.deepEqual(G.frontLinesView(ring, G.viewMatrix(90, 0), R), [])
  const below = G.frontPolygonsView(ring, G.viewMatrix(-90, 0), R)
  assert.equal(below.length, 1)
  // About 14 million km² seen straight down, within about 25° of the pole.
  const area = G.polygonArea(below[0]) / (R * R)
  assert.ok(area > 0.2 && area < 0.45, `area ${area}`)
  assert.ok(insideAny(below, 0, 0), "the pole is land")
  // The coast only: nothing along the ±180° seam or the pole.
  for (const m of [G.viewMatrix(-90, 0), G.viewMatrix(-30, 179.5), G.viewMatrix(-60, 0)]) {
    for (const line of G.frontLinesView(ring, m, R)) {
      for (let i = 0; i < line.length; i += 2) {
        const place = G.unprojectView(line[i] * 0.999999, line[i + 1] * 0.999999, m, R)
        assert.ok(place && place.lat > -86, "no stroke at the pole")
      }
    }
  }
})

test("view: strokes stay on the disc and never run along the rim", () => {
  const rings = G.prepareLand(land)
  for (const [cLat, cLon] of views) {
    const m = G.viewMatrix(cLat, cLon)
    for (const ring of rings) {
      for (const line of G.frontLinesView(ring, m, R)) {
        assert.ok(line.length >= 4)
        for (let i = 2; i < line.length; i += 2) {
          const a = Math.hypot(line[i - 2], line[i - 1]), b = Math.hypot(line[i], line[i + 1])
          assert.ok(a <= R + 1e-6 && b <= R + 1e-6)
          // A cut lands on the rim and the next point may lie a hair inside
          // it (a coast grazing the rim); a run along the rim would step about 2°.
          const step = Math.hypot(line[i] - line[i - 2], line[i + 1] - line[i - 1])
          assert.ok(!(Math.abs(a - R) < 1e-4 && Math.abs(b - R) < 1e-4 && step > 2), "along the rim")
        }
      }
    }
  }
  const grid = G.gridLinesView(G.viewMatrix(30, 10), R, 30)
  assert.ok(grid.length >= 10)
  for (const line of grid) for (let i = 0; i < line.length; i += 2) assert.ok(Math.hypot(line[i], line[i + 1]) <= R + 1e-6)
})

test("view: twilight caps match the sun's elevation at tilts 0, 45 and 80", () => {
  for (const ms of [Date.UTC(2026, 5, 21, 18), Date.UTC(2026, 9, 2, 15, 44), Date.UTC(2026, 11, 21, 6)]) {
    const sun = S.subsolarPoint(ms)
    const anti = { lat: -sun.lat, lon: sun.lon > 0 ? sun.lon - 180 : sun.lon + 180 }
    for (const tilt of [0, 45, 80, -80]) {
      for (const cLon of [sun.lon + 90, sun.lon - 60, anti.lon]) {
        const m = G.viewMatrix(tilt, cLon)
        for (const e of [6, 0, -6, -12]) {
          const polys = G.capPolygonView(anti.lat, anti.lon, 90 + e, m, R)
          for (let x = -R + 2; x < R; x += 7) {
            for (let y = -R + 2; y < R; y += 7) {
              const place = G.unprojectView(x, y, m, R)
              if (!place || Math.hypot(x, y) > R - 1) continue
              const elevation = S.sunElevation(place.lat, place.lon, ms)
              if (Math.abs(elevation - e) < 0.6) continue
              assert.equal(insideAny(polys, x, y), elevation < e, `${e}° tilt ${tilt} at ${place.lat.toFixed(1)},${place.lon.toFixed(1)}`)
            }
          }
        }
      }
    }
  }
  // Wholly behind, wholly in front, covering the front.
  const m = G.viewMatrix(0, 0)
  assert.deepEqual(G.capPolygonView(0, 180, 30, m, R), [])
  const small = G.capPolygonView(0, 0, 30, m, R)
  assert.equal(small.length, 1)
  near(G.polygonArea(small[0]) / (Math.PI * R * R), 0.25, 0.01)
  const all = G.capPolygonView(0, 0, 95, m, R)
  assert.equal(all.length, 1)
  near(G.polygonArea(all[0]) / (Math.PI * R * R), 1, 0.001)
  // Holding all but 5° round the view's centre: the disc with a hole.
  const ring = G.capPolygonView(0, 180, 175, m, R)
  assert.equal(ring.length, 2)
  assert.ok(!insideAny(ring, 0, 0) && insideAny(ring, 0, R * 0.5))
  near((G.polygonArea(ring[0]) - G.polygonArea(ring[1])) / (Math.PI * R * R), 1 - Math.sin(5 * Math.PI / 180) ** 2, 0.001)
})

test("view: zoomed in, the radius just grows", () => {
  const m = G.viewMatrix(48, 11)
  const big = 50000
  const p = G.projectView(48.2, 11.5, m, big)
  const back = G.unprojectView(p.x, p.y, m, big)
  near(back.lat, 48.2, 1e-6)
  near(back.lon, 11.5, 1e-6)
  const night = G.capPolygonView(0, 0, 90, m, big)
  for (const poly of night) for (let i = 0; i < poly.length; i += 2) assert.ok(Math.hypot(poly[i], poly[i + 1]) <= big + 1e-3)
})
