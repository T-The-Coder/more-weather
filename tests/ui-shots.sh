#!/usr/bin/env bash
# Screenshots of the app view without touching the real settings or the
# network: a throwaway HOME (with the current theme linked in) and runtime
# directory, synthetic weather for Tórshavn (tests/ui/fixtures/state.py),
# requests that never leave the machine (MORE_PLUGINS_OFFLINE), an offscreen
# Quickshell, and tests/ui/shell.qml stepping through the views.
#   tests/ui-shots.sh [output-dir]
# MW_SHOTS_ONLY=<regular expression> keeps only the matching pictures.
# MW_AUDIT=1 shoots the interface audit instead (every view and settings
# page at the popup's width and the app's).
# MW_AUDIT=glyphs measures every glyph-only control instead: the ink's
# offset from its box's centre (tests/ui/glyph-check.py; MW_GLYPH_BG is the
# theme's background, default #eff1f5).
set -u
root=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d "${TMPDIR:-/tmp}/more-weather-ui.XXXXXX")
out=${1:-$work/shots}
shell="${OMARCHY_PATH:-/usr/share/omarchy}/shell"
mkdir -p "$out" "$work/config" "$work/home/.local/state/omarchy/current" "$work/run"
chmod 700 "$work/run"
ln -s "$shell/Commons" "$work/config/Commons"
ln -s "$shell/Ui" "$work/config/Ui"
ln -s "$root" "$work/config/Weather"
cp "$root/tests/ui/shell.qml" "$work/config/shell.qml"
# MW_THEME=<theme directory> shoots in another theme than the current one.
theme="${MW_THEME:-$HOME/.local/state/omarchy/current/theme}"
[ -e "$theme" ] && ln -s "$theme" "$work/home/.local/state/omarchy/current/theme"
python3 "$root/tests/ui/fixtures/state.py" "$work/home"
# No session bus: a warning that comes due during the run notifies no one.
# The XDG directories default to the throwaway HOME.
env -u DBUS_SESSION_BUS_ADDRESS -u XDG_DATA_HOME -u XDG_CONFIG_HOME -u XDG_STATE_HOME HOME="$work/home" XDG_RUNTIME_DIR="$work/run" XDG_CACHE_HOME="$work/home/.cache" \
  MW_SHOTS="$out" MW_SHOTS_ONLY="${MW_SHOTS_ONLY:-}" MW_AUDIT="${MW_AUDIT:-}" MORE_PLUGINS_OFFLINE=1 QT_QPA_PLATFORM=offscreen \
  timeout 480 qs -n -p "$work/config" >"$work/log.txt" 2>&1
echo "log: $work/log.txt"
echo "shots: $out"
python3 "$root/tests/ui/rim-check.py" "$work/log.txt" "$out" >>"$work/log.txt"
[ "${MW_AUDIT:-}" = glyphs ] && python3 "$root/tests/ui/glyph-check.py" "$work/log.txt" "$out" "${MW_GLYPH_BG:-#eff1f5}" | tee "$out/glyphs.txt" | grep " OFF "
grep -E "SHOT|STATUS|CHECK|GLOBE|STEP FAILED|ERROR|WARN|Error|error" "$work/log.txt" | grep -v "^$" | head -80
