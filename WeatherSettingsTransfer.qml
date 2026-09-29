import QtQuick
import Quickshell
import Quickshell.Io
import "Model.js" as Model

// Export and import of the settings (Settings → General): the general
// options, the display options of the menu bar, the widget and the app, and
// the saved places, in one JSON file. Caches and the current place (Omarchy's
// weather.json, shared with its own weather) are left out.
//
// An import goes through the same checks as the settings files themselves
// (normalised general options, sanitised display options, parsed places), is
// written to those files, which the other instance watches, and is preceded
// by a backup of the settings it replaces.
QtObject {
  id: transfer
  required property var panel

  readonly property string home: Quickshell.env("HOME")
  readonly property string settingsDirectory: home + "/.local/state/omarchy/settings"
  readonly property string backupPath: settingsDirectory + "/more-weather-settings-backup.json"
  // The downloads folder from user-dirs.dirs, else ~/Downloads.
  property string downloadsDirectory: home + "/Downloads"
  readonly property string defaultPath: downloadsDirectory + "/more-weather-settings.json"

  // The outcome of the last export or import, for the settings page:
  // { key: i18n key, path, error: bool }.
  property var status: null
  // One at a time: export and the import's backup share the writer.
  property bool busy: false

  property FileView userDirs: FileView {
    path: transfer.home + "/.config/user-dirs.dirs"
    printErrors: false
    onLoaded: {
      var match = String(text()).match(/^XDG_DOWNLOAD_DIR="([^"]+)"/m)
      if (match) transfer.downloadsDirectory = match[1].replace(/^\$HOME/, transfer.home)
    }
  }

  function snapshot() {
    return {
      app: "more-weather",
      version: 1,
      exportedAt: new Date().toISOString(),
      general: panel.generalOptions,
      display: {
        menubar: panel.menubarDisplayOptions,
        widget: panel.widgetDisplayOptions,
        app: panel.appDisplayOptions
      },
      favorites: panel.savedLocations
    }
  }

  // A path as shown: the home folder as ~, as typed in a shell.
  function shown(path) {
    var text = String(path || "")
    return text.indexOf(home + "/") === 0 ? "~" + text.slice(home.length) : text
  }

  // Leading ~ stands for the home folder, as in a shell.
  function expanded(path) {
    var text = String(path || "").replace(/^\s+|\s+$/g, "")
    return text.indexOf("~/") === 0 ? home + text.slice(1) : text
  }

  property FileView writer: FileView {
    printErrors: false
    atomicWrites: true
    property string purpose: ""
    onSaved: {
      if (purpose === "backup") {
        transfer.startImport()
        return
      }
      transfer.finish({ key: "settingsExported", path: path, error: false })
    }
    onSaveFailed: {
      // Without a backup nothing is replaced.
      transfer.finish({ key: purpose === "export" ? "settingsExportFailed" : "settingsBackupFailed",
        path: path, error: true })
    }
  }

  function finish(result) {
    status = result
    busy = false
  }

  function exportTo(path) {
    var target = expanded(path)
    if (!target || busy) return
    busy = true
    writer.purpose = "export"
    writer.path = target
    writer.setText(JSON.stringify(snapshot(), null, 2) + "\n")
  }

  property string importPath: ""

  function importFrom(path) {
    var source = expanded(path)
    if (!source || busy) return
    busy = true
    importPath = source
    // Importing the backup itself undoes the last import: it must not be
    // overwritten by a backup of the settings it is meant to replace.
    if (source === backupPath) {
      startImport()
      return
    }
    // First the backup of what the import replaces; the import follows once
    // it is written (writer.onSaved).
    writer.purpose = "backup"
    writer.path = backupPath
    writer.setText(JSON.stringify(snapshot(), null, 2) + "\n")
  }

  property FileView reader: FileView {
    printErrors: false
    onLoaded: transfer.apply(text())
    onLoadFailed: transfer.finish({ key: "settingsImportMissing", path: path, error: true })
  }

  function startImport() {
    // A path set again to the same file would not read it anew.
    reader.path = ""
    reader.path = importPath
  }

  function apply(raw) {
    var data = null
    try { data = JSON.parse(String(raw || "")) } catch (e) { data = null }
    if (!data || typeof data !== "object" || data.app !== "more-weather") {
      finish({ key: "settingsImportInvalid", path: importPath, error: true })
      return
    }
    var store = panel.displayOptionsStore
    if (data.general && typeof data.general === "object") {
      store.loadGeneralOptions(JSON.stringify(data.general))
      store.generalOptionsFile.setText(JSON.stringify(panel.generalOptions) + "\n")
    }
    var display = data.display && typeof data.display === "object" ? data.display : {}
    var surfaces = [
      ["menubar", store.menubarDisplayOptionsFile, "menubarDisplayOptions"],
      ["widget", store.widgetDisplayOptionsFile, "widgetDisplayOptions"],
      ["app", store.appDisplayOptionsFile, "appDisplayOptions"]
    ]
    for (var i = 0; i < surfaces.length; ++i) {
      var options = display[surfaces[i][0]]
      if (!options || typeof options !== "object") continue
      store.loadDisplayOptionsFor(surfaces[i][0], JSON.stringify(options))
      surfaces[i][1].setText(JSON.stringify(panel[surfaces[i][2]]) + "\n")
    }
    if (Array.isArray(data.favorites)) {
      panel.savedLocations = Model.parseSavedLocations(JSON.stringify(data.favorites))
      panel.savedLocationsFile.setText(JSON.stringify(panel.savedLocations, null, 2) + "\n")
    }
    // From the backup no new one was made: it is a restore.
    finish({ key: importPath === backupPath ? "settingsRestored" : "settingsImported", path: importPath, error: false })
  }
}
