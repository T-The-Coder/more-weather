import QtQuick
import Quickshell
import Quickshell.Io
import "Weather" as Weather
import "Weather/GlobeProjection.js" as GlobeProjection
import "Weather/Sky.js" as Sky

// Demo and measurement for the globe's GPU surface (tests/ui-shader.sh,
// GLOBE-SHADER.md): one small window titled "more-weather shader test" with
// WeatherGlobeSurface fed by WeatherGlobeTexture from synthetic lattices (a
// smooth temperature field, a cloud band, a regional rain patch over
// Europe), a Canvas above it marking a few cities through GlobeProjection
// (they must sit on their land in the picture). It shows still, then turns at
// 15 and at 30 frames per second, logs the frames drawn and the process's
// CPU time (/proc/<pid>/stat) per phase, repaints the texture a few times
// (its cost), saves pictures (Europe, the flat map, zoomed in at z3), logs
// the resident memory, and quits after about 11 s.
//   MW_SHADER_OUT  where the pictures go (default /tmp)
//   MW_SHADER_SECONDS  seconds per turning phase (default 2.5)
ShellRoot {
  id: harness
  readonly property string out: Quickshell.env("MW_SHADER_OUT") || "/tmp"
  readonly property real phaseSeconds: Number(Quickshell.env("MW_SHADER_SECONDS")) || 2.5
  // 2026-10-03 16:00 UTC: the terminator crosses Europe and Africa.
  readonly property double shownMs: Date.UTC(2026, 9, 3, 16, 0)

  // ---- Synthetic lattices (row 0 in the south, as GlobeGrid's).
  function lattice(south, north, west, east, cols, rows, fn) {
    var values = []
    for (var r = 0; r < rows; r++) {
      var lat = south + (north - south) * r / (rows - 1)
      for (var c = 0; c < cols; c++) values.push(fn(lat, west + (east - west) * c / (cols - 1)))
    }
    return { south: south, north: north, west: west, east: east, cols: cols, rows: rows, values: values, wrap: west === -180 }
  }
  readonly property var lattices: {
    var rad = Math.PI / 180
    return {
      temperature: { global: lattice(-90, 90, -180, 180, 145, 73, function(lat, lon) {
        return 42 * Math.cos(lat * rad) - 18 + 6 * Math.sin(3 * lon * rad) * Math.cos(lat * rad)
      }), region: null },
      cloud: { global: lattice(-90, 90, -180, 180, 145, 73, function(lat, lon) {
        var d = (lat - 50 - 8 * Math.sin(2 * lon * rad)) / 7
        return 100 * Math.exp(-d * d)
      }), region: null },
      precipitation: { global: null, region: lattice(40, 60, -10, 30, 81, 41, function(lat, lon) {
        var dx = (lon - 10) / 6, dy = (lat - 50) / 4
        return 12 * Math.exp(-(dx * dx + dy * dy))
      }) }
    }
  }

  // ---- CPU time of this process: utime + stime (clock ticks) from
  //      /proc/<pid>/stat through a shell whose parent is this process.
  property var cpuStart: null
  property var phase: null
  function readCpu(then) {
    cpuReader.then = then
    cpuReader.running = true
  }
  Process {
    id: cpuReader
    property var then: null
    command: ["sh", "-c", "cut -d' ' -f14,15 /proc/$PPID/stat; getconf CLK_TCK"]
    stdout: StdioCollector {
      onStreamFinished: {
        var parts = text.trim().split(/\s+/)
        var ticks = Number(parts[0]) + Number(parts[1]), hz = Number(parts[2]) || 100
        if (cpuReader.then) cpuReader.then(ticks / hz * 1000)
      }
    }
  }
  function startPhase(name, fps) {
    readCpu(function(cpuMs) {
      harness.phase = { name: name, fps: fps, cpu: cpuMs, wall: Date.now(), frames: surface.frames }
      turner.interval = fps > 0 ? Math.round(1000 / fps) : 1000
      turner.running = fps > 0
    })
  }
  function endPhase(then) {
    var p = phase
    turner.running = false
    readCpu(function(cpuMs) {
      var wall = Date.now() - p.wall, cpu = cpuMs - p.cpu, frames = surface.frames - p.frames
      console.log("SHADER phase", p.name, "target", p.fps, "fps:", frames, "frames in", wall, "ms (",
        (frames * 1000 / wall).toFixed(1), "fps ), CPU", cpu.toFixed(0), "ms =", (100 * cpu / wall).toFixed(1),
        "% of a core,", frames ? (cpu / frames).toFixed(2) : "-", "ms CPU per frame")
      if (then) then()
    })
  }

  Timer {
    id: turner
    repeat: true
    onTriggered: surface.centerLon = surface.centerLon + 0.6
  }

  // The script: still, 15 fps, 30 fps, texture repaints, pictures, quit.
  property int step: 0
  readonly property var steps: [
    function() {
      console.log("SHADER api", surface.GraphicsInfo.api, "(software " + GraphicsInfo.Software + ") available", surface.available)
      var s = texture.stats
      console.log("SHADER texture", texture.width + "x" + texture.height, "first paints", s.count, "last", s.last, "ms, max", s.max, "ms")
      grabPicture("shader-europe")
      startPhase("still", 0)
    },
    function() { endPhase(function() { startPhase("turn15", 15) }) },
    function() { endPhase(function() { startPhase("turn30", 30) }) },
    function() {
      endPhase(function() {
        // The texture's repaint cost: one every 150 ms, CPU per repaint.
        texture.stats = { count: 0, total: 0, max: 0, last: 0 }
        texture.parts = { sample: 0, compose: 0, copy: 0, draw: 0, land: 0 }
        readCpu(function(cpuMs) {
          harness.phase = { name: "repaint", cpu: cpuMs, wall: Date.now() }
          repaintTimer.start()
        })
      })
    },
    function() {
      repaintTimer.stop()
      var p = harness.phase
      readCpu(function(cpuMs) {
        var s = texture.stats, n = Math.max(1, s.count)
        console.log("SHADER texture repaint", s.count, "times: script mean", (s.total / n).toFixed(1), "ms, max", s.max,
          "ms; CPU per repaint (all threads, with the capture)", ((cpuMs - p.cpu) / n).toFixed(1), "ms; script parts (ms per repaint)",
          JSON.stringify(Object.keys(texture.parts).reduce(function(o, k) { o[k] = Math.round(texture.parts[k] / n * 10) / 10; return o }, {})))
        grabPicture("shader-end")
      })
    },
    // The flat Equal Earth map from the same texture.
    function() {
      surface.style = "map"
      surface.centerLat = 0
      surface.centerLon = 0
    },
    function() { grabPicture("shader-map") },
    function() {
      // Zoomed in (z3, 8 × the radius) over the rain: the texture's limit.
      surface.style = "globe"
      surface.centerLat = 50
      surface.centerLon = 10
      surface.radius = 220 * 8
    },
    function() {
      grabPicture("shader-z3")
      rss.running = true
    }
  ]
  // The resident memory at the end, then quit.
  Process {
    id: rss
    command: ["sh", "-c", "grep -E 'VmRSS|VmHWM' /proc/$PPID/status | tr -s ' \\t' ' ' | tr '\\n' ' '"]
    stdout: StdioCollector {
      onStreamFinished: {
        console.log("SHADER memory", text.trim())
        quitTimer.start()
      }
    }
  }
  Timer {
    id: stepper
    interval: 1200
    running: true
    onTriggered: {
      harness.steps[harness.step]()
      harness.step++
      if (harness.step < harness.steps.length) {
        interval = harness.step === 1 ? 1000 : (harness.step === 4 ? 1500 : (harness.step > 4 ? 400 : harness.phaseSeconds * 1000))
        start()
      }
    }
  }
  Timer {
    id: repaintTimer
    interval: 150
    repeat: true
    onTriggered: texture.requestPaint()
  }
  Timer { id: quitTimer; interval: 400; onTriggered: Qt.quit() }
  // Hard stop.
  Timer { interval: 12000; running: true; onTriggered: { console.log("SHADER timeout"); Qt.quit() } }

  function grabPicture(name) {
    view.grabToImage(function(result) {
      result.saveToFile(harness.out + "/" + name + ".png")
      console.log("SHADER picture", harness.out + "/" + name + ".png")
    })
  }

  FloatingWindow {
    visible: true
    title: "more-weather shader test"
    implicitWidth: 480
    implicitHeight: 480
    // A fixed size: a tiling compositor floats it instead of resizing it.
    minimumSize: Qt.size(480, 480)
    maximumSize: Qt.size(480, 480)
    color: "#1e1e2e"

    Item {
      id: view
      anchors.fill: parent

      Weather.WeatherGlobeTexture {
        id: texture
        // Out of sight: the surface captures it (hideSource).
        x: 0
        y: 0
        layers: ["temperature", "cloud", "precipitation"]
        lattices: harness.lattices
        landColor: Qt.rgba(1, 1, 1, 0.22)
      }

      Weather.WeatherGlobeSurface {
        id: surface
        anchors.fill: parent
        centerLat: 30
        centerLon: 10
        radius: 220
        displayMs: harness.shownMs
        background: "#1e1e2e"
        textureSource: texture
      }

      // Cities through the Canvas path's projection: each must sit on its
      // land in the picture below; the sun's point too.
      Canvas {
        id: marks
        anchors.fill: parent
        // Off while turning: the measurement is the surface's alone.
        visible: !turner.running
        property string view: [surface.style, surface.centerLat, surface.centerLon, surface.radius].join()
        onViewChanged: requestPaint()
        onPaint: {
          var ctx = getContext("2d")
          ctx.reset()
          var P = GlobeProjection.make({ style: surface.style, centerLat: surface.centerLat, centerLon: surface.centerLon, zoom: surface.zoom,
            width: width, height: height, radius: surface.radius })
          var places = [[51.5, -0.1], [30.0, 31.2], [55.75, 37.6], [40.4, -3.7], [-33.9, 18.4], [64.1, -21.9]]
          ctx.fillStyle = "#ff3060"
          for (var i = 0; i < places.length; i++) {
            if (!P.at(places[i][0], places[i][1])) continue
            ctx.beginPath()
            ctx.arc(P.x, P.y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
          var sun = Sky.subsolarPoint(harness.shownMs)
          if (P.at(sun.lat, sun.lon)) Sky.paintSun(ctx, P.x, P.y, "#f5c542")
        }
      }
    }
  }
}
