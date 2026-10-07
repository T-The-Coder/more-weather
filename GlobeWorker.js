// The globe's data off the shell's thread (WorkerScript): Open-Meteo's
// answers for the global batches, the tiles, the wind heights and the sea
// (Marine) become the compact form (GlobeGrid.compactFromResponse,
// GlobeLayers.compactFromMarine), are kept here, and come back as lattices
// for the wash and as overlays (GlobeLayers.layersFor). Messages:
//   { fn: "ingest", key, kind, text, points, at, variables } → { fn, key, ok, compact (text, for the cache) }
//   { fn: "restore", key, text }                  → { fn, key, ok, at }
//   { fn: "forget", keys }                        → nothing
//   { fn: "lattice", token, name, ms, box, level, cols, rows, height }
//       → { fn, token, ms, lattice } (the global one when box is null)
//   { fn: "layers", token, ms, box, level, height, isobars, storms, streaks }
//       → { fn, token, ms, layers }
//   { fn: "wet", keys, ms } → { fn, wet: { key: bool } } (the dense rain
//       cells that may see rain, GlobeGrid.rainCellWet)
//   { fn: "landmask", land } (data/globe-land.json) → { fn, lattice } (1 land, 0 sea)
// With `quiet` (the timeline's look-ahead) lattice and layers are made and
// kept, not sent.
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
      if (!message.quiet) WorkerScript.sendMessage({ fn: "lattice", token: message.token, ms: message.ms, lattice: lattice })
    } else if (message.fn === "wet") {
      // Which dense rain cells may see rain (GlobeGrid.rainCellWet).
      var list = []
      for (var key in store.batches) list.push(store.batches[key])
      var wet = {}
      for (var w = 0; w < message.keys.length; w++) wet[message.keys[w]] = rainCellWet(list, message.keys[w], message.ms)
      WorkerScript.sendMessage({ fn: "wet", wet: wet })
    } else if (message.fn === "landmask") {
      // Land (1) and sea (0) at the global lattice's nodes (GlobeMarine).
      var mask = []
      for (var row = 0; row < 73; row++)
        for (var col = 0; col < 145; col++)
          mask.push(isOcean(message.land, -90 + row * 2.5, -180 + col * 2.5) ? 0 : 1)
      WorkerScript.sendMessage({ fn: "landmask", lattice: { south: -90, north: 90, west: -180, east: 180, cols: 145, rows: 73,
        values: mask, wrap: true } })
    } else if (message.fn === "layers") {
      var layers = layersFor(store, message)
      if (!message.quiet) WorkerScript.sendMessage({ fn: "layers", token: message.token, ms: message.ms, layers: layers })
    }
  } catch (e) {
    WorkerScript.sendMessage({ fn: message.fn, key: message.key, token: message.token, ok: false, error: String(e) })
  }
}
