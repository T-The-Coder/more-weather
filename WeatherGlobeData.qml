import QtQuick
import Quickshell
import Quickshell.Io
import "GlobeGrid.js" as GlobeGrid
import "GlobeView.js" as GlobeView
import "GlobeFields.js" as GlobeFields
import "GlobeMarine.js" as GlobeMarine
import "GlobeTimeline.js" as GlobeTimeline

// The weather on the globe: Open-Meteo's model at the global points (seven
// batches, one every ten seconds) and, close up, at the tiles in view (after
// the view has rested 600 ms, two at a time), kept as compact files under
// ~/.cache/more-weather/globe/ so the bar and the app share them, parsed and
// turned into lattices and overlays by GlobeWorker.js. A wind height other
// than 10 m adds a request of two variables per batch and tile ("@<level>"
// keys) while the wind layer or the streaks show it; the sea's temperature
// comes from Open-Meteo Marine for the global points at sea ("S9:<i>", a
// day). Loads only while the globe is shown with a colour wash or an
// overlay on, never while Open-Meteo is rate limited, and
// within a daily budget of point-calls counted in the shared live file
// (GlobeGrid.budgetState: from 2,000 only what the user causes, from 3,000
// nothing). MORE_PLUGINS_OFFLINE reads the files only.
QtObject {
  id: loader
  required property var panel

  readonly property var globe: panel.globeItem
  // The colour layers on, in the wash's order (WeatherGlobeWash).
  readonly property var washLayers: GlobeFields.LAYERS.filter(function(kind) {
    if (kind === "wind") return loader.windOn && loader.windMode !== "lines"
    return loader.panel.displaySetting(GlobeFields.SWITCH[kind], kind === "temperature") === true
  })
  readonly property string washKey: washLayers.join(",")
  readonly property bool washOn: washLayers.length > 0
  readonly property string height: String(panel.displaySetting("globeWindLevel", "10m"))
  // The wind: one layer with a mode, lines (the streaks), colour or both.
  readonly property bool windOn: panel.displaySetting("globeWind", false) === true
  readonly property string windMode: String(panel.displaySetting("globeWindMode", "lines"))
  readonly property bool streaksOn: windOn && windMode !== "colour"
  readonly property bool isobarsOn: panel.displaySetting("globeIsobars", false) === true
  readonly property bool stormsOn: panel.displaySetting("globeStorms", true) === true
  readonly property bool active: !!globe && panel.globeShown && (washOn || streaksOn || isobarsOn || stormsOn)
  // A height's own requests, and the sea's, only while something shows them.
  readonly property bool needsHeight: height !== "10m" && (washLayers.indexOf("wind") >= 0 || streaksOn)
  readonly property bool needsMarine: washLayers.indexOf("sst") >= 0
  readonly property bool offline: Quickshell.env("MORE_PLUGINS_OFFLINE") === "1"
  readonly property string dir: (Quickshell.env("XDG_CACHE_HOME") || (Quickshell.env("HOME") + "/.cache")) + "/more-weather/globe"

  // What the colour layers show, per layer { global, region }: the whole
  // earth, and close up the region in view.
  property var lattices: ({})
  // Land (1) and sea (0) every 2.5°, made by the worker once the sea's and
  // the air's temperature show together.
  property var landMask: null
  property bool landMaskAsked: false
  // The overlays (GlobeLayers.layersFor): isobars, centres, storms,
  // thunderstorms, u and v.
  property var layers: null
  // The global points at sea (GlobeMarine.oceanPoints), once the land is read.
  readonly property var oceanPoints: globe && globe.landData
    ? GlobeMarine.oceanPoints(GlobeGrid.globalPoints().filter(function(p) { return Math.abs(p.lat) <= GlobeGrid.MARINE_MAX_LAT }),
      globe.landData)
    : []
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

  // ---- The timeline (WeatherGlobeTimeline.qml): the whole earth now …
  //      +120 h in 3-hour steps, close up now … +48 h hourly
  //      (GlobeTimeline.js). One time, displayMs, drives the wash, the
  //      overlays, the sky and my places' markers; a chosen time stays
  //      when the zoom changes the steps (the nearest one is shown).
  readonly property string range: globe && globe.zoom >= 2 ? "regional" : "global"
  readonly property double nowMs: panel.relativeTimeNowMs
  readonly property var steps: GlobeTimeline.steps(nowMs, range)
  readonly property int nowIndex: GlobeTimeline.atNow(steps, nowMs)
  // The chosen step's time, or -1 for now.
  property double pinnedMs: -1
  readonly property bool scrubbed: pinnedMs >= 0
  readonly property int stepIndex: scrubbed ? GlobeTimeline.nearestIndex(steps, pinnedMs) : nowIndex
  readonly property double displayMs: scrubbed && stepIndex >= 0 ? steps[stepIndex] : nowMs
  readonly property double displayHour: Math.round(displayMs / 3600000)
  property bool playing: false
  onDisplayHourChanged: { stepStartedMs = Date.now(); stepReady = false; requestLattices() }
  // Whether the shown step's data has come: playback waits for it, so a
  // busy worker slows the play rather than showing an old picture.
  property bool stepReady: true
  // What a step costs (the screenshot harness reads it): the shell's time
  // in the worker's answers, and how long after the step the wash's
  // lattice came.
  property double stepStartedMs: 0
  property var messageStats: ({ count: 0, total: 0, max: 0, latency: 0, latencyMax: 0, steps: 0 })

  function showStep(index) {
    var i = GlobeTimeline.clampIndex(index, steps)
    if (i < 0) return
    pinnedMs = i === nowIndex ? -1 : steps[i]
  }
  function stepBy(delta) {
    playing = false
    showStep(stepIndex + (delta < 0 ? -1 : 1))
  }
  function backToNow() {
    playing = false
    pinnedMs = -1
  }
  // Play from where it stands; at the end it stops, and the next play
  // starts from now again.
  function togglePlay() {
    if (playing) { playing = false; return }
    if (stepIndex >= steps.length - 1) pinnedMs = -1
    playing = true
  }
  property Timer playTimer: Timer {
    interval: GlobeTimeline.playbackDelay(loader.range)
    repeat: true
    running: loader.playing && loader.active && loader.panel.motionAllowed
    onTriggered: {
      if (!loader.stepReady) return
      var next = GlobeTimeline.advance(loader.stepIndex, loader.steps, 1, false)
      if (next === loader.stepIndex) { loader.playing = false; return }
      loader.showStep(next)
    }
  }

  onActiveChanged: if (active) { scheduleGlobal(); viewRested() }
  onWashKeyChanged: { scheduleGlobal(); viewRested() }
  onHeightChanged: { scheduleGlobal(); viewRested() }
  onStreaksOnChanged: { scheduleGlobal(); requestLattices() }
  onIsobarsOnChanged: requestLattices()
  onStormsOnChanged: requestLattices()

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
    return globe.projection().box()
  }
  function viewRested() {
    if (!active || !globe || globe.dragging) return
    if (globe.zoom >= 2) {
      var keys = GlobeGrid.tilesFor(viewBox(), globe.zoom).slice(0, 24)
      if (needsHeight) keys = keys.concat(keys.map(function(key) { return GlobeGrid.withLevel(key, loader.height) }))
      wantedTiles = keys
      for (var i = 0; i < keys.length; i++) needTile(keys[i])
      pumpTiles()
    } else {
      wantedTiles = []
    }
    requestLattices()
  }

  // ---- Freshness and the budget.
  // Keys whose last request failed: { count, until } (GlobeGrid.retryAfterMs).
  property var failures: ({})
  function waiting(key) {
    var f = failures[key]
    return !!f && Date.now() < f.until
  }
  function fresh(key) {
    if (waiting(key)) return true
    var at = loaded[key]
    return !!at && Date.now() - at < GlobeGrid.ttlOf(key)
  }
  function mayRequest(points, userCaused) {
    if (offline || !panel.openMeteoAvailable()) return false
    return GlobeGrid.mayLoad(callsToday + points, userCaused)
  }
  function countCalls(points) {
    localCalls = GlobeGrid.countedCalls(localCalls, points, Date.now())
    panel.sharedLive.addGlobeCalls(points)
  }

  // ---- The global batches, one every ten seconds: the base data, the
  //      chosen height's wind, the sea.
  property int nextBatch: 0
  function globalJobs() {
    var jobs = []
    for (var k = 0; k < GlobeGrid.BATCHES; k++) {
      var points = GlobeGrid.batchPoints(k)
      jobs.push({ key: GlobeGrid.batchKey(k), points: points, kind: "global", variables: null })
      if (needsHeight)
        jobs.push({ key: GlobeGrid.batchKey(k, height), points: points, kind: "global", variables: GlobeGrid.levelVariables(height) })
    }
    if (needsMarine) {
      var sea = oceanPoints
      for (var i = 0; i * GlobeGrid.MARINE_CHUNK < sea.length; i++)
        jobs.push({ key: "S9:" + i, points: sea.slice(i * GlobeGrid.MARINE_CHUNK, (i + 1) * GlobeGrid.MARINE_CHUNK), kind: "marine", variables: null })
    }
    return jobs
  }
  onNeedsMarineChanged: scheduleGlobal()
  onOceanPointsChanged: scheduleGlobal()
  function scheduleGlobal() {
    if (!active) return
    var jobs = globalJobs()
    for (var k = 0; k < jobs.length; k++) if (!diskTried[jobs[k].key]) readCache(jobs[k].key)
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
      var jobs = loader.globalJobs()
      for (var step = 0; step < jobs.length; step++) {
        var k = (loader.nextBatch + step) % jobs.length
        var job = jobs[k]
        if (loader.fresh(job.key) || !loader.diskTried[job.key] || loader.panel.sharedLive.globeClaimedByOther(job.key)) continue
        // Nothing yet is the user's opening; renewing stale data is automatic.
        if (!loader.mayRequest(job.points.length, !loader.loaded[job.key])) continue
        if (loader.globalRequest.running) return
        loader.nextBatch = (k + 1) % jobs.length
        loader.startRequest(loader.globalRequest, job.key, job.points, job.kind, job.variables)
        return
      }
      // All fresh: look again in a while.
      if (jobs.every(function(job) { return loader.fresh(job.key) })) interval = 5 * 60 * 1000
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
        var level = GlobeGrid.keyLevel(key)
        startRequest(requests[r], key, points, "tile", level ? GlobeGrid.levelVariables(level) : null)
        break
      }
    }
  }

  function startRequest(request, key, points, kind, variables) {
    request.key = key
    request.points = points
    request.kind = kind
    request.variables = variables || []
    if (kind === "marine") {
      var marine = GlobeMarine.request(points)
      request.request = { url: marine.url, maxBytes: marine.maxBytes, timeoutMs: 20000 }
    } else {
      request.request = GlobeGrid.forecastRequest(points, kind, variables)
    }
    countCalls(points.length)
    panel.sharedLive.claimGlobe([key])
    request.running = true
  }
  function finished(request, text) {
    var next = Object.assign({}, failures)
    if (text === "") {
      var count = (failures[request.key] ? failures[request.key].count : 0) + 1
      next[request.key] = { count: count, until: Date.now() + GlobeGrid.retryAfterMs(count) }
      failures = next
      panel.noteOpenMeteoResponse(request)
      console.warn("more-weather: globe data request failed:", request.key, request.status || "")
      // The key is tried again after a while (global) or with a later view
      // (tiles).
      return
    }
    if (next[request.key]) {
      delete next[request.key]
      failures = next
    }
    post({ fn: "ingest", key: request.key, kind: request.kind, text: text,
      points: request.points, variables: request.variables, at: Date.now() })
  }
  property WeatherRequest globalRequest: WeatherRequest {
    property string key: ""
    property var points: []
    property string kind: ""
    property var variables: []
    onFinished: function(text) { loader.finished(loader.globalRequest, text) }
  }
  property WeatherRequest tileRequestA: WeatherRequest {
    property string key: ""
    property var points: []
    property string kind: ""
    property var variables: []
    onFinished: function(text) { loader.finished(loader.tileRequestA, text); loader.panel.defer(loader.pumpTiles) }
  }
  property WeatherRequest tileRequestB: WeatherRequest {
    property string key: ""
    property var points: []
    property string kind: ""
    property var variables: []
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
  // The close-up box the worker reads, half a view wider on each side so a
  // drag finds colour.
  function paddedBox() {
    var box = viewBox()
    var lonPad = (box.east - box.west) / 2, latPad = (box.north - box.south) / 2
    return { south: Math.max(-90, box.south - latPad), north: Math.min(90, box.north + latPad),
      west: box.west - lonPad, east: box.east + lonPad }
  }
  function requestLattices() {
    if (!active) return
    latticeToken++
    var closeUp = globe && globe.zoom >= 2
    var box = closeUp ? paddedBox() : null
    var tag = height !== "10m" ? height : ""
    var kept = {}
    for (var k = 0; k < washLayers.length; k++) {
      var kind = washLayers[k]
      var name = GlobeFields.variableFor(kind, height)
      post({ fn: "lattice", token: "g" + latticeToken + ":" + kind, name: name, ms: loader.displayMs, box: null })
      // The sea's temperature has no tiles: the global lattice serves.
      if (closeUp && kind !== "sst")
        post({ fn: "lattice", token: "r" + latticeToken + ":" + kind, name: name, ms: loader.displayMs, box: box,
          level: globe.zoom, cols: 72, rows: 72, height: kind === "wind" ? tag : "" })
      // What is shown stays until the new answers come.
      if (lattices[kind]) kept[kind] = { global: lattices[kind].global, region: closeUp ? lattices[kind].region : null }
    }
    lattices = kept
    if (needsMarine && washLayers.indexOf("temperature") >= 0 && !landMaskAsked && globe && globe.landData) {
      landMaskAsked = true
      post({ fn: "landmask", land: globe.landData })
    }
    if (streaksOn || isobarsOn || stormsOn) {
      post({ fn: "layers", token: "l" + latticeToken, ms: loader.displayMs, box: box, level: closeUp ? globe.zoom : 0,
        height: height, isobars: isobarsOn, storms: stormsOn, streaks: streaksOn })
    } else {
      layers = null
    }
    // While playing, the worker gets the next step ready as well, quietly:
    // it keeps the result and sends nothing back.
    if (playing && stepIndex + 1 < steps.length) {
      var ahead = steps[stepIndex + 1]
      for (var a = 0; a < washLayers.length; a++) {
        var aheadKind = washLayers[a]
        var aheadName = GlobeFields.variableFor(aheadKind, height)
        post({ fn: "lattice", token: "pg", quiet: true, name: aheadName, ms: ahead, box: null })
        if (closeUp && aheadKind !== "sst")
          post({ fn: "lattice", token: "pr", quiet: true, name: aheadName, ms: ahead, box: box, level: globe.zoom, cols: 72, rows: 72,
            height: aheadKind === "wind" ? tag : "" })
      }
      if (streaksOn || isobarsOn || stormsOn)
        post({ fn: "layers", token: "pl", quiet: true, ms: ahead, box: box, level: closeUp ? globe.zoom : 0,
          height: height, isobars: isobarsOn, storms: stormsOn, streaks: streaksOn })
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
      var started = Date.now()
      loader.handle(message)
      var spent = Date.now() - started
      var st = loader.messageStats
      if (message.fn === "lattice" || message.fn === "layers")
        loader.messageStats = { count: st.count + 1, total: st.total + spent, max: Math.max(st.max, spent),
          latency: st.latency, latencyMax: st.latencyMax, steps: st.steps }
    }
  } }
  function handle(message) {
      if (message.error) console.warn("more-weather: globe worker:", message.fn, message.error)
      if (message.fn === "ingest" || message.fn === "restore") {
        // An answer that would not parse waits like a failed request.
        if (message.fn === "ingest" && !message.ok && message.key) {
          var failed = Object.assign({}, loader.failures)
          var count = (failed[message.key] ? failed[message.key].count : 0) + 1
          failed[message.key] = { count: count, until: Date.now() + GlobeGrid.retryAfterMs(count) }
          loader.failures = failed
          console.warn("more-weather: globe data unreadable:", message.key)
        }
        if (message.ok) {
          var next = Object.assign({}, loader.loaded)
          next[message.key] = message.fn === "ingest" ? Date.now() : Number(message.at)
          loader.loaded = next
          loader.dataAt = Math.max(loader.dataAt, next[message.key])
          if (message.fn === "ingest") loader.writeCache(message.key, message.compact)
          loader.latticeTimer.restart()
        }
        if (message.fn === "restore") loader.afterDisk(message.key)
      } else if (message.fn === "layers" && message.layers) {
        // The answer for the time shown, whichever request asked for it.
        if (Math.round(Number(message.ms) / 3600000) !== loader.displayHour) return
        if (!loader.washOn) loader.stepReady = true
        var got = message.layers
        ;[got.u, got.v].forEach(function(l) {
          if (!l) return
          for (var n = 0; n < l.values.length; n++) if (l.values[n] === null || l.values[n] === undefined) l.values[n] = NaN
        })
        loader.layers = got
      } else if (message.fn === "landmask" && message.lattice) {
        loader.landMask = message.lattice
      } else if (message.fn === "lattice" && message.lattice) {
        // "g12:temperature": global or region, request number, layer.
        var token = String(message.token)
        var colon = token.indexOf(":")
        if (colon < 0 || Math.round(Number(message.ms) / 3600000) !== loader.displayHour) return
        var kind = token.slice(colon + 1)
        if (loader.washLayers.indexOf(kind) < 0) return
        // Unknown nodes may arrive as null: NaN, so they colour nothing.
        var values = message.lattice.values
        for (var i = 0; i < values.length; i++) if (values[i] === null || values[i] === undefined) values[i] = NaN
        var next = Object.assign({}, loader.lattices)
        var pair = next[kind] ? { global: next[kind].global, region: next[kind].region } : { global: null, region: null }
        if (token.charAt(0) === "g") {
          pair.global = message.lattice
          loader.stepReady = true
          if (loader.stepStartedMs > 0) {
            var late = Date.now() - loader.stepStartedMs
            var ms = loader.messageStats
            loader.messageStats = { count: ms.count, total: ms.total, max: ms.max, latency: ms.latency + late,
              latencyMax: Math.max(ms.latencyMax, late), steps: ms.steps + 1 }
            loader.stepStartedMs = 0
          }
        } else {
          pair.region = message.lattice
        }
        next[kind] = pair
        loader.lattices = next
      }
  }
  // Several answers in a row ask for one new lattice.
  property Timer latticeTimer: Timer {
    interval: 200
    onTriggered: loader.requestLattices()
  }
}
