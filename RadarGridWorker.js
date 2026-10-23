// Bounded native RADOLAN validation runs off the shell thread.
Qt.include("Model.js")
WorkerScript.onMessage = function(message) {
  var report = radarGridReport(message.text)
  WorkerScript.sendMessage({ token: message.token, report: report })
}
