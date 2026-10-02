// Loads one of the plugin's JavaScript files (written for QML's engine) into
// a fresh context for Node's test runner: the QML pragma line is dropped and
// the file's functions and variables are read from the context. A file's
// `.import "<file>" as <Name>` lines are loaded the same way (relative to
// the importing file, each in a fresh context of its own) and the importing
// file sees each one under its name, as in QML.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

export const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function evaluate(path, globals) {
  const raw = readFileSync(path, "utf8")
  const context = vm.createContext(globals)
  for (const match of raw.matchAll(/^\.import "([^"]+)" as (\w+)$/gm))
    context[match[2]] = evaluate(join(dirname(path), match[1]), {})
  const source = raw.replace(/^\.(pragma|import)\b.*$/gm, "")
  vm.runInContext(source, context, { filename: path })
  return context
}

export function load(file) {
  return evaluate(join(root, file), { console })
}
