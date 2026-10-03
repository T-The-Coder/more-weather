// The globe section's two map styles behind one interface
// (GlobeProjection.js): the orthographic globe and the flat Equal Earth map.
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const P = load("GlobeProjection.js")
const G = load("Globe.js")
const V = load("GlobeView.js")
const E = load("EqualEarth.js")
const S = load("Sky.js")
const land = JSON.parse(readFileSync(join(root, "data/globe-land.json"), "utf8"))
const rings = P.prepareLand(land)

const W = 800, H = 420
const views = [
  { lat: 0, lon: 0, zoom: 0 }, { lat: 35, lon: 12, zoom: 1 }, { lat: -48, lon: 170, zoom: 2 },
  { lat: 62, lon: -150, zoom: 3 }, { lat: 10, lon: 100, zoom: 5 }, { lat: 78, lon: 179, zoom: 2 }
]
const both = (view) => [P.ortho(view, W, H), P.flat(view, W, H)]
const lonDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180)
const dist = (a, b, c, d) => P.angularDistance(a, b, c, d)
// Objects from the loaded files come from another realm: compare as JSON.
const same = (a, b, message) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), message)

// Even-odd: inside an odd number of the polygons' edges.
function insideEvenOdd(polygons, x, y) {
  let inside = false
  for (const xy of polygons) {
    for (let i = 0, j = xy.length - 2; i < xy.length; j = i, i += 2) {
      const xi = xy[i], yi = xy[i + 1], xj = xy[j], yj = xy[j + 1]
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}

// Pixels every `step` px over the viewport with the place under each.
function samples(proj, step) {
  const out = []
  for (let y = step / 2; y < proj.height; y += step)
    for (let x = step / 2; x < proj.width; x += step) out.push({ x, y, place: proj.unproject(x, y) })
  return out
}

test("both styles share one interface", () => {
  const members = ["kind", "width", "height", "scale", "viewport", "clipPoints", "isDisc", "project", "unproject",
    "fillPaths", "strokePaths", "capPaths", "gridPaths", "linePaths", "visibleBox", "degPerPixelAt", "dragged",
    "zoomedAt", "keyStep", "reset", "clamp", "towards", "cellGrid", "view", "zoom", "gridStep"]
  for (const proj of both(views[1])) for (const m of members) assert.ok(m in proj, `${proj.kind} lacks ${m}`)
  assert.strictEqual(P.create("flat", views[1], W, H).kind, "flat")
  assert.strictEqual(P.create("globe", views[1], W, H).kind, "ortho")
})

test("project and unproject round-trip inside each domain; visible is domain membership", () => {
  for (const view of views) {
    const [ortho, flat] = both(view)
    for (let lat = -88; lat <= 88; lat += 8) {
      for (let lon = -176; lon <= 176; lon += 8) {
        const o = ortho.project(lat, lon)
        const front = dist(lat, lon, ortho.view.lat, ortho.view.lon) <= 90
        if (Math.abs(dist(lat, lon, ortho.view.lat, ortho.view.lon) - 90) > 1e-6) assert.strictEqual(o.visible, front)
        if (o.visible) {
          const back = ortho.unproject(o.x, o.y)
          assert.ok(back && Math.abs(back.lat - lat) < 1e-6 && lonDiff(back.lon, lon) < 1e-6, `ortho ${lat} ${lon}`)
        }
        const f = flat.project(lat, lon)
        assert.strictEqual(f.visible, true)
        const fb = flat.unproject(f.x, f.y)
        assert.ok(fb && Math.abs(fb.lat - lat) < 1e-6 && lonDiff(fb.lon, lon) < 1e-6, `flat ${lat} ${lon}`)
      }
    }
    // Off the disc and off the map's outline: nothing.
    assert.strictEqual(ortho.unproject(ortho.centerX + ortho.radius * 1.01, ortho.centerY), null)
    const corner = flat.project(89.999, 180)
    assert.strictEqual(flat.unproject(corner.x + 3, corner.y - 3), null)
  }
})

test("the globe is Globe.projectView and Globe.unprojectView round the viewport's middle", () => {
  for (const view of views) {
    const ortho = P.ortho(view, W, H)
    const R = V.radiusFor(view.zoom, Math.min(W, H), 1.18)
    assert.strictEqual(ortho.radius, R)
    const m = G.viewMatrix(V.clampLat(view.lat), G.wrapLon(view.lon))
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 30) {
        const a = ortho.project(lat, lon)
        const b = G.projectView(lat, lon, m, R)
        assert.strictEqual(a.x, W / 2 + b.x)
        assert.strictEqual(a.y, H / 2 - b.y)
        assert.strictEqual(a.visible, b.visible)
      }
    }
    same(ortho.unproject(300, 100), G.unprojectView(300 - W / 2, H / 2 - 100, m, R))
    // Fills, strokes and caps: Globe.js' paths moved to canvas pixels.
    const ring = rings[rings.length - 1]
    const expected = G.frontPolygonsView(ring, m, R).map((xy) => xy.map((v, i) => i % 2 ? H / 2 - v : W / 2 + v))
    same(ortho.fillPaths(ring), expected)
    const cap = G.capPolygonView(-10, 30, 96, m, R).map((xy) => xy.map((v, i) => i % 2 ? H / 2 - v : W / 2 + v))
    same(ortho.capPaths(-10, 30, 96), cap)
  }
})

