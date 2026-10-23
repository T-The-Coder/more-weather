# Radar rebuild report

The Omastorm-inspired presentation remains. The owner's correction supersedes
the earlier resolution/fetching request: data acquisition and computation
are restored to c6fcf53. Changes in this correction are left uncommitted on
`radar-omastorm` (starting HEAD b8c4a64), as requested.

## What was NOT changed: data acquisition and computation are those of c6fcf53

Restored byte-for-byte:

- `Model.js`: catalogues, geometry, parsers, grid calculations, original limits
  and RainViewer/JMA zoom/tile choices. Presentation mappings remain in `RadarStyle.js`.
- `WeatherMapPrefetch.qml`: original frame loading, three-at-a-time gating,
  pending-series handling and reuse.
- `WeatherImageStore.qml`, `WeatherRemoteImage.qml`: original bytes, cache keys,
  sanitization, request/retry behaviour, image dimensions and download limits.
- `GlobeRadar.js`, `WeatherGlobeRadar.qml`: original tile URLs, sampling,
  reprojection, catalogue and loading. Globe shader/QSB restored too.

Restored within mixed UI files:

- `Panel.qml`: original `radarFrameUrl`, WMS BBOX/480×250 dimensions, RainViewer
  512 px coordinate-tile URL/scheme 2 / 1_1 options, request scheduling,
  catalogue selection, pending-frame handoff and fallback. Existing functions
  match the base except the explicit UI/key/playback-loop functions.
- `WeatherJmaRadarLayer.qml`: original `Model.jmaTilesFor`, URL construction,
  time matching, tile geometry and load/completion gating; only painter and
  displayed-source/time hooks remain new.
- `WeatherRadarMap.qml` / `WeatherRadarLayerFrame.qml`: paint the original
  fetched images at the original map crop/scale, not new mosaics or native grids.
- `WeatherForecast.qml` and `WeatherBasemap.qml`: their remaining changes are
  radar layout and quiet theme colours; no data logic changes.

Removed: `RadarGridWorker.js`, `WeatherDwdRadarField.qml`,
`WeatherRadarTileFrame.qml`, `shaders/radar-grid.frag` and its QSB. The separate
Bright Sky view-grid request, native-grid reprojection and viewport/DPR request
planning are gone. Bright Sky point/grid calculations, `RadarMotion.mjs`,
source allowlists and all original network/count/cache bounds remain unchanged.
No main-worktree source, shared file or alert file was edited.

## Presentation retained

Quiet geography, sparse labels, rings/crosshair, scale and attribution;
source/product/frame age, LIVE/stale/unreachable light; legend, transport,
ticks, forecast outlines, actual timestamp/index; selection-based playback,
FULL/LEAN/Focus, compact popup, radar keys and translated shortcuts.

`RadarStyle.js`, `WeatherRadarPalette.qml`, `WeatherRadarPaint.qml`,
`WeatherRadarFrame.qml`, `WeatherRadarLayerFrame.qml`, `WeatherRadarLegend.qml`,
`WeatherRadarView.qml`, `WeatherRadarTimeline.qml` and radar-map/paint shaders
retain the treatments and shared continuous 13-stop reflectivity palette.
DWD's original WMS palette and JMA's original tile classes map their rain-rate
lower bounds through Marshall–Palmer Z=200 R^1.6 to approximate dBZ. This changes
painting only. Model fallback uses the already-computed precipitation grid.

RainViewer's original coloured/smoothed scheme-2 image is **provider colours**,
as are NWS/ECCC/FMI/KNMI. Its red channel is never mistaken for monochrome dBZ.
Treatments and weak filtering apply only where values are recoverable; they
do not invent data from provider-coloured images. The globe preserves its
original colours (nearest-neighbour capture is presentation only).

## Visual comparison with Omastorm

Reference: read-only Omastorm `docs/media/readme/window.png`. Synthetic fixtures
are different weather, not the same product. No reference picture was copied.

