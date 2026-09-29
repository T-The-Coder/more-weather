#!/usr/bin/env python3
"""Build data/basemap.bin from Natural Earth.

The radar and wind maps draw their ground themselves, in the theme's colours,
instead of showing a satellite picture (which stays available as a map style).
The idea and the choice of layers follow the Weather Radar plugin by Eduardo
Dalle Cort (MIT); this script and the format are More Weather's own.

The world is cut into 5° × 5° cells, stored in one file behind an index, so
the map decodes only the few cells around the place it shows. One level of detail
serves every zoom: fine enough for the closest (about 0.1 km per pixel),
and a wide view still reads only a dozen cells.

Run by hand when the source data or the layers change; the output is
committed. Sources are cached in tools/.cache (not committed).

    python3 tools/build-basemap.py

Natural Earth is public domain.

File
----

All numbers little-endian; varints are LEB128, signed ones zigzag-coded.

    magic     "MWBM"
    version   u8 (2)
    cell      u8, degrees per cell side (5)
    count     u16, cells
    index     per cell: row u8, column u8, offset u32, length u32
              (row 0 starts at 90° S, column 0 at 180° W; offsets count
              from the end of the index)
    cells     per cell, the layers in LAYER_ORDER, each:
                feature count varint, then per feature
                  polygons: ring count varint, then per ring a point list
                  lines:    one point list
                point list: point count varint, then x, y signed varints:
                  the first point, then deltas to the previous one
              then the places: count varint, then per place
                x, y signed varints (not deltas), population varint,
                kind u8 (1 a city: a capital or a large town, 0 a town),
                name: byte length varint, UTF-8

Points are in thousandths of a degree from the cell's south-west corner
(0 … 5000); x is east, y north. Polygons are cut to the cell, so a ring may
run along the cell's edge; the renderer leaves those edges out when it draws
a coastline. Holes are rings of their own; fill even-odd per feature.
"""

import json
import math
import os
import struct
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".cache")
OUTPUT = os.path.join(ROOT, "data", "basemap.bin")
MAGIC = b"MWBM"
VERSION = 2
PLACES_SOURCE = "ne_10m_populated_places_simple"
LAYER_ORDER = ["land", "lakes", "urban", "rivers", "admin1", "admin0"]
POLYGON_LAYERS = {"land", "lakes", "urban"}

SOURCE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson"

CELL = 5
QUANTUM = 1000

# name: (source, kind, simplification tolerance in degrees). 0.002° is about
# 220 m, two pixels at the closest zoom; context layers take a looser one.
LAYERS = [
    ("land",   "ne_10m_land",                              "polygon", 0.002),
    ("lakes",  "ne_10m_lakes",                             "polygon", 0.003),
    ("urban",  "ne_10m_urban_areas",                       "polygon", 0.002),
    ("rivers", "ne_10m_rivers_lake_centerlines",           "line",    0.003),
    ("admin1", "ne_10m_admin_1_states_provinces_lines",    "line",    0.003),
    ("admin0", "ne_10m_admin_0_boundary_lines_land",       "line",    0.002),
]


def fetch(name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name + ".geojson")
    if not os.path.exists(path):
        url = SOURCE + "/" + name + ".geojson"
        print("fetching", url, file=sys.stderr)
        with urllib.request.urlopen(url) as response, open(path + ".part", "wb") as out:
            out.write(response.read())
        os.replace(path + ".part", path)
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def polygons_of(geometry):
    if not geometry:
        return []
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiPolygon":
        return geometry["coordinates"]
    return []


def lines_of(geometry):
    if not geometry:
        return []
    if geometry["type"] == "LineString":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiLineString":
        return geometry["coordinates"]
    return []


def simplify(points, tolerance):
    """Douglas-Peucker, iterative."""
    if len(points) < 3 or not tolerance:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    tol2 = tolerance * tolerance
    while stack:
        first, last = stack.pop()
        ax, ay = points[first][0], points[first][1]
        bx, by = points[last][0], points[last][1]
        dx, dy = bx - ax, by - ay
        length2 = dx * dx + dy * dy
        worst, worst_d2 = -1, tol2
        for i in range(first + 1, last):
            px, py = points[i][0], points[i][1]
            if length2 == 0:
                d2 = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / length2))
                d2 = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if d2 > worst_d2:
                worst, worst_d2 = i, d2
        if worst >= 0:
            keep[worst] = True
            stack.append((first, worst))
            stack.append((worst, last))
    return [p for p, k in zip(points, keep) if k]


