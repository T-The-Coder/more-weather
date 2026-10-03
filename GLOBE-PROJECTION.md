# Globe projection: the globe and the flat map behind one interface

`GlobeProjection.js` (`.pragma library`, tested by `tests/globe-projection.test.mjs`)
puts the globe section's two map styles behind one interface, so the views
(`WeatherGlobe.qml`, `WeatherGlobeWash.qml`, `WeatherGlobeOverlay.qml`,
`WeatherGlobeStreaks.qml`, `WeatherGlobeData.qml`) do not have to branch on the
style ("Map style: Globe / Flat map"):

| Style  | Factory                                  | Built on                                  |
|--------|------------------------------------------|-------------------------------------------|
| Globe  | `ortho(view, width, height, options)`    | `Globe.js` (`*View`), `GlobeView.js`      |
| Flat   | `flat(view, width, height, options)`     | `EqualEarth.js` (shared with More Time)   |
| Either | `create(style, view, width, height, options)` | `"flat"` or anything else for the globe |

Module-level helpers: `prepareLand(data)` (= `Globe.prepareLand`, cached per
process), `prepareRing(points)` (= `Globe.prepareVectors`), `angularDistance`,
`DEFAULT_LIFT` (1.18), `FLAT_ASPECT` (`Y_MAX / X_MAX` ≈ 0.4867).

## Units and conventions

- **view**: `{ lat, lon, zoom }`, the place in the middle of the viewport and the
  zoom level z0 … z5 (each level doubles the scale). The globe keeps
  longitude unwrapped (turns animate the short way, as today); the flat map
  returns longitudes within ±180.
- **Pixels** are canvas pixels of the viewport (`width` × `height`): origin top
  left, x right, y down. No more `centerX + x, centerY - y` in the views.
- **Paths** are flat arrays `[x0, y0, x1, y1, ...]` in those pixels, polygons
  implicitly closed. Fill everything with `ctx.fillRule = Qt.OddEvenFill`
  (several polygons of one call, or of several calls, in one path).
- **Rings** (land, anything to fill or stroke) are Globe.js' prepared rings
  (`Globe.prepareLand(data)`, `Globe.prepareVectors(points)`), or raw
  `[lat0, lon0, ...]` / `[{ lat, lon }]` arrays, which are prepared once and
  kept on the array (`__globeVectors`). A raw ring means what it means to
  `Globe.prepareVectors`: a plain lat/lon polygon (longitudes past ±180 reach
  across the seam). `data/globe-land.json`'s `[lon, lat]` integers go through
  `prepareLand(data)`. The flat map's geometry (map units, already cut at the
  ±180° edge, with bounding boxes) is made the first time a ring is drawn flat
  and kept on the ring object (`__flatMap`), so `Globe.prepareLand`'s
  per-process cache serves both styles.

## The interface (members of what `ortho` and `flat` return)

