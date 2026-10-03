#!/usr/bin/env bash
# The globe's GPU surface on its own (tests/ui/shader/shell.qml,
# GLOBE-SHADER.md): synthetic lattices into WeatherGlobeTexture, projected
# by WeatherGlobeSurface, still and turning at 15 and 30 fps; logs frames,
# CPU time per phase and the texture's repaint cost, saves pictures, quits
# after about 11 s.
#   tests/ui-shader.sh [output-dir]        headless (offscreen, see below)
#   MW_SHADER_LIVE=1 tests/ui-shader.sh    one small window on the running
#                                          Wayland session, grabbed by grim
# Headless, Qt's offscreen platform has only the software scene graph, where
# shaders do not run (the surface reports available: false); MW_SHADER_QPA
# and MW_SHADER_RHI pick another platform plugin / RHI backend to try (none
# gave a GPU here: offscreen always loads the software backend, minimalegl
# finds no EGL config without a display). The texture's cost and the
# pictures' layout can be checked headless; the GPU numbers need the live run.
set -u
root=$(cd "$(dirname "$0")/.." && pwd)
# The work directory must lie outside the plugin: its Weather link would
# point back into itself, and Quickshell's scanner never finishes the loop.
case "${TMPDIR:-/tmp}/" in
  "$root"/*) echo "TMPDIR must lie outside $root" >&2; exit 2 ;;
esac
work=$(mktemp -d "${TMPDIR:-/tmp}/more-weather-shader.XXXXXX")
out=${1:-$work/out}
mkdir -p "$out" "$work/config"
ln -s "$root" "$work/config/Weather"
cp "$root/tests/ui/shader/shell.qml" "$work/config/shell.qml"

envs=(MW_SHADER_OUT="$out")
if [ "${MW_SHADER_LIVE:-}" = 1 ]; then
  envs+=(QT_QPA_PLATFORM=wayland)
else
  envs+=(QT_QPA_PLATFORM="${MW_SHADER_QPA:-offscreen}")
fi
[ -n "${MW_SHADER_RHI:-}" ] && envs+=(QSG_RHI_BACKEND="$MW_SHADER_RHI")

env "${envs[@]}" QSG_INFO=1 timeout 20 qs -n -p "$work/config" >"$work/log.txt" 2>&1 &
pid=$!
if [ "${MW_SHADER_LIVE:-}" = 1 ] && command -v grim >/dev/null && command -v hyprctl >/dev/null; then
  # The window on screen after the still phase began.
  sleep 1.8
  geometry=$(hyprctl clients -j 2>/dev/null | python3 -c '
import json, sys
for c in json.load(sys.stdin):
    if c.get("title") == "more-weather shader test":
        x, y = c["at"]; w, h = c["size"]; print(f"{x},{y} {w}x{h}"); break
')
  [ -n "$geometry" ] && grim -g "$geometry" "$out/shader-screen.png" && echo "screen: $out/shader-screen.png"
fi
wait "$pid"
echo "log: $work/log.txt"
echo "pictures: $out"
grep -E "SHADER|rhi|RHI|backend|GL_RENDERER|Driver|ERROR|Error|error|warn" "$work/log.txt" | head -40
