// The globe's data off the shell's thread (WorkerScript): Open-Meteo's
// answers for the global batches and the tiles become the compact form
// (GlobeGrid.compactFromResponse), are kept here, and come back as
// lattices for the wash. Messages:
//   { fn: "ingest", key, kind, text, points, at } → { fn, key, ok, compact (text, for the cache) }
//   { fn: "restore", key, text }                  → { fn, key, ok, at }
//   { fn: "forget", keys }                        → nothing
//   { fn: "lattice", token, name, ms, box, level, cols, rows }
//       → { fn, token, lattice } (the global one when box is null)
Qt.include("GlobeGrid.js")

var batches = {}
var tiles = {}
var globalCache = { key: "", lattice: null }

function keep(compact) {
  if (!compact || !compact.key) return false
  if (String(compact.key).indexOf("G9:") === 0) batches[compact.key] = compact
  else tiles[compact.key] = compact
  globalCache.key = ""
  return true
}

function globalFor(name, ms) {
  var list = []
  for (var k in batches) list.push(batches[k])
  var key = name + "|" + nearestHour(ms) + "|" + Object.keys(batches).map(function(k) { return k + batches[k].at }).join(",")
  if (globalCache.key !== key) globalCache = { key: key, lattice: globalLattice(list, name, ms) }
  return globalCache.lattice
}

function nearestHour(ms) {
  return Math.round(Number(ms) / 3600000)
}

WorkerScript.onMessage = function(message) {
  try {
    if (message.fn === "ingest") {
      var compact = compactFromResponse(message.text, message.points, message.kind, message.key, message.at)
      var ok = keep(compact)
      WorkerScript.sendMessage({ fn: "ingest", key: message.key, ok: ok, compact: ok ? JSON.stringify(compact) : "" })
    } else if (message.fn === "restore") {
      var restored = JSON.parse(String(message.text))
      var fine = restored && restored.v === 1 && restored.key === message.key && keep(restored)
      WorkerScript.sendMessage({ fn: "restore", key: message.key, ok: !!fine, at: fine ? restored.at : 0 })
    } else if (message.fn === "forget") {
      for (var i = 0; i < message.keys.length; i++) delete tiles[message.keys[i]]
    } else if (message.fn === "lattice") {
      var global = globalFor(message.name, message.ms)
      var lattice = message.box
        ? regionLattice(tiles, global, message.name, message.ms, message.box, message.level, message.cols, message.rows)
        : global
      WorkerScript.sendMessage({ fn: "lattice", token: message.token, lattice: lattice })
    }
  } catch (e) {
    WorkerScript.sendMessage({ fn: message.fn, key: message.key, token: message.token, ok: false, error: String(e) })
  }
}
