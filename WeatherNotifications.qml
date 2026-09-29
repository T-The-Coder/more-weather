import QtQuick
import Quickshell
import Quickshell.Io
import "Model.js" as Model

// Desktop notifications from the bar instance: severe and extreme warnings
// and rain reaching the chosen strength within the chosen radius. Announced keys persist, so a restart
// stays quiet.
Item {
  required property var panel

  // Alerts already announced by desktop notification: { key: expiresMs }.
  property var notifiedAlerts: ({})
  property bool notifiedAlertsLoaded: false

  property FileView notifiedAlertsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-notified-alerts.json"
    atomicWrites: true
    printErrors: false
    onLoaded: {
      try { notifiedAlerts = JSON.parse(String(text() || "{}")) || ({}) }
      catch (e) { notifiedAlerts = ({}) }
      notifiedAlertsLoaded = true
      scheduleAlertNotifications()
    }
    onLoadFailed: {
      notifiedAlerts = ({})
      notifiedAlertsLoaded = true
      scheduleAlertNotifications()
    }
  }

  // Severe and extreme warnings for the shown place become one desktop
  // notification each. Only the bar instance notifies (the app would repeat
  // it) and only from live data; keys persist so a restart stays quiet.
  function scheduleAlertNotifications() {
    if (!panel.standaloneMode) alertNotifyDebounce.restart()
  }

  function alertNotificationKey(alert) {
    return [alert.id, alert.headline, alert.onset].join("|")
  }

  function sendAlertNotifications() {
    if (panel.standaloneMode || !notifiedAlertsLoaded) return
    if (panel.cacheFallbackActive || alertNotifyProc.running) return
    var now = Date.now()
    var known = ({})
    var changed = false
    for (var key in notifiedAlerts) {
      var until = Number(notifiedAlerts[key])
      if (!isFinite(until) || until > now) known[key] = notifiedAlerts[key]
      else changed = true
    }
    var pending = null
    for (var i = 0; panel.notifySevereWarnings && i < panel.liveActiveWeatherAlerts.length; ++i) {
      var alert = panel.liveActiveWeatherAlerts[i]
      if (alert.severity !== "severe" && alert.severity !== "extreme") continue
      var alertKey = alertNotificationKey(alert)
      if (known[alertKey] !== undefined) continue
      // One notification per pass; the next pass starts when it is sent.
      var expires = new Date(alert.expires || "").getTime()
      known[alertKey] = isNaN(expires) ? now + 2 * 24 * 60 * 60 * 1000 : expires
      changed = true
      pending = alert
      break
    }
    // Rain reaching the threshold within the radius's lead time. Once told,
    // the next two hours stay quiet unless it gets stronger (light to
    // moderate, moderate to heavy), so a shower that keeps shifting in the
    // nowcast is announced once.
    var rain = null
    var rainNext = panel.rainAlert
    if (!pending && panel.notifyRainSoon && rainNext
        && !Model.weatherSeriesUsesCache(panel.rainNowcast)) {
      var toldLevel = -1
      for (var knownKey in known) {
        var parts = knownKey.split(":")
        if (parts[0] !== "rain") continue
        // Keys before 2.5 carry no level: count them as light.
        var level = parts.length > 2 ? Number(parts[1]) : 0
        toldLevel = Math.max(toldLevel, isFinite(level) ? level : 0)
      }
      if (rainNext.level > toldLevel) {
        rain = rainNext
        known["rain:" + rainNext.level + ":" + rainNext.time] = now + 2 * 60 * 60 * 1000
        changed = true
      }
    }
    if (changed) {
      notifiedAlerts = known
      notifiedAlertsFile.setText(JSON.stringify(known) + "\n")
    }
    if (rain) {
      var rainBody = panel.i18n(["rainWeak", "rainMedium", "rainStrong"][rain.level])
        + " · " + panel.i18n("upToRate", { rate: panel.precipitationText(rain.peak, true) })
      if (panel.reportLocation) rainBody = panel.reportLocation + " · " + rainBody
      alertNotifyProc.command = ["notify-send", "--app-name=More Weather",
        "--icon=more-weather", "--urgency=normal",
        panel.i18n("rainNotificationTitle", { time: Qt.formatTime(rain.date, "HH:mm") }), rainBody]
      alertNotifyProc.running = true
      return
    }
    if (!pending) return
    var body = panel.warningPeriod(pending)
    if (panel.reportLocation) body = panel.reportLocation + " · " + body
    alertNotifyProc.command = ["notify-send", "--app-name=More Weather",
      "--icon=more-weather",
      "--urgency=" + (pending.severity === "extreme" ? "critical" : "normal"),
      pending.headline, body]
    alertNotifyProc.running = true
  }

  property Timer alertNotifyDebounce: Timer {
    interval: 2000
    onTriggered: sendAlertNotifications()
  }

  property Process alertNotifyProc: Process {
    onExited: scheduleAlertNotifications()
  }
}
