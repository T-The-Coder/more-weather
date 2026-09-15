import QtQuick

// One HTTP request, made in-process with XMLHttpRequest instead of spawning
// curl. The surface mirrors the Process + StdioCollector pairs it replaces:
// set `request`, set `running`, then `finished(text)` delivers the body —
// empty on any failure, like `curl -f` — followed by `exited(code)` with
// curl's own codes (0 ok, 22 HTTP error, 28 timeout, 7 network error).
// Setting `running` to false cancels silently, so a superseded response can
// never land.
//
// request: { url, method ("GET"), headers ({}), body (""), timeoutMs (10000) }
QtObject {
  id: http

  property var request: null
  property bool running: false

  signal finished(string text)
  signal exited(int exitCode)

  property var activeRequest: null
  property int generation: 0
  // HTTP status and body of the last completed request (0 / "" on timeout or
  // network error); set before finished() so handlers can inspect a failure.
  property int status: 0
  property string errorText: ""

  // Identifies this client to services that require it (MET Norway, NWS,
  // Overpass); harmless everywhere else.
  readonly property string userAgent: "more-weather/2.0 (+https://github.com/T-The-Coder/more-weather)"

  onRunningChanged: {
    if (running) start()
    else cancel()
  }

  function start() {
    status = 0
    errorText = ""
    var spec = request
    if (!spec || !spec.url) {
      running = false
      return
    }
    var token = ++generation
    var xhr = new XMLHttpRequest()
    activeRequest = xhr
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== XMLHttpRequest.DONE || token !== http.generation) return
      var ok = xhr.status >= 200 && xhr.status < 300
      http.status = xhr.status
      http.errorText = ok ? "" : String(xhr.responseText || "")
      http.complete(ok ? 0 : (xhr.status > 0 ? 22 : 7), ok ? String(xhr.responseText || "") : "")
    }
    xhr.open(spec.method || "GET", spec.url)
    xhr.setRequestHeader("User-Agent", userAgent)
    var headers = spec.headers || {}
    for (var name in headers) xhr.setRequestHeader(name, headers[name])
    if (spec.body) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    timeoutTimer.interval = Math.max(1000, Number(spec.timeoutMs) || 10000)
    timeoutTimer.restart()
    xhr.send(spec.body || null)
  }

  function complete(exitCode, text) {
    timeoutTimer.stop()
    activeRequest = null
    generation++
    running = false
    finished(text)
    exited(exitCode)
  }

  function cancel() {
    timeoutTimer.stop()
    generation++
    var xhr = activeRequest
    activeRequest = null
    if (xhr) xhr.abort()
  }

  property Timer timeoutTimer: Timer {
    onTriggered: {
      var xhr = http.activeRequest
      http.activeRequest = null
      http.generation++
      if (xhr) xhr.abort()
      http.running = false
      http.finished("")
      http.exited(28)
    }
  }
}
