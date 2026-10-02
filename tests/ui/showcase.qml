import QtQuick
import Quickshell
import qs.Commons
import "Weather" as Weather

// The README pictures (tests/ui-showcase.sh): live data, the app at
// 941 × 1150, the widget at 480 wide, and the menu bar. Each scene waits
// for its data; a step is 1.2 s.
ShellRoot {
  id: harness
  readonly property string shots: Quickshell.env("MW_SHOTS") || "/tmp"
  property int step: 0

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
  function wait(seconds) {
    var list = []
    for (var i = 0; i < Math.ceil(seconds / 1.2); i++) list.push(function() {})
    return list
  }

  readonly property var steps: [].concat(
    [function() {
      panel.contentRoot.parent = appHost
      // My places as a tab beside rain, radar and wind (the Tokyo scene).
      onSurface("app", "favoritesAsTab", true)
      onSurface("app", "showFavorites", true)
      onSurface("app", "showAirQuality", true)
    }],
    wait(30),
    // Chicago in °F (with a warning when NWS has one), from the top.
    [function() { press(Qt.Key_Home) }, function() { shot("chicago") }],
    // Settings: General and Sources.
    [function() { panel.openSettings("general") }],
    wait(2),
    [function() { shot("settings") }, function() { panel.settingsPage = "sources" }],
    wait(2),
    [function() { shot("sources") }, function() { panel.settingsOpen = false }],
    // Tokyo's radar: the JMA radar under the tab strip.
    [function() { panel.showFavorite(1) }],
    wait(20),
    [function() { panel.showTab("radar") }],
    wait(12),
    [function() { press(Qt.Key_End) }, function() { shot("tokyo-radar") }],
    // Tórshavn's wind map.
    [function() { panel.showFavorite(2) }],
    wait(20),
    [function() { panel.showTab("wind") }],
    wait(10),
    [function() { press(Qt.Key_End) }, function() { shot("torshavn-wind") }],
    // The widget's view (as in the bar's popup) and the menu bar with
    // coloured values above it.
    [function() {
      panel.settingsOpen = false
      onSurface("menubar", "currentFeelsLike", true)
      onSurface("menubar", "currentWind", true)
      onSurface("menubar", "menubarAccents", "always")
      panel.standaloneMode = false
      panel.activeTab = "rain"
      panel.contentRoot.parent = widgetHost
      barHost.active = true
    }],
    wait(12),
    [function() { press(Qt.Key_Home) }, function() { shot("widget") },
      function() { shot("bar", barHost) },
      function() { Qt.quit() }]
  )

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

  FloatingWindow {
    visible: true
    implicitWidth: 900
    implicitHeight: 48
    color: "transparent"

    Rectangle {
      id: barHost
      property alias active: barLoader.active
      readonly property alias item: barLoader.item
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
