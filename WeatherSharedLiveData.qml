import QtQuick
import Quickshell
import Quickshell.Io
import "Model.js" as Model

// Live reports shared between the bar widget (omarchy shell) and the
// standalone app through weather-live-shared.json. Whichever instance is due
// fetches, claims the cycle in this file first, and publishes its responses;
// the other one applies them instead of issuing its own requests. Keeps both
// on one refresh cycle and halves the load on rate-limited APIs.
//
// The hourly wind grids travel in the same file (windGrids, by map extent,
// with their own short claim in windGridClaim), independent of the forecast
// cycle and its location key. So does the five-minute DWD radar (radarLive,
// claimed in radarClaim), which renews more often than the forecast cycle.
Item {
  required property var panel

  property FileView sharedLiveFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-live-shared.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: loadSharedLiveData(text())
    onLoadFailed: loadSharedLiveData("")
  }

  function sharedInstanceId() {
    if (panel.sharedInstanceIdValue === "")
      panel.sharedInstanceIdValue = (panel.standaloneMode ? "app-" : "shell-") + Math.random().toString(36).slice(2, 10)
    return panel.sharedInstanceIdValue
  }

  function loadSharedLiveData(raw) {
    var parsed = null
    try {
      parsed = raw ? JSON.parse(String(raw)) : null
    } catch (e) {
      parsed = null
    }
    panel.sharedLiveData = parsed && parsed.version === 1 ? parsed : null
    var firstLoad = !panel.sharedLiveLoaded
    panel.sharedLiveLoaded = true
    applySharedWindGrids()
    if (firstLoad) {
      // The app waits a moment so a shell starting at the same time can
      // claim the cycle first instead of both fetching.
      if (panel.standaloneMode) {
        panel.sharedStartupTimer.restart()
      } else {
        panel.refreshTick(true)
        panel.windGridLoader.windGridDebounce.restart()
      }
    } else {
      applySharedLiveData()
      applySharedRadar()
    }
  }

  function applySharedLiveData() {
    var data = panel.sharedLiveData
    if (!data || !data.reports || data.locationKey !== panel.sharedLiveLocationKey) return false
    if (data.publishedBy === sharedInstanceId()) return false
    var publishedAt = Number(data.publishedAt || 0)
    var fetchedAt = Number(data.fetchedAt || 0)
    if (publishedAt <= panel.sharedLiveAppliedPublishedAt) return false
    if (fetchedAt <= 0 || fetchedAt < panel.lastSuccessfulUpdateMs) return false

    var reports = data.reports
    panel.applyingSharedLive = true
    panel.sharedLiveOwnFetch = false
    if (reports.placeReport) {
      panel.placeReport = reports.placeReport
      panel.placeResolvedKey = panel.locationQuery
    }
    if (reports.providerCountry) panel.providerCountry = reports.providerCountry
    if (reports.placeName) panel.placeName = reports.placeName
    if (reports.dailyForecastReport) {
      panel.dailyForecastReport = reports.dailyForecastReport
      panel.forecastProviderId = reports.forecastProviderId || panel.forecastProviderId
    }
    if (reports.uvReport) panel.uvReport = reports.uvReport
    if (reports.mosmixReport) panel.mosmixReport = reports.mosmixReport
    // Radar parts only when newer than what the five-minute updates brought.
    var radarAt = Number(reports.radarFetchedAt || fetchedAt)
    if (reports.radarReport && radarAt > panel.radarFetchedAtMs) {
      panel.radarReport = reports.radarReport
      panel.radarFetchedAtMs = radarAt
    }
    var motionAt = Number(reports.radarMotionAt || fetchedAt)
    if ((reports.radarMotion || reports.radarWet) && motionAt > panel.radarMotionAtMs) {
      if (reports.radarMotion) panel.radarMotion = reports.radarMotion
      if (reports.radarWet) panel.radarWet = reports.radarWet
      panel.radarMotionAtMs = motionAt
    }
    if (reports.rainViewerReport) panel.rainViewerReport = reports.rainViewerReport
    if (reports.alertReport) {
      panel.alertReport = reports.alertReport
      panel.alertActiveProviderId = reports.alertActiveProviderId || panel.alertActiveProviderId
    }
    panel.sharedLiveAppliedPublishedAt = publishedAt
    panel.recordForecastRefreshSuccess(fetchedAt)
    panel.relativeTimeNowMs = Date.now()
    panel.scheduleWeatherCachePersist()
    panel.applyingSharedLive = false
    // The forecast cycle's radar may be older than a five-minute update.
    applySharedRadar()
    return true
  }

  readonly property int radarClaimMs: 60 * 1000

  // Radar the other instance fetched for this place and published.
  function applySharedRadar() {
    var live = panel.sharedLiveData && panel.sharedLiveData.radarLive
    if (!live || live.locationKey !== panel.sharedLiveLocationKey || live.by === sharedInstanceId()) return false
    // The place grid and the worker's results are published separately (the
    // worker finishes a moment later) and are taken separately when newer.
    var at = Number(live.at || 0)
    var motionAt = Number(live.motionAt || 0)
    var takeReport = !!live.radarReport && at > panel.radarFetchedAtMs
    var takeMotion = (!!live.radarMotion || !!live.radarWet) && motionAt > panel.radarMotionAtMs
    if (!takeReport && !takeMotion) return false
    panel.applyingSharedLive = true
    if (takeReport) {
      panel.radarReport = live.radarReport
      panel.radarFetchedAtMs = at
    }
    if (takeMotion) {
      if (live.radarMotion) panel.radarMotion = live.radarMotion
      if (live.radarWet) panel.radarWet = live.radarWet
      panel.radarMotionAtMs = motionAt
    }
    panel.applyingSharedLive = false
    return true
  }

  function radarClaimedByOther() {
    var claim = panel.sharedLiveData && panel.sharedLiveData.radarClaim
    return !!claim && claim.locationKey === panel.sharedLiveLocationKey && claim.by !== sharedInstanceId()
      && Date.now() - Number(claim.at || 0) < radarClaimMs
  }

  function claimRadar() {
    if (!panel.sharedLiveLoaded) return
    var next = sharedDataWithout(["radarClaim"])
    next.radarClaim = { locationKey: panel.sharedLiveLocationKey, at: Date.now(), by: sharedInstanceId() }
    writeSharedLiveData(next)
  }

  // Publishes this instance's radar and releases its claim; called when the
  // grid arrives and again when the worker has analysed the wide grid.
  function publishSharedRadar() {
    if (!panel.sharedLiveLoaded || panel.applyingSharedLive || panel.radarFetchedAtMs <= 0) return
    var next = sharedDataWithout(["radarLive", "radarClaim"])
    next.radarLive = {
      locationKey: panel.sharedLiveLocationKey,
      at: panel.radarFetchedAtMs,
      motionAt: panel.radarMotionAtMs,
      by: sharedInstanceId(),
      radarReport: panel.radarReport,
      radarMotion: panel.radarMotion,
      radarWet: panel.radarWet
    }
    next.radarClaim = null
    writeSharedLiveData(next)
  }

  function writeSharedLiveData(next) {
    // Forecast and wind writes replace the whole file; each carries the
    // other's fields along.
    var current = panel.sharedLiveData
    if (current) {
      if (next.windGrids === undefined && current.windGrids) next.windGrids = current.windGrids
      if (next.windGridClaim === undefined && current.windGridClaim) next.windGridClaim = current.windGridClaim
      if (next.radarLive === undefined && current.radarLive) next.radarLive = current.radarLive
      if (next.radarClaim === undefined && current.radarClaim) next.radarClaim = current.radarClaim
    }
    panel.sharedLiveData = next
    sharedLiveFile.setText(JSON.stringify(next) + "\n")
  }

  // Everything but the given fields of the current file, for a wind write.
  function sharedDataWithout(fields) {
    var current = panel.sharedLiveData
    var next = ({ version: 1 })
    if (current) for (var key in current) if (fields.indexOf(key) < 0) next[key] = current[key]
    return next
  }

  readonly property int windGridClaimMs: 30 * 1000

  // A grid another instance published for this extent within the hour, if
  // it is not older than notBeforeMs (a manual refresh's time).
  function sharedWindGrid(key, notBeforeMs) {
    var grids = panel.sharedLiveData && panel.sharedLiveData.windGrids
    var entry = grids && grids[key]
    if (!entry || !entry.report) return null
    var at = Number(entry.at || 0)
    if (at < Number(notBeforeMs || 0) || Date.now() - at >= panel.windGridCacheMs) return null
    return entry
  }

  function windGridClaimedByOther(key) {
    var claim = panel.sharedLiveData && panel.sharedLiveData.windGridClaim
    return !!claim && claim.key === key && claim.by !== sharedInstanceId()
      && Date.now() - Number(claim.at || 0) < windGridClaimMs
  }

  function claimWindGrid(key) {
    if (!panel.sharedLiveLoaded) return
    var next = sharedDataWithout(["windGridClaim"])
    next.windGridClaim = { key: key, at: Date.now(), by: sharedInstanceId() }
    writeSharedLiveData(next)
  }

  function releaseWindGridClaim(key) {
    var claim = panel.sharedLiveData && panel.sharedLiveData.windGridClaim
    if (!panel.sharedLiveLoaded || !claim || claim.key !== key || claim.by !== sharedInstanceId()) return
    var next = sharedDataWithout(["windGridClaim"])
    next.windGridClaim = null
    writeSharedLiveData(next)
  }

  // Publishes a fetched grid and releases the claim. Keeps the few newest
  // grids of the last hour (zoom levels), each about 15 KB.
  function publishWindGrid(key, at, report) {
    if (!panel.sharedLiveLoaded || !key || !report) return
    var old = panel.sharedLiveData && panel.sharedLiveData.windGrids || ({})
    var entries = [{ key: key, at: at, by: sharedInstanceId(), report: report }]
    for (var existing in old) {
      if (existing === key || !old[existing]) continue
      if (Date.now() - Number(old[existing].at || 0) >= panel.windGridCacheMs) continue
      entries.push({ key: existing, at: old[existing].at, by: old[existing].by, report: old[existing].report })
    }
    entries.sort(function(a, b) { return b.at - a.at })
    var grids = ({})
    for (var i = 0; i < Math.min(4, entries.length); ++i)
      grids[entries[i].key] = { at: entries[i].at, by: entries[i].by, report: entries[i].report }
    var next = sharedDataWithout(["windGrids", "windGridClaim"])
    next.windGrids = grids
    next.windGridClaim = null
    writeSharedLiveData(next)
  }

  function applySharedWindGrids() {
    var grids = panel.sharedLiveData && panel.sharedLiveData.windGrids
    if (!grids) return
    for (var key in grids) {
      var entry = grids[key]
      if (!entry || !entry.report || entry.by === sharedInstanceId()) continue
      panel.windGridLoader.adoptSharedGrid(key, entry)
    }
  }

  function claimSharedRefresh(nowMs) {
    if (!panel.sharedLiveLoaded) return
    var current = panel.sharedLiveData && panel.sharedLiveData.locationKey === panel.sharedLiveLocationKey
      ? panel.sharedLiveData : null
    var next = ({})
    if (current) for (var key in current) next[key] = current[key]
    next.version = 1
    next.locationKey = panel.sharedLiveLocationKey
    next.refreshStartedAt = nowMs
    next.refreshStartedBy = sharedInstanceId()
    writeSharedLiveData(next)
  }

  function publishSharedLiveData() {
    if (!panel.sharedLiveLoaded || !panel.sharedLiveOwnFetch || panel.lastSuccessfulUpdateMs <= 0) return
    writeSharedLiveData({
      version: 1,
      locationKey: panel.sharedLiveLocationKey,
      fetchedAt: panel.lastSuccessfulUpdateMs,
      publishedAt: Date.now(),
      publishedBy: sharedInstanceId(),
      refreshStartedAt: 0,
      refreshStartedBy: "",
      reports: {
        placeReport: panel.placeReport,
        providerCountry: panel.providerCountry,
        placeName: panel.placeName,
        dailyForecastReport: panel.dailyForecastReport,
        forecastProviderId: panel.forecastProviderId,
        uvReport: panel.uvReport,
        mosmixReport: Model.compactMosmixReport(panel.mosmixReport),
        radarReport: panel.radarReport,
        radarFetchedAt: panel.radarFetchedAtMs,
        radarMotion: panel.radarMotion,
        radarWet: panel.radarWet,
        radarMotionAt: panel.radarMotionAtMs,
        rainViewerReport: panel.rainViewerReport,
        alertReport: panel.alertReport,
        alertActiveProviderId: panel.alertActiveProviderId
      }
    })
  }

  // Responses arrive over several seconds; publish once they have settled.
  property Timer sharedLivePublishTimer: Timer {
    interval: 3000
    onTriggered: publishSharedLiveData()
  }
}
