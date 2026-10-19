#!/usr/bin/env bash
# The README pictures and preview.png, from live data: like ui-shots.sh a
# throwaway HOME (with the current theme linked in) and runtime directory,
# but with the network, the places of MW_PLACES saved ("name,lat,lon"
# separated by ";"; six famous cities by default: New York, London, Tokyo,
# Dubai, Sydney, Reykjavík) and tests/ui/showcase.qml stepping through the
# scenes it is told by MW_SCENES (see there). The pictures go to the
# output directory; tools/build-preview.sh puts the preview together from
# them (its header has the variables for the current pictures).
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
# MW_CACHE: the cache of an earlier run (its home/.cache/more-weather) to
# start from, so the globe's model data is not asked for again: a run takes
# about 1,500 of Open-Meteo's calls, and it allows 5,000 an hour.
if [ -n "${MW_CACHE:-}" ]; then
  mkdir -p "$work/home/.cache/more-weather"
  cp -r "$MW_CACHE/." "$work/home/.cache/more-weather/"
fi
theme="$HOME/.local/state/omarchy/current/theme"
[ -e "$theme" ] && ln -s "$theme" "$work/home/.local/state/omarchy/current/theme"
places=${MW_PLACES:-"New York,40.7128,-74.006;London,51.5074,-0.1278;Tokyo,35.6895,139.6917;Dubai,25.2048,55.2708;Sydney,-33.8688,151.2093;Reykjavík,64.1466,-21.9426"}
MW_PLACES="$places" python3 - "$settings" <<'PY'
import json, os, sys
places = []
for item in os.environ["MW_PLACES"].split(";"):
    name, lat, lon = item.rsplit(",", 2)
    places.append({"name": name, "latitude": float(lat), "longitude": float(lon)})
with open(os.path.join(sys.argv[1], "more-weather-locations.json"), "w") as f:
    json.dump(places, f, ensure_ascii=False, indent=2)
with open(os.path.join(sys.argv[1], "weather.json"), "w") as f:
    json.dump(places[0], f, ensure_ascii=False)
PY
# Factory general settings (English from LANG below), the widget in the
# bar's centre, and More Time's cities for the import button.
echo '{}' > "$settings/more-weather-general.json"
mkdir -p "$work/home/.config/omarchy"
echo '{"version": 1, "bar": {"layout": {"left": [], "center": [{"id": "more-weather"}], "right": []}}}' \
  > "$work/home/.config/omarchy/shell.json"
echo '[{"name": "Tokyo", "country": "Japan", "tz": "Asia/Tokyo", "lat": 35.6895, "lon": 139.6917}]' \
  > "$settings/more-time-cities.json"
# MW_DISPLAY=headless: draw on the GPU in a real Wayland window instead of
# offscreen (where the globe falls back to its Canvas), on a headless
# Hyprland output of its own: a 1920 × 1200 monitor MWSHOT right of the
# others with the workspace "mwshot", and the harness's windows (class
# more-weather-showcase) floating there, silent and never focused. Nothing
# on the other monitors is focused, moved or switched; the output goes again
# when the run ends, also on an error. Runtime rules only (hyprctl eval);
# they match nothing else and go with the next config reload.
platform=offscreen
if [ "${MW_DISPLAY:-}" = headless ]; then
  output=MWSHOT
  hyprctl eval "hl.monitor({ output = \"$output\", mode = \"1920x1200@60\", position = \"auto-right\", scale = 1 })" >/dev/null
  hyprctl eval "hl.workspace_rule({ workspace = \"name:mwshot\", monitor = \"$output\", default = true })" >/dev/null
  hyprctl eval "hl.window_rule({ match = { class = \"^more-weather-showcase$\" }, float = true, workspace = \"name:mwshot silent\", no_focus = true, no_anim = true })" >/dev/null
  trap 'hyprctl output remove "$output" >/dev/null 2>&1' EXIT
  hyprctl output create headless "$output" >/dev/null
  platform=wayland
  # The run has a runtime directory of its own: the compositor's socket by
  # its full path.
  wayland="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/${WAYLAND_DISPLAY:-wayland-1}"
fi
env -u DBUS_SESSION_BUS_ADDRESS -u XDG_DATA_HOME -u XDG_CONFIG_HOME -u XDG_STATE_HOME HOME="$work/home" XDG_RUNTIME_DIR="$work/run" XDG_CACHE_HOME="$work/home/.cache" \
  MW_SCENES="${MW_SCENES:-}" LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 MW_SHOTS="$out" QT_QPA_PLATFORM=$platform QS_APP_ID=more-weather-showcase WAYLAND_DISPLAY="${wayland:-}" \
  timeout 1500 qs -n -p "$work/config" >"$work/log.txt" 2>&1
echo "log: $work/log.txt"
echo "shots: $out"
grep -E "SHOT|STEP FAILED|GLOBE PATH" "$work/log.txt"
# Script errors fail the run: a TypeError, a ReferenceError or an undefined
# assigned to a property (as when a type of a newer Qt hides a singleton)
# is breakage even when every picture was taken.
errors=$(grep -E "TypeError|ReferenceError|Unable to assign \[undefined\]" "$work/log.txt")
if [ -n "$errors" ]; then
  echo "SCRIPT ERRORS:"
  echo "$errors" | sort | uniq -c | sort -rn | head -40
  exit 1
fi