| Aspect | Assessment |
| --- | --- |
| Cell size | Value-aware treatments retain an approximately 3 logical-px lattice at both 500 and 840 px. Source resolution remains the original fetched image; a larger view does not acquire more detail. |
| Crispness | Nearest source-pixel sampling keeps treatment marks crisp. Existing RainViewer/provider-side smoothing cannot be undone by the painter. |
| Palette | DWD/JMA value-aware paint and legend share Omastorm's continuous cool-to-warm/purple ramp, including interpolated 35 dBZ. Provider-coloured sources keep their own ramp, honestly labelled. |
| Geography | Theme-coloured thin lines, low-alpha rings, sparse labels, crosshair and corner scale remain quiet behind weather. |
| Chrome | Map → legend → transport/ticks hierarchy, source/product/status, frame age, locale stamp and index remain. More Weather keeps its theme, provider naming and global navigation. |

Differences from Omastorm remain where the base data has less detail: fixed
480×250 WMS pictures, the original single RainViewer coordinate image and its
provider smoothing/palette, original JMA zoom/time/classes, and the existing
coarse model fallback. No fetching or computation was changed to hide these
limits. The monochrome fidelity fixture verifies the renderer only; it does
not claim live RainViewer supplies monochrome cells.

## Adaptation and licence

Omastorm © 2026 Wes Grimes, MIT; full notice in `THIRD-PARTY-NOTICES.md`.
Adapted files: `RadarStyle.js`, `Panel.qml` (radar presentation/playback),
`WeatherRadarMap.qml`, `WeatherJmaRadarLayer.qml`, `WeatherRadarView.qml`,
`WeatherRadarTimeline.qml`, `WeatherRadarFrame.qml`, `WeatherRadarPalette.qml`,
`WeatherRadarPaint.qml`, `WeatherRadarLegend.qml`, `shaders/radar-paint.glsl`,
`shaders/radar-map.frag` and its QSB. Adaptations include treatment masks,
reflectivity palette, presentation hierarchy, layout and loop semantics.
README credits and all 30 translations remain.

## Verification

| Offline check | Result |
| --- | --- |
| `tests/qml-syntax.sh` | PASS; `/tmp/radar-revert-syntax.log` |
| `mise x node@24.21.0 -- node --test tests/*.test.mjs` | PASS: 32 file tests, 0 failures; `/tmp/radar-revert-node-final.log` |
| `tests/ui-shots.sh /tmp/radar-revert-shots` | PASS: complete run, no TypeError/ReferenceError/undefined assignments or failed checks; `/tmp/radar-revert-ui.log` |
| `MW_AUDIT=radar tests/ui-shots.sh /tmp/radar-revert-final-shots` | PASS: latest presentation helpers, both widths and all three treatments; `/tmp/radar-revert-final-ui.log` |
| `git diff --check` | PASS |

Full Qt log: `/tmp/more-weather-ui.4CnMJ0/log.txt`. All source, map/cache,
settings, focus, translated UI and compact-popup checks completed.

Regenerated shots: `radar-fidelity-{500,840}-{pixels,glyphs,stipple}.png`
and matching map crops, twelve files in each run's shot directory.
Latest [500 px Glyphs](/tmp/radar-revert-final-shots/radar-fidelity-500-glyphs.png)
and [840 px Glyphs](/tmp/radar-revert-final-shots/radar-fidelity-840-glyphs.png)
were inspected alongside the Omastorm reference. Coloured map-pixel counts
(Pixels / Glyphs / Stipple): 500 px 21,493 / 4,716 / 3,443; 840 px
63,313 / 18,487 / 9,021. Checks reject blank radar maps and require reduced
paint coverage for Glyphs/Stipple. The source remains the original fetched
image geometry; these counts are rendering evidence, not new data resolution.

`tests/radar-acquisition.test.mjs` fingerprints the base data-only files and
existing Panel functions, so regression coverage includes exact URL building,
requests, computation and fallback. The stable synthetic catalogue is injected
only into the harness's throwaway source copy; production catalogue selection
is the original code.

Maintainer review: live GPU/fractional-scale rendering, DWD/JMA class decoding,
provider-coloured images and JMA source/time handoff. Offline tests do not
contact providers or prove their current remote availability. No GPU visual
pass is claimed by the software offscreen harness.
