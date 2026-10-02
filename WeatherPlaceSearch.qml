import QtQuick
import Quickshell
import "I18n.js" as I18n
import "PlaceSearch.js" as PlaceSearch

// Searching a place by name, shared by the More plugins (tools/sync-shared.sh).
// Set `query`; 350 ms after the last change Open-Meteo's geocoder is asked.
// `results` holds { name, region, country, countryCode, lat, lon, tz }
// (PlaceSearch.js), `index` the marked one; `pick()` hands it out through
// `picked(place)`.
// Nominatim is never asked while typing: its usage policy forbids
// autocomplete and allows one request a second. Only `submit()` (Enter on
// a query Open-Meteo knows nothing about) asks it, at most once a second.
// One request runs at a time: a query changed meanwhile waits for the
// debounce again, and an answer to an old query is dropped.
QtObject {
  id: search
  required property var panel

  property string query: ""
  property var results: []
  // The query `results` answer; while typing they may still be the last
  // query's.
  property string resultsQuery: ""
  readonly property bool resultsCurrent: resultsQuery === trimmed
  property int index: 0
  readonly property bool busy: debounce.running || http.running || nominatimDelay.running
  // Shortest query worth asking for.
  property int minimumLength: 2
  readonly property int maximumResults: 8
  readonly property bool offline: Quickshell.env("MORE_PLUGINS_OFFLINE") === "1"

  signal picked(var place)

  // Bumped by every request; an answer for an older one is ignored.
  property int generation: 0
  // The query and service of the request in flight or last answered.
  property string activeQuery: ""
  property string activeProvider: ""
  // The query Open-Meteo answered with nothing, and the one submit() asked
  // Nominatim for (or wants it for once Open-Meteo is done).
  property string emptyQuery: ""
  property string fallbackQuery: ""
  property double lastNominatimMs: 0

  readonly property string trimmed: query.trim()

  onQueryChanged: {
    fallbackQuery = ""
    // query.trim() here, not `trimmed`: that binding has not caught up yet
    // when the query jumps from empty to a whole name in one step.
    if (query.trim().length < minimumLength) {
      debounce.stop()
      nominatimDelay.stop()
      generation++
      http.running = false
      results = []
      resultsQuery = ""
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
    var at = i === undefined ? index : i
    var place = results[at]
    if (!place) return
    index = at
    picked(place)
  }

  // Enter without a result: Nominatim may know the place. True while that
  // search runs or waits, false when there is nothing more to ask.
  function submit() {
    var text = trimmed
    if (offline || text.length < minimumLength || (results.length > 0 && resultsCurrent) || fallbackQuery === text)
      return false
    fallbackQuery = text
    // Open-Meteo not done with this text yet: its empty answer goes on.
    if (emptyQuery !== text) {
      if (!debounce.running && !http.running) ask("open-meteo", text)
      return true
    }
    askNominatim(text)
    return true
  }

  function language() {
    return I18n.serviceLanguage(panel ? panel.interfaceLanguage : "en")
  }

  function ask(provider, text) {
    activeQuery = text
    activeProvider = provider
    if (offline) {
      results = []
      resultsQuery = text
      return
    }
    generation++
    http.running = false
    http.token = generation
    http.request = provider === "nominatim"
      ? PlaceSearch.nominatimRequest(text, language())
      : PlaceSearch.openMeteoRequest(text, language())
    if (provider === "nominatim") lastNominatimMs = Date.now()
    http.running = true
  }

  // From the event loop (an answer's process is still winding down), and
  // not sooner than a second after the last Nominatim request.
  function askNominatim(text) {
    nominatimDelay.text = text
    nominatimDelay.interval = Math.max(0, Math.min(1000, lastNominatimMs + 1000 - Date.now()))
    nominatimDelay.restart()
  }

  function answer(text, token) {
    if (token !== generation) return
    // The text moved on while this ran: the debounce asks for the new one.
    if (activeQuery !== trimmed) {
      if (trimmed.length >= minimumLength && !debounce.running) debounce.restart()
      return
    }
    var places = activeProvider === "nominatim"
      ? PlaceSearch.parseNominatim(text) : PlaceSearch.parseOpenMeteo(text)
    if (!places.length && activeProvider === "open-meteo") {
      emptyQuery = activeQuery
      if (fallbackQuery === activeQuery) {
        askNominatim(activeQuery)
        return
      }
    }
    if (!places.length && text === "") console.warn("more-weather: place search failed (" + activeProvider + ")")
    results = PlaceSearch.dedupe(places, maximumResults)
    resultsQuery = activeQuery
    index = 0
  }

  property Timer debounce: Timer {
    interval: 350
    // Busy: its answer sees the new text and starts this again.
    onTriggered: if (search.trimmed.length >= search.minimumLength && !search.http.running)
      search.ask("open-meteo", search.trimmed)
  }

  property Timer nominatimDelay: Timer {
    property string text: ""
    onTriggered: if (text === search.trimmed) search.ask("nominatim", text)
  }

  property WeatherRequest http: WeatherRequest {
    property int token: 0
    onFinished: function(text) { search.answer(text, token) }
  }
}
