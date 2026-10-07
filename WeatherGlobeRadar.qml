import QtQuick
import Quickshell
import "GlobeRadar.js" as GlobeRadar

// The globe's radar layer from z2 on (Settings → Display → Globe: Radar):
// RainViewer's tiles of the frame shown (the Radar section's source and
// catalogue, panel.rainViewerFrames), fetched through the map picture
// store (panel.mapImages, its cache and size cap), each reprojected from
// web mercator to plain longitude/latitude once (GlobeRadar.rowMap) and
// kept; `raster` holds those of the view for the wash and the GPU
// surface's texture. The globe's time picks the frame while it lies within
// the radar's span, else the latest shows (`inRange` false, said in the
// legend). MW_RADAR_FIXTURE: a PNG used for every tile (the screenshot
// harness, offline).
Item {
  id: radar
  required property var panel
  property Item globe: null
  // On, from z2, while the globe shows.
  property bool wanted: false
  width: GlobeRadar.TILE_PIXELS * 4
  height: width

  readonly property string fixture: Quickshell.env("MW_RADAR_FIXTURE") || ""
  readonly property var frames: fixture !== ""
    ? [{ timestamp: new Date(Math.floor(panel.relativeTimeNowMs / 600000) * 600000).toISOString(), rainViewerHost: "fixture",
      rainViewerPath: "" }]
    : (panel.rainViewerFrames || [])
  readonly property var chosen: GlobeRadar.frameFor(frames, panel.globeData.displayMs)
  readonly property bool inRange: chosen.inRange
  readonly property double frameMs: chosen.frame ? new Date(chosen.frame.timestamp).getTime() : 0
  readonly property string frameId: chosen.frame ? String(chosen.frame.rainViewerHost || "") + String(chosen.frame.rainViewerPath || "") : ""

  // The tiles of the view (GlobeRadar.tilesFor), set when the view rests.
  property var tiles: []
  property int tileZoom: 3
  // Reprojected tiles by URL: { key, box, size, rgba } (plain arrays).
  property var decoded: ({})
  property var decodedOrder: []
  // What the wash and the texture read: { z, tiles: { key: tile } } of the
  // view's tiles decoded so far, or null.
  property var raster: null

  function urlOf(tile) {
    if (!chosen.frame) return ""
    if (fixture !== "") return "fixture:" + tile.key
    return GlobeRadar.tileUrl(chosen.frame.rainViewerHost, chosen.frame.rainViewerPath, tile.z, tile.x, tile.y)
  }
  function localOf(url) {
    if (url.indexOf("fixture:") === 0) return "file://" + fixture
    return panel.mapImages.localUrl(url)
  }

  // The view's tiles: a slightly padded box at the zoom's tile level.
  function refresh() {
    if (!wanted || !globe || !chosen.frame) {
      tiles = []
      raster = null
      return
    }
    var box = globe.projection().box()
    var z = GlobeRadar.tileZoomFor(globe.zoom)
    var list = GlobeRadar.tilesFor(box, z)
    tileZoom = list.length ? list[0].z : z
    tiles = list
    for (var i = 0; i < list.length; i++) {
      var url = urlOf(list[i])
      if (url.indexOf("fixture:") !== 0) panel.mapImages.request(url)
    }
    collect()
  }
  onWantedChanged: refresh()
  onFrameIdChanged: refresh()
  Connections {
    target: radar.globe
    ignoreUnknownSignals: true
    function onZoomChanged() { restTimer.restart() }
    function onCenterLatChanged() { restTimer.restart() }
    function onCenterLonChanged() { restTimer.restart() }
  }
  Timer {
    id: restTimer
    interval: 600
    onTriggered: radar.refresh()
  }
  Connections {
    target: radar.panel.mapImages
    function onRevisionChanged() { if (radar.tiles.length) radar.collect() }
  }

  // The view's tiles that are decoded go into the raster; the next ready
  // one is decoded.
  property string decoding: ""
  property var decodingTile: null
  function collect() {
    var out = {}
    var any = false
    var next = null
    for (var i = 0; i < tiles.length; i++) {
      var url = urlOf(tiles[i])
      var done = decoded[url]
      if (done) { out[tiles[i].key] = done; any = true; continue }
      if (!next && localOf(url) !== "") next = { url: url, tile: tiles[i] }
    }
    raster = any ? { z: tileZoom, tiles: out } : null
    if (next && decoding === "") {
      decoding = next.url
      decodingTile = next.tile
      decoder.source = localOf(next.url)
      decoder.loadImage(decoder.source)
      if (decoder.isImageLoaded(decoder.source)) decoder.requestPaint()
    }
  }

  // Draws a tile's picture once and reads it back, then reprojects it.
  Canvas {
    id: decoder
    property string source: ""
    visible: false
    width: 512
    height: 512
    renderStrategy: Canvas.Immediate
    onImageLoaded: requestPaint()
    onPaint: {
      if (radar.decoding === "" || source === "" || !isImageLoaded(source)) return
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(source, 0, 0, width, height)
      var data = ctx.getImageData(0, 0, width, height).data
      var size = GlobeRadar.TILE_PIXELS
      var tile = radar.decodingTile
      var rows = GlobeRadar.rowMap(tile.z, tile.y, size, height)
      var rgba = new Array(size * size * 4)
      var step = width / size
      for (var r = 0; r < size; r++) {
        var src = rows[r] * width
        for (var c = 0; c < size; c++) {
          var s = (src + Math.floor((c + 0.5) * step)) * 4
          var o = (r * size + c) * 4
          rgba[o] = data[s]; rgba[o + 1] = data[s + 1]; rgba[o + 2] = data[s + 2]; rgba[o + 3] = data[s + 3]
        }
      }
      unloadImage(source)
      var url = radar.decoding
      var next = Object.assign({}, radar.decoded)
      // The picture's file stays with it: the GPU path draws from it at
      // full resolution (WeatherGlobeRadarSurface).
      next[url] = { key: tile.key, box: GlobeRadar.tileBox(tile.z, tile.x, tile.y), size: size, rgba: rgba,
        z: tile.z, x: tile.x, y: tile.y, source: source }
      // At most 48 tiles kept (three views' worth).
      var order = radar.decodedOrder.concat([url])
      while (order.length > 48) delete next[order.shift()]
      radar.decoded = next
      radar.decodedOrder = order
      radar.decoding = ""
      radar.decodingTile = null
      radar.panel.defer(radar.collect)
    }
  }
}