test("flat z0 shows the whole map fitted to the width, at Equal Earth's aspect ratio, and does not pan", () => {
  for (const [w, h] of [[800, 420], [800, 800], [600, 300]]) {
    const flat = P.flat({ lat: 40, lon: 100, zoom: 0 }, w, h)
    const outline = flat.clipPoints
    const xs = outline.filter((_, i) => i % 2 === 0), ys = outline.filter((_, i) => i % 2 === 1)
    const width = Math.max(...xs) - Math.min(...xs), height = Math.max(...ys) - Math.min(...ys)
    const fitsWidth = h >= w * E.Y_MAX / E.X_MAX
    if (fitsWidth) assert.ok(Math.abs(width - w) < 1e-6, `${width} != ${w}`)
    else assert.ok(Math.abs(height - h) < 1e-6 && width <= w)
    assert.ok(Math.abs(height / width - E.Y_MAX / E.X_MAX) < 1e-9)
    assert.ok(Math.abs(P.FLAT_ASPECT - E.Y_MAX / E.X_MAX) < 1e-15)
    // Centred on 0° 0°: the view's centre is clamped there.
    assert.deepStrictEqual([flat.view.lat, flat.view.lon], [0, 0])
    const middle = flat.project(0, 0)
    assert.ok(Math.abs(middle.x - w / 2) < 1e-9 && Math.abs(middle.y - h / 2) < 1e-9)
    const moved = flat.dragged(flat.view, 120, -60)
    assert.deepStrictEqual([moved.lat, moved.lon, moved.zoom], [0, 0, 0])
    same(flat.keyStep(flat.view, 1, 1), { lat: 0, lon: 0, zoom: 0 })
  }
})

test("flat views from z1 pan, clamped to the map", () => {
  const flat = P.flat({ lat: 0, lon: 0, zoom: 1 }, W, H)
  // Dragged far right and up: the centre stays half a viewport inside.
  const far = flat.dragged(flat.view, 5000, 5000)
  const f2 = P.flat(far, W, H)
  const left = f2.project(far.lat, -180)
  assert.ok(far.lon < 0 && far.lat > 0)
  const edge = f2.clipPoints.filter((_, i) => i % 2 === 0)
  assert.ok(Math.abs(Math.min(...edge)) < 1e-6, "the map's west edge on the viewport's")
  assert.ok(left.x >= -1e-6)
  // Deep zoom near a corner: the centre never leaves the outline.
  for (const v of [{ lat: 85, lon: 179, zoom: 5 }, { lat: -89, lon: -179.5, zoom: 4 }, { lat: 60, lon: 175, zoom: 3 }]) {
    const c = P.flat(v, W, H).view
    assert.ok(E.unproject(E.project(c.lat, c.lon).x * 0.999999, E.project(c.lat, c.lon).y), JSON.stringify(c))
    assert.deepStrictEqual(P.flat(c, W, H).clamp(c).zoom, v.zoom)
  }
  // Keys: a quarter of the view; east and north.
  const step = P.flat({ lat: 10, lon: 10, zoom: 3 }, W, H)
  const east = step.keyStep(step.view, 1, 0), north = step.keyStep(step.view, 0, 1)
  assert.ok(Math.abs(step.project(east.lat, east.lon).x - (W / 2 + W / 4)) < 1e-6)
  assert.ok(Math.abs(step.project(north.lat, north.lon).y - (H / 2 - H / 4)) < 1e-6)
  same(step.reset({ lat: 48, lon: 11 }), { lat: 0, lon: 0, zoom: 0 })
  // Animations go straight across the map, never round the back.
  const t = P.flat({ lat: 10, lon: 170, zoom: 2 }, W, H)
  assert.ok(t.towards(t.view, 10, -170).lon < 0)
  const o = P.ortho({ lat: 10, lon: 170, zoom: 2 }, W, H)
  assert.ok(Math.abs(o.towards(o.view, 10, -170).lon - 190) < 1e-9)
})

