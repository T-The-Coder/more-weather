// The globe section's view arithmetic (GlobeView.js): zoom and radius,
// tilt clamping, drags, key steps, and zooming towards the pointer.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const V = load("GlobeView.js")
const G = load("Globe.js")
const close = (a, b, eps, what) => assert.ok(Math.abs(a - b) <= eps, `${what}: ${a} vs ${b}`)

test("zoom levels double the radius, z0 fits the viewport", () => {
  close(V.radiusFor(0, 500, 1.18), 500 / 2 / 1.18, 1e-9, "z0")
  close(V.radiusFor(3, 500, 1.18), 500 / 2 / 1.18 * 8, 1e-9, "z3")
  assert.equal(V.clampZoom(9), 5)
  assert.equal(V.clampZoom(-2), 0)
  assert.equal(V.clampZoom(2.4), 2)
  // At z0 the viewport spans the whole earth (its diameter at most).
  close(V.visibleWidthKm(V.radiusFor(0, 500, 1), 500), 12742, 1, "z0 width")
  close(V.visibleWidthKm(V.radiusFor(5, 500, 1), 500), 12742 / 32, 1, "z5 width")
})

test("the view tilts to 80° at most", () => {
  assert.equal(V.clampLat(95), 80)
  assert.equal(V.clampLat(-81), -80)
  assert.equal(V.clampLat(45), 45)
})

test("a drag turns and tilts with the surface", () => {
  const r = 200
  const right = V.panned(0, 10, r * Math.PI / 18, 0, r)    // 10° worth to the right
  close(right.lon, 0, 1e-9, "lon")
  close(right.lat, 0, 1e-9, "lat")
  const down = V.panned(10, 0, 0, r * Math.PI / 36, r)     // 5° worth down
  close(down.lat, 15, 1e-9, "tilt north")
  assert.equal(V.panned(78, 0, 0, 100, r).lat, 80)
})

test("key steps: 15° on the whole disc, a quarter of the view when zoomed", () => {
  assert.equal(V.stepDegrees(1, 400, 500), 15)
  close(V.stepDegrees(3, 2000, 500), 125 / 2000 * 180 / Math.PI, 1e-9, "z3")
  assert.deepEqual([0, 2, 3, 4, 5].map(V.gridStep), [15, 15, 5, 5, 1])
})

test("zooming keeps the place under the pointer", () => {
  for (const [lat, lon, px, py] of [[45, 10, 80, -60], [-30, 170, -120, 40], [0, 0, 10, 10]]) {
    const r0 = 300
    const r1 = 600
    const m0 = G.viewMatrix(lat, lon)
    const place = G.unprojectView(px, -py, m0, r0)
    const next = V.zoomedCentre(lat, lon, r0, r1, px, py)
    const at = G.projectView(place.lat, place.lon, G.viewMatrix(next.lat, next.lon), r1)
    close(at.x, px, 0.5, "x")
    close(-at.y, py, 0.5, "y")
  }
  // Off the globe: the centre stays.
  assert.deepEqual(JSON.parse(JSON.stringify(V.zoomedCentre(0, 0, 100, 200, 500, 0))), { lat: 0, lon: 0 })
})

test("the box round the view", () => {
  const box = V.visibleBounds(47, 10, 4000, 500, 500)
  assert.ok(box.south < 47 && box.north > 47 && box.west < 10 && box.east > 10)
  assert.ok(box.north - box.south < 12)
  const whole = V.visibleBounds(0, 0, 200, 500, 500)
  assert.equal(whole.east - whole.west, 360)
})
