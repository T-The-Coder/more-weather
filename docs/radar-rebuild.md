# Radar presentation (3.3)

Reference: Omastorm by Wes Grimes, MIT, local reference DESIGN.md “Picture”,
“Window chrome” and “Playback”; ui/RadarWindow.qml, RadarMap.qml, Popover.qml,
Keys.js and shaders. Adaptations carry THIRD-PARTY-NOTICES.md and file headers.
No branding or reference pictures are included.

## Picture and sources

`WeatherRadarMap.qml` retains the bounded frame/image pipeline, pan geometry,
quiet Natural Earth ground and at most four place labels. Thin range rings
and a crosshair mark the selected place. A true-length 1/2/5 scale bar uses
More Weather's km/mi setting; map credit is bottom-right, always inside the
stage. `WeatherMapGround.qml` dims the drawn geography for radar only.

`RadarStyle.js` owns the palette; `WeatherRadarPalette.qml` uploads exactly
those swatches to the shaders and `WeatherRadarLegend.qml` displays them.
Bounds (dBZ): <0, 0, 10, 20, 30, 35, 40, 45, 50, 55, 60, 65, 70+.
The Omastorm reflectivity ramp is interpolated continuously between those
stops; 35 is interpolated between its original 30/40 stops. Both value-aware renderers
sample the same fetched image and palette with nearest-neighbour filtering.
They do not recover detail or undo smoothing already present in provider images. Cell size is 3 × max(1, Style.font.baseSize/12) logical px.
Rain rate maps to equivalent reflectivity with Z=200 R^1.6 (R in mm/h),
explicitly labelled approximate dBZ, not a new measured reflectivity product.
Missing/transparent cells remain missing; zero rain draws nothing. The floor
hides measured values below 5 dBZ by default and is named in the legend.

| Source | Presentation decision |
| --- | --- |
| DWD | Decode the original DWD WMS image using the existing Model.DWD_RADAR_COLORS class lower bounds; approximate dBZ. Bright Sky grids, point calculations and motion stay exactly as before. No separate view grid request. |
| JMA | Decode the existing JMA tile colour classes to lower rain-rate bounds; approximate dBZ. Unknown colours stay transparent. Keep nearest-time tile completion gating. |
| RainViewer | Original 512 px coordinate tile, Model.rainViewerTile zoom and scheme 2 / 1_1 options. Preserve provider colours, explicitly labelled; never interpret coloured RGB bytes as encoded dBZ. No new mosaic or viewport-based zoom. |
| NWS, ECCC, FMI, KNMI | Preserve supplied WMS images; legend explicitly says “provider colours”. No invented numerical decoding or weak-return filter. |
| Model fallback | Existing bounded precipitation cells use the shared rain-rate mapping, explicitly labelled model precipitation. |

`WeatherRadarPaint.qml` / `shaders/radar-map.frag` paint the same sampled
3-pixel cell as Pixels, Glyphs (default), or Stipple. Omastorm's density mask
and soft-square treatment are adapted. Treatments and the weak-return floor
apply to value-aware DWD/JMA images and model fallback, not provider-coloured
products. The globe keeps its original coloured RainViewer pipeline and shader.
No new hosts, binaries or runtime engine. Precompiled QSBs are shipped as before.
`RadarMotion.mjs` and shared files remain unchanged. Existing image sanitization and allowlists apply.

## Chrome and behaviour

`WeatherRadarView.qml` composes siteRow (source + place, automatic coverage,
no fictional station lock), productLine (product + active attribution),
metaLine (age of the picture), mapStage, legend, transport, tickStrip.
Feed health is independent of selected-frame age: LIVE, stale at 10 minutes
since the newest observation/reference, unreachable on active-source failure.
Forecast times never make an old observation look fresh. Cache and catalogue
replacement/failure semantics stay those of the base commit. Forecast tick
identity is read from the existing RainViewer report without changing catalogue entries.
`WeatherRadarTimeline.qml`: first/previous/play/next/last; stripStamp uses
numeric locale date, locale 12/24-hour time and an explicit local zone;
frameIndex reads N / total. One tick per playable frame; forecast ticks are
outlined. No baseline or gap padding. Stamp/index follow the displayed frame.