test("zooming towards the pointer keeps the place under it within 0.5 px", () => {
  const pointers = [[W / 2, H / 2], [W / 2 + 120, H / 2 - 70], [W / 2 - 90, H / 2 + 40]]
  const tried = { ortho: 0, flat: 0 }
  for (const make of [P.ortho, P.flat]) {
    for (const view of [{ lat: 30, lon: 20, zoom: 1 }, { lat: -20, lon: -60, zoom: 2 }, { lat: 45, lon: 8, zoom: 3 }]) {
      for (const [x, y] of pointers) {
        for (const delta of [1, -1]) {
          const proj = make(view, W, H)
          const place = proj.unproject(x, y)
          assert.ok(place)
          const next = proj.zoomedAt(proj.view, x, y, delta)
          assert.strictEqual(next.zoom, view.zoom + delta)
          // Where the clamp holds the flat map, the place cannot stay.
          if (proj.kind === "flat") {
            const s1 = proj.scale * Math.pow(2, delta)
            const unclamped = { x: proj.mapCenter.x + (x - W / 2) / proj.scale - (x - W / 2) / s1 }
            const after = make(next, W, H)
            if (Math.abs(after.mapCenter.x - unclamped.x) > 1e-9) continue
          }
          tried[proj.kind]++
          const at = make(next, W, H).project(place.lat, place.lon)
          assert.ok(Math.hypot(at.x - x, at.y - y) < 0.5, `${proj.kind} z${view.zoom}${delta > 0 ? "+" : "-"} (${x}, ${y}): ${at.x}, ${at.y}`)
        }
      }
    }
  }
  assert.strictEqual(tried.ortho, 18)
  assert.ok(tried.flat >= 12, `flat: ${tried.flat} of 18 unclamped`)
})

test("drags move the surface with the pointer", () => {
  for (const make of [P.ortho, P.flat]) {
    const proj = make({ lat: 20, lon: 30, zoom: 3 }, W, H)
    const place = proj.unproject(W / 2, H / 2)
    const next = make(proj.dragged(proj.view, 40, -25), W, H)
    const at = next.project(place.lat, place.lon)
    assert.ok(Math.hypot(at.x - (W / 2 + 40), at.y - (H / 2 - 25)) < 1, `${proj.kind}: ${at.x}, ${at.y}`)
  }
})

test("visibleBox holds every place in view", () => {
  for (const view of views) {
    for (const proj of both(view)) {
      const box = proj.visibleBox()
      assert.ok(box.south <= box.north && box.west <= box.east)
      if (proj.kind === "flat") assert.ok(box.west >= -180 && box.east <= 180 && !box.wraps)
      for (const s of samples(proj, 10)) {
        if (!s.place) continue
        const { lat, lon } = s.place
        assert.ok(lat >= box.south - 1e-6 && lat <= box.north + 1e-6, `${proj.kind} ${JSON.stringify(view)} lat ${lat}`)
        const offset = ((lon - box.west) % 360 + 360) % 360
        assert.ok(offset <= box.east - box.west + 1e-6 || Math.abs(offset - 360) < 1e-6,
          `${proj.kind} ${JSON.stringify(view)} lon ${lon} not in ${box.west}…${box.east}`)
      }
    }
  }
})

