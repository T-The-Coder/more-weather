import QtQuick

// One radar frame picture. The radar servers (DWD's GeoServer in particular)
// answer bursts of requests with 502/503, so a failed picture is asked for
// again twice before it counts as failed; only then does `failed` fire and
// the panel switch to a fallback source.
Image {
  id: frameImage
  property string frameUrl: ""
  // False keeps the picture unrequested (throttled loading).
  property bool load: true
  property int attempts: 0
  property bool retrying: false
  readonly property int maximumAttempts: 3

  signal failed()

  asynchronous: true
  cache: true
  // Part of Qt's pixmap cache key: must match in every copy of a frame.
  fillMode: Image.PreserveAspectCrop
  source: load && !retrying ? frameUrl : ""

  onFrameUrlChanged: attempts = 0
  onStatusChanged: {
    if (status !== Image.Error) return
    attempts++
    if (attempts < maximumAttempts) {
      retrying = true
      retryTimer.interval = attempts * 2500
      retryTimer.restart()
    } else {
      failed()
    }
  }

  Timer {
    id: retryTimer
    onTriggered: frameImage.retrying = false
  }
}
