# Utah Peaks spatial audit — 2026-10-08

**Run:** 2026-10-09 00:13 UTC  
**Scope:** all 13 mountain-range polygons against the 90 named conservation features drawn by the current NPS national-parks and curated protected-area overlays. The existing **Pine Valley Mountains / Red Cliffs National Conservation Area** pair was intentionally excluded, as requested.

## Method

- Geometry comes directly from the same agency ArcGIS endpoints and the same WGS84 simplification parameters used by `Home.tsx`.
- Each ArcGIS feature's multipart rings and holes are preserved, then same-name parts are unioned before comparison.
- Intersections and boundary contact are measured in EPSG:6933 equal-area metres after the browser-equivalent WGS84 fetch. Values at or under **0.0001 m²** are treated as numerical noise; **10,000 m² (0.01 km² / 1 ha)** is the material-overlap threshold.
- **Shared-boundary contact** means at least one metre of coincident boundary. Pairing includes the NPS park layer as well as the curated conservation layer.

## Results

- **Pairs tested:** 1169
- **Excluded known pair:** 1 (Pine Valley Mountains / Red Cliffs National Conservation Area)
- **Material positive-area overlaps:** 0
- **Positive-area overlaps below material threshold:** 0
- **Shared-boundary-only contacts:** 8
- **Disjoint pairs:** 1161

## Agency source fetches

| Layer | Source | Status | Returned | Usable | Precision / offset |
| --- | --- | --- | --- | --- | --- |
| Curated protected areas | nps-monuments | ok | 5 | 5 | 5 / 0.001 |
| Curated protected areas | glen-canyon-recreation-area | ok | 1 | 1 | 5 / 0.001 |
| Curated protected areas | flaming-gorge-recreation-area | ok | 1 | 1 | 5 / 0.001 |
| Curated protected areas | utah-historic-monuments | ok | 3 | 3 | 5 / 0.001 |
| Curated protected areas | utah-state-parks | ok | 16 | 16 | 5 / 0.001 |
| Curated protected areas | dead-horse-point | ok | 4 | 4 | 5 / 0.001 |
| Curated protected areas | gold-butte | ok | 1 | 1 | 5 / 0.001 |
| Curated protected areas | parashant | ok | 2 | 2 | 5 / 0.001 |
| Curated protected areas | arizona-strip-ncl | ok | 2 | 2 | 5 / 0.001 |
| Curated protected areas | beaver-dam-wash | ok | 2 | 2 | 5 / 0.001 |
| Curated protected areas | red-cliffs-nca | ok | 2 | 2 | 5 / 0.001 |
| Curated protected areas | nevada-state-parks | ok | 2 | 2 | 5 / 0.001 |
| NPS national parks | nps-national-parks-detailed | ok | 7 | 7 | 5 / 0.001 |
| NPS national parks | nps-national-parks-overview | ok | 56 | 56 | 2 / 0.1 |


## Adjacent or overlapping pairs

| Mountain range | Conservation area | Layer | Relationship | Overlap m² | Overlap km² | Shared boundary m |
| --- | --- | --- | --- | --- | --- | --- |
| Abajo Mountains | Bears Ears National Monument | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 30928.75 |
| Markagunt Plateau | Cedar Breaks National Monument | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 21347.71 |
| Uinta Mountains | Dinosaur National Monument | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 23023.37 |
| Uinta Mountains | Flaming Gorge National Recreation Area | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 26673.52 |
| Wasatch Range | Deer Creek State Park | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 35814.98 |
| Wasatch Range | Jordanelle State Park | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 34657.26 |
| Wasatch Range | Timpanogos Cave National Monument | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 4054.06 |
| Wasatch Range | Wasatch Mountain State Park | Curated protected areas | shared-boundary contact | 0.00 | 0.000000 | 112107.60 |


## Audit disposition

The final audited geometry contains no material positive-area intersections. The listed shared-boundary contacts are the reconciled range–conservation-area edges.

The complete machine-readable pair-level results, including all disjoint comparisons, are in `spatial-audit-2026-10-08.json`.
