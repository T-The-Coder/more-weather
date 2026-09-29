.pragma library

// Reader for data/basemap.bin (written by tools/build-basemap.py, which
// describes the format). The file is read once per engine and kept here, as
// are the cells decoded from it, so the radar and wind maps and every
// redraw share them. A cell decodes to the same shape the renderer walks:
// { land: [feature: [ring: Int32Array]], ..., rivers: [line: Int32Array] }.

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
    if (view.length < 8 || String.fromCharCode(view[0], view[1], view[2], view[3]) !== "MWBM" || view[4] !== 1)
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
  var result = entry ? decodeCell(dataStart + entry.offset, dataStart + entry.offset + entry.length) : null
  decoded[key] = result
  return result
}

function decodeCell(start, end) {
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
    return layers
  } catch (e) {
    return null
  }
}
