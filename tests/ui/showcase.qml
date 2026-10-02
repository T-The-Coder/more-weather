import QtQuick
import Quickshell
import qs.Commons
import "Weather" as Weather

// The README pictures (tests/ui-showcase.sh): live data, the app at
// 941 × 1150, the widget at 480 wide, and the menu bar. MW_SCENES lists the
// scenes, separated by ";", each "file|kind|place|latitude|longitude":
//   top       the app from the top (current weather, warnings, hours)
//   places    the app from the top with my places in the window
//   radar     the radar tab, scrolled to the end
//   wind      the wind tab, scrolled to the end
//   settings  Settings → Display → Menu bar at "Colour the values" (no place)
//   general   Settings → General (no place needed)
//   sources   Settings → Sources (no place needed)
//   widget    the widget's view and, as "<file>-bar", the menu bar
// A step is 1.2 s; each place gets half a minute for its data. My places
// fill from the bar's own panel, a few seconds per place: put "places"
// late.
ShellRoot {
  id: harness
  readonly property string shots: Quickshell.env("MW_SHOTS") || "/tmp"
  property int step: 0
  property var steps: []

  function shot(name, item) {
    (item || panel.contentRoot.parent.parent).grabToImage(function(result) {
      result.saveToFile(harness.shots + "/" + name + ".png")
      console.log("SHOT", name)
    })
  }
  function onSurface(surface, key, value) {
    panel.settingsTargetSurface = surface
    panel.displayOptionsStore.setSettingsDisplaySetting(key, value)
  }
  function press(key) {
    panel.handlePanelKey({ key: key, text: "", modifiers: Qt.NoModifier, accepted: false })
  }
  function wait(list, seconds) {
    for (var i = 0; i < Math.ceil(seconds / 1.2); i++) list.push(function() {})
  }
  function goTo(place, lat, lon) {
    panel.settingsOpen = false
    panel.pickSuggestion({ name: place, latitude: Number(lat), longitude: Number(lon) })
  }

  function scene(list, spec) {
    var part = spec.split("|")
    var file = part[0], kind = part[1], place = part[2], lat = part[3], lon = part[4]
    if (kind === "settings" || kind === "general" || kind === "sources") {
      list.push(function() {
        panel.openSettings(kind === "settings" ? "display" : kind)
        if (kind === "settings") panel.settingsTargetSurface = "menubar"
      })
      wait(list, 2)
      // Menu bar: down to "Colour the values", the card scrolled into view.
      if (kind === "settings")
        list.push(function() { for (var i = 0; i < 23; i++) press(Qt.Key_Down) })
      wait(list, 2)
      list.push(function() { shot(file) }, function() { panel.settingsOpen = false })
      return
    }
    if (kind === "widget") {
      list.push(function() {
        goTo(place, lat, lon)
        panel.standaloneMode = false
        panel.activeTab = "rain"
        panel.contentRoot.parent = widgetHost
      })
      wait(list, 30)
      list.push(function() { press(Qt.Key_Home) }, function() { shot(file) },
        function() { shot(file + "-bar", barHost) })
      return
    }
    list.push(function() {
      onSurface("app", "favoritesAsTab", kind !== "places")
      goTo(place, lat, lon)
    })
    wait(list, 30)
    if (kind === "radar" || kind === "wind") {
      list.push(function() { panel.showTab(kind) })
      wait(list, 12)
      list.push(function() { press(Qt.Key_End) })
    } else {
      list.push(function() { press(Qt.Key_Home) })
    }
    wait(list, 2)
    list.push(function() { shot(file) })
  }

  Component.onCompleted: {
    var list = [function() {
      panel.contentRoot.parent = appHost
      onSurface("app", "showFavorites", true)
      onSurface("app", "showAirQuality", true)
      onSurface("app", "favoritesMoon", true)
      onSurface("menubar", "currentFeelsLike", true)
      onSurface("menubar", "currentWind", true)
      onSurface("menubar", "menubarAccents", "always")
      // The bar's own panel fetches the saved places' forecasts for my
      // places (the app reads them from the shared cache).
      barHost.active = true
    }]
    var scenes = String(Quickshell.env("MW_SCENES") || "").split(";")
    for (var i = 0; i < scenes.length; i++) if (scenes[i] !== "") scene(list, scenes[i])
    list.push(function() { Qt.quit() })
    steps = list
  }

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

  // The app window's content with its padding, on the popups' colour.
  FloatingWindow {
    visible: true
    implicitWidth: 941
    implicitHeight: 1150
    Rectangle {
      anchors.fill: parent
      color: Color.popups.background
      Item { id: appHost; anchors.fill: parent; anchors.margins: 14 }
    }
  }

  // The popup: 480 wide inside its padding.
  FloatingWindow {
    visible: true
    implicitWidth: 512
    implicitHeight: 1000
    Rectangle {
      anchors.fill: parent
      color: Color.popups.background
      Item { id: widgetHost; anchors.fill: parent; anchors.margins: 16 }
    }
  }

  // The menu bar.
  FloatingWindow {
    visible: true
    implicitWidth: 900
    implicitHeight: 48
    color: "transparent"

    Rectangle {
      id: barHost
      property alias active: barLoader.active
      anchors.fill: parent
      color: Color.bar ? Color.bar.background : Color.popups.background

      Loader {
        id: barLoader
        active: false
        anchors.centerIn: parent
        height: 32
        sourceComponent: Component { Weather.BarWidget { height: 32 } }
      }
    }
  }

  Weather.Panel {
    id: panel
    standaloneMode: true
    Component.onCompleted: open()
  }
}
