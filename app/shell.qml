import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import "Weather" as Weather

ShellRoot {
  id: app

  // Keep the standalone window on the exact same settings as the bar entry.
  property var weatherSettings: ({ refreshMinutes: 15, unit: "metric" })

  function settingsFromShell(raw) {
    try {
      var config = JSON.parse(String(raw || ""))
      var layout = config && config.bar && config.bar.layout ? config.bar.layout : ({})
      var sections = ["left", "center", "right"]
      for (var s = 0; s < sections.length; ++s) {
        var entries = layout[sections[s]] || []
        for (var i = 0; i < entries.length; ++i) {
          if (entries[i] && entries[i].id === "more-weather") return entries[i]
        }
      }
    } catch (e) {
      console.warn("weather app: could not read shell settings:", e)
    }
    return ({ refreshMinutes: 15, unit: "metric" })
  }

  FileView {
    id: shellConfig
    path: Quickshell.env("HOME") + "/.config/omarchy/shell.json"
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: app.weatherSettings = app.settingsFromShell(text())
  }

  // omarchy-theme-set pushes the new palette over IPC to the Omarchy shell
  // only; this separate process would keep its startup colors. The theme
  // name file is rewritten on every switch, after the new theme directory is
  // in place, so re-read the theme from here the same way the shell's
  // applyTheme does.
  FileView {
    id: themeNameFile
    path: Quickshell.env("HOME") + "/.local/state/omarchy/current/theme.name"
    watchChanges: true
    printErrors: false
    onFileChanged: {
      reload()
      themeReloadDebounce.restart()
    }
  }

  Timer {
    id: themeReloadDebounce
    interval: 250
    onTriggered: {
      Color.colorsFile.reload()
      Color.shellFile.reload()
      Style.scheduleRefresh()
    }
  }

  Weather.Panel {
    id: weather
    standaloneMode: true
    settings: app.weatherSettings
    Component.onCompleted: open()
  }
}
