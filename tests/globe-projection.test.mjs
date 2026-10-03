// The globe section's projections (GlobeProjection.js): the orthographic
// globe and the flat Equal Earth map behind one interface — round trips,
// what is in view, the box in view, places just past the edge.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const P = load("GlobeProjection.js")
const view = (style, extra) => Object.assign({ style, centerLat: 30, centerLon: 10, zoom: 0, width: 500, height: 500,
  radius: 210 }, extra || {})

for (const style of ["globe", "map"]) {
  test(`${style}: a place and back`, () => {
    const p = P.make(view(style))
    for (const [lat, lon] of [[30, 10], [45, 20], [10, -20], [-20, 40]]) {
      const s = p.project(lat, lon)
      assert.ok(s.visible, `${lat},${lon}`)
      const back = p.unproject(s.x, s.y)
      assert.ok(back && Math.abs(back.lat - lat) < 1e-6 && Math.abs(back.lon - lon) < 1e-6, JSON.stringify(back))
      // at() agrees with project() and makes nothing.
      assert.equal(p.at(lat, lon), true)
      assert.ok(Math.abs(p.x - s.x) < 1e-9 && Math.abs(p.y - s.y) < 1e-9)
    }
    // The centre in the middle of the view.
    const c = p.project(30, 10)
    if (style === "globe") assert.ok(Math.abs(c.x - 250) < 1e-6 && Math.abs(c.y - 250) < 1e-6)
  })

  test(`${style}: the box in view holds what is shown`, () => {
    const p = P.make(view(style, { zoom: 2 }))
    const box = p.box()
    for (const [x, y] of [[50, 50], [250, 250], [450, 400]]) {
      const place = p.unproject(x, y)
      if (!place) continue
      assert.ok(place.lat >= box.south - 1e-6 && place.lat <= box.north + 1e-6, JSON.stringify([place, box]))
    }
  })

  test(`${style}: points just past the edge are taken onto it`, () => {
    const p = P.make(view(style))
    const out = {}
    if (style === "globe") {
      assert.equal(p.unprojectNear(250 + 212, 250, out, 4), true)
      assert.equal(p.unprojectNear(250 + 230, 250, out, 4), false)
      assert.ok(p.onEarth(250, 250))
      assert.ok(!p.onEarth(250 + 230, 250))
    } else {
      const whole = P.make(view("map", { centerLat: 0, centerLon: 0 }))
      const edge = whole.project(0, 179.9999)
      assert.equal(whole.unprojectNear(edge.x + 2, edge.y, out, 4), true)
      assert.equal(Math.abs(out.lon), 180)
      assert.equal(whole.unprojectNear(edge.x + 20, edge.y, out, 4), false)
    }
  })
}

test("the globe hides the far side, the map shows what is in the view", () => {
  const g = P.make(view("globe", { centerLat: 0, centerLon: 0 }))
  assert.equal(g.project(0, 120).visible, false)
  const m = P.make(view("map", { centerLat: 0, centerLon: 0 }))
  assert.equal(m.project(0, 120).visible, true)
  const zoomed = P.make(view("map", { centerLat: 0, centerLon: 0, zoom: 3 }))
  assert.equal(zoomed.project(0, 120).visible, false)
})

test("the map's centre stays where the map covers the view", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(P.mapCentre(60, 100, 500, 250, 0))), { lat: 0, lon: 0 })
  const c = P.mapCentre(85, 179, 500, 250, 3)
  assert.ok(c.lat < 85 && c.lon < 179, JSON.stringify(c))
})
