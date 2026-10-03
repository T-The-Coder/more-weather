import QtQuick
import Quickshell
import Quickshell.Io
import "Weather" as Weather

// Screenshot run for tests/ui-shots.sh: the app view with the synthetic
// weather from tests/ui/fixtures/state.py, every section as a tab, every
// settings page, in English, German and Arabic (right to left), the
// widget's view (as in the bar's popup), and last the menu bar with its
// values coloured. Pictures go to $MW_SHOTS.
ShellRoot {
  id: harness
  readonly property string shots: Quickshell.env("MW_SHOTS") || "/tmp"
  property int step: 0
  readonly property var tabs: ["favorites", "airQuality", "hourly", "daily", "rain", "radar", "wind", "globe"]

  function shot(name) {
    panel.contentRoot.grabToImage(function(result) {
      result.saveToFile(harness.shots + "/" + name + ".png")
      console.log("SHOT", name)
    })
  }

  function check(name, ok) { console.log(ok ? "CHECK ok" : "CHECK FAILED", name) }
  function measureGlobe() {
    panel.globeItem.paintStats = { count: 0, total: 0, max: 0 }
    panel.globeItem.rotating = true
  }
  function reportGlobe() {
    var st = panel.globeItem.paintStats
    var n = Math.max(1, st.count)
    console.log("GLOBE paint", Math.round(panel.globeItem.radius * 2), "px:", st.count, "frames, mean",
      (st.total / n).toFixed(1), "ms, max", st.max, "ms; land", (st.land / n).toFixed(1),
      "sky", (st.sky / n).toFixed(1), "places", (st.places / n).toFixed(1))
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
    // The globe turning by itself: the cost of a frame (paintStats) with
    // the globe about 500 and 840 px across, in a window of its own.
    function() {
      panel.contentRoot.parent = globeHost
      panel.settingsTargetSurface = "app"
      display("globeAutoRotate", true)
      display("globeRotateSpeed", "1")
    },
    function() { measureGlobe() }, function() {}, function() {}, function() {}, function() { reportGlobe() },
    function() { panel.contentRoot.parent = globeHostLarge },
    function() { measureGlobe() }, function() {}, function() {}, function() {}, function() { reportGlobe() },
    function() {
      display("globeAutoRotate", false)
      panel.globeItem.recenter()
    },
    function() { panel.globeItem.finishTurn() },
    function() { shot("09d-globe-app") },
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
      barHost.item.grabToImage(function(result) {
        result.saveToFile(harness.shots + "/25-bar-accents.png")
        console.log("SHOT", "25-bar-accents")
      })
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
    function() { barHost.item.grabToImage(function(result) {
      result.saveToFile(harness.shots + "/28-bar-pressure.png")
      console.log("SHOT", "28-bar-pressure")
    }) },
    // Settings → General → Places after importing More Time's cities.
    function() { panel.openSettings("general"); panel.cityImport.run() },
    function() { press(Qt.Key_End) },
    function() { shot("26-settings-general-import") },
    function() { console.log("STATUS", panel.reportLocation, panel.displayTabs.join(",")); Qt.quit() }
  ]

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
