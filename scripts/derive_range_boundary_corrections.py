#!/usr/bin/env python3
"""Derive exact non-overlapping range-boundary candidates from the audit sources."""

from __future__ import annotations

import json
from pathlib import Path

from shapely import make_valid
from shapely.ops import unary_union

from audit_range_conservation_areas import (
    PROJECT,
    MATERIAL_OVERLAP_M2,
    audit_pairs,
    equal_area_measure,
    fetch_curated_features,
    fetch_nps_features,
    finalise_areas,
    parse_range_geometries,
)

OUTPUT = PROJECT / "docs/spatial-audit-boundary-candidates.json"


def polygon_payload(geometry):
    if geometry.geom_type == "Polygon":
        polygons = [geometry]
    elif geometry.geom_type == "MultiPolygon":
        polygons = list(geometry.geoms)
    else:
        raise RuntimeError(f"Unsupported corrected geometry type: {geometry.geom_type}")

    return [
        {
            "exterior_lat_lng": [
                [float(f"{lat:.12f}"), float(f"{lng:.12f}")]
                for lng, lat in polygon.exterior.coords
            ],
            "holes_lat_lng": [
                [
                    [float(f"{lat:.12f}"), float(f"{lng:.12f}")]
                    for lng, lat in interior.coords
                ]
                for interior in polygon.interiors
            ],
            "area_m2": equal_area_measure(polygon, "area"),
        }
        for polygon in polygons
    ]


def main() -> None:
    ranges = parse_range_geometries()
    curated, _ = fetch_curated_features()
    nps, _ = fetch_nps_features()
    areas = finalise_areas(curated, nps)
    areas_by_key = {area["key"]: area for area in areas}
    pairs, _ = audit_pairs(ranges, areas)
    overlaps = [pair for pair in pairs if pair["overlap_m2"] >= MATERIAL_OVERLAP_M2]

    grouped: dict[str, list[dict]] = {}
    for pair in overlaps:
        grouped.setdefault(pair["range"], []).append(pair)

    candidates = {}
    for range_name, affected_pairs in grouped.items():
        blockers = unary_union([areas_by_key[pair["area_key"]]["geometry"] for pair in affected_pairs])
        original = ranges[range_name]
        corrected = original.difference(blockers)
        corrected = make_valid(corrected) if not corrected.is_valid else corrected
        candidates[range_name] = {
            "affected_areas": [pair["area"] for pair in affected_pairs],
            "original_area_m2": equal_area_measure(original, "area"),
            "removed_area_m2": equal_area_measure(original.intersection(blockers), "area"),
            "corrected_geometry_type": corrected.geom_type,
            "corrected_valid": corrected.is_valid,
            "polygons": polygon_payload(corrected),
        }

    OUTPUT.write_text(json.dumps(candidates, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        range_name: {
            "affected_areas": payload["affected_areas"],
            "geometry_type": payload["corrected_geometry_type"],
            "polygon_count": len(payload["polygons"]),
            "hole_count": sum(len(polygon["holes_lat_lng"]) for polygon in payload["polygons"]),
            "removed_area_sq_km": payload["removed_area_m2"] / 1_000_000,
        }
        for range_name, payload in candidates.items()
    }, indent=2))
    print(OUTPUT)


if __name__ == "__main__":
    main()
