#!/usr/bin/env python3
"""The colour layers end at the globe's rim: for each "RIM <shot> cx cy r"
line in the harness log, a ring of pixels 3 px outside the disc must equal
the background (a pixel well outside it in the same picture). Prints
"CHECK wash inside rim ok <shot>" or "CHECK FAILED wash inside rim <shot>".
No image library: a small PNG reader for the 8-bit RGBA pictures Qt saves.
    tests/ui/rim-check.py <log> <shots-dir>"""
import math
import os
import re
import struct
import sys
import zlib


def read_png(path):
    data = open(path, "rb").read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    pos, idat, width = 8, b"", 0
    while pos < len(data):
        length, kind = struct.unpack(">I4s", data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + length]
        if kind == b"IHDR":
            width, height, depth, colour = struct.unpack(">IIBB", body[:10])
            assert depth == 8 and colour in (2, 6), (depth, colour)
            channels = 4 if colour == 6 else 3
        elif kind == b"IDAT":
            idat += body
        pos += 12 + length
    raw = zlib.decompress(idat)
    stride = width * channels
    rows, prev = [], bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        kind = raw[start]
        line = bytearray(raw[start + 1:start + 1 + stride])
        for i in range(stride):
            a = line[i - channels] if i >= channels else 0
            b = prev[i]
            c = prev[i - channels] if i >= channels else 0
            if kind == 1:
                line[i] = (line[i] + a) & 255
            elif kind == 2:
                line[i] = (line[i] + b) & 255
            elif kind == 3:
                line[i] = (line[i] + (a + b) // 2) & 255
            elif kind == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else (b if pb <= pc else c))) & 255
        rows.append(line)
        prev = line
    return width, height, channels, rows


def pixel(img, x, y):
    width, height, channels, rows = img
    x, y = int(round(x)), int(round(y))
    if not (0 <= x < width and 0 <= y < height):
        return None
    line = rows[y]
    return tuple(line[x * channels:(x + 1) * channels])


def main(log, folder):
    failed = False
    for line in open(log, errors="replace"):
        m = re.search(r"RIM (\S+) ([\d.]+) ([\d.]+) ([\d.]+)", line)
        if not m:
            continue
        name, cx, cy, r = m.group(1), float(m.group(2)), float(m.group(3)), float(m.group(4))
        path = os.path.join(folder, name + ".png")
        if not os.path.exists(path):
            continue
        img = read_png(path)
        # The background: just inside the picture's corner nearest the disc's
        # left, on the disc's row, well outside it.
        background = pixel(img, max(1, cx - r - 12), cy)
        bad = 0
        total = 0
        for k in range(360):
            angle = math.radians(k)
            p = pixel(img, cx + (r + 3) * math.cos(angle), cy + (r + 3) * math.sin(angle))
            if p is None:
                continue
            total += 1
            if any(abs(a - b) > 3 for a, b in zip(p, background)):
                bad += 1
        ok = total > 0 and bad == 0
        failed = failed or not ok
        print(("CHECK wash inside rim ok %s (%d px)" % (name, total)) if ok
              else "CHECK FAILED wash inside rim %s: %d of %d px differ from %s" % (name, bad, total, background))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
