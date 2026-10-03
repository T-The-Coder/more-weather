import QtQuick
import Quickshell
import Quickshell.Io
import "GlobeGrid.js" as GlobeGrid
import "GlobeView.js" as GlobeView

// The weather on the globe: Open-Meteo's model at the global points (seven
// batches, one every ten seconds) and, close up, at the tiles in view (after
// the view has rested 600 ms, two at a time), kept as compact files under
// ~/.cache/more-weather/globe/ so the bar and the app share them, parsed and
// turned into lattices by GlobeWorker.js. Loads only while the globe is
// shown with a colour wash on, never while Open-Meteo is rate limited, and
// within a daily budget of point-calls counted in the shared live file
// (GlobeGrid.budgetState: from 2,000 only what the user causes, from 3,000
// nothing). MORE_PLUGINS_OFFLINE reads the files only.
QtObject {
  id: loader
  required property var panel

  readonly property var globe: panel.globeItem
  readonly property string wash: String(panel.displaySetting("globeWash", "temperature"))
  readonly property bool active: !!globe && wash !== "none" && panel.globeShown
  readonly property bool offline: Quickshell.env("MORE_PLUGINS_OFFLINE") === "1"
  readonly property string dir: (Quickshell.env("XDG_CACHE_HOME") || (Quickshell.env("HOME") + "/.cache")) + "/more-weather/globe"

  // What the wash shows: the whole earth, and close up the region in view.
  property var globalLattice: null
  property var regionLattice: null
  // Newest data in use (ms), and whether the budget holds new loads back.
  property double dataAt: 0
  readonly property int callsToday: {
    var calls = panel.sharedLiveData && panel.sharedLiveData.globeCalls
    var local = localCalls
    var shared = calls && calls.utcDay === GlobeGrid.utcDay(panel.relativeTimeNowMs) ? Number(calls.count) || 0 : 0
    return Math.max(shared, local.utcDay === GlobeGrid.utcDay(panel.relativeTimeNowMs) ? local.count : 0)
  }
  property var localCalls: ({ utcDay: "", count: 0 })
  readonly property bool limitHeld: GlobeGrid.budgetState(callsToday) !== "ok"
  readonly property bool gridLoaded: Object.keys(loaded).some(function(key) { return key.indexOf("G9:") === 0 })

  // key → time of its data (ms) for what the worker holds; files tried.
  property var loaded: ({})
  property var diskTried: ({})
  property var tileOrder: []
  property var tileQueue: []
  property var wantedTiles: []
  property int latticeToken: 0
  property double hourMs: Math.floor(panel.relativeTimeNowMs / 3600000) * 3600000

  onActiveChanged: if (active) { scheduleGlobal(); viewRested() }
  onWashChanged: requestLattices()
  onHourMsChanged: requestLattices()

  // ---- The view: a move waits for 600 ms of rest.
  property Connections viewWatch: Connections {
    target: loader.globe
    ignoreUnknownSignals: true
    function onZoomChanged() { loader.restTimer.restart() }
    function onCenterLatChanged() { loader.restTimer.restart() }
    function onCenterLonChanged() { loader.restTimer.restart() }
    function onDraggingChanged() { loader.restTimer.restart() }
  }
  property Timer restTimer: Timer {
    interval: 600
    onTriggered: loader.viewRested()
  }
  function viewBox() {
    if (!globe) return null
    return GlobeView.visibleBounds(globe.centerLat, GlobeGrid.wrapLon(globe.centerLon), globe.radius, globe.width, globe.height)
  }
  function viewRested() {
    if (!active || !globe || globe.dragging) return
    if (globe.zoom >= 2) {
      var keys = GlobeGrid.tilesFor(viewBox(), globe.zoom).slice(0, 24)
      wantedTiles = keys
      for (var i = 0; i < keys.length; i++) needTile(keys[i])
      pumpTiles()
    } else {
      wantedTiles = []
    }
    requestLattices()
  }

  // ---- Freshness and the budget.
  function fresh(key) {
    var at = loaded[key]
    var ttl = key.indexOf("G9:") === 0 ? GlobeGrid.GLOBAL_TTL_MS : GlobeGrid.TILE_TTL_MS
    return !!at && Date.now() - at < ttl
  }
  function mayRequest(points, userCaused) {
    if (offline || !panel.openMeteoAvailable()) return false
    return GlobeGrid.mayLoad(callsToday + points, userCaused)
  }
  function countCalls(points) {
    localCalls = GlobeGrid.countedCalls(localCalls, points, Date.now())
    panel.sharedLive.addGlobeCalls(points)
  }

  // ---- The global batches, one every ten seconds.
  property int nextBatch: 0
  function scheduleGlobal() {
    if (!active) return
    for (var k = 0; k < GlobeGrid.BATCHES; k++) {
      var key = GlobeGrid.batchKey(k)
      if (!diskTried[key]) readCache(key)
    }
    globalTimer.interval = 10000
    if (!globalTimer.running) globalTimer.start()
  }
  property Timer globalTimer: Timer {
    interval: 10000
    repeat: true
    triggeredOnStart: true
    running: false
    onTriggered: {
      if (!loader.active) { stop(); return }
      for (var step = 0; step < GlobeGrid.BATCHES; step++) {
        var k = (loader.nextBatch + step) % GlobeGrid.BATCHES
        var key = GlobeGrid.batchKey(k)
        if (loader.fresh(key) || !loader.diskTried[key] || loader.panel.sharedLive.globeClaimedByOther(key)) continue
        var points = GlobeGrid.batchPoints(k)
        // Nothing yet is the user's opening; renewing stale data is automatic.
        if (!loader.mayRequest(points.length, !loader.loaded[key])) continue
        if (loader.globalRequest.running) return
        loader.nextBatch = (k + 1) % GlobeGrid.BATCHES
        loader.startRequest(loader.globalRequest, key, points, "global")
        return
      }
      // All fresh: look again in a while.
      if (Object.keys(loader.loaded).filter(function(key) { return key.indexOf("G9:") === 0 }).length === GlobeGrid.BATCHES) {
        interval = 5 * 60 * 1000
      }
    }
  }

  // ---- Tiles, two at a time.
  function needTile(key) {
    var lru = GlobeGrid.touchedLru(tileOrder, key, GlobeGrid.MAX_TILES)
    tileOrder = lru.list
    if (lru.evicted.length) {
      post({ fn: "forget", keys: lru.evicted })
      var next = Object.assign({}, loaded)
      for (var i = 0; i < lru.evicted.length; i++) delete next[lru.evicted[i]]
      loaded = next
    }
    if (fresh(key)) return
    if (!diskTried[key]) { readCache(key); return }
    if (tileQueue.indexOf(key) < 0) tileQueue = tileQueue.concat([key])
  }
  function pumpTiles() {
    var requests = [tileRequestA, tileRequestB]
    for (var r = 0; r < requests.length; r++) {
      if (requests[r].running) continue
      while (tileQueue.length) {
        var key = tileQueue[0]
        tileQueue = tileQueue.slice(1)
        // Only tiles still in view, not loaded meanwhile.
        if (wantedTiles.indexOf(key) < 0 || fresh(key) || panel.sharedLive.globeClaimedByOther(key)) continue
        var points = GlobeGrid.tilePoints(key)
        if (!mayRequest(points.length, true)) { tileQueue = []; return }
        startRequest(requests[r], key, points, "tile")
        break
      }
    }
  }

  function startRequest(request, key, points, kind) {
    request.key = key
    request.points = points
    request.kind = kind
    request.request = GlobeGrid.forecastRequest(points, kind)
    countCalls(points.length)
    panel.sharedLive.claimGlobe([key])
    request.running = true
  }
  function finished(request, text) {
    if (text === "") {
      panel.noteOpenMeteoResponse(request)
      console.warn("more-weather: globe data request failed:", request.key, request.status || "")
      // The key is tried again with the next round (global) or view (tiles).
      return
    }
    post({ fn: "ingest", key: request.key, kind: request.kind, text: text,
      points: request.points, at: Date.now() })
  }
  property WeatherRequest globalRequest: WeatherRequest {
    property string key: ""
    property var points: []
    property string kind: ""
    onFinished: function(text) { loader.finished(loader.globalRequest, text) }
  }
  property WeatherRequest tileRequestA: WeatherRequest {
    property string key: ""
    property var points: []
    property string kind: ""
    onFinished: function(text) { loader.finished(loader.tileRequestA, text); loader.panel.defer(loader.pumpTiles) }
  }
  property WeatherRequest tileRequestB: WeatherRequest {
    property string key: ""
    property var points: []
    property string kind: ""
    onFinished: function(text) { loader.finished(loader.tileRequestB, text); loader.panel.defer(loader.pumpTiles) }
  }

  // ---- The files.
  property Component fileView: Component {
    FileView {
      id: cacheFile
      // Set for reads: the key whose file this is.
      property string key: ""
      printErrors: false
      atomicWrites: true
      onLoaded: if (key !== "") loader.fileRead(cacheFile, true)
      onLoadFailed: if (key !== "") loader.fileRead(cacheFile, false)
    }
  }
  property var writers: []
  function readCache(key) {
    var tried = Object.assign({}, diskTried)
    tried[key] = true
    diskTried = tried
    fileView.createObject(loader, { key: key, path: dir + "/" + key + ".json" })
  }
  function fileRead(file, ok) {
    var key = file.key
    var text = ok ? file.text() : ""
    file.destroy()
    if (text.length > 0 && text.length < 1024 * 1024) post({ fn: "restore", key: key, text: text })
    else afterDisk(key)
  }
  function afterDisk(key) {
    if (key.indexOf("T") === 0) {
      if (wantedTiles.indexOf(key) >= 0 && !fresh(key) && tileQueue.indexOf(key) < 0) tileQueue = tileQueue.concat([key])
      pumpTiles()
    } else if (active && !globalTimer.running) {
      globalTimer.start()
    }
  }
  function writeCache(key, text) {
    // A batch is about 100 KB; anything far larger is not kept.
    if (text.length > 600 * 1024) return
    ensureDir.running = true
    var file = fileView.createObject(loader, { path: dir + "/" + key + ".json" })
    file.setText(text)
    writers = writers.concat([file])
    writerSweep.restart()
  }
  property Timer writerSweep: Timer {
    interval: 3000
    onTriggered: {
      for (var i = 0; i < loader.writers.length; i++) loader.writers[i].destroy()
      loader.writers = []
    }
  }
  property Process ensureDir: Process { command: ["mkdir", "-p", loader.dir] }
  // Files older than the global data's six hours go.
  property Process sweep: Process {
    command: ["find", loader.dir, "-maxdepth", "1", "-type", "f", "-name", "*.json", "-mmin", "+360", "-delete"]
  }
  property Timer sweepTimer: Timer {
    interval: 60 * 60 * 1000
    repeat: true
    running: true
    triggeredOnStart: true
    onTriggered: if (!loader.sweep.running) loader.sweep.running = true
  }

  // ---- The worker.
  function requestLattices() {
    if (!active || wash === "none") return
    var name = { temperature: "temperature_2m", cloud: "cloud_cover", precipitation: "precipitation" }[wash]
    latticeToken++
    post({ fn: "lattice", token: "g" + latticeToken, name: name, ms: Date.now(), box: null })
    if (globe && globe.zoom >= 2) {
      var box = viewBox()
      // Half a view more on each side, so a drag finds colour.
      var lonPad = (box.east - box.west) / 2, latPad = (box.north - box.south) / 2
      box = { south: Math.max(-90, box.south - latPad), north: Math.min(90, box.north + latPad),
        west: box.west - lonPad, east: box.east + lonPad }
      post({ fn: "lattice", token: "r" + latticeToken, name: name, ms: Date.now(), box: box,
        level: globe.zoom, cols: 72, rows: 72 })
    } else {
      regionLattice = null
    }
  }
  // The worker starts with the first message: a panel whose globe stays
  // hidden keeps no thread (and Qt's WorkerScript logs a harmless
  // "QObject::connect(QJSEngine, QtObject): invalid nullptr parameter" as
  // it starts).
  property WorkerScript worker: null
  function post(message) {
    if (!worker) worker = workerComponent.createObject(loader)
    worker.sendMessage(message)
  }
  property Component workerComponent: Component { WorkerScript {
    source: "GlobeWorker.js"
    onMessage: function(message) {
      if (message.error) console.warn("more-weather: globe worker:", message.fn, message.error)
      if (message.fn === "ingest" || message.fn === "restore") {
        if (message.ok) {
          var next = Object.assign({}, loader.loaded)
          next[message.key] = message.fn === "ingest" ? Date.now() : Number(message.at)
          loader.loaded = next
          loader.dataAt = Math.max(loader.dataAt, next[message.key])
          if (message.fn === "ingest") loader.writeCache(message.key, message.compact)
          loader.latticeTimer.restart()
        }
        if (message.fn === "restore") loader.afterDisk(message.key)
      } else if (message.fn === "lattice" && message.lattice) {
        var token = String(message.token)
        if (Number(token.slice(1)) !== loader.latticeToken) return
        // Unknown nodes may arrive as null: NaN, so they colour nothing.
        var values = message.lattice.values
        for (var i = 0; i < values.length; i++) if (values[i] === null || values[i] === undefined) values[i] = NaN
        if (token.charAt(0) === "g") loader.globalLattice = message.lattice
        else loader.regionLattice = message.lattice
      }
    }
  } }
  // Several answers in a row ask for one new lattice.
  property Timer latticeTimer: Timer {
    interval: 200
    onTriggered: loader.requestLattices()
  }
}
