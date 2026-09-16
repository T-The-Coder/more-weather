import { radarMotionSeries } from "./RadarMotion.mjs"

// Runs radarMotionSeries off the GUI thread, which it would otherwise freeze
// for about half a second on every radar refresh, in the bar as well.
WorkerScript.onMessage = function(message) {
  var motion = null
  try {
    motion = radarMotionSeries(JSON.parse(message.text))
  } catch (e) {
    motion = null
  }
  WorkerScript.sendMessage({ token: message.token, motion: motion })
}
