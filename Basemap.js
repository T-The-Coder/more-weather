.pragma library

// Reader for data/basemap.bin (written by tools/build-basemap.py, which
// describes the format). The file is read once per engine and kept here, as
// are the cells decoded from it, so the radar and wind maps and every
// redraw share them. A cell decodes to the same shape the renderer walks:
// { land: [feature: [ring: Int32Array]], ..., rivers: [line: Int32Array],
//   places: [{ name, latitude, longitude, place, population }] }.

var LAYER_ORDER = ["land", "lakes", "urban", "rivers", "admin1", "admin0"]
var POLYGON_LAYERS = { land: true, lakes: true, urban: true }

var bytes = null
var cellDegrees = 5
// "row_col" → { offset, length } within the cell data.
var index = null
var dataStart = 0
var decoded = {}

function loaded() {
  return index !== null
}

// Takes the file's ArrayBuffer; answers false for anything unreadable.
function load(buffer) {
  try {
    var view = new Uint8Array(buffer)
    if (view.length < 8 || String.fromCharCode(view[0], view[1], view[2], view[3]) !== "MWBM" || view[4] !== 2)
      return false
    cellDegrees = view[5]
    var count = view[6] | (view[7] << 8)
    var table = {}
    var at = 8
    for (var i = 0; i < count; ++i) {
      var offset = (view[at + 2] | (view[at + 3] << 8) | (view[at + 4] << 16)) + view[at + 5] * 16777216
      var length = (view[at + 6] | (view[at + 7] << 8) | (view[at + 8] << 16)) + view[at + 9] * 16777216
      table[view[at] + "_" + view[at + 1]] = { offset: offset, length: length }
      at += 10
    }
    bytes = view
    dataStart = at
    index = table
    decoded = {}
    return true
  } catch (e) {
    return false
  }
}

// The cell's layers, or null for a cell with nothing (open sea) or before
// the file is loaded.
function cell(key) {
  if (!index) return null
  if (decoded[key] !== undefined) return decoded[key]
  var entry = index[key]
  var parts = key.split("_")
  var result = entry ? decodeCell(dataStart + entry.offset, dataStart + entry.offset + entry.length,
    Number(parts[0]) * cellDegrees - 90, Number(parts[1]) * cellDegrees - 180) : null
  decoded[key] = result
  return result
}

// Natural Earth's places within an extent in degrees (west may exceed east
// across the date line only as far as the map's own extent does).
function placesIn(west, east, south, north) {
  var list = []
  if (!index) return list
  var firstRow = Math.max(0, Math.floor((south + 90) / cellDegrees))
  var lastRow = Math.min(180 / cellDegrees - 1, Math.floor((north + 90) / cellDegrees))
  var firstCol = Math.floor((west + 180) / cellDegrees)
  var lastCol = Math.floor((east + 180) / cellDegrees)
  var columns = 360 / cellDegrees
  for (var row = firstRow; row <= lastRow; ++row) {
    for (var col = firstCol; col <= lastCol; ++col) {
      var data = cell(row + "_" + (((col % columns) + columns) % columns))
      var places = data && data.places ? data.places : []
      // A column beyond the date line sits a world further along.
      var shift = Math.floor(col / columns) * 360
      for (var p = 0; p < places.length; ++p) {
        var place = places[p]
        var lon = place.longitude + shift
        if (place.latitude < south || place.latitude > north || lon < west || lon > east) continue
        list.push({ name: place.name, latitude: place.latitude, longitude: lon,
          place: place.place, population: place.population, source: "naturalearth" })
      }
    }
  }
  return list
}

function decodeCell(start, end, south, west) {
  var at = start
  function varint() {
    var value = 0
    var shift = 0
    while (at < end) {
      var byte = bytes[at++]
      value += (byte & 0x7F) * Math.pow(2, shift)
      if ((byte & 0x80) === 0) return value
      shift += 7
    }
    throw new Error("basemap: cell runs past its end")
  }
  function signed() {
    var value = varint()
    return value % 2 === 0 ? value / 2 : -(value + 1) / 2
  }
  function utf8(length) {
    var stop = at + length
    if (stop > end) throw new Error("basemap: name runs past its cell")
    var text = ""
    while (at < stop) {
      var byte = bytes[at++]
      var code
      if (byte < 0x80) code = byte
      else if (byte < 0xE0) code = ((byte & 0x1F) << 6) | (bytes[at++] & 0x3F)
      else if (byte < 0xF0) code = ((byte & 0x0F) << 12) | ((bytes[at++] & 0x3F) << 6) | (bytes[at++] & 0x3F)
      else code = ((byte & 0x07) << 18) | ((bytes[at++] & 0x3F) << 12) | ((bytes[at++] & 0x3F) << 6) | (bytes[at++] & 0x3F)
      text += String.fromCodePoint(code)
    }
    return text
  }
  function pointList() {
    var count = varint()
    var list = new Int32Array(count * 2)
    for (var i = 0; i < count * 2; ++i) list[i] = signed()
    return list
  }
  try {
    var layers = {}
    for (var l = 0; l < LAYER_ORDER.length; ++l) {
      var name = LAYER_ORDER[l]
      var features = []
      var featureCount = varint()
      for (var f = 0; f < featureCount; ++f) {
        if (POLYGON_LAYERS[name]) {
          var rings = []
          var ringCount = varint()
          for (var r = 0; r < ringCount; ++r) rings.push(pointList())
          features.push(rings)
        } else {
          features.push(pointList())
        }
      }
      if (features.length) layers[name] = features
    }
    var places = []
    var placeCount = varint()
    for (var p = 0; p < placeCount; ++p) {
      var x = signed()
      var y = signed()
      var population = varint()
      var kind = bytes[at++]
      var name = utf8(varint())
      places.push({ name: name, latitude: south + y / 1000, longitude: west + x / 1000,
        place: kind === 1 ? "city" : "town", population: population })
    }
    if (places.length) layers.places = places
    return layers
  } catch (e) {
    return null
  }
}