| Member | Globe (`ortho`) | Flat map (`flat`) |
|---|---|---|
| `kind` | `"ortho"` | `"flat"` |
| `isDisc` | `true` | `false` |
| `width`, `height`, `viewport` `{x, y, width, height}` | the canvas | the canvas |
| `view`, `zoom` | the clamped view | the clamped view (see the rules below) |
| `scale`, `radius`, `pxPerRadian` | disc radius R (px per earth radius) | px per Equal Earth map unit (equal-area on the unit sphere, so also px per radian on average) |
| `centerX`, `centerY` | the disc's centre | where 0° 0° is |
| `disc` | `{ x, y, r }` (for `ctx.arc`) | `null` |
| `clipPoints` | the rim as a sampled circle (lazily) | the Equal Earth outline (2° steps, 0.5° from z3; lazily) |
| `matrix` | `Globe.viewMatrix` (for code that keeps its own fast loop) | — |
| `mapCenter` | — | the centre in map units `{x, y}` |
| `gridStep` | `GlobeView.gridStep(zoom)` | same |
| `project(lat, lon)` → `{x, y, visible}` | `Globe.projectView`; `visible` = on the front | Equal Earth; `visible` is always true (cull to the viewport yourself, as today) |
| `unproject(x, y)` → `{lat, lon}` \| `null` | `Globe.unprojectView`; null off the disc | `EqualEarth.unproject`; null outside the outline |
| `fillPaths(ring)` | `Globe.frontPolygonsView` | the ring's cached pieces, culled to the viewport |
| `strokePaths(ring)` | `Globe.frontLinesView` (no rim strokes, no seams) | cached polylines: seams (±180°, poles) left out, cut where they cross ±180° |
| `capPaths(axisLat, axisLon, radiusDeg)` | `Globe.capPolygonView` | seam-safe cap, see below |
| `linePaths([lon0, lat0, ...])` | open line (isobars): split behind the globe and where it jumps across ±180° | split at ±180°, cut exactly at the crossing |
| `gridPaths(stepDeg)` | z0–z2 `Globe.gridLinesView`; from z3 the lines in view, sampled to step/4 (as `traceGrid`) | meridians (curved, 2° samples or finer in view; not ±180°) and parallels (straight: two points) in view |
| `visibleBox()` → `{south, north, west, east, wraps}` | `GlobeView.visibleBounds`; west/east unwrapped about the centre, `wraps` when past ±180 | exact box of the viewport ∩ map; `wraps` always false |
| `degPerPixelAt(lat, lon)` | side of a pixel's area in degrees of arc: `1/(RAD·R·√cos c)` (c = distance from the centre); `Infinity` behind | `1/(RAD·scale)` everywhere (equal-area) |
| `cellGrid(cols, rows, pad, reuse)` | the wash's lattice (below) | same, row-wise |
| `clamp(view)` | `clampLat` (±80), `clampZoom`, lon kept | the flat rules below |
| `dragged(view, dx, dy)` | `GlobeView.panned` with the view's radius | the map follows the pointer, then clamp |
| `zoomedAt(view, x, y, delta)` | `GlobeView.zoomedCentre` plus a few Newton steps (see notes) | keeps the map point under (x, y), then clamp |
| `keyStep(view, east, north)` | as `turnStep`: 15° on z0/z1, a quarter of the view from z2 (east divided by cos lat) | a quarter of the viewport per step (nothing moves at z0) |
| `towards(view, lat, lon)` | the animation target: lon the short way (unwrapped next to view.lon), lat clamped, `lat === null` keeps it | clamped target; animations run straight across the map, never across the seam |
| `reset(place)` | `{ lat: 0, lon: place.lon (short way), zoom: 0 }` | `{ lat: 0, lon: 0, zoom: 0 }` |

All view functions take the view to start from (`dragged` the view at the press,
as `dragTo` does now) and return a new `{ lat, lon, zoom }`; they use the
projection object's width, height and options, not its own view.

