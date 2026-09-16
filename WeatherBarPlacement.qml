import QtQuick
import Quickshell
import Quickshell.Io

// Where the widget sits in Omarchy's bar (left, center or right section),
// switched in the settings. The layout belongs to Omarchy: it is only read
// here, and a change goes through Omarchy's own `omarchy-bar move`, run when
// the user picks a section, never on its own.
Item {
  required property var panel

  readonly property string widgetId: "more-weather"
  // "left" | "center" | "right", or "" when the widget is not on the bar.
  property string section: ""
  // A bar on the left or right screen edge runs top to bottom.
  property bool verticalBar: false
  property bool busy: false

  function readLayout(raw) {
    var found = ""
    var vertical = false
    try {
      var bar = (JSON.parse(String(raw || "")) || {}).bar || {}
      vertical = bar.position === "left" || bar.position === "right"
      var layout = bar.layout || {}
      var sections = ["left", "center", "right"]
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
    if (["left", "center", "right"].indexOf(target) < 0) return
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
      if (exitCode !== 0) console.warn("weather: moving the bar widget failed with exit code", exitCode)
      busy = false
      shellConfigView.reload()
    }
  }
}
