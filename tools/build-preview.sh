#!/usr/bin/env bash
# Puts the README pictures and preview.png together from a showcase run
# (tests/ui-showcase.sh): the app scenes as they are, the menu bar above
# the widget, and the preview with the feature list beside them. Colours
# come from the current Omarchy theme, the font is JetBrains Mono.
#   tools/build-preview.sh <showcase-output-dir>
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
in=${1:?usage: $0 <showcase-output-dir>}
theme="$HOME/.local/state/omarchy/current/theme/colors.toml"
color() { sed -n "s/^$1 *= *\"\\(#[0-9a-fA-F]*\\)\".*/\\1/p" "$theme" | head -n 1; }
bg=$(color background); bg=${bg:-#1a1b26}
fg=$(color foreground); fg=${fg:-#a9b1d6}
accent=$(color accent); accent=${accent:-#7aa2f7}
muted=$(color dark_foreground); muted=${muted:-#565f89}
line=$(color lighter_background); line=${line:-#24283b}
font=$(fc-match -f '%{file}' "JetBrainsMono Nerd Font:style=Regular")
bold=$(fc-match -f '%{file}' "JetBrainsMono Nerd Font:style=Bold")
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

for scene in chicago tokyo-radar torshavn-wind settings sources; do
  cp "$in/$scene.png" "$root/screenshots/$scene.png"
done

# The bar (its middle, as wide as the popup) over the popup, which has the
# accent line of the bar's edge above it.
magick "$in/bar.png" -gravity center -crop 512x32+0+0 +repage "$work/bar.png"
magick "$work/bar.png" \( -size 512x2 "xc:$accent" \) \( -size 512x8 "xc:$bg" \) \
  \( "$in/widget.png" -bordercolor "$accent" -border 1 -gravity north -crop 512x1000+0+0 +repage \) \
  -append +repage "$root/screenshots/menubar-widget.png"

# The preview: the list on the left, the widget in the middle, three
# scenes on the right.
panel() {  # source crop-geometry width output
  magick "$1" -crop "$2" +repage -resize "$3x" -bordercolor "$line" -border 3 "$4"
}
panel "$in/chicago.png" 941x225+0+0 900 "$work/p1.png"
panel "$in/tokyo-radar.png" 941x485+0+665 900 "$work/p2.png"
panel "$in/torshavn-wind.png" 941x440+0+710 900 "$work/p3.png"
magick "$root/screenshots/menubar-widget.png" -resize x1000 -bordercolor "$line" -border 3 "$work/w.png"

bullets=("Radar & wind maps, pan & zoom" "Drawn in your Omarchy theme" "Coloured values in the bar"
  "Temperature lines, rain bars" "My places at a glance" "Any section as window or tab"
  "Rain alerts: threshold & radius" "Official services worldwide")
args=()
y=520
for text in "${bullets[@]}"; do
  args+=(-font "$font" -pointsize 34 -fill "$fg" -annotate "+156+$y" "$text"
    -fill "$accent" -annotate "+104+$y" "•")
  y=$((y + 62))
done

magick -size 2400x1350 "xc:$bg" \
  -fill "$accent" -draw "roundrectangle 90,150 470,206 8,8" \
  -font "$bold" -pointsize 30 -fill "$bg" -annotate +112+190 "NEW · VERSION 3.1" \
  -font "$bold" -pointsize 92 -fill "$accent" -annotate +86+330 "More Weather" \
  -font "$font" -pointsize 40 -fill "$fg" -annotate +92+398 "for the Omarchy bar" \
  "${args[@]}" \
  -font "$font" -pointsize 30 -fill "$muted" -annotate +98+1040 "30 languages · °C / °F" \
  -annotate +98+1080 "full keyboard control" \
  "$work/w.png" -geometry +860+170 -composite \
  "$work/p1.png" -geometry +1440+110 -composite \
  "$work/p2.png" -geometry +1440+365 -composite \
  "$work/p3.png" -geometry +1440+850 -composite \
  "$root/preview.png"
echo "preview.png and screenshots/ updated"
