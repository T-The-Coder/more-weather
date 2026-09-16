import QtQuick
import Quickshell.Io

// One HTTP request, run through curl in a child process. The response size is
// capped outside the shell: curl stops at `maxBytes` of (decompressed) body,
// and `head -c` cuts stdout just above that as a second wall, so a huge or
// endless response — success or error, compressed or not — can never be
// buffered here. XMLHttpRequest could not guarantee that: Qt's network thread
// reads ahead of any readyState callback, and a local test had 1.3 GB queued
// before the first LOADING event could abort it.
//
// Set `request`, set `running`, then `finished(text)` delivers the body —
// empty on any failure — followed by `exited(code)` with curl's exit codes
// (0 ok, 22 HTTP error, 28 timeout, 63 response too large, others network).
// Setting `running` to false cancels silently, so a superseded response can
// never land.
//
// request: { url, method ("GET"), headers ({}), body (""), timeoutMs (10000),
//            maxBytes (defaultMaxBytes) }
QtObject {
  id: http

  property var request: null
  property bool running: false

  signal finished(string text)
  signal exited(int exitCode)

  property int generation: 0
  // HTTP status of the last completed request (0 if no response arrived) and,
  // for HTTP errors, the start of its body; set before finished() so handlers
  // can inspect a failure.
  property int status: 0
  property string errorText: ""

  readonly property int defaultMaxBytes: 4 * 1024 * 1024
  // Error bodies are only read for short reasons such as Open-Meteo's 429.
  readonly property int maxErrorChars: 4096

  // Identifies this client to services that require it (MET Norway, NWS,
  // Overpass); harmless everywhere else.
  readonly property string userAgent: "more-weather/2.1 (+https://github.com/T-The-Coder/more-weather)"

  // $1 is the stdout ceiling; the rest are curl's arguments, passed as argv so
  // nothing from a request is ever parsed by the shell. The ceiling leaves room
  // for the "\n<status>" trailer that -w appends after the body. Cancelling
  // only signals bash, so the trap passes TERM on to curl and head; without it
  // a stalled curl would linger until --max-time.
  readonly property string script: "set -o pipefail; limit=$1; shift; "
    + "trap 'pkill -TERM -P $$; exit 143' TERM; "
    + "curl \"$@\" | head -c \"$limit\" & wait $!"

  property bool pendingExit: false
  property bool pendingStream: false
  property int pendingCode: 0

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
    var timeoutMs = Math.max(1000, Number(spec.timeoutMs) || 10000)
    var maxBytes = Math.max(1, Math.floor(Number(spec.maxBytes) || defaultMaxBytes))
    // -q must come first: it keeps a user's ~/.curlrc out of the request.
    var args = ["-q", "-s", "--compressed",
      "-L", "--max-redirs", "5", "--proto", "=https,http", "--proto-redir", "=https,http",
      "--max-time", String(timeoutMs / 1000),
      "--max-filesize", String(maxBytes),
      "-A", userAgent,
      "-w", "\n%{http_code}"]
    var method = String(spec.method || "GET").toUpperCase()
    if (spec.body) args.push("--data-raw", String(spec.body))
    if (method !== "GET" && !(method === "POST" && spec.body)) args.push("-X", method)
    var headers = spec.headers || {}
    for (var name in headers) args.push("-H", name + ": " + headers[name])
    args.push("--url", String(spec.url))

    ++generation
    pendingExit = false
    pendingStream = false
    pendingCode = 0
    if (proc.running) proc.running = false
    proc.command = ["bash", "-c", script, "more-weather-request", String(maxBytes + 16)].concat(args)
    proc.token = generation
    // curl's --max-time is the real timeout; this only catches a stuck process.
    timeoutTimer.interval = timeoutMs + 5000
    timeoutTimer.restart()
    proc.running = true
  }

  function settle() {
    if (!pendingExit || !pendingStream) return
    var exitCode = pendingCode
    var out = String(collector.text || "")
    var cut = out.lastIndexOf("\n")
    var httpStatus = cut >= 0 ? Number(out.slice(cut + 1)) || 0 : 0
    var body = cut >= 0 ? out.slice(0, cut) : ""
    var ok = exitCode === 0 && httpStatus >= 200 && httpStatus < 300
    if (exitCode === 0 && !ok) exitCode = httpStatus > 0 ? 22 : 7
    if (exitCode === 63) console.warn("weather: response over size limit dropped:", String(request && request.url || "").split("?")[0])
    status = httpStatus
    errorText = !ok && exitCode === 22 ? body.slice(0, maxErrorChars) : ""
    complete(exitCode, ok ? body : "")
  }

  function complete(exitCode, text) {
    timeoutTimer.stop()
    generation++
    running = false
    finished(text)
    exited(exitCode)
  }

  function cancel() {
    timeoutTimer.stop()
    generation++
    if (proc.running) proc.running = false
  }

  property Process proc: Process {
    property int token: 0

    stdout: StdioCollector {
      id: collector
      onStreamFinished: {
        if (http.proc.token !== http.generation) return
        http.pendingStream = true
        http.settle()
      }
    }

    onExited: function(exitCode) {
      if (token !== http.generation) return
      http.pendingCode = exitCode
      http.pendingExit = true
      http.settle()
    }
  }

  property Timer timeoutTimer: Timer {
    onTriggered: {
      http.generation++
      if (http.proc.running) http.proc.running = false
      http.running = false
      http.finished("")
      http.exited(28)
    }
  }
}
