#!/usr/bin/env python3
"""Audit Utah Peaks range polygons against every conservation overlay the app loads.

The audit intentionally mirrors the browser's ArcGIS query parameters:
- Curated protected areas: WGS84, geometryPrecision=5, maxAllowableOffset=0.001
- NPS parks: featured regional parks at 5/0.001; nationwide overview parks at 2/0.1

It writes a concise Markdown record and complete JSON data beneath docs/.  Run from
any directory with:

    python3 scripts/audit_range_conservation_areas.py
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from pyproj import Transformer
from shapely import make_valid, transform as shapely_transform
from shapely.geometry import GeometryCollection, LineString, MultiPolygon, Polygon
from shapely.ops import unary_union

PROJECT = Path(__file__).resolve().parents[1]
RANGES_FILE = PROJECT / "client/src/data/ranges.ts"
MARKDOWN_REPORT = PROJECT / "docs/spatial-audit-2026-10-08.md"
JSON_REPORT = PROJECT / "docs/spatial-audit-2026-10-08.json"

# Treat only values below one square centimetre as topology/float noise.  A
# material overlap is 0.01 km² (1 hectare), deliberately far above noise while
# still revealing visually meaningful polygon conflicts at map scale.
NUMERIC_NOISE_M2 = 0.0001
MATERIAL_OVERLAP_M2 = 10_000.0
CONTACT_THRESHOLD_M = 1.0

EQUAL_AREA = Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True)

NPS_ENDPOINT = (
    "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/"
    "NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query"
)
DETAILED_NPS_CODES = ["ZION", "BRCA", "CANY", "ARCH", "CARE", "GRCA", "GRBA"]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def fetch_json(endpoint: str, params: dict[str, str]) -> dict[str, Any]:
    url = f"{endpoint}?{urlencode(params)}"
    request = Request(url, headers={"User-Agent": "UtahPeaksSpatialAudit/1.0"})
    with urlopen(request, timeout=90) as response:
        payload = json.load(response)
    if payload.get("error"):
        fail(f"{endpoint}: {payload['error'].get('message', payload['error'])}")
    return payload


def browser_query_params(where: str, geometry_precision: int, max_allowable_offset: float) -> dict[str, str]:
    """Return precisely the ArcGIS parameters used by Home.tsx."""
    return {
        "where": where,
        "outFields": "*",
        "returnGeometry": "true",
        "outSR": "4326",
        "geometryPrecision": str(geometry_precision),
        "maxAllowableOffset": str(max_allowable_offset),
        "f": "json",
    }


def load_protected_area_sources() -> list[dict[str, Any]]:
    """Import the same source array consumed by the React map, not a copy."""
    command = [
        "pnpm",
        "exec",
        "tsx",
        "-e",
        (
            "import { PROTECTED_AREA_SOURCES } from './client/src/data/protectedAreas.ts';"
            "console.log(JSON.stringify(PROTECTED_AREA_SOURCES));"
        ),
    ]
    result = subprocess.run(command, cwd=PROJECT, capture_output=True, text=True, check=True)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        fail(f"Could not read protected-area configuration: {exc}")


def bracketed_block(source: str, start: int) -> str:
    """Extract one balanced [] block from TypeScript source."""
    opening = source.find("[", start)
    if opening < 0:
        fail("Could not find polygon array")
    depth = 0
    for position in range(opening, len(source)):
        character = source[position]
        if character == "[":
            depth += 1
        elif character == "]":
            depth -= 1
            if depth == 0:
                return source[opening : position + 1]
    fail("Unclosed polygon array")


def parse_range_geometries() -> dict[str, Polygon | MultiPolygon]:
    command = [
        "pnpm",
        "exec",
        "tsx",
        "-e",
        (
            "import { MOUNTAIN_RANGES } from './client/src/data/ranges.ts';"
            "console.log(JSON.stringify(MOUNTAIN_RANGES.map(({ range, polygon, polygonGroups, boundaryType }) => "
            "({ range, polygon, polygonGroups, boundaryType }))));"
        ),
    ]
    result = subprocess.run(command, cwd=PROJECT, capture_output=True, text=True, check=True)
    try:
        range_records = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        fail(f"Could not read mountain-range configuration: {exc}")

    ranges: dict[str, Polygon | MultiPolygon] = {}

    for record in range_records:
        range_name = record["range"]
        if record.get("boundaryType") == "line":
            continue
        groups = record.get("polygonGroups") or [[record["polygon"]]]
        polygons = []
        for group in groups:
            if not group or len(group[0]) < 4:
                fail(f"{range_name}: fewer than four exterior coordinates")
            # App data is [lat, lng]; Shapely is [x=lng, y=lat].
            exterior = [(float(lng), float(lat)) for lat, lng in group[0]]
            holes = [[(float(lng), float(lat)) for lat, lng in ring] for ring in group[1:]]
            polygon = Polygon(exterior, holes)
            polygon = make_valid(polygon) if not polygon.is_valid else polygon
            if not polygon.is_empty:
                polygons.append(polygon)
        geometry = unary_union(polygons)
        if geometry.is_empty:
            fail(f"{range_name}: no usable geometry")
        ranges[range_name] = geometry

    if not ranges:
        fail("No mountain range polygons parsed")
    return ranges


def signed_ring_area(ring: list[tuple[float, float]]) -> float:
    return sum(
        ring[index][0] * ring[(index + 1) % len(ring)][1]
        - ring[(index + 1) % len(ring)][0] * ring[index][1]
        for index in range(len(ring))
    ) / 2.0


def esri_rings_to_geometry(rings: list[list[list[float]]]) -> Polygon | MultiPolygon | GeometryCollection:
    """Convert ArcGIS flat rings to geometry while retaining holes and multipart areas."""
    ring_records: list[tuple[list[tuple[float, float]], Polygon, float]] = []
    for raw_ring in rings:
        ring = [(float(point[0]), float(point[1])) for point in raw_ring if len(point) >= 2]
        if len(ring) < 4:
            continue
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        candidate = Polygon(ring)
        if candidate.is_empty or candidate.area == 0:
            continue
        ring_records.append((ring, candidate, signed_ring_area(ring)))

    if not ring_records:
        return GeometryCollection()

    # ArcGIS uses consistent winding within a feature.  The largest ring is
    # necessarily an exterior; rings with its winding are exteriors and the
    # opposite winding represents holes.  This supports multipart features.
    exterior_sign = 1 if max(ring_records, key=lambda item: abs(item[2]))[2] >= 0 else -1
    exteriors = [record for record in ring_records if (1 if record[2] >= 0 else -1) == exterior_sign]
    holes = [record for record in ring_records if record not in exteriors]

    polygons: list[Polygon] = []
    for exterior_ring, exterior_polygon, _ in exteriors:
        interior_rings = [
            hole_ring
            for hole_ring, hole_polygon, _ in holes
            if exterior_polygon.contains(hole_polygon.representative_point())
        ]
        polygon = Polygon(exterior_ring, interior_rings)
        polygons.append(make_valid(polygon) if not polygon.is_valid else polygon)

    geometry = unary_union(polygons)
    return make_valid(geometry) if not geometry.is_valid else geometry


def equal_area_measure(geometry: Any, kind: str) -> float:
    if geometry.is_empty:
        return 0.0
    projected = shapely_transform(geometry, EQUAL_AREA.transform, interleaved=False)
    return projected.area if kind == "area" else projected.length


def fetch_curated_features() -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    grouped: dict[str, dict[str, Any]] = {}
    source_status: list[dict[str, Any]] = []

    for source in load_protected_area_sources():
        try:
            payload = fetch_json(
                source["endpoint"],
                browser_query_params(source["where"], 5, 0.001),
            )
            features = payload.get("features", [])
            accepted = 0
            for feature in features:
                geometry = feature.get("geometry") or {}
                rings = geometry.get("rings") or []
                if not rings:
                    continue
                attributes = feature.get("attributes") or {}
                raw_name = str(attributes.get(source["nameField"]) or source["name"]).strip()
                name = (source.get("nameOverrides") or {}).get(raw_name, raw_name)
                key = f"curated:{source['id']}:{name}"
                shape = esri_rings_to_geometry(rings)
                if shape.is_empty:
                    continue
                if key not in grouped:
                    grouped[key] = {
                        "key": key,
                        "name": name,
                        "layer": "Curated protected areas",
                        "source_id": source["id"],
                        "source_label": source["sourceLabel"],
                        "source_url": source["sourceUrl"],
                        "query_precision": "geometryPrecision=5; maxAllowableOffset=0.001",
                        "geometry_parts": [],
                    }
                grouped[key]["geometry_parts"].append(shape)
                accepted += 1
            source_status.append(
                {
                    "layer": "Curated protected areas",
                    "source": source["id"],
                    "status": "ok",
                    "returned_features": len(features),
                    "usable_features": accepted,
                    "precision": "5 / 0.001",
                }
            )
        except Exception as exc:
            source_status.append(
                {
                    "layer": "Curated protected areas",
                    "source": source["id"],
                    "status": f"error: {exc}",
                    "returned_features": 0,
                    "usable_features": 0,
                    "precision": "5 / 0.001",
                }
            )

    return grouped, source_status


def fetch_nps_features() -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    grouped: dict[str, dict[str, Any]] = {}
    source_status: list[dict[str, Any]] = []
    detailed_where = " OR ".join(f"UNIT_CODE='{code}'" for code in DETAILED_NPS_CODES)
    overview_where = (
        "(UNIT_TYPE='National Parks' OR UNIT_CODE='NERI') AND "
        f"UNIT_CODE NOT IN ({','.join(repr(code) for code in DETAILED_NPS_CODES)})"
    )

    for label, where, precision, offset in [
        ("detailed", detailed_where, 5, 0.001),
        ("overview", overview_where, 2, 0.1),
    ]:
        try:
            params = browser_query_params(where, precision, offset)
            params["resultRecordCount"] = "100"
            payload = fetch_json(NPS_ENDPOINT, params)
            features = payload.get("features", [])
            accepted = 0
            for feature in features:
                geometry = feature.get("geometry") or {}
                rings = geometry.get("rings") or []
                if not rings:
                    continue
                attributes = feature.get("attributes") or {}
                unit_code = str(attributes.get("UNIT_CODE") or "unknown")
                name = str(attributes.get("UNIT_NAME") or unit_code)
                key = f"nps:{unit_code}"
                shape = esri_rings_to_geometry(rings)
                if shape.is_empty:
                    continue
                if key not in grouped:
                    grouped[key] = {
                        "key": key,
                        "name": name,
                        "layer": "NPS national parks",
                        "source_id": f"nps-national-parks-{label}",
                        "source_label": "NPS Boundary Service",
                        "source_url": NPS_ENDPOINT.rsplit("/query", 1)[0],
                        "query_precision": f"geometryPrecision={precision}; maxAllowableOffset={offset}",
                        "geometry_parts": [],
                    }
                grouped[key]["geometry_parts"].append(shape)
                accepted += 1
            source_status.append(
                {
                    "layer": "NPS national parks",
                    "source": f"nps-national-parks-{label}",
                    "status": "ok",
                    "returned_features": len(features),
                    "usable_features": accepted,
                    "precision": f"{precision} / {offset}",
                }
            )
        except Exception as exc:
            source_status.append(
                {
                    "layer": "NPS national parks",
                    "source": f"nps-national-parks-{label}",
                    "status": f"error: {exc}",
                    "returned_features": 0,
                    "usable_features": 0,
                    "precision": f"{precision} / {offset}",
                }
            )

    return grouped, source_status


def finalise_areas(*groups: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    areas: list[dict[str, Any]] = []
    for group in groups:
        for item in group.values():
            geometry = unary_union(item.pop("geometry_parts"))
            item["geometry"] = make_valid(geometry) if not geometry.is_valid else geometry
            areas.append(item)
    return sorted(areas, key=lambda item: (item["layer"], item["name"]))


def audit_pairs(ranges: dict[str, Any], areas: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    excluded: list[dict[str, Any]] = []
    for range_name, range_geometry in sorted(ranges.items()):
        for area in areas:
            # This pair was fixed and explicitly excluded by the requested scope.
            if range_name == "Pine Valley Mountains" and area["source_id"] == "red-cliffs-nca":
                excluded.append({"range": range_name, "area": area["name"], "reason": "previously corrected pair"})
                continue
            intersection = range_geometry.intersection(area["geometry"])
            overlap_m2 = equal_area_measure(intersection, "area")
            boundary_contact = range_geometry.boundary.intersection(area["geometry"].boundary)
            contact_m = equal_area_measure(boundary_contact, "length")
            if overlap_m2 <= NUMERIC_NOISE_M2:
                overlap_m2 = 0.0
            if contact_m <= 0.01:
                contact_m = 0.0
            relationship = "disjoint"
            if overlap_m2 >= MATERIAL_OVERLAP_M2:
                relationship = "material overlap"
            elif overlap_m2 > NUMERIC_NOISE_M2:
                relationship = "positive overlap below material threshold"
            elif contact_m >= CONTACT_THRESHOLD_M:
                relationship = "shared-boundary contact"
            records.append(
                {
                    "range": range_name,
                    "area": area["name"],
                    "layer": area["layer"],
                    "source": area["source_id"],
                    "area_key": area["key"],
                    "precision": area["query_precision"],
                    "overlap_m2": overlap_m2,
                    "overlap_sq_km": overlap_m2 / 1_000_000,
                    "shared_boundary_m": contact_m,
                    "relationship": relationship,
                }
            )
    return records, excluded


def markdown_table(rows: list[list[str]], headers: list[str]) -> str:
    if not rows:
        return "_None._\n"
    divider = ["---"] * len(headers)
    all_rows = [headers, divider, *rows]
    return "\n".join("| " + " | ".join(row) + " |" for row in all_rows) + "\n"


def write_reports(records: list[dict[str, Any]], excluded: list[dict[str, Any]], sources: list[dict[str, Any]], ranges: dict[str, Any], areas: list[dict[str, Any]]) -> None:
    tested = len(records)
    material = [record for record in records if record["relationship"] == "material overlap"]
    minor = [record for record in records if record["relationship"] == "positive overlap below material threshold"]
    contact = [record for record in records if record["relationship"] == "shared-boundary contact"]
    relevant = [*material, *minor, *contact]
    now = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")

    MARKDOWN_REPORT.parent.mkdir(parents=True, exist_ok=True)
    source_rows = [
        [
            row["layer"],
            row["source"],
            row["status"],
            str(row["returned_features"]),
            str(row["usable_features"]),
            row["precision"],
        ]
        for row in sources
    ]
    relevant_rows = [
        [
            row["range"],
            row["area"],
            row["layer"],
            row["relationship"],
            f"{row['overlap_m2']:.2f}",
            f"{row['overlap_sq_km']:.6f}",
            f"{row['shared_boundary_m']:.2f}",
        ]
        for row in relevant
    ]

    report = f"""# Utah Peaks spatial audit — 2026-10-08