Playback captures the selected timestamp, runs through the last available
frame (including More Weather's nowcast), wraps to that selection; starting
at the last frame chooses the whole available loop. Pause keeps the picture.
If that timestamp leaves the catalogue, the loop begins at its oldest frame.

FULL requires width >=560 and available height >=620, scaled by base font/12
(minimum 1). LEAN drops the extra title row and colour strip, retaining the
legend explanation. Focus (`f`) overrides size: map, scale, credit and a
status/time/age stamp. Session-only, reset on closing. Widget/popover uses
compact source + status/age, map, product/time stamp and transport.

## Keys

Radar-only keys are intercepted after settings/search/global modifiers.

| Keys | Action |
| --- | --- |
| h j k l / arrows, Ctrl+arrows | Pan (Shift+arrows retain hour-cursor behaviour) |
| + / −, 0 | Zoom / reset |
| Space, [ / ], Home / End | Play/pause, step, first/last |
| Ctrl+1 / Ctrl+2 / Ctrl+3 | Pixels / Glyphs / Stipple |
| Shift+W | Weak returns |
| f, ? | Focus / shortcuts page |
| 1–9; Tab / Shift+Tab | Tabs; existing bar-panel switching (unchanged) |
| w, / or Enter, Ctrl+comma, Alt+1–9 | Existing service link, search, settings, favourites |

Omastorm's bare 1/2/3 and w collide with global More Weather keys, so use
Ctrl+digits and Shift+W. No NEXRAD station picker/lock, aviation, archive,
IP lookup or external engine: these are outside More Weather's providers and
marketplace rules. Satellite remains an explicit existing map preference.

## What was NOT changed: data acquisition and computation are those of c6fcf53

Restored byte-for-byte: `Model.js`, `WeatherMapPrefetch.qml`,
`WeatherImageStore.qml`, `WeatherRemoteImage.qml`, `GlobeRadar.js`,
`WeatherGlobeRadar.qml`, `shaders/radar.frag` and its QSB. Model's original
catalogues, geometry, JMA/RainViewer zoom selection, parsers, limits and
calculations are unchanged; all palette/Z–R helpers live in `RadarStyle.js`.
`Panel.qml` retains its original request functions, `radarFrameUrl`, WMS
BBOX/WIDTH/HEIGHT, source selection, pending-frame handoff and fallback.
`WeatherJmaRadarLayer.qml` retains the original tile selection, nearest-time
matching, placement and completion/load gating, with only painter/status hooks.
`WeatherForecast.qml` changes only radar layout; `WeatherBasemap.qml` changes
only radar colours. The original Bright Sky request, grid calculations and
`RadarMotion.mjs` remain unchanged.

Removed additions: `RadarGridWorker.js`, `WeatherDwdRadarField.qml`,
`WeatherRadarTileFrame.qml` and the unused radar-grid shader/QSB. There is no
extra fetching, reprojection worker, viewport/DPR request planning, new
per-frame budget or new network host. Existing base byte/count/cache limits
apply unchanged (WMS 480×250, RainViewer 512×512 coordinate image, original
JMA tile cap/zoom choices). `WeatherRadarLayerFrame.qml` is now just a painter
adapter for the original `panel.radarFrameUrl` and original load allowance.

`WeatherRadarFrame.qml` reads each sanitized image at its source dimensions
and samples integer pixels for value-aware paints. It does not enlarge an
image to manufacture data. Original map crop/scale placement remains. The
3 logical-pixel treatment lattice is a painting choice and cannot increase
the resolution of the original fetched product. Provider-coloured products
retain their original palette and any provider-side smoothing. The synthetic
monochrome fixture is only a renderer test; production RainViewer never uses
that decoder. The UI test's stable catalogue override is injected only into
the throwaway test snapshot, never the production Panel.

Regression fingerprints in `tests/radar-acquisition.test.mjs` check the base
data files and existing Panel functions, excluding the explicit UI/key/loop
functions. Shared files and alert files remain untouched.
