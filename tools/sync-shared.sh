#!/usr/bin/env bash
# Copies the files the two More plugins share between their repositories,
# which sit side by side (../<sibling id>, or MORE_SIBLING_DIR).
#   tools/sync-shared.sh from-sibling   the sibling's copies replace ours
#   tools/sync-shared.sh to-sibling     ours replace the sibling's
# The QML files carry the plugin's type prefix, id and product name, which
# are renamed on the way; the user agent keeps the target's version. The
# other files are copied as they are. tests/shared-files.test.mjs reads the
# lists below and fails when the copies drift apart.
set -euo pipefail

pair=(more-time more-weather)
renamed=(SwitchRow.qml SwitchToggle.qml BarPlacement.qml AppLauncherEntry.qml Request.qml Button.qml IconButton.qml PlaceSearch.qml BarHover.qml MoonSphere.qml GlobeSurface.qml)
verbatim=(tests/qml-syntax.sh tests/load.mjs tests/shared-files.test.mjs .github/workflows/tests.yml tools/sync-shared.sh PlaceSearch.js tests/place-search.test.mjs Moon.js tests/moon.test.mjs tests/plain-text.test.mjs tests/plain-text-sources.json Globe.js Sky.js data/globe-land.json tests/globe.test.mjs tests/sky.test.mjs EqualEarth.js tests/equal-earth.test.mjs GlobeView.js tests/globe-view.test.mjs shaders/globe.frag shaders/globe.frag.qsb tools/build-shaders.sh SettingsSearch.js tests/settings-search.test.mjs MotionGate.qml MoonView.js tests/moon-view.test.mjs tests/fixtures/moonview-reference.json tools/fetch-moonview-fixture.py Changelog.js tests/changelog.test.mjs)

root=$(cd "$(dirname "$0")/.." && pwd)

usage() {
  echo "usage: $0 [from-sibling|to-sibling]" >&2
  exit 2
}

# The plugin id from the manifest, else the directory name.
id_of() {
  local id
  id=$(sed -n 's/^ *"id": *"\([^"]*\)".*/\1/p' "$1/manifest.json" 2>/dev/null | head -n 1)
  echo "${id:-$(basename "$1")}"
}

# more-time → Time
prefix_of() {
  local name=${1#more-}
  echo "${name^}"
}

# The user agent version in the plugin's Request.qml, else major.minor of
# the manifest version.
ua_version_of() {
  local dir=$1 id=$2 version
  version=$(grep -o "$id/[0-9][0-9.]*" "$dir/$(prefix_of "$id")Request.qml" 2>/dev/null | head -n 1 | cut -d/ -f2 || true)
  [ -n "$version" ] || version=$(sed -n 's/^ *"version": *"\([0-9]*\.[0-9]*\).*/\1/p' "$dir/manifest.json" | head -n 1)
  echo "$version"
}

self=$(id_of "$root")
sibling=""
case "$self" in
  "${pair[0]}") sibling=${pair[1]} ;;
  "${pair[1]}") sibling=${pair[0]} ;;
  *) echo "$0: $self is not one of: ${pair[*]}" >&2; exit 2 ;;
esac
sibling_root=${MORE_SIBLING_DIR:-$(dirname "$root")/$sibling}
[ -d "$sibling_root" ] || { echo "$0: no sibling at $sibling_root" >&2; exit 1; }

case "${1:-}" in
  from-sibling) src=$sibling_root; src_id=$sibling; dst=$root; dst_id=$self ;;
  to-sibling) src=$root; src_id=$self; dst=$sibling_root; dst_id=$sibling ;;
  *) usage ;;
esac
src_prefix=$(prefix_of "$src_id")
dst_prefix=$(prefix_of "$dst_id")
ua=$(ua_version_of "$dst" "$dst_id")

# Writes through a temporary file and a rename, so this script can replace
# itself while it runs.
put() {
  local from=$1 to=$2 tmp
  mkdir -p "$(dirname "$to")"
  tmp=$(mktemp "$to.XXXXXX")
  cat > "$tmp"
  chmod --reference="$from" "$tmp"
  if [ -f "$to" ] && cmp -s "$tmp" "$to"; then
    rm -f "$tmp"
  else
    mv "$tmp" "$to"
    echo "updated ${to#"$dst"/}"
  fi
}

for name in "${renamed[@]}"; do
  from="$src/$src_prefix$name"
  [ -f "$from" ] || { echo "missing ${from#"$src"/}" >&2; continue; }
  sed -e "s#$src_id/[0-9][0-9.]*#$dst_id/$ua#g" \
      -e "s/More $src_prefix/More $dst_prefix/g" \
      -e "s/$src_id/$dst_id/g" \
      -e "s/\\b$src_prefix\\([A-Z]\\)/$dst_prefix\\1/g" \
      "$from" | put "$from" "$dst/$dst_prefix$name"
done

for name in "${verbatim[@]}"; do
  from="$src/$name"
  [ -f "$from" ] || { echo "missing $name" >&2; continue; }
  put "$from" "$dst/$name" < "$from"
done
