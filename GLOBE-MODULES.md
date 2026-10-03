# Globe modules for P4–P5

Five pure JS modules for the globe section, written for QML's engine
(`.pragma library`, ES5 style, no `Intl`, no imports), each with Node tests
in `tests/globe-*.test.mjs` (`mise x node@24.21.0 -- node --test tests/globe-*.test.mjs`).
None of them draws anything or touches QML; they turn lattices into
lines, points and times.

## Lattice assumptions (all modules)

`{ south, north, west, east, cols, rows, values, wrap }`, values row by row
from the south-west corner (`index = row * cols + col`), NaN (or a non-number)
where unknown. `wrap: true` means the longitudes go all the way round; when
`east − west = 360` (the global 145 × 73 lattice at 2.5°, west −180, east
180) the last column is taken as a repeat of the first and is never used
twice (no doubled symbols, isolines join across the seam). A wrapping
lattice without the repeated column (e.g. 144 columns up to 177.5°) also
works. Box lattices (`wrap: false`) give NaN outside the box. Bilinear
lookup: `fx = (lon − west)/(east − west)·(cols − 1)`, `fy = (lat − south)/(north − south)·(rows − 1)`.
Each module has its own small `valueAt`; none imports `GlobeGrid.js`.

Lattices may use plain arrays or typed arrays for `values`.

## GlobeIsolines.js — isobars and pressure centres

- `isolines(lattice, step, base)` → `[{ level, lines: [[lon, lat, lon, lat, …], …] }]`
  Marching squares, linear interpolation along cell edges, one pass over the
  cells for all levels. Levels are `base + k·step` between the least and
  greatest known value; a level only appears when it has a line. A corner
  counts as "above" when `value >= level`, so a level exactly equal to the
  field's minimum yields nothing. Closed lines repeat the first point at the
  end (`line[0] === line[len−2] && line[1] === line[len−1]`); open lines end
  at the lattice edge or a NaN hole. Cells with any unknown corner are
  skipped. Saddles are decided by the mean of the four corners. On a
  wrapping lattice the lines join across ±180°; longitudes are in
  −180 … 180, so a line crossing the seam has a jump from ~180 to ~−180
  between two neighbouring points (harmless on the sphere; a 2-D renderer
  must split there).
  Pressure: `isolines(pressureLattice, 4, 1000)` (hPa).
- `extrema(lattice, { radius = 3, minDepth = 2, minDistanceDeg, max = 12 })`
  → `[{ kind: "high" | "low", lat, lon, value }]`, strongest (deepest)
  first. A node is a centre if it is the greatest/least known value within
  `radius` nodes and at least `minDepth` (lattice unit, hPa) above/below
  the **mean** of the ring of nodes exactly `radius` away. Same-kind centres
  closer than `minDistanceDeg` (great-circle) to a stronger one are dropped;
  default 15° on a wrapping lattice, a quarter of the box's smaller side on
  a box. Nodes within `radius` rows of the north/south edge (and on a box,
  of any edge) are never centres, so no false centres at the poles or box
  edges. Positions are refined by a parabola through the neighbours
  (within ±½ node); `value` is the node value (round it for the "H 1032"
  label).
- `levelsFor(values, step, base)`, `distanceDeg(lat1, lon1, lat2, lon2)` (helpers).
- Cost (V8, smooth global field): ~40 ms isolines, ~7 ms extrema; QML's V4
  is several times slower, so run it in the WorkerScript, once per time
  step, and cache the result per step.

## GlobeStreaks.js — wind particles

Units: u/v lattices in **m/s** (east, north). Times in seconds.

