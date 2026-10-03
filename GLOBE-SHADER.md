# The globe's surface on the GPU

The globe section draws everything on QML Canvas in JavaScript. While the globe turns by itself, every frame
used to recompute the colour wash through an inverse projection and redraw the land and the night, which took
about 90 % of a CPU core in the real app (the offscreen harness measured about 25 ms of script per frame).
The GPU path here moves the **surface** of the sphere to a fragment shader:

- the colour layers and the land are painted **once per change** of the data, the shown time, the layer set or
  the theme, into a flat **equirectangular texture** (`WeatherGlobeTexture.qml`, `GlobeTexture.js`);
- a fragment shader (`shaders/globe.frag`) projects that texture onto the sphere every frame, using the same
  orthographic view as the Canvas path (`GlobeProjection.js`: centre lat/lon, radius, disc centre) or the flat
  Equal Earth map. It also puts the base colour underneath, adds the night in its three steps and antialiases
  the rim (`WeatherGlobeSurface.qml`).

While the globe turns, only uniforms change, so turning costs almost nothing. Everything drawn as lines or
symbols stays on the existing Canvas layers above it: coast strokes, borders, the grid, markers, labels,
isobars, streaks, symbols, the sun and the moon.

None of this is wired into `WeatherGlobe.qml` yet. The checklist is below.

## Files

