#!/usr/bin/env python3
"""Writes data/wind-dots.png: sparse soft dots on black, 256 x 256, tiling.

The wind shader (shaders/windstreaks.frag) draws each dot as a streak along
the wind. Seeded, so a rebuild gives the same picture.
"""
import os
import random
import struct
import zlib

SIZE = 256
DOTS = 110
RADIUS = 0.95

random.seed(7)
pixels = [[0.0] * SIZE for _ in range(SIZE)]
for _ in range(DOTS):
    cx = random.random() * SIZE
    cy = random.random() * SIZE
    brightness = 0.55 + random.random() * 0.45
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            x = int(cx) + dx
            y = int(cy) + dy
            d2 = (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2
            value = brightness * 2.718281828 ** (-d2 / (2 * RADIUS * RADIUS))
            # Wrapped, so the picture tiles without seams.
            row = pixels[y % SIZE]
            row[x % SIZE] = max(row[x % SIZE], value)
rows = []
for y in range(SIZE):
    rows.append(bytes([0]) + bytes(min(255, int(v * 255)) for v in pixels[y]))


def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 0, 0, 0, 0))  # 8-bit grey
png += chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
png += chunk(b"IEND", b"")
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "wind-dots.png")
with open(out, "wb") as handle:
    handle.write(png)
print(out, len(png), "bytes")
