// Runs Model.js parsers off the shell's main thread (WorkerScript), for the
// large documents of the warning lookup: Alert Hub's register, CAP feeds and
// documents, JMA's area files (up to a few hundred kilobytes each), which
// would otherwise hold the bar for a moment while they are read. Also the
// check of every downloaded map picture (WeatherImageStore): decoding,
// rewriting and encoding a radar frame takes 40-50 ms in the shell's engine,
// which made the radar stutter while new frames came in.
Qt.include("Model.js")

// A downloaded picture (base64) → { code: 0, payload } holding only the
// picture chunks (Model.pngSanitized), or { code: 63 } (too large) or
// { code: 65 } (not a PNG the strict reader takes).
function imagePayload(b64, maxSide, maxPixels, maxBytes) {
  var raw = base64Decoded(b64)
  if (raw.length > maxBytes) return { code: 63 }
  var clean = pngSanitized(raw, maxSide, maxPixels, maxBytes)
  return clean === null ? { code: 65 } : { code: 0, payload: base64Encoded(clean) }
}

var calls = {
  imagePayload: imagePayload,
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