`options`: `ortho` takes `{ lift, viewSize }` (default lift 1.18 and
`min(width, height)`, i.e. today's `GlobeView.radiusFor(zoom, viewSize, lift)`);
`flat` takes `{ fit }` (a factor on the z0 scale, default 1).

### Flat zoom and pan rules

- Equal Earth's central meridian is always 0°: the ±180° seam is the map's
  edge and never moves, so land, caps and isobars never need re-cutting per
  view. (A Pacific-centred map would need every ring cut anew per centre.)
- z0: the whole map fitted into the viewport: `scale = min(width / (2·X_MAX), height / (2·Y_MAX))`,
  i.e. fitted to the width whenever `height ≥ width · FLAT_ASPECT`. For a map
  that fills the section, make the flat style's height `width · FLAT_ASPECT`
  (≈ 0.487 · width; the square globe viewport leaves half of it empty).
  Each level doubles the scale.
- The centre is clamped in map units: along an axis where the map is not
  larger than the viewport it sits in the middle (so z0 is fixed on 0° 0° and
  does not pan); otherwise it stays half a viewport inside the map's bounding
  box. Then it is pulled inside the outline (|x| ≤ the ±180° meridian at its y),
  so the centre is always a real place and `{lat, lon}` stays meaningful: near
  the curved corners at z3+ part of the viewport shows the empty space beyond
  the edge, but never more than half.
- The factory clamps the view it is given, so animation frames between two
  clamped views (linear in lat/lon) are always valid.

### Caps (night and the twilight steps)

`capPaths(axisLat, axisLon, ρ)`: the places within ρ of the axis (the night:
the antisolar point, ρ = 90° + elevation, as today). Even-odd fill semantics in
both styles.

- Globe: `Globe.capPolygonView` (`[]`, `[disc]`, `[disc, edge]` or one polygon).
- Flat: the edge is traced every 1° of bearing, then halved until each chord is
  within 0.3 px of the curve (so passes close by a pole resolve), and unwrapped
  edge by edge. The three topologies:
  - no pole inside: the edge is a closed loop in lat/lon;
  - one pole inside: the edge winds once round it (net ±360°); it is closed
    along that pole (down the meridian, along the pole line, back);
  - both poles inside: the map's outline plus the cap round the antipode of
    radius 180° − ρ (which holds no pole), so even-odd leaves the difference.
  The ring is then copied every 360° that reaches into −180 … 180, each copy
  cut at the edge with Sutherland–Hodgman (the cut follows the curved ±180°
  meridian, sampled every 2°). The copies do not overlap. Results are cached
  per (axis, ρ, zoom level band) — 24 entries — so the four caps of a minute
  cost once per zoom level.
- ρ ≤ 0 gives `[]`, ρ ≥ 180 the whole outline. An edge exactly through a pole
  is degenerate (not handled specially).

### `cellGrid(cols, rows, pad, reuse)` — the wash's lattice

Returns `{ cols, rows, nodeCols, nodeRows, cellW, cellH, lats, lons }` for the
**nodes** the wash samples today (not cell centres): `(cols + 1) × (rows + 1)`
nodes, node `(c, r)` at `(c · width / cols, r · height / rows)`, index
`r · nodeCols + c`, so `WeatherGlobeWash`'s pattern ("pixel i's middle on
node i") stays as it is. `lats`/`lons` are plain JS arrays (no typed arrays), NaN
outside the projection, so `inside[j]` becomes `lats[j] === lats[j]`.
`pad` = how many cells past the rim/outline still take the edge's place (the
wash uses 1.5 today); with `pad = 0` the NaN pattern equals `unproject`'s
nulls exactly (tested). Pass the last result as `reuse` to refill its arrays
when the size is unchanged (the wash's `buffer()` cache can hold the result).

## Performance

Measured in Node 24 (V8; the QML engine is slower, expect several times
this), viewport 800 × 400, all 347 land rings (8,100 points prepared):

| | Globe | Flat |
|---|---|---|
| `cellGrid(96, 96)` (9,409 nodes) | 0.3 ms (z0), 0.6–0.9 ms (z3) | 0.10–0.17 ms |
| land fills + strokes, per view | 1.4–1.6 ms | 0.2 ms (z0), 0.1 ms (z3, culled) |
| land, first flat draw (prepare map geometry for all rings, once per process) | — | 23–26 ms |
| four caps, uncached (a new minute) | 0.06–0.2 ms | 2–3.5 ms (then cached) |

What to cache:
- **Per process**: `prepareLand(data)` and the coarse rings (as now); the flat
  geometry rides on those ring objects. Do not prepare raw rings per frame.
- **Per view change** (centre, zoom, size, style): one projection object —
  e.g. `readonly property var projection: GlobeProjection.create(style, { lat: centerLat, lon: centerLon, zoom: zoom }, width, height, { lift: lift, viewSize: viewSize })`
  — shared by the globe canvas, wash, overlay, streaks and data loader; it
  costs a matrix (globe) or one Newton solve (flat) to make. `clipPoints` is
  made on first use.
- **Per frame**: the paths calls. In flat mode these are only an affine
  transform of cached map-unit arrays, culled by bounding box. Caps are cached
  inside the module.
- For the overlay's isobars the globe can keep its own unit-vector loop
  (`matrix` is exposed); `linePaths` projects per point (fine for the flat map,
  where each point is one `EqualEarth.project`).

## Notes for the main agent

- `GlobeView.zoomedCentre` alone leaves up to ~0.7 px between the pointer and
  the place when zooming **out** (its six drag corrections do not converge
  near the rim); `ortho.zoomedAt` adds up to eight Newton steps so the place
  stays within 0.01 px. Today's `zoomAt` has the same small drift.
- `EqualEarth.js` and `tests/equal-earth.test.mjs` are byte-identical copies of
  More Time's; More Time's `tools/sync-shared.sh` already lists them in
  `verbatim`, this repository's copy does not yet (add them to the list).
- Auto-rotation (`rotateTimer`, `centerLon += …`) makes no sense flat (z0 is
  pinned to 0°): disable it for the flat style. The moon floating at 1.15 × its
  disc position is globe-only; on the flat map draw it at its sub-lunar point
  or not at all.
- The faint sphere `Rectangle` under the wash becomes a fill of `clipPoints`.

## Wiring checklist

Line numbers are those of commit c20ea98; the files are changing, so the
function names lead. "proj" is the shared projection object.

### WeatherGlobe.qml

| Where (function / item) | Line | Today | Instead |
|---|---|---|---|
| `globe.radius` property | 93 | `GlobeView.radiusFor(zoom, viewSize, lift)` | `proj.radius` (globe) / `proj.scale`; prefer `proj.pxPerRadian` where it is a speed (rotateTimer 460) |
| `centerX`, `centerY` | 94–95 | width/2, height/2 | only where needed as "viewport middle"; projected points come in canvas px now |
| `turnTo(lat, lon)` | 136–138 | `GlobeView.clampLat`, `Globe.shortestTurn` | `var t = proj.towards(view, lat, lon)`; animate to `t.lat`, `t.lon` |
| `turnStep(east, north)` | 143–150 | `GlobeView.stepDegrees`, cos, `Globe.wrapLon` | `var t = proj.keyStep(target view, east, north)`; `turnTo(t.lat, t.lon)` (or animate to t directly) |
| `reset()` | 157–161 | `zoom = 0; turnTo(0, placeTarget.lon)` | `var t = proj.reset(placeTarget)` then zoom/animate to it |
| `zoomAt(delta, px, py)` | 166–177 | `GlobeView.clampZoom`, `radiusFor`, `zoomedCentre` (px, py from the middle) | `var v = proj.zoomedAt(view, x, y, delta)` with **canvas** x, y (callers at 1064 and 1090 pass `event.x, event.y` / `at.x, at.y` instead of offsets); `zoomBy(delta)` passes `width/2, height/2` |
| `coarseRings(data)` | 218 | `Globe.prepareVectors(flat)` | unchanged (works for both styles) |
| `landFile.onLoaded` | 229 | `Globe.prepareLand(data)` | unchanged, or `GlobeProjection.prepareLand(data)` |
| `sky` property | 262 | `Globe.wrapLon(sun.lon + 180)` | unchanged |
| `washHover(x, y)` | 309–313 | `Globe.viewMatrix` + `Globe.unprojectView(x - centerX, centerY - y, m, radius)` | `proj.unproject(x, y)` |
| `washValues(x, y)` | 323–326 | same | `proj.unproject(x, y)` |
| `rotateTimer.interval` | 460 | `globe.radius` | `proj.pxPerRadian`; not running in the flat style |
| sphere fill `Rectangle` | 481–485 | a circle of `radius` | globe as is; flat: fill `proj.clipPoints` |
| canvas `trace(ctx, xy, close)` | 530–534 | `centerX + x`, `centerY - y` | `ctx.moveTo(xy[0], xy[1])`, `lineTo(xy[i], xy[i + 1])` (paths are canvas px) |
| canvas `disc(ctx)` | 535–538 | `ctx.arc(centerX, centerY, radius)` | `proj.isDisc ? ctx.arc(proj.disc.x, proj.disc.y, proj.disc.r, …) : trace(ctx, proj.clipPoints, true)` (clip and rim stroke) |
| canvas `screenPoint(lat, lon, m)` | 539–541 | `Globe.projectView` + centre | `proj.project(lat, lon)` (used by markers, towns, sun, moon, `Moon.moonLitAngle`) |
| canvas `onPaint` | 550 | `Globe.viewMatrix(...)` | `var proj = globe.projection` |
| `onPaint`, grid | 563–566 | `Globe.gridLinesView(m, R, 15)` / `traceGrid(ctx, m, GlobeView.gridStep(zoom))` | `proj.gridPaths(proj.gridStep)` for every zoom; `traceGrid` goes |
| `onPaint`, land fill | 578 | `Globe.frontPolygonsView(rings[r], m, R)` | `proj.fillPaths(rings[r])` |
| `onPaint`, coast | 586 | `Globe.frontLinesView(rings[l], m, R)` | `proj.strokePaths(rings[l])` |
| `onPaint`, night caps | 602 | `Globe.capPolygonView(anti.lat, anti.lon, 90 + e, m, R)` | `proj.capPaths(anti.lat, anti.lon, 90 + e)` |
| `onPaint`, moon | 621–628 | 1.15 × from `centerX/Y`, globe only | globe only (`proj.isDisc`) |
| `traceGrid(ctx, m, step)` | 653–678 | `GlobeView.visibleBounds`, `Globe.projectView` | removed (in `proj.gridPaths`) |
| `paintBasemap(ctx, m)` | 686–782 | `GlobeView.visibleBounds` (688); inline matrix projection in its inner `trace` (697–720, from 701: m0…m8, front test `m6·vx + … ≥ 0`) | box from `proj.visibleBox()`; per point: globe keeps the fast inline loop with `proj.matrix`, `proj.radius`, `proj.centerX/Y`; flat uses `proj.project(lat, lon)` (`visible` always true) |
| `paintMarkers(ctx, m)` | 788, 797 | `screenPoint` | `proj.project` |
| `paintTowns(ctx, m, taken)` | 857–867 | `GlobeView.visibleBounds`, `screenPoint` | `proj.visibleBox()`, `proj.project` |
| `mouse.dragTo(x, y)` | 999–1001 | `GlobeView.panned(pressLat, pressLon, dx, dy, radius)` | `proj.dragged({ lat: pressLat, lon: pressLon, zoom: zoom }, dx, dy)` |
| `mouse.onDoubleClicked` | 1062–1065 | `zoomAt(1, x - centerX, y - centerY)` | `zoomAt(1, event.x, event.y)` |
| `takeWheel(wheel, point)`, zoom | 1089–1090 | offsets from the centre | canvas point |
| `takeWheel`, sideways | 1094 | `GlobeView.panned(..., wheelSidewaysPixels, 0, radius)`, lon only | `proj.dragged(view, wheelSidewaysPixels(wheel), 0)` (take lat too for the flat map) |

### WeatherGlobeWash.qml

| Where | Line | Today | Instead |
|---|---|---|---|
| `onPaint`, node places | 164–189 | `Globe.viewMatrix`, inline unproject per node with `reach` (1.5 cells past the rim), `inside[]` | `var grid = globe.projection.cellGrid(cols, rows, 1.5, buffered grid)`; `lats = grid.lats`, `lons = grid.lons`; `inside[j]` → `lats[j] === lats[j]` (also in `sample()`, 118–147) |
| `onPaint`, the fill | 273–280 | `ctx.arc(cx, cy, R, …)` | `proj.isDisc ? arc(proj.disc…) : path of proj.clipPoints` |

### WeatherGlobeOverlay.qml

| Where | Line | Today | Instead |
|---|---|---|---|
| `onPaint`, `project` helper | 91–96 | `Globe.viewMatrix` + `Globe.projectView` + centre | `proj.project(lat, lon)`, keep the ±20 px viewport test |
| `onPaint`, isobar clip | 130–133 | `ctx.arc(cx, cy, R, …)` | disc or `proj.clipPoints` |
| `onPaint`, isobar lines | 138–163 (`isoVectors`, `onLayersChanged` 36–59) | inline matrix loop over unit vectors, split on `visible` and `|Δlon| > 180` | globe: keep (with `proj.matrix`); flat: `proj.linePaths(line)` on the worker's `[lon, lat, …]` lines (label spot: 6th point of each run) — or `linePaths` for both |
| gusts, bolts, numbers | 189–230 | through `project` | unchanged (they use the helper above); numbers' `valueAt` goes through `washValueText` → `proj.unproject` |

### WeatherGlobeStreaks.qml

| Where | Line | Today | Instead |
|---|---|---|---|
| `viewBox()` | 34–43 | `GlobeView.visibleBounds`, front half when ≥ 359°, `Globe.wrapLon` | `var b = proj.visibleBox()`; globe keeps the front-half rule; wrap west/east as now (flat: already within ±180) |
| `onPaint`, clip | 89–92 | `ctx.arc(centerX, centerY, R)` | disc or `proj.clipPoints` |
| `onPaint`, speed | 94 | `20 · 6371000 / (10 · R)` | `… / (10 · proj.pxPerRadian)` |
| `onPaint`, segments | 96–107 | `Globe.viewMatrix`, `Globe.projectView` ×2 + centre | `proj.project` ×2; on the flat map also skip a segment whose ends lie more than half the width apart (a particle wrapping across ±180°) |

### WeatherGlobeData.qml

| Where | Line | Today | Instead |
|---|---|---|---|
| `viewBox()` | 158–161 | `GlobeView.visibleBounds(centerLat, wrapLon(centerLon), radius, width, height)` | `globe.projection.visibleBox()` (same shape; `GlobeGrid.tilesFor` takes unwrapped west/east) |
