#!/usr/bin/env bash
# The README pictures and preview.png, from live data: like ui-shots.sh a
# throwaway HOME (with the current theme linked in) and runtime directory,
# but with the network, four saved places (Chicago, Tokyo, Tórshavn,
# London) and tests/ui/showcase.qml stepping through the scenes. The
# pictures go to the output directory; tools/build-preview.sh puts the
# preview together from them.
#   tests/ui-showcase.sh [output-dir]
set -u
root=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d "${TMPDIR:-/tmp}/more-weather-showcase.XXXXXX")
out=${1:-$work/shots}
shell="${OMARCHY_PATH:-/usr/share/omarchy}/shell"
settings="$work/home/.local/state/omarchy/settings"
mkdir -p "$out" "$work/config" "$settings" "$work/home/.local/state/omarchy/current" "$work/run"
chmod 700 "$work/run"
ln -s "$shell/Commons" "$work/config/Commons"
ln -s "$shell/Ui" "$work/config/Ui"
ln -s "$root" "$work/config/Weather"
cp "$root/tests/ui/showcase.qml" "$work/config/shell.qml"
theme="$HOME/.local/state/omarchy/current/theme"
[ -e "$theme" ] && ln -s "$theme" "$work/home/.local/state/omarchy/current/theme"
cat > "$settings/more-weather-locations.json" <<'JSON'
[
  {"name": "Chicago", "latitude": 41.8781, "longitude": -87.6298},
  {"name": "Tokyo", "latitude": 35.6895, "longitude": 139.6917},
  {"name": "Tórshavn", "latitude": 62.0107, "longitude": -6.7741},
  {"name": "London", "latitude": 51.5074, "longitude": -0.1278}
]
JSON
echo '{"name": "Chicago", "latitude": 41.8781, "longitude": -87.6298}' > "$settings/weather.json"
# Factory general settings (English from LANG below), the widget in the
# bar's centre, and More Time's cities for the import button.
echo '{}' > "$settings/more-weather-general.json"
mkdir -p "$work/home/.config/omarchy"
echo '{"version": 1, "bar": {"layout": {"left": [], "center": [{"id": "more-weather"}], "right": []}}}' \
  > "$work/home/.config/omarchy/shell.json"
echo '[{"name": "Tokyo", "country": "Japan", "tz": "Asia/Tokyo", "lat": 35.6895, "lon": 139.6917}]' \
  > "$settings/more-time-cities.json"
env -u DBUS_SESSION_BUS_ADDRESS -u XDG_DATA_HOME -u XDG_CONFIG_HOME -u XDG_STATE_HOME HOME="$work/home" XDG_RUNTIME_DIR="$work/run" XDG_CACHE_HOME="$work/home/.cache" \
  LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 MW_SHOTS="$out" QT_QPA_PLATFORM=offscreen \
  timeout 400 qs -n -p "$work/config" >"$work/log.txt" 2>&1
echo "log: $work/log.txt"
echo "shots: $out"
grep -E "SHOT|STEP FAILED" "$work/log.txt"
