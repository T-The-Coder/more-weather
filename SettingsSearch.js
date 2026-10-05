.pragma library

// Searching the settings (shared by the More plugins, tools/sync-shared.sh):
// every row the settings draw is an entry with the texts it can be found
// by (its title and hint, its page, card and section, in the interface
// language and in English); a query matches an entry when every word of
// it is found in one of those texts, accents and case aside. Pure
// functions, tested in Node (tests/settings-search.test.mjs).

// Lower case without accents; "-" and "_" read as spaces, runs of spaces
// as one.
function fold(text) {
  var value = String(text === undefined || text === null ? "" : text).toLowerCase()
  if (typeof value.normalize === "function") value = value.normalize("NFD").replace(/[̀-ͯ]/g, "")
  return value.replace(/[_\-]/g, " ").replace(/\s+/g, " ").trim()
}

// The words of a query, folded.
function words(query) {
  var q = fold(query)
  return q === "" ? [] : q.split(" ")
}

// The entries ({ texts: [string], … }) every word of the query is found in,
// in their order; none for an empty query.
function matches(query, entries) {
  var wanted = words(query)
  if (!wanted.length) return []
  var out = []
  for (var i = 0; i < (entries || []).length; i++) {
    var texts = (entries[i].texts || []).map(fold)
    var all = true
    for (var w = 0; w < wanted.length && all; w++) {
      var found = false
      for (var t = 0; t < texts.length && !found; t++) found = texts[t].indexOf(wanted[w]) >= 0
      all = found
    }
    if (all) out.push(entries[i])
  }
  return out
}

// Consecutive entries with the same heading (an entry's `heading`) as
// groups: [{ heading, items }], in order.
function grouped(entries) {
  var groups = []
  for (var i = 0; i < (entries || []).length; i++) {
    var heading = String(entries[i].heading || "")
    var last = groups.length ? groups[groups.length - 1] : null
    if (last && last.heading === heading) last.items.push(entries[i])
    else groups.push({ heading: heading, items: [entries[i]] })
  }
  return groups
}

if (typeof module !== "undefined") module.exports = { fold: fold, words: words, matches: matches, grouped: grouped }
