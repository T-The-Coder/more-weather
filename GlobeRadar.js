.pragma library

// The globe's radar layer (WeatherGlobeRadar.qml) from z2 on: RainViewer's
// web-mercator tiles of the frame shown, laid onto the globe's plain
// longitude/latitude picture. Which tiles cover a view, their places,
// which source row each output row reads (the tile reprojected to
// equirectangular once), and a place's colour in the reprojected tiles.
// Pure functions, tested in Node (tests/globe-radar.test.mjs).

var MAX_TILES = 16
var MAX_TILE_ZOOM = 7
var MERCATOR_LIMIT = 85.0511287798
// The reprojected tiles' size (a 512 px tile kept at a quarter of its pixels).
var TILE_PIXELS = 128

// The tile zoom for a globe zoom: z2 → 3 … z5 → 6 (a tile about as wide
// as the view or a half of it).
function tileZoomFor(globeZoom) {
  return Math.max(2, Math.min(MAX_TILE_ZOOM, Math.round(Number(globeZoom)) + 1))
}

// Web mercator: the fractional tile row of a latitude at zoom z, and back.
function mercatorY(lat, z) {
  var phi = Math.max(-MERCATOR_LIMIT, Math.min(MERCATOR_LIMIT, Number(lat))) * Math.PI / 180
  return (1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2 * Math.pow(2, z)
}
function latOfY(y, z) {
  var n = Math.PI - 2 * Math.PI * Number(y) / Math.pow(2, z)
  return Math.atan(Math.sinh(n)) * 180 / Math.PI
}
function wrapLon(lon) {
  return ((Number(lon) + 180) % 360 + 360) % 360 - 180
}
function tileX(lon, z) {
  var n = Math.pow(2, z)
  return Math.min(n - 1, Math.floor((wrapLon(lon) + 180) / 360 * n))
}
function tileKey(z, x, y) {
  return z + "/" + x + "/" + y
}
// { west, east, north, south } of a tile.
function tileBox(z, x, y) {
  var n = Math.pow(2, z)
  return { west: x / n * 360 - 180, east: (x + 1) / n * 360 - 180, north: latOfY(y, z), south: latOfY(y + 1, z) }
}

// The tiles covering a box ({ south, north, west, east }, west/east may run
// past ±180°) at zoom z: [{ z, x, y, key }], centre first. More than
// `max` (16): the next zoom out, down to 2.
function tilesFor(box, z, max) {
  var limit = max || MAX_TILES
  for (var zoom = Math.min(MAX_TILE_ZOOM, z); zoom >= 2; zoom--) {
    var n = Math.pow(2, zoom)
    var y0 = Math.max(0, Math.floor(mercatorY(Math.min(box.north, MERCATOR_LIMIT), zoom)))
    var y1 = Math.min(n - 1, Math.floor(mercatorY(Math.max(box.south, -MERCATOR_LIMIT), zoom)))
    var x0 = Math.floor((box.west + 180) / 360 * n), x1 = Math.floor((box.east + 180) / 360 * n - 1e-9)
    if (x1 - x0 + 1 > n) { x0 = 0; x1 = n - 1 }
    var count = (y1 - y0 + 1) * (x1 - x0 + 1)
    if (count > limit && zoom > 2) continue
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
    var list = []
    for (var y = y0; y <= y1; y++) {
      for (var xi = x0; xi <= x1; xi++) {
        var x = ((xi % n) + n) % n
        list.push({ z: zoom, x: x, y: y, key: tileKey(zoom, x, y), d: Math.abs(xi - cx) + Math.abs(y - cy) })
      }
    }
    list.sort(function(a, b) { return a.d - b.d })
    return list.slice(0, limit).map(function(t) { return { z: t.z, x: t.x, y: t.y, key: t.key } })
  }
  return []
}

// RainViewer's tile of a frame: <host><path>/512/z/x/y/2/1_1.png (colour
// scheme 2, smoothed, snow), as the Radar section asks for its pictures.
function tileUrl(host, path, z, x, y) {
  return String(host || "") + String(path || "") + "/512/" + z + "/" + x + "/" + y + "/2/1_1.png"
}

// For each of `rows` output rows of a tile reprojected to equal latitude
// steps (north to south), the source row of a `size`-pixel mercator tile.
function rowMap(z, y, rows, size) {
  var box = tileBox(z, 0, y)
  var map = new Array(rows)
  for (var r = 0; r < rows; r++) {
    var lat = box.north - (r + 0.5) * (box.north - box.south) / rows
    var src = Math.floor((mercatorY(lat, z) - y) * size)
    map[r] = Math.max(0, Math.min(size - 1, src))
  }
  return map
}

// The frame to show at a time: { frame, inRange } — the nearest of the
// radar's frames while the time lies within their span (five minutes
// before the first to ten after the last), else the latest.
function frameFor(frames, ms) {
  if (!frames || !frames.length) return { frame: null, inRange: false }
  var times = frames.map(function(f) { return new Date(f.timestamp).getTime() })
  var first = times[0], last = times[times.length - 1]
  var target = Number(ms)
  if (target < first - 5 * 60000 || target > last + 10 * 60000) return { frame: frames[frames.length - 1], inRange: false }
  var best = 0
  for (var i = 1; i < times.length; i++) if (Math.abs(times[i] - target) < Math.abs(times[best] - target)) best = i
  return { frame: frames[best], inRange: true }
}

// ---- The z2 box picture (WeatherGlobeRadarSurface): the tiles' union as
//      one longitude/latitude box, longitudes taken nearest `centerLon` so
//      a box across ±180° stays whole; and a tile's rectangle in a picture
//      of that box `width` × `height`.
function nearLon(lon, centerLon) {
  return Number(lon) + 360 * Math.round((Number(centerLon) - Number(lon)) / 360)
}
function rasterBox(raster, centerLon) {
  if (!raster || !raster.tiles) return null
  var box = null
  for (var key in raster.tiles) {
    var b = raster.tiles[key].box
    var west = nearLon((b.west + b.east) / 2, centerLon) - (b.east - b.west) / 2
    var east = west + (b.east - b.west)
    if (!box) box = { west: west, east: east, south: b.south, north: b.north }
    else {
      box.west = Math.min(box.west, west); box.east = Math.max(box.east, east)
      box.south = Math.min(box.south, b.south); box.north = Math.max(box.north, b.north)
    }
  }
  return box
}
function tileRect(tileBoxValue, box, width, height) {
  var west = nearLon((tileBoxValue.west + tileBoxValue.east) / 2, (box.west + box.east) / 2)
    - (tileBoxValue.east - tileBoxValue.west) / 2
  var x0 = (west - box.west) / (box.east - box.west) * width
  var x1 = (west + tileBoxValue.east - tileBoxValue.west - box.west) / (box.east - box.west) * width
  var y0 = (box.north - tileBoxValue.north) / (box.north - box.south) * height
  var y1 = (box.north - tileBoxValue.south) / (box.north - box.south) * height
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

// A mercator tile drawn into equal-latitude rows in `strips` horizontal
// strips: for each, the source rows (of a `size`-pixel tile) and the share
// of the tile's height it covers in the destination, top to bottom.
function strips(z, y, count, size) {
  var box = tileBox(z, 0, y)
  var list = []
  for (var k = 0; k < count; k++) {
    var top = box.north - k * (box.north - box.south) / count
    var bottom = box.north - (k + 1) * (box.north - box.south) / count
    // Within the picture (drawImage refuses a source rectangle past it).
    var sy0 = Math.max(0, Math.min(size - 1, (mercatorY(top, z) - y) * size))
    var sy1 = Math.max(sy0 + 0.5, Math.min(size, (mercatorY(bottom, z) - y) * size))
    list.push({ sy: sy0, sh: sy1 - sy0, dy: k / count, dh: 1 / count })
  }
  return list
}

// A place's colour from the reprojected tiles ({ z, tiles: { key: { box,
// size, rgba } } }) into out [r, g, b, a] (0–255); false where no tile.
function sample(raster, lat, lon, out) {
  if (!raster || !raster.tiles || Math.abs(lat) >= MERCATOR_LIMIT) return false
  var z = raster.z
  var tile = raster.tiles[tileKey(z, tileX(lon, z), Math.floor(mercatorY(lat, z)))]
  if (!tile) return false
  var b = tile.box, size = tile.size
  var fx = (wrapLon(lon) - b.west) / (b.east - b.west) * size
  if (fx < 0) fx += 360 / (b.east - b.west) * size
  var col = Math.max(0, Math.min(size - 1, Math.floor(fx)))
  var row = Math.max(0, Math.min(size - 1, Math.floor((b.north - lat) / (b.north - b.south) * size)))
  var o = (row * size + col) * 4
  out[0] = tile.rgba[o]; out[1] = tile.rgba[o + 1]; out[2] = tile.rgba[o + 2]; out[3] = tile.rgba[o + 3]
  return true
}
