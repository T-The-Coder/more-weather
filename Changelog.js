.pragma library

// The plugin's own CHANGELOG.md as data, for Settings → What's new. Shared
// verbatim by the More plugins (tools/sync-shared.sh); both keep their
// change log in the same form:
//
//   ## Unreleased                 a section; also "## 1.2.0 — 2026-10-03"
//                                 (em dash, en dash or hyphen before the date)
//   - **Lead:** text …            an item; the bold lead is its title
//     continued, indented         joins the item
//     - sub point                 joins the item as its own line "• sub point"
//   A paragraph or > quote        an item without a title
//
// Text before the first section (the title and intro) is left out. A blank
// line ends an item. Markdown is reduced to plain text: **bold**, *em*,
// `code`, [text](url) and \-escapes keep only their text.

// "**x**" → "x", "`x`" → "x", "[t](u)" → "t", "*x*" → "x", "\*" → "*";
// runs of spaces collapsed.
function plain(text) {
  return String(text || "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, "$1$2")
    .replace(/\\([\\`*_\[\]()#>-])/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim()
}

// An item's title and text: a leading "**Lead:**" or "**Lead.**" becomes the
// title (a final colon, full stop, comma or semicolon dropped), the rest
// the text.
function splitLead(raw) {
  var text = String(raw || "").trim()
  var match = /^\*\*([^*]+)\*\*\s*/.exec(text)
  if (!match) return { title: "", text: plain(text) }
  var title = match[1].trim().replace(/[:.,;]\s*$/, "").trim()
  return { title: plain(title), text: plain(text.slice(match[0].length)) }
}

// "## 1.2.0 — 2026-10-03" → { version, date, unreleased }; null for any
// other line.
function heading(line) {
  var match = /^##\s+(.+?)\s*$/.exec(line)
  if (!match || /^#/.test(match[1])) return null
  var title = match[1]
  if (/^unreleased$/i.test(title)) return { version: "", date: "", unreleased: true }
  var parts = /^\[?v?([0-9][^\s\]]*)\]?\s*(?:[—–-]\s*(.+))?$/.exec(title)
  if (parts) return { version: parts[1], date: parts[2] ? parts[2].trim() : "", unreleased: false }
  return { version: title, date: "", unreleased: false }
}

// The sections, newest first as written: [{ version, date, unreleased,
// items: [{ title, text }] }]. Empty for an empty or foreign text.
function parse(markdown) {
  var lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n")
  var sections = []
  var section = null
  var item = null
  function finish() {
    if (item && section) {
      var raw = item.lines.join("\n")
      if (raw.trim() !== "") section.items.push(splitLead(raw))
    }
    item = null
  }
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var head = heading(line)
    if (head) {
      finish()
      section = { version: head.version, date: head.date, unreleased: head.unreleased, items: [] }
      sections.push(section)
      continue
    }
    if (!section) continue
    if (/^\s*$/.test(line)) {
      finish()
      continue
    }
    if (/^#/.test(line)) {
      // A deeper heading: an item of its own, without a title.
      finish()
      item = { lines: [line.replace(/^#+\s*/, "")] }
      finish()
      continue
    }
    var bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      finish()
      item = { lines: [bullet[1]] }
      continue
    }
    var sub = /^\s+[-*]\s+(.*)$/.exec(line)
    var quote = /^>\s?(.*)$/.exec(line)
    var content = sub ? "• " + sub[1] : (quote ? quote[1] : line.trim())
    if (!item) item = { lines: [] }
    if (sub || item.lines.length === 0) item.lines.push(content)
    else item.lines[item.lines.length - 1] += " " + content
  }
  finish()
  return sections
}

if (typeof module !== "undefined") module.exports = { parse: parse, plain: plain, splitLead: splitLead, heading: heading }
