// Runs Model.js parsers off the shell's main thread (WorkerScript), for the
// large documents of the warning lookup: Alert Hub's register, CAP feeds and
// documents, JMA's area files (up to a few hundred kilobytes each), which
// would otherwise hold the bar for a moment while they are read.
Qt.include("Model.js")

var calls = {
  alertHubFeeds: alertHubFeeds,
  capFeedEntries: capFeedEntries,
  capAlerts: capAlerts,
  jmaAreaCandidates: jmaAreaCandidates,
  jmaAreaContains: jmaAreaContains,
  jmaOfficeCode: jmaOfficeCode,
  jmaAlertReport: jmaAlertReport
}

// { id, fn, args } → { id, result }, or { id, error } for an unknown call
// or a parser that threw.
WorkerScript.onMessage = function(message) {
  var call = calls[message.fn]
  if (!call) {
    WorkerScript.sendMessage({ id: message.id, error: "unknown call " + message.fn })
    return
  }
  try {
    WorkerScript.sendMessage({ id: message.id, result: call.apply(null, message.args || []) })
  } catch (e) {
    WorkerScript.sendMessage({ id: message.id, error: String(e) })
  }
}
