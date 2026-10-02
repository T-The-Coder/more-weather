import QtQuick
import Quickshell
import Quickshell.Io
import "Model.js" as Model
import "PlaceSearch.js" as PlaceSearch

// Settings → General → Places: More Time's world clock cities taken over as
// saved places. Only reads its file; the button waits for it to exist.
QtObject {
  id: cityImport
  required property var panel

  readonly property string path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-time-cities.json"
  property bool available: false
  // The last run: { added, existing, skipped }, or null.
  property var status: null

  function run() {
    if (!available) return
    var result = Model.importedCities(panel.savedLocations, file.text(), PlaceSearch.samePlace)
    if (result.added > 0) panel.replaceSavedLocations(result.list)
    status = { added: result.added, existing: result.existing, skipped: result.skipped }
  }

  property FileView file: FileView {
    path: cityImport.path
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: cityImport.available = true
    onLoadFailed: cityImport.available = false
  }
}
