import QtQuick

// A view's motion in step with the frames the window really shows, shared
// by the More plugins (tools/sync-shared.sh, verbatim).
//
// While `active`, step(elapsedMs) is emitted about `fps` times a second;
// advance by elapsedMs (the real time since the last step, at most 500) and
// the speed is the same at any rate. Each next step is timed from the
// moment the last one reached the screen (the window's frameSwapped), a few
// milliseconds before the frame it is meant for, so the steps keep an even
// cadence with the display instead of beating against it; between steps no
// frame is forced.
//
// `shown`: frames are reaching the screen. When the compositor stops showing
// the window (another workspace), a step's frame is never swapped; then
// shown turns false and the steps slow to one a second (no CPU worth
// speaking of) until a frame shows again. Gate motion on the window being
// shown (visible, the popup open), not on keyboard focus, which follows the
// pointer in Omarchy.
Item {
  id: gate
  property bool active: false
  property int fps: 15
  signal step(real elapsedMs)

  property bool shown: true
  // Steps so far (the screenshot harness and the motion log count them).
  property int steps: 0
  property double lastStep: 0
  // A step waits for its frame to be swapped.
  property bool waitingForFrame: false

  readonly property int period: Math.round(1000 / Math.max(1, fps))

  function takeStep() {
    var now = Date.now()
    var elapsed = Math.min(500, now - lastStep)
    lastStep = now
    steps++
    waitingForFrame = true
    lost.restart()
    step(elapsed)
  }

  onActiveChanged: {
    next.stop()
    lost.stop()
    waitingForFrame = false
    if (!active) return
    lastStep = Date.now()
    shown = true
    next.interval = period
    next.start()
  }

  // The next step: a period after the last one reached the screen, less a
  // few milliseconds so it is in time for that frame.
  Timer {
    id: next
    onTriggered: if (gate.active) gate.takeStep()
  }
  // Its frame never came: not shown; try again in a second.
  Timer {
    id: lost
    interval: 600
    onTriggered: {
      gate.shown = false
      gate.waitingForFrame = false
      if (!gate.active) return
      next.interval = 400
      next.start()
    }
  }
  Connections {
    target: gate.Window.window
    function onFrameSwapped() {
      if (!gate.waitingForFrame) return
      gate.waitingForFrame = false
      gate.shown = true
      lost.stop()
      next.interval = Math.max(1, gate.period - 6)
      next.start()
    }
  }
}
