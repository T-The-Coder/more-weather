#!/usr/bin/env bash
# Compiles the shaders under shaders/ into the .qsb files Qt's ShaderEffect
# loads (WeatherGlobeSurface.qml, GLOBE-SHADER.md). qsb is a build tool only
# (qt6-shadertools); the compiled files are committed, so the plugin needs
# nothing at runtime. One .qsb holds every variant: SPIR-V (Vulkan), GLSL ES
# 100 and 300 (OpenGL ES), GLSL 120, 150 and 330 (OpenGL compatibility and
# core), HLSL and MSL.
#   tools/build-shaders.sh
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
qsb=${QSB:-$(command -v qsb6 || command -v qsb || echo /usr/lib/qt6/bin/qsb)}
for src in "$root"/shaders/*.frag "$root"/shaders/*.vert; do
  [ -f "$src" ] || continue
  "$qsb" --glsl "100es,120,150,300es,330" --hlsl 50 --msl 12 -o "$src.qsb" "$src"
  echo "built ${src#"$root"/}.qsb"
done
