import QtQuick
import Quickshell
import "I18n.js" as I18n
import "PlaceSearch.js" as PlaceSearch

// Searching a place by name, shared by the More plugins (tools/sync-shared.sh).
// Set `query`; 350 ms after the last change Open-Meteo's geocoder is asked,
// and Nominatim when Open-Meteo fails or knows nothing. `results` holds
// { name, region, country, countryCode, lat, lon, tz } (PlaceSearch.js),
// `index` the marked one; `pick()` hands it out through `picked(place)`.
// One request runs at a time: a query changed meanwhile is asked once the
// running one is done, and an answer to an old query is dropped.
QtObject {
  id: search
  required property var panel

  property string query: ""
  property var results: []
  property int index: 0
  readonly property bool busy: debounce.running || http.running || nextAsk.running
  // Shortest query worth asking for.
  property int minimumLength: 2
  readonly property int maximumResults: 8
  readonly property bool offline: Quickshell.env("MORE_PLUGINS_OFFLINE") === "1"

  signal picked(var place)

  // Bumped by every request; an answer for an older one is ignored.
  property int generation: 0
  property string activeQuery: ""
  property string activeProvider: ""

  onQueryChanged: {
    var text = query.trim()
    if (text.length < minimumLength) {
      debounce.stop()
      nextAsk.stop()
      generation++
      http.running = false
      results = []
      index = 0
      return
    }
    debounce.restart()
  }
  onResultsChanged: index = Math.max(0, Math.min(index, results.length - 1))

  function step(delta) {
    if (!results.length) return
    index = Math.max(0, Math.min(results.length - 1, index + delta))
  }

  function pick(i) {
    var place = results[i === undefined ? index : i]
    if (!place) return
    index = i === undefined ? index : i
    picked(place)
  }

  function language() {
    return I18n.serviceLanguage(panel ? panel.interfaceLanguage : "en")
  }

  function ask(provider) {
    activeQuery = query.trim()
    activeProvider = provider
    if (offline) {
      results = []
      return
    }
    generation++
    http.running = false
    http.token = generation
    http.request = provider === "nominatim"
      ? PlaceSearch.nominatimRequest(activeQuery, language())
      : PlaceSearch.openMeteoRequest(activeQuery, language())
    http.running = true
  }

  // From inside an answer the request's process is still winding down: the
  // next one starts from the event loop.
  function askLater(provider) {
    nextAsk.provider = provider
    nextAsk.restart()
  }

  function answer(text, token) {
    if (token !== generation) return
    // The text moved on while this ran: ask again for the current one.
    if (activeQuery !== query.trim()) {
      if (query.trim().length >= minimumLength) askLater("open-meteo")
      return
    }
    var places = activeProvider === "nominatim"
      ? PlaceSearch.parseNominatim(text) : PlaceSearch.parseOpenMeteo(text)
    if (!places.length && activeProvider === "open-meteo") {
      askLater("nominatim")
      return
    }
    if (!places.length && text === "") console.warn("more-weather: place search failed (Open-Meteo and Nominatim)")
    results = PlaceSearch.dedupe(places, maximumResults)
    index = 0
  }

  property Timer debounce: Timer {
    interval: 350
    onTriggered: {
      if (search.query.trim().length < search.minimumLength) return
      // Running: its answer sees the new text and asks again.
      if (!search.http.running && !search.nextAsk.running) search.ask("open-meteo")
    }
  }

  property Timer nextAsk: Timer {
    property string provider: ""
    interval: 0
    onTriggered: search.ask(provider)
  }

  property WeatherRequest http: WeatherRequest {
    property int token: 0
    onFinished: function(text) { search.answer(text, token) }
  }
}
