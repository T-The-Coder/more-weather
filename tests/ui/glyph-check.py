#!/usr/bin/env python3
"""Measures glyph-only controls in the UI harness's shots (MW_AUDIT=glyphs).

For every "GLYPHBOX <shot> x y w h <text>" line of the log: the box's fill
is its most common colour inside a 2 px inset (clear of the border), the ink
everything that differs from it, and the report gives the ink's bounding
box and how far its centre sits from the box's centre (dx, dy in px).
"GLYPHROW" lines (a glyph beside text, as a dropdown's chevron) report only
the vertical offset of the ink at the glyph's end of the box.
  glyph-check.py <log> <shots-dir> [#rrggbb background, default #eff1f5]
"""
import json, os, re, sys, collections, importlib.util

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("rim", os.path.join(here, "rim-check.py"))
rim = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rim)

BACKGROUND = (239, 241, 245)

def ink_box(img, x, y, w, h, inset=2):
    pts = []
    for yy in range(y + inset, y + h - inset):
        for xx in range(x + inset, x + w - inset):
            p = rim.pixel(img, xx, yy)
            if p is not None:
                # Over the theme's background (the shots are transparent
                # where the view draws nothing, and fills are translucent).
                a = p[3] if len(p) > 3 else 255
                c = tuple(round(v * a / 255 + BACKGROUND[i] * (1 - a / 255)) for i, v in enumerate(p[:3]))
                pts.append((xx, yy, c, 255))
    if not pts:
        return None
    fill = collections.Counter(p[2] for p in pts).most_common(1)[0][0]
    ink = [(xx, yy) for xx, yy, c, a in pts if a > 40 and max(abs(c[i] - fill[i]) for i in range(3)) > 20]
    if not ink:
        return None
    xs = [p[0] for p in ink]
    ys = [p[1] for p in ink]
    return min(xs), min(ys), max(xs), max(ys)

def main(log, folder):
    cache = {}
    rows = []
    for line in open(log, errors="replace"):
        m = re.search(r"(GLYPHBOX|GLYPHROW) (\S+) (\d+) (\d+) (\d+) (\d+) (.*)$", line)
        if not m:
            continue
        kind, shot, x, y, w, h, text = m.group(1), m.group(2), *map(int, m.groups()[2:6]), m.group(7)
        path = os.path.join(folder, shot + ".png")
        if not os.path.exists(path):
            continue
        if path not in cache:
            cache[path] = rim.read_png(path)
        img = cache[path]
        if kind == "GLYPHROW":
            # A chip's glyph sits at its start, a dropdown's chevron at its
            # end: the first and last 24 px of the box.
            box = ink_box(img, x + w - 24, y, 24, h) if w > 120 else ink_box(img, x, y, 24, h)
            if not box:
                continue
            dy = (box[1] + box[3] + 1) / 2 - (y + h / 2)
            rows.append((shot, text, f"{w}x{h}", f"ink {box[2]-box[0]+1}x{box[3]-box[1]+1}", "dx -", f"dy {dy:+.1f}", abs(dy) > 1))
            continue
        box = ink_box(img, x, y, w, h)
        if not box:
            rows.append((shot, text, f"{w}x{h}", "no ink", "", "", False))
            continue
        dx = (box[0] + box[2] + 1) / 2 - (x + w / 2)
        dy = (box[1] + box[3] + 1) / 2 - (y + h / 2)
        rows.append((shot, text, f"{w}x{h}", f"ink {box[2]-box[0]+1}x{box[3]-box[1]+1}", f"dx {dx:+.1f}", f"dy {dy:+.1f}",
                     abs(dx) > 1 or abs(dy) > 1))
    for r in rows:
        print("GLYPH", ("OFF " if r[6] else "ok  "), r[0], json.loads(r[1]) if r[1].startswith('"') else r[1], *r[2:6])

if __name__ == "__main__":
    if len(sys.argv) > 3:
        h = sys.argv[3].lstrip("#")
        BACKGROUND = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    main(sys.argv[1], sys.argv[2])