def bounds(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return min(xs), min(ys), max(xs), max(ys)


def cells_for(box):
    west, south, east, north = box
    for row in range(int(math.floor((south + 90) / CELL)), int(math.floor((north + 90) / CELL)) + 1):
        for col in range(int(math.floor((west + 180) / CELL)), int(math.floor((east + 180) / CELL)) + 1):
            if 0 <= row < 180 // CELL and 0 <= col < 360 // CELL:
                yield row, col


def cell_box(row, col):
    west = col * CELL - 180
    south = row * CELL - 90
    return west, south, west + CELL, south + CELL


def clip_ring(ring, box, axes="xy"):
    """Sutherland-Hodgman against the cell rectangle, or only its x or y
    edges (a column or a band)."""
    west, south, east, north = box
    edges = []
    if "x" in axes:
        edges += [
            (lambda p: p[0] >= west, lambda a, b: (west, a[1] + (b[1] - a[1]) * (west - a[0]) / (b[0] - a[0]))),
            (lambda p: p[0] <= east, lambda a, b: (east, a[1] + (b[1] - a[1]) * (east - a[0]) / (b[0] - a[0]))),
        ]
    if "y" in axes:
        edges += [
            (lambda p: p[1] >= south, lambda a, b: (a[0] + (b[0] - a[0]) * (south - a[1]) / (b[1] - a[1]), south)),
            (lambda p: p[1] <= north, lambda a, b: (a[0] + (b[0] - a[0]) * (north - a[1]) / (b[1] - a[1]), north)),
        ]
    points = ring
    for inside, cross in edges:
        if not points:
            return []
        result = []
        previous = points[-1]
        for current in points:
            if inside(current):
                if not inside(previous):
                    result.append(cross(previous, current))
                result.append(current)
            elif inside(previous):
                result.append(cross(previous, current))
            previous = current
        points = result
    return points


def clip_line(line, box):
    """Cuts a polyline to the rectangle; answers the pieces inside."""
    west, south, east, north = box
    pieces = []
    current = []
    for a, b in zip(line, line[1:]):
        # Liang-Barsky for the segment a-b.
        x0, y0 = a[0], a[1]
        dx, dy = b[0] - x0, b[1] - y0
        t0, t1 = 0.0, 1.0
        ok = True
        for p, q in ((-dx, x0 - west), (dx, east - x0), (-dy, y0 - south), (dy, north - y0)):
            if p == 0:
                if q < 0:
                    ok = False
                    break
            else:
                r = q / p
                if p < 0:
                    if r > t1:
                        ok = False
                        break
                    t0 = max(t0, r)
                else:
                    if r < t0:
                        ok = False
                        break
                    t1 = min(t1, r)
        if not ok:
            if len(current) > 1:
                pieces.append(current)
            current = []
            continue
        start = (x0 + t0 * dx, y0 + t0 * dy)
        end = (x0 + t1 * dx, y0 + t1 * dy)
        if not current:
            current = [start]
        elif t0 > 0:
            if len(current) > 1:
                pieces.append(current)
            current = [start]
        current.append(end)
        if t1 < 1:
            if len(current) > 1:
                pieces.append(current)
            current = []
    if len(current) > 1:
        pieces.append(current)
    return pieces


def encode(points, box, closed):
    west, south = box[0], box[1]
    out = []
    last = None
    count = 0
    for p in points:
        x = int(round((p[0] - west) * QUANTUM))
        y = int(round((p[1] - south) * QUANTUM))
        if last is not None and (x, y) == last:
            continue
        if last is None:
            out += [x, y]
        else:
            out += [x - last[0], y - last[1]]
        last = (x, y)
        count += 1
    if count < (3 if closed else 2):
        return None
    return out


def build():
    cells = {}

    def cell(row, col):
        return cells.setdefault((row, col), {})

    for name, source, kind, tolerance in LAYERS:
        data = fetch(source)
        print(name, len(data["features"]), "features", file=sys.stderr)
        for feature in data["features"]:
            geometry = feature.get("geometry")
            if kind == "polygon":
                for polygon in polygons_of(geometry):
                    rings = [simplify(ring, tolerance) for ring in polygon]
                    rings = [ring for ring in rings if len(ring) >= 4]
                    if not rings:
                        continue
                    # Cut to the latitude band first, then each band to its
                    # cells: a continent's outline is clipped a few dozen
                    # times instead of once per cell it spans.
                    west, south, east, north = bounds(rings[0])
                    rows = range(int(math.floor((south + 90) / CELL)), int(math.floor((north + 90) / CELL)) + 1)
                    cols = range(int(math.floor((west + 180) / CELL)), int(math.floor((east + 180) / CELL)) + 1)
                    for row in rows:
                        band_box = (-180, row * CELL - 90, 180, row * CELL - 90 + CELL)
                        bands = [clip_ring(ring[:-1], band_box, "y") for ring in rings]
                        # A hole alone, without its outer ring, is not land.
                        if len(bands[0]) < 3:
                            continue
                        for col in cols:
                            if not (0 <= row < 180 // CELL and 0 <= col < 360 // CELL):
                                continue
                            box = cell_box(row, col)
                            outer = encode(clip_ring(bands[0], box, "x"), box, True)
                            if not outer:
                                continue
                            clipped = [outer]
                            for band in bands[1:]:
                                encoded = encode(clip_ring(band, box, "x"), box, True) if len(band) >= 3 else None
                                if encoded:
                                    clipped.append(encoded)
                            cell(row, col).setdefault(name, []).append(clipped)
            else:
                for line in lines_of(geometry):
                    line = simplify(line, tolerance)
                    if len(line) < 2:
                        continue
                    for row, col in cells_for(bounds(line)):
                        box = cell_box(row, col)
                        for piece in clip_line(line, box):
                            encoded = encode(piece, box, False)
                            if encoded:
                                cell(row, col).setdefault(name, []).append(encoded)

    add_places(cells)
    write(cells)


def add_places(cells):
    """Natural Earth's populated places, for the map's labels where
    OpenStreetMap has none (offline, or a view it was not asked for)."""
    data = fetch(PLACES_SOURCE)
    count = 0
    for feature in data["features"]:
        properties = feature.get("properties") or {}
        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "Point":
            continue
        lon, lat = geometry["coordinates"][:2]
        name = str(properties.get("name") or "").strip()
        if not name:
            continue
        row = int(math.floor((lat + 90) / CELL))
        col = int(math.floor((lon + 180) / CELL))
        if not (0 <= row < 180 // CELL and 0 <= col < 360 // CELL):
            continue
        box = cell_box(row, col)
        population = max(0, int(properties.get("pop_max") or 0))
        capital = "capital" in str(properties.get("featurecla") or "").lower()
        kind = 1 if capital or population >= 100000 else 0
        x = int(round((lon - box[0]) * QUANTUM))
        y = int(round((lat - box[1]) * QUANTUM))
        cells.setdefault((row, col), {}).setdefault("places", []).append((x, y, population, kind, name))
        count += 1
    print("places", count, file=sys.stderr)


def varint(value, out):
    while True:
        byte = value & 0x7F
        value >>= 7
        if value:
            out.append(byte | 0x80)
        else:
            out.append(byte)
            return


def signed(value, out):
    varint((value << 1) ^ (value >> 63) if value < 0 else value << 1, out)


def points(flat, out):
    varint(len(flat) // 2, out)
    for value in flat:
        signed(value, out)


def encode_cell(layers):
    out = bytearray()
    places = layers.get("places", [])
    for name in LAYER_ORDER:
        features = layers.get(name, [])
        varint(len(features), out)
        for feature in features:
            if name in POLYGON_LAYERS:
                varint(len(feature), out)
                for ring in feature:
                    points(ring, out)
            else:
                points(feature, out)
    varint(len(places), out)
    for x, y, population, kind, name in places:
        signed(x, out)
        signed(y, out)
        varint(population, out)
        out.append(kind)
        encoded = name.encode("utf-8")
        varint(len(encoded), out)
        out += encoded
    return bytes(out)


def write(cells):
    blobs = []
    index = bytearray()
    offset = 0
    for (row, col) in sorted(cells):
        blob = encode_cell(cells[(row, col)])
        index += struct.pack("<BBII", row, col, offset, len(blob))
        blobs.append(blob)
        offset += len(blob)
    header = MAGIC + struct.pack("<BBH", VERSION, CELL, len(blobs))
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT + ".part", "wb") as handle:
        handle.write(header)
        handle.write(index)
        for blob in blobs:
            handle.write(blob)
    os.replace(OUTPUT + ".part", OUTPUT)
    print(len(blobs), "cells,", round((len(header) + len(index) + offset) / 1e6, 2), "MB", file=sys.stderr)


def main():
    build()


if __name__ == "__main__":
    main()
