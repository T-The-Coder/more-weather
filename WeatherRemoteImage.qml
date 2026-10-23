import QtQuick

// A map picture from the network: a radar frame or a basemap. The download
// runs through WeatherImageStore, which enforces byte and pixel ceilings, and
// the Image only ever loads the checked local file.
//
// The radar servers (DWD's GeoServer in particular) answer bursts of requests
// with 502/503, so a failed picture is asked for again twice before it counts
// as failed; only then does `failed` fire and the panel switch to a fallback
// source. `status` stays Null while the download runs, as for a picture that
// is not allowed to load yet.
Image {
  id: remoteImage
  property string remoteUrl: ""
  // Not required: a required property would stop Repeater delegates from
  // seeing index and modelData.
  property var store: null
  // False keeps the picture unrequested (throttled loading).
  property bool load: true
  property int attempts: 0
  property bool retrying: false
  readonly property int maximumAttempts: 3

  signal failed()

  readonly property string fetchState: store && remoteUrl
    ? (store.revision, store.stateOf(remoteUrl)) : ""

  asynchronous: true
  cache: true
  // Part of Qt's pixmap cache key: must match in every copy of a picture.
  fillMode: Image.PreserveAspectCrop
  source: load && !retrying && fetchState === "ready" ? store.localUrl(remoteUrl) : ""

  // Requests wait for the end of the current event: the map extent is several
  // bindings (centre, zoom, south, north...) that update one after another,
  // and each step used to request a picture for a half-updated extent, which
  // DWD answers with an error document instead of a PNG. When that hit a
  // radar frame, the whole radar switched to RainViewer.
  // A zero-interval Timer rather than Qt.callLater: it dies with the item, so
  // an image a Repeater removes in the same event never runs a stale call.
  property bool pendingRetry: false

  function scheduleRequest(retry) {
    pendingRetry = pendingRetry || !!retry
    if (!requestTimer.running) requestTimer.start()
  }

  function flushRequest() {
    var retry = pendingRetry
    pendingRetry = false
    requestPicture(retry)
  }

  function requestPicture(retry) {
    if (!load || retrying || !store || !remoteUrl) return
    // Failed before this item asked (another copy, or the prefetch): count it
    // here too, since fetchState will not change again on its own.
    if (!retry && store.stateOf(remoteUrl) === "failed") noteFailure()
    else store.request(remoteUrl, retry)
  }

  function noteFailure() {
    attempts++
    if (attempts < maximumAttempts) {
      retrying = true
      retryTimer.interval = attempts * 2500
      retryTimer.restart()
    } else {
      failed()
    }
  }

  Component.onCompleted: scheduleRequest(false)
  onRemoteUrlChanged: {
    attempts = 0
    scheduleRequest(false)
  }
  onLoadChanged: scheduleRequest(false)
  onStoreChanged: scheduleRequest(false)
  onFetchStateChanged: {
    if (fetchState === "failed" && !retrying) noteFailure()
  }
  onStatusChanged: {
    // A file that passed the header check but does not decode.
    if (status === Image.Error && !retrying) noteFailure()
  }

  Timer {
    id: requestTimer
    interval: 0
    onTriggered: remoteImage.flushRequest()
  }

  Timer {
    id: retryTimer
    onTriggered: {
      remoteImage.retrying = false
      remoteImage.scheduleRequest(true)
    }
  }
}
