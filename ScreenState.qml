import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland

// Whether the monitor that shows a window is on, shared by the More plugins
// (tools/sync-shared.sh, verbatim). Hyprland turns monitors off (DPMS: a
// key binding, or Omarchy on idle) without telling its clients or sending
// an event, and a window on a dark monitor still gets frames, so motion
// would go on computing without a picture.
//
// screenOn: false only while the monitor named monitorName (the window's
// screen) is known to be off; with no name, while every monitor is off.
// True whenever it cannot be known (no Hyprland, hyprctl missing or failing).
// Read with `hyprctl monitors -j` (dpmsStatus), run through PATH so a test
// can put a fake hyprctl first: on start, when monitors come, go or take
// the focus, and while `wanted` every 10 s (every 2 s while off, so the
// picture comes back at the next look).
Item {
  id: state
  property string monitorName: ""
  property bool wanted: true

  // dpmsStatus by monitor name, from the last look.
  property var dpmsByName: ({})
  property bool allOff: false
  readonly property bool screenOn: monitorName !== "" && dpmsByName[monitorName] !== undefined
    ? dpmsByName[monitorName] : !allOff
  readonly property bool hyprland: (Quickshell.env("HYPRLAND_INSTANCE_SIGNATURE") || "") !== ""

  function probe() {
    if (hyprland && !reader.running) reader.running = true
  }
  function read(text) {
    try {
      var list = JSON.parse(text)
      if (!Array.isArray(list)) return
      var map = {}
      var anyOn = false
      for (var i = 0; i < list.length; i++) {
        var on = list[i].dpmsStatus !== false
        map[list[i].name] = on
        anyOn = anyOn || on
      }
      dpmsByName = map
      allOff = list.length > 0 && !anyOn
    } catch (e) {}
  }

  Process {
    id: reader
    command: ["hyprctl", "monitors", "-j"]
    stdout: StdioCollector { onStreamFinished: state.read(text) }
  }
  Timer {
    interval: state.screenOn ? 10000 : 2000
    repeat: true
    running: state.wanted && state.hyprland
    onTriggered: state.probe()
  }
  Connections {
    target: state.hyprland ? Hyprland : null
    function onRawEvent(event) {
      var name = event.name
      if (name === "monitoradded" || name === "monitoraddedv2" || name === "monitorremoved"
          || name === "monitorremovedv2" || name === "focusedmon" || name === "focusedmonv2")
        state.probe()
    }
  }
  onWantedChanged: if (wanted) probe()
  Component.onCompleted: probe()
}
