// Loads one of the plugin's JavaScript files (written for QML's engine) into
// a fresh context for Node's test runner: the QML pragma line is dropped and
// the file's functions and variables are read from the context.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

export const root = join(dirname(fileURLToPath(import.meta.url)), "..")

export function load(file) {
  const source = readFileSync(join(root, file), "utf8").replace(/^\.pragma.*$/m, "")
  const context = vm.createContext({ console })
  vm.runInContext(source, context, { filename: file })
  return context
}
