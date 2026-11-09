import QtQuick
import "Model.js" as Model

// Warning sources that need several requests in a row, run one step at a
// time through a single request:
//  - CAP feeds: MetService (New Zealand), SMN (Argentina) and, through the
//    Alert Hub register, the official feeds of the place's country. Each
//    feed lists one CAP document per alert; the documents are fetched and
//    reduced to bounded records when their area holds the place. Recently
//    used records are cached only while the current feeds reference them.
//  - JMA (Japan): the place is matched to its municipality through JMA's
//    area boxes and outlines, the municipality to its forecast office, and
//    the office's warning file read for that municipality. The matching is
//    kept per place, so a refresh costs a single request.
// The result goes to panel.acceptAlertReport; a failure to
// panel.alertLookupFailed, which moves on in the provider chain. Every
// document is parsed in ModelWorker.js, off the shell's main thread; results
// of a lookup that has since been cancelled or restarted are dropped.
QtObject {
  id: lookup
  required property var panel

  readonly property string jmaBase: "https://www.jma.go.jp/bosai/"
  readonly property string alertHubRegister: "https://alert-hub-sources.s3.amazonaws.com/json"
  // Feed entries older than this are past any warning's validity.
  readonly property double maxEntryAgeMs: 10 * 24 * 60 * 60 * 1000

  property string providerId: ""
  property real latitude: 0
  property real longitude: 0
  property string step: ""
  property var queue: []
  property var feedQueue: []
  property var collected: []
  property string countryCode: ""
  // Bounded URL cache of flat records, plus this refresh's download budget.
  property var capRetention: Model.newAlertRetention()
  property string alertHubSources: ""
  // JMA lookups kept across refreshes.
  property string jmaBoxes: ""
  property string jmaAreas: ""
  property var jmaPlaces: ({})
  property string jmaAreaCode: ""

  readonly property bool running: step !== ""

  // Parser calls in flight: id → continuation; the generation drops the
  // answers of a lookup that has since been cancelled.
  property int generation: 0
  property int nextCallId: 0
  property var pendingCalls: ({})

  function parse(fn, args, done) {
    var id = ++nextCallId
    var calls = pendingCalls
    calls[id] = { generation: generation, done: done }
    pendingCalls = calls
    parser.sendMessage({ id: id, fn: fn, args: args })
  }

  property WorkerScript parser: WorkerScript {
    source: "ModelWorker.js"
    onMessage: function(message) {
      var calls = lookup.pendingCalls
      var call = calls[message.id]
      delete calls[message.id]
      lookup.pendingCalls = calls
      if (!call || call.generation !== lookup.generation) return
      if (message.error) console.warn("more-weather: warning parser failed:", message.error)
      call.done(message.error ? null : message.result)
    }
  }

  // Panel begins the budget once per refresh, shared by provider fallbacks.
  function start(provider, lat, lon) {
    cancel()
    providerId = provider.id
    latitude = Number(lat)
    longitude = Number(lon)
    collected = []
    countryCode = String(provider.countryCode || "")
    if (providerId === "metservice") {
      startFeeds(["https://alerts.metservice.com/cap/rss"])
    } else if (providerId === "smn") {
      startFeeds(["https://ssl.smn.gob.ar/CAP/AR.php"])
    } else if (providerId === "alert-hub") {
      if (alertHubSources === "") fetch("hub-register", alertHubRegister, 15000)
      else startAlertHubFeeds()
    } else if (providerId === "jma") {
      var known = jmaPlaces[placeKey()]
      if (known) {
        jmaAreaCode = known.area
        fetch("jma-warnings", jmaBase + "warning/data/r8/" + known.office + ".json", 10000)
      } else if (jmaBoxes === "") {
        fetch("jma-boxes", jmaBase + "common/const/class20relm.json", 15000)
      } else {
        jmaMatchArea()
      }
    } else {
      fail()
    }
  }

  function cancel() {
    if (running) Model.endAlertRefresh(capRetention)
    generation++
    request.running = false
    step = ""
    queue = []
    feedQueue = []
    collected = []
    pendingCalls = ({})
  }

  function placeKey() {
    return latitude.toFixed(3) + "," + longitude.toFixed(3)
  }

  function fetch(nextStep, url, timeoutMs) {
    step = nextStep
    // Individual CAP messages and RSS/Atom indexes fit a small ceiling.
    // Registry and JMA geographic files keep their existing 8 MiB limit.
    var maxBytes = nextStep === "cap" || nextStep === "feed"
      ? Model.ALERT_CAP_RESPONSE_MAX_BYTES : 8 * 1024 * 1024
    request.request = { url: url, timeoutMs: timeoutMs || 10000, maxBytes: maxBytes }
    request.running = true
  }

  function finish(report) {
    Model.endAlertRefresh(capRetention)
    collected = []
    step = ""
    panel.acceptAlertReport(report, providerId)
  }

  function fail() {
    Model.endAlertRefresh(capRetention)
    collected = []
    step = ""
    panel.alertLookupFailed(providerId)
  }

  function startFeeds(urls) {
    feedQueue = urls.slice()
    queue = []
    nextFeed()
  }

  function startAlertHubFeeds() {
    parse("alertHubFeeds", [alertHubSources, countryCode], function(feeds) {
      if (!feeds) {
        fail()
        return
      }
      startFeeds(feeds.map(function(feed) { return feed.url }))
    })
  }

  function nextFeed() {
    if (!feedQueue.length) {
      nextCapDocument()
      return
    }
    var url = feedQueue[0]
    feedQueue = feedQueue.slice(1)
    fetch("feed", url, 15000)
  }

  // Cached hits count immediately; at most 32 unread URLs enter the queue.
  function takeFeedEntries(entries) {
    var known = Model.takeAlertFeedEntries(capRetention, entries, Date.now(), maxEntryAgeMs)
    collected = collected.concat(known).slice(0, Model.ALERT_MAX_PER_PLACE)
  }

  function nextCapDocument() {
    var link = Model.nextAlertDownload(capRetention)
    if (!link) {
      finish({ alerts: Model.withoutSupersededAlerts(collected), _providerId: providerId })
      return
    }
    fetch("cap", link, 10000)
  }

  function jmaMatchArea() {
    parse("jmaAreaCandidates", [jmaBoxes, latitude, longitude], function(candidates) {
      queue = candidates || []
      nextJmaOutline()
    })
  }

  function nextJmaOutline() {
    if (!queue.length) {
      // Out at sea or outside Japan: no municipality, so no warnings.
      finish({ alerts: [], _providerId: "jma" })
      return
    }
    jmaAreaCode = queue[0]
    queue = queue.slice(1)
    fetch("jma-outline", jmaBase + "common/const/geojson/class20s/" + jmaAreaCode + ".json", 10000)
  }

  function jmaAreaFound() {
    if (jmaAreas === "") {
      fetch("jma-areas", jmaBase + "common/const/area.json", 15000)
      return
    }
    parse("jmaOfficeCode", [jmaAreas, jmaAreaCode], function(office) {
      if (!office) {
        fail()
        return
      }
      var places = jmaPlaces
      places[placeKey()] = { area: jmaAreaCode, office: office }
      jmaPlaces = places
      fetch("jma-warnings", jmaBase + "warning/data/r8/" + office + ".json", 10000)
    })
  }

  property WeatherRequest request: WeatherRequest {
    onExited: function(exitCode) {
      if (exitCode === 0 || lookup.step === "") return
      // One feed or document that fails does not cost the others.
      if (lookup.step === "cap") lookup.nextCapDocument()
      else if (lookup.step === "feed") lookup.nextFeed()
      else lookup.fail()
    }
    onFinished: function(text) {
      var raw = String(text || "")
      if (!raw.trim()) return
      var current = lookup.step
      if (current === "hub-register") {
        lookup.alertHubSources = raw
        lookup.startAlertHubFeeds()
      } else if (current === "feed") {
        lookup.parse("capFeedEntries", [raw], function(entries) {
          if (entries) lookup.takeFeedEntries(entries)
          lookup.nextFeed()
        })
      } else if (current === "cap") {
        var link = String(request.request && request.request.url || "")
        lookup.parse("capAlerts", [raw, lookup.latitude, lookup.longitude, lookup.providerId, ""], function(alerts) {
          // Unreadable documents are remembered as empty, so they are not
          // asked for again while retained and referenced.
          var records = Model.keepAlertDocument(lookup.capRetention, link, alerts || [])
          lookup.collected = lookup.collected.concat(records).slice(0, Model.ALERT_MAX_PER_PLACE)
          lookup.nextCapDocument()
        })
      } else if (current === "jma-boxes") {
        lookup.jmaBoxes = raw
        lookup.jmaMatchArea()
      } else if (current === "jma-outline") {
        lookup.parse("jmaAreaContains", [raw, lookup.latitude, lookup.longitude], function(contains) {
          if (contains) lookup.jmaAreaFound()
          else lookup.nextJmaOutline()
        })
      } else if (current === "jma-areas") {
        lookup.jmaAreas = raw
        lookup.jmaAreaFound()
      } else if (current === "jma-warnings") {
        lookup.parse("jmaAlertReport", [raw, lookup.jmaAreaCode], function(report) {
          if (report) lookup.finish(report)
          else lookup.fail()
        })
      }
    }
  }
}