**Run:** {now}  
**Scope:** all {len(ranges)} mountain-range polygons against the {len(areas)} named conservation features drawn by the current NPS national-parks and curated protected-area overlays. The existing **Pine Valley Mountains / Red Cliffs National Conservation Area** pair was intentionally excluded, as requested.

## Method

- Geometry comes directly from the same agency ArcGIS endpoints and the same WGS84 simplification parameters used by `Home.tsx`.
- Each ArcGIS feature's multipart rings and holes are preserved, then same-name parts are unioned before comparison.
- Intersections and boundary contact are measured in EPSG:6933 equal-area metres after the browser-equivalent WGS84 fetch. Values at or under **0.0001 m²** are treated as numerical noise; **10,000 m² (0.01 km² / 1 ha)** is the material-overlap threshold.
- **Shared-boundary contact** means at least one metre of coincident boundary. Pairing includes the NPS park layer as well as the curated conservation layer.

## Results

- **Pairs tested:** {tested}
- **Excluded known pair:** {len(excluded)} (Pine Valley Mountains / Red Cliffs National Conservation Area)
- **Material positive-area overlaps:** {len(material)}
- **Positive-area overlaps below material threshold:** {len(minor)}
- **Shared-boundary-only contacts:** {len(contact)}
- **Disjoint pairs:** {tested - len(relevant)}

