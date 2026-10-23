#!/usr/bin/env python3
"""Verify actual returns and treatment coverage in native radar fixture shots."""
from pathlib import Path
import sys
import importlib.util
spec = importlib.util.spec_from_file_location("rim", Path(__file__).with_name("rim-check.py"))
rim = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rim)

root = Path(sys.argv[1])
for width in (500, 840):
    counts = {}
    for treatment in ('pixels', 'glyphs', 'stipple'):
        path = root / f'radar-fidelity-{width}-map-{treatment}.png'
        image = rim.read_png(path)
        assert image[0] == width, (path, image[:2])
        # Theme geography is low-contrast. Radar has bright chromatic cells;
        # do not count labels, borders, controls or the scale/credit at the edges.
        count = sum(1 for y in range(28, image[1]-30)
                    for x in range(20, image[0]-20)
                    for r,g,b in [rim.pixel(image,x,y)[:3]]
                    if max(r,g,b)>90 and max(r,g,b)-min(r,g,b)>45)
        assert count > 300, f'{path}: no convincing radar returns ({count})'
        counts[treatment] = count
    assert counts['glyphs'] < counts['pixels'] * .95, counts
    assert counts['stipple'] < counts['pixels'] * .99, counts
    print(f'CHECK radar fidelity {width} px: {counts}')
