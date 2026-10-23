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
stops; 35 is interpolated between its original 30/40 stops. Both renderers
sample the same native value and palette; no radar texture uses bilinear
filtering or mipmaps. Cell size is 3 × max(1, Style.font.baseSize/12) logical px.
Rain rate maps to equivalent reflectivity with Z=200 R^1.6 (R in mm/h),
explicitly labelled approximate dBZ, not a new measured reflectivity product.
Missing/transparent cells remain missing; zero rain draws nothing. The floor
hides measured values below 5 dBZ by default and is named in the legend.

| Source | Presentation decision |
| --- | --- |
| DWD | Native 1 km Bright Sky grid, separate bounded view request so rain totals and motion keep their point/grid semantics. Polar stereographic inverse cell addressing, no averaging; approximate dBZ. |
| JMA | Decode the existing JMA tile colour classes to lower rain-rate bounds; approximate dBZ. Unknown colours stay transparent. Keep nearest-time tile completion gating. |
| RainViewer | 512 px monochrome scheme 0 tiles, z derived from viewport pixels/km and DPR. Byte minus 32 gives dBZ; alpha/no-data stays distinct from measured negative values. |
| NWS, ECCC, FMI, KNMI | Preserve supplied WMS images; legend explicitly says “provider colours”. No invented numerical decoding or weak-return filter. |
| Model fallback | Existing bounded precipitation cells use the shared rain-rate mapping, explicitly labelled model precipitation. |

`WeatherRadarPaint.qml` / `shaders/radar-map.frag` paint the same sampled
3-pixel cell as Pixels, Glyphs (default), or Stipple. Omastorm's density mask
and soft-square treatment are adapted. `shaders/radar.frag` keeps the globe
projection and shares the paint functions. No new hosts, binaries or runtime
engine. Source budgets are explicit below. Precompiled QSBs are shipped as before.
`RadarMotion.mjs` and shared files remain unchanged. Existing image sanitization and allowlists apply.

## Chrome and behaviour

`WeatherRadarView.qml` composes siteRow (source + place, automatic coverage,
no fictional station lock), productLine (product + active attribution),
metaLine (age of the picture), mapStage, legend, transport, tickStrip.
Feed health is independent of selected-frame age: LIVE, stale at 10 minutes
since the newest observation/reference, unreachable on active-source failure.
Forecast times never make an old observation look fresh. Cached frames stay.
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

## Implementation notes

`WeatherRadarFrame.qml` samples the native Image texture directly on the GPU.
Its software path reads a native-sized image once and addresses it with
integer indices; it never samples an enlarged/resized picture. FULL/LEAN,
Focus and compact popup use the same map. WMS WIDTH/HEIGHT follows the visible
viewport × DPR, capped independently at 2048. Request BBOX is the actual
visible viewport. `WeatherRadarTileFrame.qml` covers that viewport completely;
it lowers z to meet a budget, never truncates the tile list. JMA uses its
supported even zooms through 10; public RainViewer stops at z7. Native DWD
validation runs in `RadarGridWorker.js`; `WeatherDwdRadarField.qml` projects
native rows/columns with the RADOLAN spherical stereographic CRS.

| Model.js budget constant | Limit |
| --- | --- |
| RADAR_FRAME_MAX_BYTES | 4 MiB image bytes per frame, unchanged |
| RADAR_RV_MAX_TILES / RADAR_TILE_MAX_BYTES | 16 × 256 KiB; 512 px tiles |
| RADAR_JMA_MAX_TILES / RADAR_JMA_TILE_MAX_BYTES | 32 × 128 KiB; 256 px tiles (previous JMA cap 36) |
| RADAR_WMS_MAX_SIDE | 2048 device pixels per side; existing store ceiling |
| RADAR_GRID_MAX_SIDE / RADAR_GRID_MAX_FRAMES | 1024 native cells per side / 32 frames (existing parser ceilings 1200 / 64 tightened) |
| RADAR_GRID_MAX_BYTES | 16 MiB total JSON response, existing Bright Sky ceiling |

Grid requests cover the projected viewport corners plus a one-cell margin, without resampling. If the view cannot fit the
native grid/response budgets, automatic RainViewer fallback supplies the
whole view rather than clipping or averaging DWD cells. Three downloads run
at a time; existing image file/cache limits and timeline limits remain.
The model fallback remains explicitly coarse model data; the globe's
software wash also retains its existing coarser sampling. The globe uses
Pixels with the shared continuous dBZ palette, keeping its rim antialiasing.
JMA credit/time changes only when the complete matching tile mosaic is ready.
The stamp names the computer's local zone, rather than silently showing the
place's fixed forecast UTC offset with a misleading zone name.

Git phase commits require writable linked-worktree metadata. This session's
sandbox denies that metadata; cumulative phase patches are saved under /tmp.
