import QtQuick
import Quickshell
import Quickshell.Io

// The standalone app's entry in the app launcher, switched in the settings.
// Nothing is written until the user turns it on; app/more-weather creates and
// removes the entry, which also removes itself once the plugin is gone.
Item {
  required property var panel

  readonly property string dataHome: Quickshell.env("XDG_DATA_HOME")
    || (Quickshell.env("HOME") + "/.local/share")
  readonly property string desktopFile: dataHome + "/applications/more-weather.desktop"
  property bool installed: false
  property bool busy: false

  function setInstalled(enabled) {
    if (busy || enabled === installed) return
    busy = true
    // Shown at once; the file check below confirms or reverts it.
    installed = enabled
    entryProc.command = [panel.appLauncherPath(),
      enabled ? "--install-desktop-entry" : "--remove-desktop-entry"]
    entryProc.running = true
  }

  property FileView desktopFileView: FileView {
    path: desktopFile
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: installed = true
    onLoadFailed: installed = false
  }

  property Process entryProc: Process {
    onExited: function(exitCode) {
      if (exitCode !== 0) console.warn("weather: app launcher entry command failed with exit code", exitCode)
      busy = false
      desktopFileView.reload()
    }
  }
}
