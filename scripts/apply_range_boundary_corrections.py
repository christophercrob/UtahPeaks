#!/usr/bin/env python3
"""Apply checked spatial-audit candidate polygons to the frontend range data."""

from __future__ import annotations

import json
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT / "client/src/data/ranges.ts"
CANDIDATES = PROJECT / "docs/spatial-audit-boundary-candidates.json"


def find_balanced(source: str, opening: int, left: str = "[", right: str = "]") -> int:
    depth = 0
    for position in range(opening, len(source)):
        char = source[position]
        if char == left:
            depth += 1
        elif char == right:
            depth -= 1
            if depth == 0:
                return position
    raise RuntimeError("Unclosed TypeScript structure")


def number(value: float) -> str:
    text = f"{value:.12f}".rstrip("0").rstrip(".")
    return text if text else "0"


def ring_text(points: list[list[float]], indent: str) -> str:
    lines = [f"{indent}["]
    lines.extend(f"{indent}  [{number(lat)}, {number(lng)}]," for lat, lng in points)
    lines.append(f"{indent}],")
    return "\n".join(lines)


def polygon_property(polygons: list[dict], include_groups: bool) -> str:
    primary = ring_text(polygons[0]["exterior_lat_lng"], "      ")
    text = "    polygon: " + primary.lstrip() + "\n"
    if not include_groups:
        return text

    groups = ["    polygonGroups: ["]
    for polygon in polygons:
        groups.append("      [")
        groups.append(ring_text(polygon["exterior_lat_lng"], "        "))
        for hole in polygon["holes_lat_lng"]:
            groups.append(ring_text(hole, "        "))
        groups.append("      ],")
    groups.append("    ],\n")
    return text + "\n".join(groups)


def replacement_for(name: str, payload: dict) -> str:
    source = SOURCE.read_text(encoding="utf-8")
    needle = f'range: "{name}"'
    range_start = source.index(needle)
    next_range = source.find('\n  {\n    range:', range_start + len(needle))
    if next_range < 0:
        next_range = source.find('\n];', range_start)
    if next_range < 0:
        next_range = source.find('\n});', range_start)
    if next_range < 0:
        raise RuntimeError(f"Could not locate the end of {name}")
    polygon_key = source.index("polygon:", range_start, next_range)
    polygon_label = source.rfind("\n", range_start, polygon_key) + 1
    array_start = source.index("[", polygon_label)
    array_end = find_balanced(source, array_start)
    property_end = source.index("\n", array_end) + 1

    needs_groups = len(payload["polygons"]) > 1 or any(item["holes_lat_lng"] for item in payload["polygons"])
    comment = (
        "    // Spatial-audit correction: clipped to the listed authoritative conservation\n"
        "    // boundaries using the same WGS84/simplification request as the map overlay.\n"
    )
    replacement = comment + polygon_property(payload["polygons"], needs_groups)
    return source[:polygon_label] + replacement + source[property_end:]


def main() -> None:
    candidates = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    # Replace bottom-to-top indirectly by reading fresh source for each target so
    # offsets never become stale as the coordinate arrays expand.
    for name in candidates:
        SOURCE.write_text(replacement_for(name, candidates[name]), encoding="utf-8")
    print("Updated: " + ", ".join(candidates))


if __name__ == "__main__":
    main()
