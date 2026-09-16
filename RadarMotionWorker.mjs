import { radarMotionSeries, radarWetFractions } from "./RadarMotion.mjs"

// Runs the radar grid analysis off the GUI thread, which it would otherwise
// freeze for about half a second on every radar refresh, in the bar as well.
WorkerScript.onMessage = function(message) {
  var motion = null
  var wet = null
  try {
    var report = JSON.parse(message.text)
    motion = radarMotionSeries(report)
    wet = radarWetFractions(report)
  } catch (e) {
    motion = null
  }
  WorkerScript.sendMessage({ token: message.token, motion: motion, wet: wet })
}