test("degrees per pixel: the globe's at its centre, Equal Earth's everywhere", () => {
  const ortho = P.ortho({ lat: 10, lon: 20, zoom: 2 }, W, H)
  assert.ok(Math.abs(ortho.degPerPixelAt(10, 20) - 180 / Math.PI / ortho.radius) < 1e-12)
  assert.ok(ortho.degPerPixelAt(40, 50) > ortho.degPerPixelAt(10, 20))
  assert.strictEqual(ortho.degPerPixelAt(-10, -160), Infinity)
  const flat = P.flat({ lat: 10, lon: 20, zoom: 2 }, W, H)
  assert.ok(Math.abs(flat.degPerPixelAt(70, 20) - flat.degPerPixelAt(0, 0)) < 1e-15)
  // Equal-area: a small square of the earth keeps its area on the map.
  const d = 0.5, lat = 55, lon = 30
  const a = flat.project(lat, lon), b = flat.project(lat + d, lon), c = flat.project(lat, lon + d)
  const pxArea = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x))
  const degArea = d * d * Math.cos((lat + d / 2) * Math.PI / 180)
  assert.ok(Math.abs(pxArea * flat.degPerPixelAt(lat, lon) ** 2 / degArea - 1) < 0.01)
})

// The caps against "angular distance to the axis ≤ radius" on every
// visible sample, but for samples within one sample step of the edge.
function checkCap(proj, axisLat, axisLon, radius, label) {
  const polygons = proj.capPaths(axisLat, axisLon, radius)
  const step = 9
  let checked = 0
  for (const s of samples(proj, step)) {
    if (!s.place) continue
    let margin = 0
    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const n = proj.unproject(s.x + dx, s.y + dy)
      margin = Math.max(margin, n ? dist(s.place.lat, s.place.lon, n.lat, n.lon) : 180)
    }
    const d = dist(s.place.lat, s.place.lon, axisLat, axisLon)
    if (Math.abs(d - radius) <= margin) continue
    checked++
    assert.strictEqual(insideEvenOdd(polygons, s.x, s.y), d <= radius,
      `${label} ${proj.kind} z${proj.zoom}: (${s.x}, ${s.y}) = ${s.place.lat.toFixed(2)}, ${s.place.lon.toFixed(2)} at ${d.toFixed(2)}°`)
  }
  assert.ok(checked > 100, `${label}: ${checked} samples`)
}

test("caps (night and twilight) agree with the angular distance to their axis", () => {
  const sunAt = (iso) => {
    const sun = S.subsolarPoint(Date.parse(iso))
    return { lat: -sun.lat, lon: ((sun.lon + 360) % 360) - 180 }
  }
  const equinox = sunAt("2026-03-20T14:46:00Z")
  const solstice = sunAt("2026-06-21T08:24:00Z")
  const cases = [
    ["equinox night", equinox.lat, equinox.lon, 90],
    ["equinox astronomical", equinox.lat, equinox.lon, 72],
    ["solstice night", solstice.lat, solstice.lon, 90],
    ["solstice civil", solstice.lat, solstice.lon, 84],
    ["solstice day side", -solstice.lat, solstice.lon + 180, 96],
    ["polar, round the pole", 86, 30, 12],
    ["polar, both poles", -60, 100, 155],
    ["across the seam", 40, 172, 25],
    ["small", -30, -60, 3]
  ]
  const viewsToTry = [{ lat: 0, lon: 0, zoom: 0 }, { lat: 50, lon: 160, zoom: 1 }, { lat: -40, lon: -120, zoom: 2 }]
  for (const [label, lat, lon, radius] of cases)
    for (const view of viewsToTry)
      for (const proj of both(view)) checkCap(proj, lat, lon, radius, label)
  // Nothing and everything.
  const flat = P.flat(viewsToTry[0], W, H)
  same(flat.capPaths(10, 10, 0), [])
  assert.strictEqual(flat.capPaths(10, 10, 180).length, 1)
})

