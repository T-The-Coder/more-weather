import QtQuick
import Quickshell
import Quickshell.Io
import "Model.js" as Model

// Desktop notifications from the bar instance: severe and extreme warnings
// and rain starting within 30 minutes. Announced keys persist, so a restart
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
    // Rain starting within 30 minutes: at most one notification per two
    // hours, so a shower that keeps shifting in the nowcast stays quiet.
    var rain = null
    if (!pending && panel.notifyRainSoon && panel.upcomingRain && panel.upcomingRain.minutes <= 30
        && !Model.weatherSeriesUsesCache(panel.rainNowcast)) {
      var recentRain = false
      for (var knownKey in known) if (knownKey.indexOf("rain:") === 0) recentRain = true
      if (!recentRain) {
        rain = panel.upcomingRain
        known["rain:" + rain.time] = now + 2 * 60 * 60 * 1000
        changed = true
      }
    }
    if (changed) {
      notifiedAlerts = known
      notifiedAlertsFile.setText(JSON.stringify(known) + "\n")
    }
    if (rain) {
      var rainBody = panel.i18n(rain.peak > 4 ? "rainStrong" : (rain.peak > 0.5 ? "rainMedium" : "rainWeak"))
        + " · " + panel.i18n("upToRate", { rate: panel.precipitationText(rain.peak, true) })
      if (panel.reportLocation) rainBody = panel.reportLocation + " · " + rainBody
      alertNotifyProc.command = ["notify-send", "--app-name=More Weather",
        "--icon=more-weather", "--urgency=normal",
        panel.i18n("rainNotificationTitle", { time: panel.upcomingRainTime }), rainBody]
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