## Agency source fetches

{markdown_table(source_rows, ["Layer", "Source", "Status", "Returned", "Usable", "Precision / offset"])}

## Adjacent or overlapping pairs

{markdown_table(relevant_rows, ["Mountain range", "Conservation area", "Layer", "Relationship", "Overlap m²", "Overlap km²", "Shared boundary m"])}

## Audit disposition

{"Material positive-area intersections require frontend range-polygon correction before this audit can pass." if material else "The final audited geometry contains no material positive-area intersections. The listed shared-boundary contacts are the reconciled range–conservation-area edges."}

The complete machine-readable pair-level results, including all disjoint comparisons, are in `spatial-audit-2026-10-08.json`.
"""
    MARKDOWN_REPORT.write_text(report, encoding="utf-8")
    serialisable = {
        "run_at_utc": now,
        "scope": {
            "range_count": len(ranges),
            "conservation_area_count": len(areas),
            "tested_pairs": tested,
            "excluded_pairs": excluded,
            "numeric_noise_m2": NUMERIC_NOISE_M2,
            "material_overlap_m2": MATERIAL_OVERLAP_M2,
            "contact_threshold_m": CONTACT_THRESHOLD_M,
        },
        "sources": sources,
        "relevant_pairs": relevant,
        "all_pairs": records,
    }
    JSON_REPORT.write_text(json.dumps(serialisable, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    ranges = parse_range_geometries()
    curated, curated_sources = fetch_curated_features()
    nps, nps_sources = fetch_nps_features()
    source_status = [*curated_sources, *nps_sources]
    failures = [source for source in source_status if source["status"] != "ok"]
    if failures:
        fail("One or more browser-configured agency sources could not be fetched: " + "; ".join(item["source"] for item in failures))
    areas = finalise_areas(curated, nps)
    records, excluded = audit_pairs(ranges, areas)
    write_reports(records, excluded, source_status, ranges, areas)

    material = [record for record in records if record["relationship"] == "material overlap"]
    relevant = [record for record in records if record["relationship"] != "disjoint"]
    print(json.dumps({
        "ranges": len(ranges),
        "conservation_areas": len(areas),
        "pairs_tested": len(records),
        "excluded_pairs": len(excluded),
        "relevant_pairs": len(relevant),
        "material_overlaps": material,
        "markdown_report": str(MARKDOWN_REPORT),
        "json_report": str(JSON_REPORT),
    }, indent=2))
    if material:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