test("land: fills on the map, strokes without seams or jumps across the map", () => {
  for (const view of [{ lat: 0, lon: 0, zoom: 0 }, { lat: 20, lon: 170, zoom: 1 }, { lat: -70, lon: -179, zoom: 2 }]) {
    const flat = P.flat(view, W, H)
    const limit = Math.min(W, H) / 4
    let fills = 0, lines = 0
    for (const ring of rings) {
      fills += flat.fillPaths(ring).length
      for (const line of flat.strokePaths(ring)) {
        lines++
        for (let i = 2; i < line.length; i += 2) {
          const len = Math.hypot(line[i] - line[i - 2], line[i + 1] - line[i - 1])
          assert.ok(len < limit, `a stroke segment of ${len.toFixed(1)} px at ${JSON.stringify(view)}`)
        }
      }
    }
    assert.ok(fills > 0 && lines > 0)
    if (view.zoom === 0) assert.ok(fills >= rings.length, "every ring filled on the whole map")
  }
  // A fill sample: land is land.
  const flat = P.flat({ lat: 0, lon: 0, zoom: 0 }, W, H)
  const polys = rings.flatMap((ring) => flat.fillPaths(ring))
  for (const [lat, lon, isLand] of [[48, 11, true], [-25, 135, true], [0, -30, false], [-80, 0, true], [40, -170, false]]) {
    const p = flat.project(lat, lon)
    assert.strictEqual(insideEvenOdd(polys, p.x, p.y), isLand, `${lat}, ${lon}`)
  }
  // Raw lat/lon rings mean what they mean to Globe.prepareVectors: a plain
  // lat/lon polygon, so longitudes past 180 reach across the seam.
  const square = [10, 170, 10, 190, 20, 190, 20, 170]
  const pieces = flat.fillPaths(square)
  assert.strictEqual(pieces.length, 2)
  const ortho = P.ortho({ lat: 15, lon: 180, zoom: 1 }, W, H)
  for (const proj of [flat, ortho]) {
    const polygons = proj.fillPaths(square)
    for (const [lat, lon, inside] of [[15, 179, true], [15, -175, true], [15, 0, false], [15, 165, false]]) {
      const p = proj.project(lat, lon)
      if (p.visible) assert.strictEqual(insideEvenOdd(polygons, p.x, p.y), inside, `${proj.kind} ${lat}, ${lon}`)
    }
  }
  for (const line of flat.strokePaths(square))
    for (let i = 2; i < line.length; i += 2) assert.ok(Math.abs(line[i] - line[i - 2]) < W / 4)
})

test("lines (isobars) split at the rim and at the seam", () => {
  const line = [160, 10, 170, 12, 179, 13, -179, 14, -170, 15]
  const flat = P.flat({ lat: 0, lon: 0, zoom: 0 }, W, H)
  const parts = flat.linePaths(line)
  assert.strictEqual(parts.length, 2)
  const ortho = P.ortho({ lat: 0, lon: 175, zoom: 0 }, W, H)
  assert.strictEqual(ortho.linePaths(line).length, 2)
  assert.strictEqual(P.ortho({ lat: 0, lon: 0, zoom: 0 }, W, H).linePaths(line).length, 0)
})

test("grid lines lie on the meridians and parallels", () => {
  for (const proj of both({ lat: 30, lon: 40, zoom: 3 }).concat(both({ lat: 0, lon: 0, zoom: 0 }))) {
    const lines = proj.gridPaths(proj.gridStep)
    assert.ok(lines.length > 2)
    for (const line of lines) {
      const mid = Math.floor(line.length / 4) * 2
      const place = proj.unproject(line[mid], line[mid + 1])
      if (!place) continue
      const step = proj.gridStep
      const onMeridian = Math.abs(place.lon / step - Math.round(place.lon / step)) < 1e-3
      const onParallel = Math.abs(place.lat / step - Math.round(place.lat / step)) < 1e-3
      assert.ok(onMeridian || onParallel, `${proj.kind}: ${place.lat}, ${place.lon}`)
    }
  }
})

test("cellGrid: the wash's nodes, NaN exactly where unproject finds nothing", () => {
  for (const view of views) {
    for (const proj of both(view)) {
      const grid = proj.cellGrid(48, 30, 0)
      assert.strictEqual(grid.lats.length, 49 * 31)
      assert.ok(Array.isArray(grid.lats) && Array.isArray(grid.lons))
      for (let r = 0; r <= 30; r++) {
        for (let c = 0; c <= 48; c++) {
          const i = r * 49 + c
          const place = proj.unproject(c * grid.cellW, r * grid.cellH)
          assert.strictEqual(Number.isNaN(grid.lats[i]), place === null, `${proj.kind} node ${c}, ${r}`)
          assert.strictEqual(Number.isNaN(grid.lons[i]), place === null)
          if (place) assert.ok(Math.abs(grid.lats[i] - place.lat) < 1e-9 && lonDiff(grid.lons[i], place.lon) < 1e-9)
        }
      }
      // Reused when the size is the same; padded nodes take the edge's place.
      assert.strictEqual(proj.cellGrid(48, 30, 0, grid).lats, grid.lats)
      const padded = proj.cellGrid(48, 30, 1.5)
      const count = (g) => g.lats.filter((v) => !Number.isNaN(v)).length
      assert.ok(count(padded) >= count(grid))
    }
  }
})
