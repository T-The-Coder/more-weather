#!/usr/bin/env bash
# Every QML file must parse: a syntax error keeps the whole plugin from
# loading, in the bar and in the app. Only syntax is checked (--bare, and
# the [syntax] category): the Omarchy shell's modules are not available here.
set -u
lint=${QMLLINT:-$(command -v qmllint6 || command -v qmllint || echo /usr/lib/qt6/bin/qmllint)}
cd "$(dirname "$0")/.."
failed=0
for file in *.qml app/*.qml; do
  [ -f "$file" ] || continue
  if "$lint" --bare "$file" 2>&1 | grep "\[syntax\]"; then failed=1; fi
done
exit $failed