| File | Role |
|---|---|
| `shaders/globe.frag` | The fragment shader (GLSL 440, Vulkan style, Qt's `qt_Matrix`/`qt_Opacity` block). It uses Qt's default vertex shader, so there is no `.vert`. |
| `shaders/globe.frag.qsb` | The compiled shader. It is committed, so the plugin needs nothing at runtime. |
| `tools/build-shaders.sh` | Rebuilds every `shaders/*.frag`/`*.vert` into `.qsb` with `/usr/lib/qt6/bin/qsb`. |
| `WeatherGlobeSurface.qml` | An Item with the `ShaderEffect`: view properties, sun, night, theme, `textureSource`, `available`. |
| `WeatherGlobeTexture.qml` | A Canvas that paints the equirectangular picture (1024×512 by default) from the lattices and the land. |
| `GlobeTexture.js` | Pure helpers: texel positions, lattice sampling (per node and separable per grid), the regional box, palettes, colour composition with lookup tables. Tested in `tests/globe-texture.test.mjs`. |
| `tests/ui/shader/shell.qml`, `tests/ui-shader.sh` | A standalone demo and measurement harness. |

## How it works

### The texture

The texture is equirectangular. Longitude −180…180° runs across x and latitude +90…−90° runs down y, so x = 0
is −180° and y = 0 is the north pole (`GlobeTexture.texelX/texelY`). The texture is RGBA. The Canvas paints it
straight, and the scene graph keeps it premultiplied, which is what the shader assumes.

The texture is painted bottom to top:

1. **The whole earth's lattices** (145×73, every 2.5°) are sampled on a node grid over the whole picture.
   `oversample` sets the nodes per lattice cell: 1 by default (the lattice's own nodes), 2 for every 1.25°.
   The layers are composed per node in the wash's order and with its colours (`GlobeTexture.compose`: base,
   wind, cloud veil, precipitation; the sea's temperature over the ocean from the land mask). The node grid
   becomes an ImageData that is drawn stretched as a smoothed pattern, so colours blend between nodes, exactly
   as the Canvas wash does.
2. **The regional lattices**: the box that all regional lattices on cover together is cleared and repainted
   at the finest regional spacing, capped at one node per texel. Inside the box the regional values come
   first, with the whole earth's as fallback. Copies 360° east or west are drawn when the box crosses ±180°.
3. **The land fill**: the rings of `data/globe-land.json` are drawn as plain lon/lat → x/y with the even-odd
   rule in `landColor`. Use the Canvas path's `landFill()`: faint, or opaque when only the sea's temperature
   shows.

The night is **not** in the texture. The shader computes it per pixel, so a change of the shown time only
updates the `sunDir` uniform and needs no repaint.

### The shader (`shaders/globe.frag`)

For each fragment the shader does the following:

- **Globe:** it computes `(u, w) = ((x − cx)/R, (cy − y)/R)` and `f = √(1 − u² − w²)`, and finds the
  Earth-fixed vector with `v = u·rowRight + w·rowUp + f·rowDepth`. That is the transpose of
  `Globe.viewMatrix`, the same inverse as `GlobeProjection.unprojectNear`. Points past the rim are pulled
  onto it, so the colour reaches the edge. Coverage `clamp((1 − d)·R, 0, 1)` makes alpha fall to 0 over the
  rim's last pixel.
- **Flat map** (`flatMap = 1`): it runs the inverse of Equal Earth (6 Newton steps on y, as in
  `EqualEarth.unproject`) on the map point `(x − cx)/s + mapCenter.x, −(y − cy)/s + mapCenter.y`. The outline
  is antialiased over a pixel: the poles' flat edges in map units × scale, and the ±180° meridians through
  `fwidth(λ)`.
- It samples `source` at `(lon/2π + 0.5, 0.5 − lat/π)` and composites it over `baseColor`.
- **Night:** it computes `e = asin(v·sunDir)` in degrees, with three steps at 0°, −6° and −12°. Each edge is
  a 1-px `smoothstep` from `fwidth(e)`. Alpha is `a0` between 0° and −6°, `a6` between −6° and −12°, and
  `a12` below. The bands follow `Sky.NIGHT_STEPS` (they do not add up), and the night colour is composited
  over everything.
- It outputs `colour × coverage × qt_Opacity`, premultiplied.

The texture has no mipmaps, so the jump in `atan` at ±180° picks no other level. Wrapping is
`RepeatHorizontally`, so filtering blends across the seam. `fwidth` stays outside any branch on the position.

### Uniform contract

The members of `uniform buf` (std140, binding 0), as `WeatherGlobeSurface` sets them:

| Uniform | GLSL | QML type | Meaning |
|---|---|---|---|
| `qt_Matrix`, `qt_Opacity` | mat4, float | (Qt) | Required by Qt. |
| `itemSize` | vec2 | size | The effect's size in px. |
| `center` | vec2 | point | The disc centre (globe) or the point where `mapCenter` sits (map), in item px. |
| `radius` | float | real | The globe's radius in px. |
| `rowRight`, `rowUp`, `rowDepth` | vec3 ×3 | vector3d | The rows of `Globe.viewMatrix(centerLat, centerLon)`. |
| `sunDir` | vec3 | vector3d | Unit vector to `Sky.subsolarPoint(displayMs)` (x to 0°/0°, y to 90° E, z north). |
| `nightOn` | float | real | 1 to draw the night, 0 for none. |
| `nightAlpha` | vec3 | vector3d | The alphas below 0°, −6° and −12°: `Sky.twilightLayers({night:true}, background)` → 0.12, 0.24, 0.38 (dark) or 0.30 (light). |
| `nightColor` | vec4 | vector4d | The night colour, rgb straight (`Sky.nightFill`). |
| `baseColor` | vec4 | vector4d | Under the texture, **premultiplied** (the sphere's faint fill: foreground at 0.04). |
| `flatMap` | float | real | 1 for the Equal Earth map. |
| `mapScale` | float | real | Px per map unit (`GlobeProjection.mapScale(w, h, zoom)`). |
| `mapCenter` | vec2 | point | `EqualEarth.project(centerLat, centerLon)` in map units. |
| `source` | sampler2D (binding 1) | ShaderEffectSource | The texture. |

Colours are passed as `vector4d`, never as `color`, so it is clear which values are premultiplied.

### `WeatherGlobeSurface.qml`

- **View:** `style` ("globe"/"map"), `centerLat`, `centerLon`, `zoom` (map scale), `radius`, `centerX`,
  `centerY`. Bind them to the same values the Canvas layers' `GlobeProjection.make` view uses. For the map,
  pass the clamped centre (`GlobeProjection.mapCentre`).
- `displayMs` drives the sun (rounded to the minute). `night` switches the night on or off.
- `background` sets the theme's popup background, from which the night colour and alphas are derived.
  `baseColor` sets the sphere's fill.
- `textureSource` takes any Item. It is wrapped in a `ShaderEffectSource` with `live: false` and
  `hideSource: true`. The texture is captured again on the source's `painted()` signal (a Canvas has it), or
  when the caller runs `refresh()`.
- `available` is **false** on the software scene graph (`GraphicsInfo.api === GraphicsInfo.Software`, or
  still `Unknown`), or when the shader failed to load. In that case the caller keeps the Canvas path.
- `frames` counts the window's swapped frames while the effect shows (for the harness).

## Rebuilding the `.qsb`

```sh
tools/build-shaders.sh          # QSB=/path/to/qsb to override
```

The script runs `qsb --glsl "100es,120,150,300es,330" --hlsl 50 --msl 12 -o shaders/globe.frag.qsb
shaders/globe.frag`. One file holds SPIR-V (Vulkan), GLSL ES 100/300, GLSL 120/150/330 (OpenGL
compatibility/core), HLSL and MSL, so it runs under every RHI backend. qsb comes from `qt6-shadertools` and
is a build tool only. The `.qsb` is about 6 KiB.

## Fallback rule

Use the GPU surface only when `surface.available` is true. Otherwise draw exactly what is drawn today:
sphere Rectangle, `WeatherGlobeWash`, land fill and night caps on the Canvas. The offscreen harnesses
(`tests/ui-shots.sh`, `tests/ui-showcase.sh`) run on the software scene graph, so they keep testing the
Canvas path unchanged. A machine without GPU acceleration also falls back automatically.

## Measurements

Machine: Intel Iris Xe (ADL GT2), Mesa 26.2.2, Qt 6.11.2, Quickshell 0.3.1, OpenGL RHI on the live Hyprland
session. The test window was 480×480 and the globe radius 220 px. The machine was busy with other jobs (load
average 9–12), so all times are on the pessimistic side.

Headless GPU runs were not possible here. The offscreen platform always loads the software backend (with
`QSG_RHI_BACKEND=opengl` or `vulkan` as well), and `minimalegl` with `EGL_PLATFORM=surfaceless` stops with
"Cannot find EGLConfig". There is no headless compositor installed, and eglfs/KMS cannot be tried on the
user's running GPU session. The GPU numbers therefore come from three live runs
(`MW_SHADER_LIVE=1 tests/ui-shader.sh`). Each was one small window that closed itself after about 11 s.

**CPU while turning** (the whole process: timer, bindings, render thread, GL submission; the Canvas marks
overlay hidden):

| | 15 fps | 30 fps |
|---|---|---|
| GPU surface, run 1 | 4.0 % of a core (2.6 ms/frame), 15.4 fps | 8.0 % (2.6 ms/frame), 30.7 fps |
| GPU surface, run 2 | 5.0 % (3.3 ms/frame), 15.4 fps | 8.7 % (2.8 ms/frame), 30.7 fps |
| GPU surface, run 3 | 4.4 % (2.8 ms/frame), 15.6 fps | 7.6 % (2.5 ms/frame), 30.8 fps |
| Canvas path (offscreen harness, script only) | ≈ 25 ms/frame → ≈ 37 % of a core | ≈ 75 % (cannot keep up at 30 fps) |
| Canvas path (real app, reported) | ≈ 90 % of a core | |

About 2.5–3 ms of CPU per frame is left, most of it Qt's own frame overhead (binding updates, scene-graph
sync, GL submission, swap). The shader itself is GPU time. Turning the surface is roughly **10× cheaper** than
the Canvas path at 15 fps. In the app, the remaining per-frame Canvas work (grid, coast strokes, markers,
overlay) is added on top; see the checklist.

**Texture repaint** (1024×512, 3 layers: temperature, cloud, a regional rain patch; `oversample` 1):

| Part | ms per repaint (script) |
|---|---|
| Sampling (separable grid, 145×73 + 81×41 regional nodes) | 7–9 |
| Composition (lookup tables) | 35–50 |
| Copy into the ImageData | 3–5 |
| Land fill path (globe-land.json) | 7–10 |
| **Script total** | **52–75** (max 106) |
| CPU per repaint including rasterising and the capture | 81–120 |

`oversample: 2` (every 1.25°) costs about 4× as much (140–200 ms). The repaint runs only when the data, the
shown hour, the layers or the theme change, never per frame. While the timeline plays, that is once per step.

Two traps were found while measuring, and both are documented in the code:

- **Typed arrays** (`Float32Array`, `Uint8ClampedArray`) counted against QML's outside-memory tally. After a
  few repaints, the engine collected garbage before every allocation, and one repaint went from about 0.1 s to
  minutes. The code now uses plain arrays only (`GlobeTexture.zeros`), kept per size.
- **Closures** inside the hot compose function made it several times slower in QML's engine, so it has none.

**Memory:** the resident set was 146 MB on the GPU run against 98 MB on the software backend for the same
harness. The difference is mostly the GL driver and context, which the real app pays anyway. The texture
itself adds the Canvas's 1024×512 image (2 MiB on the CPU), its GPU texture (2 MiB) and the capture's layer
(2 MiB of GPU memory), plus about 1 MB of node buffers.

## Visual check

The pictures from the live runs are produced by `tests/ui-shader.sh` (`shader-screen.png` from grim, plus
`shader-europe.png`, `shader-map.png` and `shader-z3.png` grabbed in QML):

- **Orientation:** centred on 30° N 10° E, Europe is upright and east is to the right. Africa lies below with
  Cape Town at its tip. The red city dots, which a Canvas places through `GlobeProjection`, sit on their land
  in the shader's picture (London, Madrid, Moscow, Cairo, Reykjavík, Cape Town), so the two projections agree.
- **Rim:** exactly one intermediate pixel at the edge (pixel row through the centre: 89,73,67 → 62,52,58 →
  background).
- **Night:** three stepped bands east of the terminator (16:00 UTC, sun over South America, dusk at Cairo).
  The edges are one or two pixels wide.
- **Regional lattice:** the rain patch shows at its own resolution inside its box. A first version drew the
  box over the global colours, so the translucent layers added up into a visible rectangle. The box is now
  cleared first, on whole texels, and no seam is visible.
- **Flat map:** the Equal Earth outline has flat poles and antialiased edges. The night shows on both ends
  across ±180°, and the cities are in place.

## Limits: texture resolution against zoom

At 1024×512 a texel covers 0.35° (about 39 km at the equator). For a globe of radius R px, one texel spans
about `R · 0.0061` px:

| Zoom | Radius (popup ≈ 220 px at z0) | Texel on screen |
|---|---|---|
| z0 | 220 | 1.3 px (crisp) |
| z1 | 440 | 2.7 px |
| z2 | 880 | 5.4 px (soft land edges; the colour fields are smooth anyway) |
| z3 | 1760 | 11 px (visibly blurred land fill; regional detail capped at a node per texel) |

**Recommendation: use the GPU surface up to z2 and switch back to the Canvas path from z3.** Reasons:

- The CPU problem is the **automatic turning of the whole globe**, which happens only at z ≤ 1 on the globe
  (`canRotate` in `WeatherGlobe.qml`). From z2 on, and on the map, nothing turns by itself. A drag already moves the finished Canvas picture (`shiftX/shiftY`) and
  repaints only on release.
- From z3 the Canvas path already switches to the basemap's detailed land (`Basemap.js`) and the regional
  lattices. The texture's land comes from the coarse globe-land.json, and its resolution would hide the
  regional detail.
- A second regional texture (a box texture for the visible area, with a second sampler and box uniforms)
  would work. However, it needs a repaint whenever the box changes, which means after every drag or zoom.
  That is the same work the Canvas wash does today, plus more code and GPU memory. It is worth doing only if
  smooth dragging close up becomes a goal. In that case the shader would take `detail` (sampler) and
  `detailBox` (vec4 south/north/west/east) and prefer it inside the box.

**Flat map:** the same shader handles it (`flatMap = 1`), and it was verified visually. I recommend using it
for the map at z0–z2 too. Panning the map at those levels then costs only uniforms, and the night needs no
polygons. The same zoom cut-off applies.

## Wiring checklist for `WeatherGlobe.qml`

1. Add a hidden texture source as a child of the globe item:
   `WeatherGlobeTexture { id: surfaceTexture; layers: globe.washLayers; lattices: panel.globeData.lattices;
   landMask: panel.globeData.landMask; scaleKmh: globe.windScaleKmh; palettes: wash.palettes;
   landColor: canvas.landFill(); landData: globe.landData }`.
   Give the land colour its own binding, so a theme change repaints it.
2. Add `WeatherGlobeSurface { id: surface }` under the Canvas, where the sphere Rectangle and the wash are now:
   `style: globe.isMap ? "map" : "globe"`, `centerLat/centerLon/zoom/radius/centerX/centerY` from the same
   values `globe.projection()` uses, `displayMs: panel.globeData.displayMs`, `night: globe.showNight`,
   `background: Color.popups.background`, `baseColor: globe.isMap ? "transparent" :
   Qt.rgba(fg.r, fg.g, fg.b, 0.04)`, `textureSource: surfaceTexture`.
3. `readonly property bool gpuSurface: surface.available && globe.zoom < 3`. Set `surface.visible: gpuSurface`.
4. When `gpuSurface` is true, these **leave the per-frame Canvas work**:
   - the sphere's faint fill (the Rectangle): hide it;
   - **the wash** (`WeatherGlobeWash`): `visible: !gpuSurface`, so its `on` is false and `viewChanged()`
     returns early;
   - **the land fill** in `canvas.onPaint` (`frontPolygonsView` per ring and the fill; the flat map's
     `mapRings` fill): skip it;
   - **the night caps** (`Globe.capPolygonView` / `mapTwilight` and the three fills): skip them.
5. These **stay** on the Canvas layers: the graticule (now above the land fill instead of under it, which is
   barely visible at 0.07 alpha), the coast strokes (`frontLinesView` / `mapRings[].lines`), the basemap at
   z≥3 (Canvas path anyway), the sun and moon markers, the moon's shadow, places, labels, the overlay
   (isobars, storms, symbols), the streaks, the legend and the tooltip.
6. Keep `wash.palettes` as the single source of the colours, so the legend and the texture match.
7. Repainting: `WeatherGlobeTexture` repaints on its own property changes. The surface captures again on the
   texture's `painted()`. Nothing else is needed, and nothing is repainted per frame.
8. The `moving`/`playing` quality reductions of the wash do not apply to the surface. Leave them in the wash
   for the fallback.
9. Tests: `tests/ui-shots.sh` stays on the Canvas path (software). Use `MW_SHADER_LIVE=1 tests/ui-shader.sh`
   for the GPU picture. Update the README's globe section and the CHANGELOG when this is wired in.

## Reuse in More Time (`TimeGlobe.qml`)

- The zone **zebra stripes** belong in the texture. The Natural Earth zone polygons are lat/lon rings, so
  they draw as plain x/y in an equirectangular Canvas (like the land here), once per theme change. The land
  fill goes with them.
- The night and twilight come from the shader through `sunDir` and `nightAlpha`/`nightColor`. If More Time
  wants its golden and blue bands, the shader needs two more band sets. Either generalise it to N
  (elevation, alpha, colour) steps through a small uniform array, or keep three bands and pass the colour per
  band.
- The zone borders, the coastline strokes, the city dots and the labels stay on its Canvas.

## Making it a shared file

- Rename the surface to `GlobeSurface.qml` and add it to `renamed` in `tools/sync-shared.sh`. It becomes
  `WeatherGlobeSurface.qml` / `TimeGlobeSurface.qml`, and the warning's product name is renamed on the way.
- Add `shaders/globe.frag`, `shaders/globe.frag.qsb` and `tools/build-shaders.sh` to `verbatim`. The
  shared-files test should compare the `.qsb` as bytes, not as text.
- The surface imports `GlobeProjection.js` (More Weather only) for `mapScale`. To share it, move `mapScale`
  into `EqualEarth.js` (already shared), or let the caller pass `mapScale`/`mapCenter` as properties.
- `WeatherGlobeTexture.qml` and `GlobeTexture.js` are specific to the weather: they hold the lattices and
  palettes. More Time gets its own texture Canvas (zones + land).
