import QtQuick
import Quickshell
import Quickshell.Io

// Downloads map pictures (radar frames, basemaps) to files before any Image
// sees them. An Image with a remote source lets Qt buffer the whole response
// and then decode a PNG of whatever dimensions it declares, both without a
// ceiling. Here curl stops at `maxBytes`, `head -c` cuts just above it, and a
// file only counts as ready once it starts with a PNG header whose width and
// height are within `maxDimension`; the Image then loads that local file.
//
// Every picture is fetched once per store however many Images show it (the
// background prefetch and the visible map share the same URLs), and at most
// `maxParallel` downloads run at a time. WeatherRemoteImage is the consumer:
// it calls request(), binds to revision and reads stateOf() / localUrl().
QtObject {
  id: store

  readonly property int maxBytes: 4 * 1024 * 1024
  // Real frames are 480x250 (WMS) and 512x512 (RainViewer).
  readonly property int maxDimension: 2048
  // DWD's GeoServer answers bursts with 502/503; the film now renews every few
  // minutes, so stay at three.
  readonly property int maxParallel: 3
  readonly property int timeoutSeconds: 20
  readonly property string userAgent: "more-weather/2.0 (+https://github.com/T-The-Coder/more-weather)"
  readonly property string cacheDir: (Quickshell.env("XDG_CACHE_HOME") || (Quickshell.env("HOME") + "/.cache"))
    + "/more-weather/map-images"

  // Bumped whenever a picture's state changes; consumers bind to it.
  property int revision: 0

  // url -> { state: "queued" | "loading" | "ready" | "failed", path, generation, reuse }
  property var records: ({})
  property var queue: []
  property int active: 0

  // argv: url, target file, byte ceiling, dimension ceiling, timeout, user
  // agent, reuse (1: an existing file for this URL is used as it is).
  // Exit codes are curl's, plus 65 for a file that is not an acceptable PNG.
  // The trap passes a cancel on to curl and head (Process only signals bash).
  readonly property string script: "set -o pipefail\n"
    + "url=$1 out=$2 max=$3 dim=$4 secs=$5 ua=$6 reuse=$7\n"
    + "if [ \"$reuse\" = 1 ] && [ -s \"$out\" ]; then touch \"$out\"; exit 0; fi\n"
    + "tmp=\"$out.$$.part\"\n"
    + "trap 'pkill -TERM -P $$; rm -f \"$tmp\"; exit 143' TERM\n"
    + "mkdir -p \"${out%/*}\" || exit 73\n"
    + "curl -q -s -f -L --max-redirs 5 --proto =https,http --proto-redir =https,http "
    + "--max-time \"$secs\" --max-filesize \"$max\" -A \"$ua\" --url \"$url\" "
    + "| head -c \"$((max + 1))\" > \"$tmp\" & wait $!\n"
    + "rc=$?\n"
    + "if [ $rc -ne 0 ]; then rm -f \"$tmp\"; exit $rc; fi\n"
    + "if [ \"$(stat -c %s \"$tmp\")\" -gt \"$max\" ]; then rm -f \"$tmp\"; exit 63; fi\n"
    + "hdr=$(od -An -tx1 -N24 \"$tmp\" | tr -d ' \\n')\n"
    + "case $hdr in 89504e470d0a1a0a0000000d49484452*) ;; *) rm -f \"$tmp\"; exit 65 ;; esac\n"
    + "w=$((16#${hdr:32:8})) h=$((16#${hdr:40:8}))\n"
    + "if [ \"$w\" -lt 1 ] || [ \"$h\" -lt 1 ] || [ \"$w\" -gt \"$dim\" ] || [ \"$h\" -gt \"$dim\" ]; then rm -f \"$tmp\"; exit 65; fi\n"
    + "mv -f \"$tmp\" \"$out\"\n"

  function stateOf(url) {
    var record = records[url]
    return record ? record.state : ""
  }

  // The generation makes a re-downloaded file a new pixmap-cache key, while
  // every Image showing the same download still shares one key.
  function localUrl(url) {
    var record = records[url]
    return record && record.state === "ready"
      ? "file://" + record.path + "?g=" + record.generation : ""
  }

  // Starts a download unless the picture is ready or on its way. `retry`
  // also restarts a failed one and replaces a ready file an Image could not
  // decode.
  function request(url, retry) {
    if (!url) return
    var record = records[url]
    if (record && (record.state === "queued" || record.state === "loading")) return
    if (record && !retry) return
    records[url] = {
      state: "queued",
      path: cacheDir + "/" + Qt.md5(url) + ".png",
      generation: record ? record.generation + 1 : 0,
      reuse: !retry && reusableUrl(url)
    }
    queue.push(url)
    revision++
    pump()
  }

  // Pictures whose URL pins their content: radar frames by time (DWD, NWS and
  // ECCC carry time=, RainViewer paths carry the run) and the static basemap.
  // Their files are taken from the cache when present, so the bar widget and
  // the app, which each run a store, download a frame only once. Frames
  // without a time and retries after a bad picture always download.
  function reusableUrl(url) {
    return url.indexOf("time=") >= 0 || url.indexOf("rainviewer.com") >= 0
      || url.indexOf("layers=dwd:bluemarble&") >= 0
  }

  function pump() {
    while (active < maxParallel && queue.length) {
      var url = queue.shift()
      var record = records[url]
      if (!record || record.state !== "queued") continue
      record.state = "loading"
      active++
      fetchComponent.createObject(store, {
        url: url,
        command: ["bash", "-c", script, "more-weather-image", url, record.path,
          String(maxBytes), String(maxDimension), String(timeoutSeconds), userAgent,
          record.reuse ? "1" : "0"]
      })
    }
  }

  function settle(url, exitCode) {
    active--
    var record = records[url]
    if (record && record.state === "loading") {
      record.state = exitCode === 0 ? "ready" : "failed"
      if (exitCode === 63 || exitCode === 65)
        console.warn("weather: map image rejected (" + (exitCode === 63 ? "too large" : "not a valid PNG") + "):", url.split("?")[0])
      revision++
    }
    pump()
  }

  property Component fetchComponent: Component {
    Process {
      id: fetch
      property string url: ""
      running: true
      onExited: function(exitCode) {
        store.settle(fetch.url, exitCode)
        fetch.destroy()
      }
    }
  }

  // Frames are keyed by time, so files go stale within hours. Removes
  // leftovers from earlier sessions at start and old pictures while running.
  property Process sweepProc: Process {
    command: ["find", store.cacheDir, "-maxdepth", "1", "-type", "f",
      "(", "-name", "*.png", "-o", "-name", "*.part", ")", "-mmin", "+180", "-delete"]
  }

  property Timer sweepTimer: Timer {
    interval: 60 * 60 * 1000
    repeat: true
    running: true
    triggeredOnStart: true
    onTriggered: if (!store.sweepProc.running) store.sweepProc.running = true
  }
}
