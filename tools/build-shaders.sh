#!/usr/bin/env bash
# Compiles the plugin's shaders to Qt's .qsb format (qt6-shadertools). The
# .qsb files are committed, so installing the plugin needs no compiler.
set -eu
cd "$(dirname "$0")/.."
qsb=${QSB:-$(command -v qsb || echo /usr/lib/qt6/bin/qsb)}
for shader in shaders/*.frag shaders/*.vert; do
  [ -f "$shader" ] || continue
  "$qsb" --glsl "100 es,120,150" --hlsl 50 --msl 12 -o "$shader.qsb" "$shader"
  echo "$shader.qsb"
done
