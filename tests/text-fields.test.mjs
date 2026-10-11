// Text fields rest while idle: every editable text in the plugin's QML is
// the plugin's <Prefix>TextField.qml, built on TextEdit (whose clipboard
// check only looks at the offered formats; Qt 6.11 and 6.12.0 read the
// payload for TextInput's) and read-only without keyboard focus. The
// clipboard is read only when you paste. Shared by the More plugins.
import { test } from "node:test"
import assert from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { root } from "./load.mjs"

function qmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name === "node_modules") return []
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return qmlFiles(path)
    return entry.name.endsWith(".qml") ? [path] : []
  })
}

const wrapperName = /^[A-Z][a-z]+TextField\.qml$/
const files = qmlFiles(root)
const wrappers = files.filter((path) => wrapperName.test(relative(root, path)))

test("one text field wrapper at the root, on TextEdit, read-only while idle", () => {
  assert.equal(wrappers.length, 1, "a <Prefix>TextField.qml at the root")
  const source = readFileSync(wrappers[0], "utf8")
  assert.match(source, /^(T\.TextArea|TextEdit) \{\s*$/m)
  assert.match(source, /^\s*readOnly: !activeFocus\s*$/m)
})

test("no other QML file declares a text input of its own", () => {
  const found = files.filter((path) => !wrappers.includes(path)).flatMap((path) =>
    readFileSync(path, "utf8").split("\n").flatMap((line, i) =>
      /(^|[^\w])(TextField|TextInput|TextEdit|TextArea)\s*\{/.test(line.replace(/\/\/.*$/, ""))
        ? [`${relative(root, path)}:${i + 1}: ${line.trim()}`] : []))
  assert.deepEqual(found, [])
})
