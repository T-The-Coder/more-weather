import QtQuick
import Quickshell
import Quickshell.Io

// Where the widget sits in Omarchy's bar, switched in the settings. Since
// Omarchy 4.5 the bar has five sections: left, the center box with
// centerBegin and centerEnd hanging off its two edges, and right (plus the
// tray's drawer, which is read but not offered as a target). The layout belongs to Omarchy: it is only read
// here, and a change goes through Omarchy's own `omarchy-bar move`, run when
// the user picks a section, never on its own.
Item {
  id: root
  required property var panel

  readonly property string widgetId: "more-weather"
  readonly property var sections: ["left", "centerBegin", "center", "centerEnd", "right"]
  // One of `sections`, "tray", or "" when the widget is not on the bar.
  property string section: ""
  // A bar on the left or right screen edge runs top to bottom.
  property bool verticalBar: false
  property bool busy: false

  // The sections as dropdown choices, named after the bar's direction. The
  // tray's drawer only shows up while the widget sits in it.
  readonly property var options: {
    var names = verticalBar
      ? { left: "barPositionTop", centerBegin: "barPositionAboveCenter", center: "barPositionCenter",
          centerEnd: "barPositionBelowCenter", right: "barPositionBottom", tray: "barPositionTray" }
      : { left: "barPositionLeft", centerBegin: "barPositionLeftOfCenter", center: "barPositionCenter",
          centerEnd: "barPositionRightOfCenter", right: "barPositionRight", tray: "barPositionTray" }
    var list = section === "tray" ? sections.concat(["tray"]) : sections
    return list.map(function(key) { return { value: key, label: panel.i18n(names[key]) } })
  }

  function readLayout(raw) {
    var found = ""
    var vertical = false
    try {
      var bar = (JSON.parse(String(raw || "")) || {}).bar || {}
      vertical = bar.position === "left" || bar.position === "right"
      var layout = bar.layout || {}
      var sections = root.sections.concat(["tray"])
      for (var s = 0; s < sections.length && !found; ++s) {
        var entries = layout[sections[s]] || []
        for (var i = 0; i < entries.length; ++i)
          if (entries[i] && entries[i].id === widgetId) { found = sections[s]; break }
      }
    } catch (e) {
      found = ""
    }
    section = found
    verticalBar = vertical
  }

  function moveTo(target) {
    if (busy || !section || target === section) return
    if (sections.indexOf(target) < 0) return
    busy = true
    moveProc.command = ["omarchy-bar", "move", widgetId, "--section", target]
    moveProc.running = true
  }

  property FileView shellConfigView: FileView {
    path: Quickshell.env("HOME") + "/.config/omarchy/shell.json"
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: readLayout(text())
    onLoadFailed: readLayout("")
  }

  property Process moveProc: Process {
    onExited: function(exitCode) {
      if (exitCode !== 0) console.warn("more-weather: moving the bar widget failed with exit code", exitCode)
      busy = false
      shellConfigView.reload()
    }
  }
}