- `uvLattices(speedLattice, directionLattice, unit = "kmh")` → `{ u, v }`
  lattices with the speed lattice's geometry; `unit` one of `"kmh"`/`"km/h"`
  (Open-Meteo's default), `"ms"`/`"m/s"`, `"kn"`, `"mph"` — converted to m/s.
  Interpolate u and v, never the direction.
- `uvFromSpeedDirection(speed, directionDeg)` → `{ u, v }` in the speed's
  unit; the direction is meteorological (where the wind comes FROM): 0° →
  v = −speed, 90° → u = −speed, 270° (west wind) → u = +speed.
- `seed(count, box | null, random?)` → `[{ lat, lon, age, life }]`, uniform
  by area on the sphere (or in `box = { south, north, west, east }`, `west > east`
  crosses the date line), always within ±88°. `life` is 3…8 s
  (`LIFE_MIN`, `LIFE_MAX`), `age` starts spread over the life so the field
  does not die at once.
- `step(particles, u, v, dtSeconds, speedScale, box | null, random?)` →
  segments `[[lat0, lon0, lat1, lon1, speed], …]` (speed: the wind in m/s,
  for colour/alpha). Moves particles **in place** by
  `dLat = v·dt·scale/R`, `dLon = u·dt·scale/(R·cos lat)` (cos clamped at 89°),
  R = 6 371 000 m. `speedScale` is simulated seconds per real second:
  10 m/s × 10 000 ≈ 0.9° per second. `lon1` is `lon0 + dLon` *unwrapped*
  so a segment across the date line stays short; the particle's own `lon`
  is wrapped to −180 … 180. Particles re-seed (and draw nothing that frame)
  when `age > life`, when they leave the box or would step out of it, when
  the wind there is NaN, or past ±88°.
- `seededRandom(seed)` → deterministic `random()` (mulberry32) for tests or
  repeatable pictures; `valueAt(lattice, lat, lon)`, `inBox(box, lat, lon)`, `spawn(box, random, staggered)`.
- Cost: ~0.4 µs per particle per step in V8; budget maybe 10× in V4.
  1500–3000 particles per frame are realistic; keep `step()` in the shell
  thread only if it stays under a few ms, else in the WorkerScript.

## GlobeSymbols.js — storms and thunderstorms

Units as Open-Meteo answers: gusts km/h, CAPE J/kg, precipitation mm (per
hour on hourly data), WMO weather codes.

- `storms(gustLattice, { storm = 75, severe = 103, cellDeg, max = 40 })`
  → `[{ lat, lon, gust, level: 1 | 2 }]`, local maxima (3 × 3) with
  gust ≥ 75 km/h, level 2 from 103 km/h, strongest first.
- `thunderstorms(codeLattice, capeLattice, precipitationLattice, { cape = 1500, rain = 0.5, cellDeg, max = 24 })`
  → `[{ lat, lon, strength, cape }]`. Places are the code lattice's nodes;
  the code is taken from the **nearest node** (never interpolated): 95 →
  strength 1, 96 → 2, 99 → 3. CAPE ≥ 1500 with precipitation ≥ 0.5 counts
  too (strength 1, 2 from 2500 J/kg); CAPE or precipitation may be `null`.
  `cape` is 0 when unknown.
- De-cluttering: places are binned into `cellDeg × cellDeg` cells
  (default 10° on a wrapping lattice, ⅛ of a box's smaller side), the
  strongest per cell stays. Nodes within 5° of a pole are skipped; the
  repeated seam column is skipped.
- `declutterScreen(points, project, minPx, score?)`: `project(lat, lon)` →
  `{ x, y, visible }` (e.g. Globe.js's projection); hidden points go, then
  every point closer than `minPx` to a stronger one. Returns **copies** with
  `x`, `y` added, strongest first (score: `strength`, else `gust`, else
  `depth`, else `|value|`). Use it after a turn/zoom, on the lattice result.
- `nearestAt(lattice, lat, lon)`, `valueAt(lattice, lat, lon)`, `codeStrength(code)`.

## GlobeTimeline.js — the scrubber

All times ms since the epoch.

- `steps(nowMs, range)`: `"global"` → 3-hour UTC slots from the slot now
  falls in to now + 120 h (41 steps); `"regional"` → full hours from the
  hour now falls in to now + 48 h (49 steps). Step 0 is always "now".
- `atNow(steps, nowMs)` → the latest index not after now (0 if all are
  later, −1 if empty).
- `nearestIndex(steps, ms)` (earlier on a tie), `clampIndex(index, steps)`
  (rounds; −1 if empty).
- `stepLabel(ms, nowMs, range, utcOffsetMinutes?)` → `{ dayOffset, hour,
  minute, isNow }`; without an offset the system zone (`Date`) is used;
  pass the place's offset to label in its time. `isNow`: now lies within
  that step.
- `advance(index, steps, direction, loop)` → next index; at the end it
  wraps when `loop`, otherwise returns the same index (stop playing).
- `playbackDelay(range)` → 400 ms (global) / 250 ms (regional).
- `stepMs(range)`, `HOUR`.

## GlobeMarine.js — sea surface temperature

Checked with one real request on 2026-10-03 (3 places: mid-Atlantic,
central Germany, Ionian Sea), fixture in `tests/fixtures/marine.json`:

- URL: `https://marine-api.open-meteo.com/v1/marine?latitude=a,b,c&longitude=x,y,z&hourly=sea_surface_temperature&forecast_days=1&timeformat=unixtime`.
- Answer: a JSON **array** in request order for several places (from the
  second on with `location_id`), a single **object** for one place;
  `hourly.time` (unix seconds, 24 values from 00 UTC today) and
  `hourly.sea_surface_temperature` (°C). Coordinates snap to the model grid
  (e.g. 30.0 → 30.041664).
- Land: HTTP 200, `elevation` > 0, every value `null` → NaN.
- Size: 2049 bytes for 3 places × 24 h, ~680 bytes per place.

Functions:

- `request(points)` → `{ url, maxBytes }` (`points` `[{ lat, lon }]`,
  coordinates with two decimals; `maxBytes = 2048 + 1200·n`).
- `requests(points, perRequest = 100)` → `[{ url, maxBytes, points }]`
  chunks so URLs stay short.
- `parse(text, points)` → `{ times (ms), values: [[°C…] per place] }`;
  array or object, `location_id` respected, nulls and missing places NaN,
  broken text → `{ times: [], values: [[] per place] }`.
- `isOcean(landData, lat, lon)`: `landData` is the parsed
  `data/globe-land.json` object (`{ scale, land }`); even-odd point in
  polygon per ring with a bounding-box prefilter, prepared rings cached per
  data object. Without data everything counts as sea. Lakes are not holes
  in that file (the Caspian counts as land).
- `oceanPoints(points, landData)` → the sea places.

## How to wire it in

Worker requests (Open-Meteo forecast, same lattice as P3):

| Layer | Variables | Module |
| --- | --- | --- |
| Isobars, H/L | `pressure_msl` | `GlobeIsolines.isolines(p, 4, 1000)`, `extrema(p)` |
| Wind particles | `wind_speed_10m`, `wind_direction_10m` | `GlobeStreaks.uvLattices(speed, dir, "kmh")` once per time step, then `seed`/`step` per frame |
| Storms | `wind_gusts_10m` | `GlobeSymbols.storms(gusts)` |
| Thunderstorms | `weather_code`, `cape`, `precipitation` | `GlobeSymbols.thunderstorms(code, cape, precip)` |
| Sea temperature | Marine API | `GlobeMarine.oceanPoints` on the lattice nodes → `requests` → `parse` |
| Time | — | `GlobeTimeline.steps(now, "global" | "regional")` |

Suggested split: the WorkerScript builds per time step the u/v lattices,
isolines, extrema, storms and thunderstorms (all pure data, cheap to post
as plain arrays/objects); the shell thread keeps the particles
(`GlobeStreaks.step` per frame on the current step's u/v) and runs
`declutterScreen` with the current projection after turning or zooming.
For the sea temperature, compute `oceanPoints` once for the lattice nodes
and cache it (the land test is the expensive part), then fetch in chunks of
≤ 100 places with the `maxBytes` guard; the values are hourly for today
only (`forecast_days=1`), so take the hour nearest the scrubber's time or
the latest one.

In QML: `import "GlobeIsolines.js" as GlobeIsolines`, in another JS
library: `.import "GlobeIsolines.js" as GlobeIsolines`. In the worker,
`.import` does not work (ReferenceError), but `Qt.include` takes these
files, pragma line and all (checked with Quickshell 0.3.1 / Qt 6.11):
GlobeWorker.js includes all of them plus GlobeGrid.js and GlobeLayers.js
into one scope; its header lists the same-named helpers and why they do
no harm.
