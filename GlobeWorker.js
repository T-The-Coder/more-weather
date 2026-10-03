// The globe's data off the shell's thread (WorkerScript): Open-Meteo's
// answers for the global batches, the tiles, the wind heights and the sea
// (Marine) become the compact form (GlobeGrid.compactFromResponse,
// GlobeLayers.compactFromMarine), are kept here, and come back as lattices
// for the wash and as overlays (GlobeLayers.layersFor). Messages:
//   { fn: "ingest", key, kind, text, points, at, variables } → { fn, key, ok, compact (text, for the cache) }
//   { fn: "restore", key, text }                  → { fn, key, ok, at }
//   { fn: "forget", keys }                        → nothing
//   { fn: "lattice", token, name, ms, box, level, cols, rows, height }
//       → { fn, token, lattice } (the global one when box is null)
//   { fn: "layers", token, ms, box, level, height, isobars, storms, streaks }
//       → { fn, token, layers }
//
// Qt.include puts every file's functions into this one scope. Same-named
// helpers either match (known, latOf, normalizeLon, valueAt, ringCols) or
// differ harmlessly: lonOf (GlobeSymbols') wraps past 180°, which the
// isobars' longitudes do not reach; coordinate (GlobeGrid's, included
// last) only shapes request URLs, which this worker does not build.
Qt.include("GlobeIsolines.js")
Qt.include("GlobeSymbols.js")
Qt.include("GlobeStreaks.js")
Qt.include("GlobeMarine.js")
Qt.include("GlobeGrid.js")
Qt.include("GlobeLayers.js")

var store = newStore()

WorkerScript.onMessage = function(message) {
  try {
    if (message.fn === "ingest") {
      var compact = message.kind === "marine"
        ? compactFromMarine(message.text, message.points, message.key, message.at)
        : compactFromResponse(message.text, message.points, message.kind, message.key, message.at,
          message.variables && message.variables.length ? message.variables : null)
      var ok = keep(store, compact)
      WorkerScript.sendMessage({ fn: "ingest", key: message.key, ok: ok, compact: ok ? JSON.stringify(compact) : "" })
    } else if (message.fn === "restore") {
      var restored = JSON.parse(String(message.text))
      var fine = restored && restored.v === 1 && restored.key === message.key && keep(store, restored)
      WorkerScript.sendMessage({ fn: "restore", key: message.key, ok: !!fine, at: fine ? restored.at : 0 })
    } else if (message.fn === "forget") {
      forget(store, message.keys)
    } else if (message.fn === "lattice") {
      var lattice = message.box
        ? boxFor(store, message.name, message.ms, message.box, message.level, message.height || "")
        : globalFor(store, message.name, message.ms)
      WorkerScript.sendMessage({ fn: "lattice", token: message.token, lattice: lattice })
    } else if (message.fn === "layers") {
      WorkerScript.sendMessage({ fn: "layers", token: message.token, layers: layersFor(store, message) })
    }
  } catch (e) {
    WorkerScript.sendMessage({ fn: message.fn, key: message.key, token: message.token, ok: false, error: String(e) })
  }
}
