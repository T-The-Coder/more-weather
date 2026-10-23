import QtQuick
import Quickshell
import Quickshell.Io
import "Model.js" as Model

// Downloads map pictures (radar frames, basemaps) to files before any Image
// sees them. An Image with a remote source lets Qt buffer the whole response
// and then decode a PNG of whatever dimensions it declares, both without a
// ceiling, and the decoder also inflates whatever metadata chunks the file
// carries. Here curl stops at `maxBytes`, `head -c` cuts just above it, and
// the raw download, kept under a temporary name, comes back as base64;
// Model.pngSanitized rewrites it chunk by chunk to picture data only (header
// within `maxDimension`, palette, transparency, image data, end), and only
// that rewrite is written to the cache file the Image loads. The raw file is
// deleted either way.
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
  readonly property string userAgent: "more-weather/3.2 (+https://github.com/T-The-Coder/more-weather)"
  readonly property string cacheDir: (Quickshell.env("XDG_CACHE_HOME") || (Quickshell.env("HOME") + "/.cache"))
    + "/more-weather/map-images"

  // MORE_PLUGINS_OFFLINE=1 (the screenshot runs in tests/) downloads nothing;
  // there "fixture:" URLs read MW_RADAR_FIXTURE instead (the globe's radar
  // tiles), through the same rewrite.
  readonly property bool offline: Quickshell.env("MORE_PLUGINS_OFFLINE") === "1"
  readonly property string fixtureFile: offline ? (Quickshell.env("MW_RADAR_FIXTURE") || "") : ""

  // Bumped whenever a picture's state changes; consumers bind to it.
  property int revision: 0

  // url -> { state: "queued" | "loading" | "ready" | "failed", path, generation, reuse }
  property var records: ({})
  property var queue: []
  property int active: 0

  // argv: url, target file, byte ceiling, timeout, user agent, reuse (1: an
  // existing file for this URL is used as it is, and "-" printed).
  // Prints the download as base64; exit codes are curl's, plus 63 for one
  // over the ceiling. The trap passes a cancel on to curl and head (Process
  // only signals bash).
  readonly property string script: "set -o pipefail\n"
    + "url=$1 out=$2 max=$3 secs=$4 ua=$5 reuse=$6\n"
    + "if [ \"$reuse\" = 1 ] && [ -s \"$out\" ]; then touch \"$out\"; echo -; exit 0; fi\n"
    + "tmp=\"$out.$$.raw.part\"\n"
    + "trap 'pkill -TERM -P $$; rm -f \"$tmp\"; exit 143' TERM\n"
    + "mkdir -p \"${out%/*}\" || exit 73\n"
    + "curl -q -s -f -L --max-redirs 5 --proto =https --proto-redir =https "
    + "--max-time \"$secs\" --max-filesize \"$max\" -A \"$ua\" --url \"$url\" "
    + "| head -c \"$((max + 1))\" > \"$tmp\" & wait $!\n"
    + "rc=$?\n"
    + "if [ $rc -ne 0 ]; then rm -f \"$tmp\"; exit $rc; fi\n"
    + "if [ \"$(stat -c %s \"$tmp\")\" -gt \"$max\" ]; then rm -f \"$tmp\"; exit 63; fi\n"
    + "base64 -w0 \"$tmp\"; rc=$?\n"
    + "rm -f \"$tmp\"\n"
    + "exit $rc\n"
  // The offline stand-in: argv fixture file, byte ceiling.
  readonly property string fixtureScript: "set -o pipefail; head -c \"$(($2 + 1))\" -- \"$1\" | base64 -w0"
  // argv: target file; stdin: the rewritten picture as base64.
  readonly property string writeScript: "out=$1 tmp=\"$1.$$.part\"\n"
    + "trap 'rm -f \"$tmp\"; exit 143' TERM\n"
    + "mkdir -p \"${out%/*}\" || exit 73\n"
    + "if base64 -d > \"$tmp\" && [ -s \"$tmp\" ]; then mv -f \"$tmp\" \"$out\"; else rm -f \"$tmp\"; exit 74; fi\n"

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
    // Only the map services' hosts (Model.IMAGE_HOSTS); anything else fails
    // at once, without a download.
    if (!Model.imageHostAllowed(url) && !isFixture(url)) {
      if (!records[url]) console.warn("more-weather: picture from an unknown host not fetched:", String(url).split("?")[0])
      records[url] = { state: "failed", path: "", generation: 0, reuse: false }
      revision++
      return
    }
    var record = records[url]
    if (record && (record.state === "queued" || record.state === "loading")) return
    if (record && !retry) return
    records[url] = {
      state: "queued",
      // "-p1": rewritten pictures; files of earlier versions, written
      // as downloaded, are never loaded and age out in the sweep.
      path: cacheDir + "/" + Qt.md5(url) + "-p1.png",
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

  function isFixture(url) {
    return fixtureFile !== "" && String(url).indexOf("fixture:") === 0
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
        command: isFixture(url) ? ["bash", "-c", fixtureScript, "more-weather-image", fixtureFile, String(maxBytes)]
          : offline ? ["bash", "-c", "exit 7"]
          : ["bash", "-c", script, "more-weather-image", url, record.path,
            String(maxBytes), String(timeoutSeconds), userAgent, record.reuse ? "1" : "0"]
      })
    }
  }

  // A download is in: "-" means the cached file was reused; else the
  // picture is rewritten (Model.pngSanitized) and the rewrite written to the
  // cache file, or the download refused (65).
  function fetched(url, exitCode, output) {
    var record = records[url]
    if (exitCode !== 0 || !record || record.state !== "loading" || output === "-") {
      settle(url, exitCode)
      return
    }
    var raw = Model.base64Decoded(output)
    if (raw.length > maxBytes) {
      settle(url, 63)
      return
    }
    var clean = Model.pngSanitized(raw, maxDimension, maxDimension * maxDimension, maxBytes)
    if (clean === null) {
      settle(url, 65)
      return
    }
    writeComponent.createObject(store, {
      url: url,
      payload: Model.base64Encoded(clean),
      command: ["bash", "-c", writeScript, "more-weather-image-write", record.path]
    })
  }

  function settle(url, exitCode) {
    active--
    if (Quickshell.env("MW_REQUEST_LOG") === "1") console.log("MAPIMG", exitCode, url.split("?")[0])
    var record = records[url]
    if (record && record.state === "loading") {
      record.state = exitCode === 0 ? "ready" : "failed"
      if (exitCode === 63 || exitCode === 65)
        console.warn("more-weather: map image rejected (" + (exitCode === 63 ? "too large" : "not a valid PNG") + "):", url.split("?")[0])
      revision++
    }
    pump()
  }

  // Waits for both the output and the exit, in whichever order they come.
  property Component fetchComponent: Component {
    Process {
      id: fetch
      property string url: ""
      property bool streamDone: false
      property int exitCode: -1
      running: true
      stdout: StdioCollector {
        id: collector
        onStreamFinished: {
          fetch.streamDone = true
          fetch.finish()
        }
      }
      onExited: function(exitCode) {
        fetch.exitCode = exitCode
        fetch.finish()
      }
      function finish() {
        if (!streamDone || exitCode < 0 || !url) return
        var done = url
        url = ""
        store.fetched(done, exitCode, String(collector.text || "").trim())
        fetch.destroy()
      }
    }
  }

  property Component writeComponent: Component {
    Process {
      id: writer
      property string url: ""
      property string payload: ""
      stdinEnabled: true
      running: true
      onStarted: {
        writer.write(payload)
        writer.payload = ""
        writer.stdinEnabled = false
      }
      onExited: function(exitCode) {
        store.settle(writer.url, exitCode)
        writer.destroy()
      }
    }
  }

  // Frames are keyed by time, so files go stale within hours. Removes
  // leftovers from earlier sessions at start and old pictures while running,
  // then the oldest beyond maxCacheBytes.
  property real maxCacheBytes: 200 * 1024 * 1024
  property Process sweepProc: Process {
    command: ["bash", "-c", "dir=$1 cap=$2; "
      + "find \"$dir\" -maxdepth 1 -type f \\( -name '*.png' -o -name '*.part' \\) -mmin +180 -delete; "
      + "find \"$dir\" -maxdepth 1 -type f \\( -name '*.png' -o -name '*.part' \\) -printf '%T@ %s %p\\n' "
      + "| sort -rn | awk -v cap=\"$cap\" '{ total += $2; if (total > cap) { sub(/^[^ ]+ [^ ]+ /, \"\"); print } }' "
      + "| xargs -r -d '\\n' rm -f --",
      "sweep", store.cacheDir, String(store.maxCacheBytes)]
  }

  property Timer sweepTimer: Timer {
    interval: 60 * 60 * 1000
    repeat: true
    running: true
    triggeredOnStart: true
    onTriggered: if (!store.sweepProc.running) store.sweepProc.running = true
  }
}
