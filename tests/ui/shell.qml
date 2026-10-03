import QtQuick
import Quickshell
import Quickshell.Io
import "Weather" as Weather

// Screenshot run for tests/ui-shots.sh: the app view with the synthetic
// weather from tests/ui/fixtures/state.py, every section as a tab, every
// settings page, in English, German and Arabic (right to left), the
// widget's view (as in the bar's popup), and last the menu bar with its
// values coloured. Pictures go to $MW_SHOTS; $MW_SHOTS_ONLY (a regular
// expression) keeps only the matching ones.
ShellRoot {
  id: harness
  readonly property string shots: Quickshell.env("MW_SHOTS") || "/tmp"
  readonly property var shotsOnly: Quickshell.env("MW_SHOTS_ONLY") ? new RegExp(Quickshell.env("MW_SHOTS_ONLY")) : null
  property int step: 0
  readonly property var tabs: ["favorites", "airQuality", "hourly", "daily", "rain", "radar", "wind", "globe"]

  function shot(name) { shotOf(panel.contentRoot, name) }
  function shotOf(item, name) {
    if (shotsOnly && !shotsOnly.test(name)) return
    item.grabToImage(function(result) {
      result.saveToFile(harness.shots + "/" + name + ".png")
      console.log("SHOT", name)
    })
  }

  // The colour layers on, the others off.
  // The harness's windows are never active: animations allowed anyway.
  Component.onCompleted: panel.motionForced = true
  function layersOn(list) {
    ;["temperature", "sst", "wind", "cloud", "precipitation"].forEach(function(kind) {
      panel.setGlobeLayer(kind, list.indexOf(kind) >= 0)
    })
  }
  // A shot of the globe with its rim for tests/ui/rim-check.py: the disc's
  // centre and radius in the picture's pixels.
  // Taken with the overlays and my places off for the moment, so only the
  // colour layers meet the rim.
  function rimShot(name) {
    var g = panel.globeItem
    var keys = ["globeStreaks", "globeIsobars", "globeStorms", "globeMarkers"]
    var before = keys.map(function(key) { return panel.displaySetting(key, false) })
    keys.forEach(function(key) { panel.setViewDisplaySetting(key, false) })
    var at = g.mapToItem(panel.contentRoot, g.centerX, g.centerY)
    console.log("RIM", name, Math.round(at.x * 100) / 100, Math.round(at.y * 100) / 100, Math.round(g.radius * 100) / 100)
    rimRestore.keys = keys
    rimRestore.values = before
    g.canvasItem.requestPaint()
    rimShotTimer.name = name
    rimShotTimer.start()
  }
  Timer {
    id: rimShotTimer
    property string name: ""
    interval: 400
    onTriggered: {
      harness.shot(name)
      rimRestore.start()
    }
  }
  Timer {
    id: rimRestore
    property var keys: []
    property var values: []
    interval: 300
    onTriggered: {
      for (var i = 0; i < keys.length; i++) panel.setViewDisplaySetting(keys[i], values[i])
    }
  }
  function check(name, ok) { console.log(ok ? "CHECK ok" : "CHECK FAILED", name) }
  // The globe's view for the measurements and shots.
  function globeView(zoom, lat, lon) {
    var g = panel.globeItem
    g.finishTurn()
    g.rotating = false
    g.zoom = zoom
    g.centerLat = lat
    g.centerLon = lon
  }
  // Steps that measure z0, z2 and z4: still, then moving, three seconds each.
  function globeMeasures(size) {
    var list = []
    ;[0, 2, 4].forEach(function(zoom) {
      ;[false, true].forEach(function(moving) {
        list.push(function() {
          globeView(zoom, 46, 9)
          panel.globeItem.rotating = moving
          panel.globeItem.paintStats = { count: 0, total: 0, max: 0 }
          panel.globeItem.washItem.stats = { count: 0, total: 0, max: 0 }
          panel.globeItem.overlayItem.stats = { count: 0, total: 0, max: 0 }
          panel.globeItem.streaksItem.stats = { count: 0, total: 0, max: 0 }
          globeNudge.start()
        }, function() {}, function() {}, function() {
          globeNudge.stop()
          var st = panel.globeItem.paintStats
          var n = Math.max(1, st.count)
          console.log("GLOBE", size, "px z" + zoom, moving ? "moving" : "still", Math.round(panel.globeItem.radius * 2), "px radius*2:",
            st.count, "frames, mean", (st.total / n).toFixed(1), "ms, max", st.max, "ms; land", (st.land / n).toFixed(1),
            "sky", (st.sky / n).toFixed(1), "places", (st.places / n).toFixed(1))
          var ws = panel.globeItem.washItem.stats
          var os = panel.globeItem.overlayItem.stats
          var ss = panel.globeItem.streaksItem.stats
          var mean = function(x) { return (x.total / Math.max(1, x.count)).toFixed(1) }
          console.log("GLOBE", size, "px z" + zoom, moving ? "moving" : "still", "wash:", ws.count, "frames, mean",
            mean(ws), "ms, max", ws.max, "ms; overlay", os.count, "×", mean(os), "ms; streaks", ss.count, "×", mean(ss),
            "ms; per globe frame", ((st.total + ws.total + os.total + ss.total) / n).toFixed(1), "ms")
          panel.globeItem.rotating = false
        })
      })
    })
    return list
  }
  property double cpuFrom: 0
  function cpuStart() {
    var g = panel.globeItem
    g.paintStats = { count: 0, total: 0, max: 0 }
    g.washItem.stats = { count: 0, total: 0, max: 0 }
    g.overlayItem.stats = { count: 0, total: 0, max: 0 }
    g.streaksItem.stats = { count: 0, total: 0, max: 0 }
    cpuFrom = Date.now()
  }
  function cpuReport(size) {
    var g = panel.globeItem
    var spent = g.paintStats.total + g.washItem.stats.total + g.overlayItem.stats.total + g.streaksItem.stats.total
    var elapsed = Date.now() - cpuFrom
    console.log("GLOBE", size, "px auto-rotation:", g.paintStats.count, "frames in", elapsed, "ms,", spent, "ms painting:",
      Math.round(spent / elapsed * 100) + " % of a core (paints only)")
  }
  // Turns the globe a little every 40 ms while measuring.
  Timer {
    id: globeNudge
    interval: 40
    repeat: true
    onTriggered: panel.globeItem.centerLon += 0.02
  }
  function general(key, value) { panel.displayOptionsStore.setGeneralSetting(key, value) }
  function display(key, value) { panel.displayOptionsStore.setSettingsDisplaySetting(key, value) }
  function press(key, text, modifiers) {
    panel.handlePanelKey({ key: key, text: text || "", modifiers: modifiers || Qt.NoModifier, accepted: false })
  }

  // Forecasts for the favourites and an air quality reading; the panel
  // would fetch them, but this run has no network.
  FileView {
    id: placesFile
    path: Quickshell.env("HOME") + "/fixture-places.json"
  }

  function seedPlaces() {
    var fixture = JSON.parse(placesFile.text())
    var entries = {}
    for (var i = 0; i < fixture.places.length; i++) {
      var place = fixture.places[i]
      var key = "geo:" + place.latitude.toFixed(4) + "," + place.longitude.toFixed(4)
      entries[key] = {
        name: place.name, latitude: place.latitude, longitude: place.longitude, updatedAt: Date.now(),
        snapshot: panel.weatherSnapshotFromReport(place.report, place.name, "open-meteo", null)
      }
    }
    panel.weatherDataCache = { version: 1, lastActiveKey: "", lastAutoKey: "", entries: entries }
    var air = panel.airQuality
    air.report = fixture.airQuality
    air.reportKey = air.placeKey()
    air.fetchedAtMs = Date.now()
    air.loadStatus = "ok"
  }

  readonly property var steps: [
    // The standalone panel waits 2.5 s for a bar instance before it takes
    // the shared (here: fixture) forecast.
    function() {},
    function() {},
    function() { seedPlaces() },
    function() { shot("01-app") },
    // Every section as a tab, so each view shows under the current weather.
    function() {
      display("showFavorites", true)
      display("showAirQuality", true)
      display("favoritesMoon", true)
      for (var i = 0; i < tabs.length; i++) display(tabs[i] + "AsTab", true)
    },
    function() { panel.activeTab = "favorites" },
    function() { shot("02-tab-places") },
    function() { panel.activeTab = "airQuality" },
    function() { shot("03-tab-air") },
    function() { panel.activeTab = "hourly" },
    function() { shot("04-tab-hourly") },
    function() { press(Qt.Key_Right, "", Qt.ShiftModifier); press(Qt.Key_Right, "", Qt.ShiftModifier) },
    function() { shot("05-tab-hourly-cursor") },
    function() { press(Qt.Key_Backspace); panel.activeTab = "daily" },
    function() { shot("06-tab-daily") },
    function() { panel.activeTab = "rain" },
    function() { shot("07-tab-rain") },
    function() { panel.activeTab = "radar" },
    function() { shot("08-tab-radar") },
    function() { panel.activeTab = "wind" },
    function() { shot("09-tab-wind") },
    function() { panel.activeTab = "globe" },
    function() { if (panel.globeItem) panel.globeItem.finishTurn() },
    function() { shot("09b-tab-globe") },
    // The globe's cost of a frame (paintStats) at z0, z2 and z4, about 500
    // and 840 px across, in windows of their own: still (the full
    // coastline, from z3 the basemap) and moving (the coarse one).
    function() {
      panel.contentRoot.parent = globeHost
      globeView(0, 20, 10)
      // Everything on for the measurements: temperature, cloud and
      // precipitation, streaks, isobars, storms.
      layersOn(["temperature", "cloud", "precipitation"])
      panel.setViewDisplaySetting("globeStreaks", true)
      panel.setViewDisplaySetting("globeIsobars", true)
      panel.setViewDisplaySetting("globeStorms", true)
    }
  ].concat(globeMeasures("500"), [
    function() { panel.contentRoot.parent = globeHostLarge }
  ], globeMeasures("840"), [
    // Auto-rotation's share of a core with everything on: four seconds of
    // turning by itself, every paint's time added up.
    function() {
      panel.setViewDisplaySetting("globeAutoRotate", true)
      globeView(0, 20, 10)
      panel.globeItem.rotating = true
      cpuStart()
    },
    function() {}, function() {},
    function() { cpuReport("500") },
    function() { panel.contentRoot.parent = globeHostLarge; cpuStart() },
    function() {}, function() {},
    function() {
      cpuReport("840")
      panel.globeItem.rotating = false
      panel.setViewDisplaySetting("globeAutoRotate", false)
      panel.setViewDisplaySetting("globeStreaks", false)
      panel.contentRoot.parent = globeHost
    },
    // At rest with nothing animating: no paints at all.
    function() { cpuStart() }, function() {}, function() {},
    function() { cpuReport("500 at rest") },
    function() { layersOn(["temperature"]) },
    // The view tilted to look at Europe from 45° N, then z2 over Europe,
    // then z4 over the Alps with borders and towns.
    function() { globeView(0, 45, 10) },
    function() {},
    function() { shot("09d-globe-tilted") },
    function() { globeView(2, 50, 10) },
    function() {},
    function() { shot("09e-globe-z2-europe") },
    function() { globeView(4, 46.5, 9.5) },
    function() {}, function() {},
    function() { shot("09f-globe-z4-alps") },
    // The colour washes from the fixture's model data (state.py), on the
    // whole disc and over the Alps (z3, the tiles).
    function() { globeView(0, 25, 10); layersOn(["temperature"]) },
    function() {}, function() { rimShot("09g-wash-temperature-z0") },
    function() { layersOn(["cloud"]) },
    function() {}, function() { shot("09h-wash-cloud-z0") },
    function() { layersOn(["precipitation"]) },
    function() {}, function() { shot("09i-wash-precipitation-z0") },
    function() { layersOn(["temperature"]); globeView(3, 47, 9) },
    function() {}, function() {}, function() { shot("09j-wash-temperature-z3") },
    function() { layersOn(["precipitation"]) },
    function() {}, function() { shot("09k-wash-precipitation-z3") },
    function() { layersOn(["temperature"]) },
    // The overlays: wind wash with streaks on the whole disc; isobars with
    // H and L at z1; storms and bolts at z2 over Europe and Africa; the sea
    // on the whole disc; numbers at z3 over the Alps.
    function() {
      panel.setViewDisplaySetting("globeIsobars", false)
      panel.setViewDisplaySetting("globeStorms", false)
      layersOn(["wind"])
      globeView(0, 30, -20)
    },
    function() {}, function() {}, function() {}, function() { shot("09l-wind-streaks-z0") },
    function() {
      panel.setViewDisplaySetting("globeStreaks", false)
      panel.setViewDisplaySetting("globeIsobars", true)
      layersOn([])
      globeView(1, 45, -10)
    },
    function() {}, function() {}, function() { shot("09m-isobars-z1") },
    function() {
      panel.setViewDisplaySetting("globeIsobars", false)
      panel.setViewDisplaySetting("globeStorms", true)
      layersOn(["temperature"])
      globeView(2, 38, 5)
    },
    function() {}, function() {}, function() { shot("09n-storms-z2") },
    function() {
      layersOn(["sst"])
      globeView(0, 20, -30)
    },
    function() {}, function() {}, function() { shot("09o-sst-z0") },
    function() {
      layersOn(["temperature"])
      panel.setViewDisplaySetting("globeNumbers", true)
      globeView(3, 47, 9)
    },
    function() {}, function() {}, function() { shot("09p-numbers-z3") },
    function() {
      panel.setViewDisplaySetting("globeNumbers", false)
      panel.setViewDisplaySetting("globeStorms", true)
    },
    // Colour layers together: temperature, cloud and precipitation on the
    // whole disc; the air's and the sea's temperature; wind over
    // temperature at z1.
    function() { layersOn(["temperature", "cloud", "precipitation"]); globeView(0, 30, -10) },
    function() {}, function() {}, function() { rimShot("09u-layers-temp-cloud-rain-z0") },
    function() { layersOn(["temperature", "sst"]); globeView(0, 20, -30) },
    function() {}, function() {}, function() {}, function() { rimShot("09v-layers-temp-sst-z0") },
    function() { layersOn(["temperature", "wind"]); globeView(1, 45, -15) },
    function() {}, function() {}, function() { shot("09w-layers-wind-temp-z1") },
    function() { layersOn(["temperature"]) },
    // The timeline: now, +24 h and +96 h on the whole disc (temperature
    // with isobars and storms), +12 h close up over the Alps.
    function() {
      panel.setViewDisplaySetting("globeIsobars", true)
      globeView(0, 35, 0)
      panel.globeData.backToNow()
    },
    function() {}, function() {}, function() { shot("09q-time-now-z0") },
    function() { panel.globeData.pinnedMs = panel.globeData.nowMs + 24 * 3600000 },
    function() {}, function() {}, function() { shot("09r-time-24h-z0") },
    function() { panel.globeData.pinnedMs = panel.globeData.nowMs + 96 * 3600000 },
    function() {}, function() {}, function() { shot("09s-time-96h-z0") },
    function() {
      panel.setViewDisplaySetting("globeIsobars", false)
      globeView(3, 47, 9)
      panel.globeData.pinnedMs = panel.globeData.nowMs + 12 * 3600000
    },
    function() {}, function() {}, function() { shot("09t-time-12h-z3") },
    // Playback on the whole disc with everything on, five seconds: the
    // cost of each step and of the frames meanwhile.
    function() {
      panel.setViewDisplaySetting("globeIsobars", true)
      panel.setViewDisplaySetting("globeStreaks", true)
      globeView(0, 35, 0)
      panel.globeData.backToNow()
    },
    function() {},
    function() {
      panel.globeItem.paintStats = { count: 0, total: 0, max: 0 }
      panel.globeItem.washItem.stats = { count: 0, total: 0, max: 0 }
      panel.globeItem.overlayItem.stats = { count: 0, total: 0, max: 0 }
      panel.globeData.messageStats = { count: 0, total: 0, max: 0, latency: 0, latencyMax: 0, steps: 0 }
      panel.globeData.togglePlay()
    },
    function() {}, function() {}, function() {},
    function() {
      var d = panel.globeData
      var st = panel.globeItem.paintStats, ws = panel.globeItem.washItem.stats, os = panel.globeItem.overlayItem.stats
      var ms = d.messageStats
      var steps = Math.max(1, ms.steps)
      console.log("GLOBE playback:", ms.steps, "steps; answers", ms.count, "× mean", (ms.total / Math.max(1, ms.count)).toFixed(1),
        "ms, max", ms.max, "ms; lattice after", (ms.latency / steps).toFixed(0), "ms (max", ms.latencyMax + ");",
        "per step: globe", (st.total / steps).toFixed(1), "wash", (ws.total / steps).toFixed(1), "overlay",
        (os.total / steps).toFixed(1), "answers", (ms.total / steps).toFixed(1), "ms; max frames: globe", st.max,
        "wash", ws.max, "overlay", os.max, "ms")
      d.backToNow()
      panel.setViewDisplaySetting("globeIsobars", false)
      panel.setViewDisplaySetting("globeStreaks", false)
    },
    // The flat map: temperature, cloud and precipitation; with isobars and
    // streaks; zoomed in at z3; at +24 h; then its cost moving.
    function() {
      panel.setViewDisplaySetting("globeStyle", "map")
      layersOn(["temperature", "cloud", "precipitation"])
      globeView(0, 0, 0)
    },
    function() {}, function() {}, function() { shot("09x-map-layers-z0") },
    function() {
      layersOn(["temperature"])
      panel.setViewDisplaySetting("globeIsobars", true)
      panel.setViewDisplaySetting("globeStreaks", true)
    },
    function() {}, function() {}, function() {}, function() { shot("09y-map-isobars-streaks-z0") },
    function() {
      panel.setViewDisplaySetting("globeIsobars", false)
      panel.setViewDisplaySetting("globeStreaks", false)
      globeView(3, 47, 9)
    },
    function() {}, function() {}, function() {}, function() { shot("09z-map-z3") },
    function() { globeView(0, 0, 0); panel.globeData.pinnedMs = panel.globeData.nowMs + 24 * 3600000 },
    function() {}, function() {}, function() { shot("09za-map-24h-z0") },
    function() {
      panel.globeData.backToNow()
      layersOn(["temperature", "cloud", "precipitation"])
      panel.setViewDisplaySetting("globeIsobars", true)
      panel.setViewDisplaySetting("globeStreaks", true)
    }
  ], globeMeasures("500 map"), [
    function() {
      layersOn(["temperature"])
      panel.setViewDisplaySetting("globeIsobars", false)
      panel.setViewDisplaySetting("globeStreaks", false)
      panel.setViewDisplaySetting("globeStyle", "globe")
    },
    function() { globeView(0, 0, 10) },
    function() { panel.contentRoot.parent = widgetHost },
    // The night side and the moon: the globe turned towards them.
    function() {
      var anti = panel.globeItem.sky.anti
      panel.globeItem.turnTo(anti.lon + 60)
    },
    function() { panel.globeItem.finishTurn() },
    function() { shot("09c-tab-globe-night") },
    function() { panel.startEditingLocation() },
    function() { shot("10-search") },
    // "−" acts on the saved places only after Tab; in the results it is a
    // character of the name (the search field hands keys to searchFieldKey).
    function() {
      var minus = { key: Qt.Key_Minus, text: "-", modifiers: Qt.NoModifier }
      var before = panel.savedLocations.slice()
      panel.searchFocusSection = "suggestions"
      check("search-minus-in-results", !panel.searchFieldKey(minus) && panel.savedLocations.length === before.length)
      panel.setSearchFocus("saved")
      check("search-minus-in-saved", panel.searchFieldKey(minus) && panel.savedLocations.length === before.length - 1)
      panel.replaceSavedLocations(before)
    },
    function() { panel.cancelEditingLocation(); panel.openSettings("general") },
    function() { shot("11-settings-general") },
    function() { press(Qt.Key_End) },
    function() { shot("12-settings-general-end") },
    function() { panel.settingsPage = "display"; panel.settingsTargetSurface = "menubar"; press(Qt.Key_Home) },
    function() { shot("13-settings-menubar") },
    // Down the keyboard list to "Bold while hovered".
    function() { for (var i = 0; i < 23; i++) press(Qt.Key_Down) },
    function() { shot("14-settings-menubar-bold") },
    function() { press(Qt.Key_Down); check("accents-dropdown-reached", panel.settingsFocusId === "barAccents") },
    function() { shot("14b-settings-menubar-accents") },
    function() { press(Qt.Key_Home); panel.settingsTargetSurface = "widget" },
    function() { shot("15-settings-widget") },
    function() { panel.settingsTargetSurface = "app" },
    function() { shot("16-settings-app") },
    function() { panel.settingsPage = "shortcuts" },
    function() { shot("17-settings-shortcuts") },
    function() { press(Qt.Key_End) },
    function() { shot("18-settings-shortcuts-end") },
    function() { panel.settingsPage = "sources" },
    function() { shot("19-settings-sources") },
    function() { panel.settingsOpen = false; general("language", "de"); panel.activeTab = "rain" },
    function() { shot("20-tab-rain-de") },
    function() { panel.openSettings("shortcuts") },
    function() { shot("21-settings-shortcuts-de") },
    function() { panel.settingsOpen = false; general("language", "el"); panel.activeTab = "wind" },
    function() { shot("22-tab-wind-el") },
    function() { general("language", "ar"); panel.activeTab = "hourly" },
    function() { shot("23-tab-hourly-ar") },
    // The widget's view: the app button beside the gear. Its popup cannot
    // open offscreen (layer shell), so the tree moves into a window here.
    function() {
      general("language", "en")
      panel.activeTab = "daily"
      panel.standaloneMode = false
      panel.contentRoot.parent = widgetHost
    },
    function() { shot("24-widget") },
    // The menu bar with "Colour the values" set to always: a bar widget
    // of its own (with its own panel), which reads the stored settings.
    function() {
      panel.settingsTargetSurface = "menubar"
      var keys = ["currentFeelsLike", "currentWind", "currentUv", "currentDayRange", "currentPrecipitation"]
      for (var i = 0; i < keys.length; i++) display(keys[i], true)
      display("menubarAccents", "always")
      barHost.active = true
    },
    function() {},
    function() {},
    function() {},
    function() {
      shotOf(barHost.item, "25-bar-accents")
    },
    // The cursor on "Reset general settings" stays on the page once the
    // button is gone.
    function() { panel.openSettings("general"); general("windUnit", "ms") },
    function() { press(Qt.Key_Up); check("reset-general-focused", panel.settingsFocusId === "restoreGeneral") },
    function() { press(Qt.Key_Return); press(Qt.Key_Return) },
    function() { check("reset-general-focus-kept", panel.settingsFocusId !== "" && panel.settingsFocusId !== "restoreGeneral") },
    // Air pressure (off by default) in the current weather, the hours, the
    // days and the menu bar.
    function() {
      panel.settingsOpen = false
      panel.standaloneMode = true
      panel.contentRoot.parent = widgetHost
      panel.settingsTargetSurface = "app"
      var keys = ["heroPressure", "hourlyPressure", "dailyPressure"]
      for (var i = 0; i < keys.length; i++) display(keys[i], true)
      // Room for it beside the temperature, and the hours and days in the
      // window rather than as tabs.
      display("heroHumidity", false)
      display("hourlyAsTab", false)
      display("dailyAsTab", false)
      display("favoritesAsTab", true)
      panel.settingsTargetSurface = "menubar"
      display("currentPressure", true)
      panel.activeTab = "rain"
      press(Qt.Key_Home)
    },
    function() { shot("27-pressure") },
    function() { shotOf(barHost.item, "28-bar-pressure") },
    // The bar's tooltip, when switched on: the entries in words.
    function() { panel.settingsTargetSurface = "menubar"; display("hoverTooltip", true) },
    function() {
      console.log("TOOLTIP", JSON.stringify(barHost.item.hoverTooltipText))
      display("hoverTooltip", false)
    },
    // Settings → General → Places after importing More Time's cities.
    function() { panel.openSettings("general"); panel.cityImport.run() },
    function() { press(Qt.Key_End) },
    function() { shot("26-settings-general-import") },
    function() { console.log("STATUS", panel.reportLocation, panel.displayTabs.join(",")); Qt.quit() }
  ])

  Timer {
    interval: 1200
    running: true
    repeat: true
    onTriggered: {
      if (harness.step >= harness.steps.length) return
      try { harness.steps[harness.step]() } catch (e) { console.log("STEP FAILED", harness.step, e, e.stack) }
      harness.step++
    }
  }

  FloatingWindow {
    visible: true
    // The popup's size: 480 wide inside its padding.
    implicitWidth: 512
    implicitHeight: 760
    Item { id: widgetHost; anchors.fill: parent; anchors.margins: 16 }
  }

  FloatingWindow {
    visible: true
    implicitWidth: 900
    implicitHeight: 48
    color: "transparent"

    Loader {
      id: barHost
      active: false
      anchors.centerIn: parent
      height: 32
      sourceComponent: Component { Weather.BarWidget { height: 32 } }
    }
  }

  // Windows for measuring the globe at about 500 and 840 px.
  FloatingWindow {
    visible: true
    implicitWidth: 640
    implicitHeight: 860
    Item { id: globeHost; anchors.fill: parent; anchors.margins: 16 }
  }
  FloatingWindow {
    visible: true
    implicitWidth: 1030
    implicitHeight: 1260
    Item { id: globeHostLarge; anchors.fill: parent; anchors.margins: 16 }
  }

  Weather.Panel {
    id: panel
    standaloneMode: true
    Component.onCompleted: open()
  }
}
