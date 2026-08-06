/*
 * Utah Mountain Ranges & Highest Peaks — Home Page
 * Design: Utah Topo Field Guide
 * Full-viewport Google Map with floating header, legend, detail sidebar,
 * full-screen data table drawer, and Google Maps directions links.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { MapView } from "@/components/Map";
import { MOUNTAIN_RANGES, type MountainRange } from "@/data/ranges";

// ── Fire Perimeter Types ───────────────────────────────────────────────────
interface FireFeature {
  attributes: {
    poly_IncidentName: string;
    attr_FireDiscoveryDateTime: number | null;
    poly_GISAcres: number | null;
    attr_POOState: string | null;
    attr_IncidentTypeCategory: string | null;
    poly_FeatureCategory: string | null;
    attr_FireOutDateTime: number | null;
    poly_DateCurrent: number | null;
  };
  geometry: {
    rings: number[][][];
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────
function googleMapsDirectionsUrl(r: MountainRange) {
  return `https://www.google.com/maps/dir/?api=1&destination=${r.trailheadLat},${r.trailheadLon}&destination_place_id=&travelmode=driving`;
}

function createPinElement(color = "#CC0000"): HTMLElement {
  const div = document.createElement("div");
  div.style.cssText = "width:18px;height:26px;cursor:pointer;";
  div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 18 26">
      <path d="M9 0 C4.03 0 0 4.03 0 9 C0 15.75 9 26 9 26 C9 26 18 15.75 18 9 C18 4.03 13.97 0 9 0 Z"
            fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
      <circle cx="9" cy="9" r="3.2" fill="white" opacity="0.9"/>
    </svg>`;
  return div;
}

// ── Data Table Drawer ─────────────────────────────────────────────────────
function DataTableDrawer({
  open,
  onClose,
  onSelectRange,
}: {
  open: boolean;
  onClose: () => void;
  onSelectRange: (r: MountainRange) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
        style={{
          background: "#F5F0E8",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          maxHeight: "82vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.23,1,0.32,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            background: "#1C2333",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <svg width="22" height="18" viewBox="0 0 28 22" fill="none">
              <path d="M10 18L17 4L24 18H10Z" fill="#C0522A" />
              <path d="M2 18L9 8L16 18H2Z" fill="#A04020" />
            </svg>
            <div>
              <div style={{ color: "#EEE8DC", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>
                Utah Mountain Ranges
              </div>
              <div style={{ color: "rgba(238,232,220,0.5)", fontSize: 11 }}>
                10 ranges · highest peaks &amp; trailheads
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close table"
          >
            ×
          </button>
        </div>

        {/* Scrollable table */}
        <div className="overflow-auto flex-1">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#2D2D2D", color: "#EEE8DC", position: "sticky", top: 0, zIndex: 1 }}>
                {["Range", "Highest Peak", "Elevation", "Coordinates", "Primary Trailhead", "Elev. Gain", "Directions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOUNTAIN_RANGES.map((r, i) => (
                <tr
                  key={r.range}
                  style={{
                    background: i % 2 === 0 ? "rgba(245,240,232,1)" : "rgba(235,229,218,0.7)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${r.color}18`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(245,240,232,1)" : "rgba(235,229,218,0.7)")}
                  onClick={() => { onSelectRange(r); onClose(); }}
                >
                  {/* Range name with color swatch */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontWeight: 600, color: "#2D2D2D" }}>{r.range}</span>
                    </div>
                  </td>
                  {/* Peak */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#3D3D3D", whiteSpace: "nowrap" }}>
                    {r.peak}
                  </td>
                  {/* Elevation */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 600, color: r.color, whiteSpace: "nowrap" }}>
                    {r.elevation}
                  </td>
                  {/* Coordinates */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#555", fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap" }}>
                    {r.lat}° N, {Math.abs(r.lon)}° W
                  </td>
                  {/* Trailhead */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#3D3D3D" }}>
                    {r.trailhead}
                  </td>
                  {/* Elevation gain */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#555", whiteSpace: "nowrap" }}>
                    {r.gain}
                  </td>
                  {/* Directions button */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }} onClick={(e) => e.stopPropagation()}>
                    <a
                      href={googleMapsDirectionsUrl(r)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#1A6B3A",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#145229")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#1A6B3A")}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      Directions
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div
          className="px-6 py-3 text-xs flex-shrink-0"
          style={{
            color: "#888",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            background: "#EDE8DF",
          }}
        >
          Click any row to jump to that range on the map · Directions open in Google Maps
        </div>
      </div>
    </>
  );
}

// ── Detail Sidebar ────────────────────────────────────────────────────────
function DetailSidebar({
  range,
  onClose,
}: {
  range: MountainRange | null;
  onClose: () => void;
}) {
  if (!range) return null;
  return (
    <div
      className="absolute top-16 right-3 z-20 w-72 rounded-xl shadow-2xl overflow-hidden"
      style={{
        background: "#F5F0E8",
        border: "1px solid rgba(0,0,0,0.12)",
        fontFamily: "var(--font-body)",
        animation: "slideIn 0.22s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Header bar */}
      <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ background: range.color }}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
            {range.range}
          </div>
          <div className="text-lg font-bold leading-tight" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>
            {range.peak}
          </div>
        </div>
        <button onClick={onClose} className="mt-0.5 text-white/70 hover:text-white transition-colors text-xl leading-none" aria-label="Close">×</button>
      </div>

      {/* Elevation badge */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L13 13H1L7 1Z" fill={range.color} />
        </svg>
        <span className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "#2D2D2D" }}>{range.elevation}</span>
        <span className="text-xs text-gray-500 ml-1">elevation</span>
      </div>

      {/* Data rows */}
      <div className="px-4 py-3 space-y-2.5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Coordinates</div>
          <div className="text-sm text-gray-700 font-mono">{range.lat}° N, {Math.abs(range.lon)}° W</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Primary Trailhead</div>
          <div className="text-sm text-gray-700">{range.trailhead}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Elevation Gain</div>
          <div className="text-sm text-gray-700">{range.gain}</div>
        </div>
      </div>

      {/* Directions button */}
      <div className="px-4 pb-4">
        <a
          href={googleMapsDirectionsUrl(range)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1A6B3A", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          Get Directions to Trailhead
        </a>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 text-xs text-gray-400 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        Click another pin to switch peaks
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────
function Legend({ selected, onSelect }: { selected: MountainRange | null; onSelect: (r: MountainRange) => void }) {
  return (
    <div
      className="absolute bottom-8 left-3 z-20 rounded-xl shadow-xl overflow-hidden"
      style={{
        background: "rgba(245,240,232,0.97)",
        border: "1px solid rgba(0,0,0,0.12)",
        fontFamily: "var(--font-body)",
        minWidth: "200px",
        maxWidth: "220px",
      }}
    >
      <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest"
        style={{ background: "#2D2D2D", color: "#EEE8DC", letterSpacing: "0.12em" }}>
        Mountain Ranges
      </div>
      <div className="py-1.5 px-2">
        {MOUNTAIN_RANGES.map((r) => (
          <button
            key={r.range}
            onClick={() => onSelect(r)}
            className="w-full flex items-center gap-2 px-1.5 py-1 rounded-md text-left transition-colors hover:bg-black/5"
            style={{ background: selected?.range === r.range ? `${r.color}18` : undefined }}
          >
            <span className="flex-shrink-0 rounded-sm" style={{ width: 12, height: 12, background: r.color }} />
            <span className="text-xs text-gray-700 leading-tight">{r.range}</span>
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 text-xs text-gray-400 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        Click a pin or range for details
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function Home() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<MountainRange | null>(null);
  const [mapType, setMapType] = useState<"terrain" | "satellite" | "roadmap">("terrain");
  const [tableOpen, setTableOpen] = useState(false);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const labelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // ── Fire layer state ──
  const [fireLayerOn, setFireLayerOn] = useState(false);
  const [fireLoading, setFireLoading] = useState(false);
  const [fireError, setFireError] = useState<string | null>(null);
  const firePolygonsRef = useRef<google.maps.Polygon[]>([]);
  const fireLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const fireDataRef = useRef<FireFeature[] | null>(null);

  // ── National Parks layer state ──
  const [parksLayerOn, setParksLayerOn] = useState(false);
  const [parksLoading, setParksLoading] = useState(false);
  const [parksError, setParksError] = useState<string | null>(null);
  const parksPolygonsRef = useRef<google.maps.Polygon[]>([]);
  const parksLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const parksDataRef = useRef<NpsParkFeature[] | null>(null);

  // Fetch NPS park boundaries (Utah's 5 national parks, lazy-loaded once)
  const fetchParksData = useCallback(async (): Promise<NpsParkFeature[]> => {
    if (parksDataRef.current) return parksDataRef.current;
    setParksLoading(true);
    setParksError(null);
    try {
      // NPS Land Resources Division Boundary Service — Utah's 5 National Parks
      // Must use outFields=* when returnGeometry=true (service rejects named fields + geometry)
      const where = encodeURIComponent(
        `UNIT_CODE='ZION' OR UNIT_CODE='BRCA' OR UNIT_CODE='CANY' OR UNIT_CODE='ARCH' OR UNIT_CODE='CARE'`
      );
      const url =
        `https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/` +
        `NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query` +
        `?where=${where}&outFields=*&returnGeometry=true&outSR=4326&f=json&resultRecordCount=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message ?? "API error");
      const features: NpsParkFeature[] = json.features ?? [];
      parksDataRef.current = features;
      return features;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setParksError(`Could not load park data: ${msg}`);
      return [];
    } finally {
      setParksLoading(false);
    }
  }, []);

  // Draw / clear NPS park polygons whenever toggle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!parksLayerOn) {
      parksPolygonsRef.current.forEach((p) => p.setMap(null));
      parksPolygonsRef.current = [];
      parksLabelsRef.current.forEach((m) => { m.map = null; });
      parksLabelsRef.current = [];
      return;
    }

    (async () => {
      const features = await fetchParksData();
      if (!features.length) return;

      features.forEach((feat) => {
        const { UNIT_NAME, GIS_Acres } = feat.attributes;
        const rings = feat.geometry?.rings;
        if (!rings?.length) return;

        const paths = rings.map((ring) =>
          ring.map(([lng, lat]) => ({ lat, lng }))
        );

        const polygon = new google.maps.Polygon({
          paths,
          strokeColor: "#1A5C2A",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#2D7A3A",
          fillOpacity: 0.18,
          map,
          zIndex: 4,
        });
        parksPolygonsRef.current.push(polygon);

        // Label at centroid of largest ring
        const largestRing = rings.reduce((a, b) => (b.length > a.length ? b : a), rings[0]);
        const centLng = largestRing.reduce((s, p) => s + p[0], 0) / largestRing.length;
        const centLat = largestRing.reduce((s, p) => s + p[1], 0) / largestRing.length;

        const acresStr = GIS_Acres
          ? `${Math.round(GIS_Acres).toLocaleString()} ac`
          : "";

        const labelEl = document.createElement("div");
        labelEl.style.cssText = `
          display:flex;flex-direction:column;align-items:center;gap:1px;
          pointer-events:none;
          transform:translate(-50%,-50%);
        `;

        const nameSpan = document.createElement("span");
        nameSpan.style.cssText = `
          font-family:'Source Sans 3',sans-serif;font-size:11px;font-weight:800;
          color:#0D3D1A;white-space:nowrap;line-height:1.2;
          text-shadow:0 0 3px #fff,0 0 6px #fff,0 0 10px #fff,
            1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff;
          background:none;padding:0;
        `;
        nameSpan.textContent = UNIT_NAME ?? "National Park";
        labelEl.appendChild(nameSpan);

        if (acresStr) {
          const acresSpan = document.createElement("span");
          acresSpan.style.cssText = `
            font-family:'Source Sans 3',sans-serif;font-size:9px;font-weight:600;
            color:#1A5C2A;white-space:nowrap;line-height:1.2;
            text-shadow:0 0 3px #fff,0 0 6px #fff,1px 1px 0 #fff,-1px -1px 0 #fff;
          `;
          acresSpan.textContent = acresStr;
          labelEl.appendChild(acresSpan);
        }

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: centLat, lng: centLng },
          content: labelEl,
          zIndex: 5,
        });
        parksLabelsRef.current.push(marker);
      });
    })();
  }, [parksLayerOn, fetchParksData]);

  const handleSelect = useCallback((r: MountainRange) => {
    setSelected(r);
    mapRef.current?.panTo({ lat: r.lat, lng: r.lon });
  }, []);

  // Fetch fire perimeters once (lazy, on first toggle-on)
  const fetchFireData = useCallback(async (): Promise<FireFeature[]> => {
    if (fireDataRef.current) return fireDataRef.current;
    setFireLoading(true);
    setFireError(null);
    try {
      // NIFC WFIGS Interagency Perimeters — Utah wildfires ≥ 5,000 acres, past 3 years.
      // Strategy: fetch ALL perimeters (Final + Daily) for Utah fires ≥ 5,000 ac,
      // then deduplicate per incident keeping: Final perimeter if available, else
      // the most recent Daily perimeter (for active/ongoing fires).
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 3);
      const dateStr = cutoff.toISOString().slice(0, 10);
      const where = encodeURIComponent(
        `attr_POOState='US-UT' AND attr_FireDiscoveryDateTime >= DATE '${dateStr}' AND poly_GISAcres >= 5000`
      );
      const url =
        `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters/FeatureServer/0/query` +
        `?where=${where}` +
        `&outFields=poly_IncidentName,attr_FireDiscoveryDateTime,poly_GISAcres,attr_POOState,attr_IncidentTypeCategory,poly_FeatureCategory,attr_FireOutDateTime,poly_DateCurrent` +
        `&returnGeometry=true&outSR=4326&f=json&resultRecordCount=500&orderByFields=poly_DateCurrent+DESC`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message ?? "API error");
      const allFeatures: FireFeature[] = json.features ?? [];

      // Deduplicate: one polygon per incident name.
      // Priority: "Wildfire Final Fire Perimeter" > most-recent daily perimeter.
      const byName = new Map<string, FireFeature>();
      for (const feat of allFeatures) {
        const name = (feat.attributes.poly_IncidentName ?? "").trim().toLowerCase();
        if (!name) continue;
        const existing = byName.get(name);
        if (!existing) {
          byName.set(name, feat);
          continue;
        }
        const isFinal = feat.attributes.poly_FeatureCategory === "Wildfire Final Fire Perimeter";
        const existingIsFinal = existing.attributes.poly_FeatureCategory === "Wildfire Final Fire Perimeter";
        // Prefer Final over Daily; among same category prefer newer poly_DateCurrent
        if (isFinal && !existingIsFinal) {
          byName.set(name, feat);
        } else if (isFinal === existingIsFinal) {
          const newDate = feat.attributes.poly_DateCurrent ?? 0;
          const oldDate = existing.attributes.poly_DateCurrent ?? 0;
          if (newDate > oldDate) byName.set(name, feat);
        }
      }
      const deduped = Array.from(byName.values());
      fireDataRef.current = deduped;
      return deduped;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setFireError(`Could not load fire data: ${msg}`);
      return [];
    } finally {
      setFireLoading(false);
    }
  }, []);

  // Draw / clear fire polygons whenever toggle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!fireLayerOn) {
      firePolygonsRef.current.forEach((p) => p.setMap(null));
      firePolygonsRef.current = [];
      fireLabelsRef.current.forEach((m) => { m.map = null; });
      fireLabelsRef.current = [];
      return;
    }

    (async () => {
      const features = await fetchFireData();
      if (!features.length) return;

      features.forEach((feat) => {
        const { poly_IncidentName, attr_FireDiscoveryDateTime, poly_GISAcres } = feat.attributes;
        const rings = feat.geometry?.rings;
        if (!rings?.length) return;

        // Convert ArcGIS [lng, lat] rings to Google Maps paths
        const paths = rings.map((ring) =>
          ring.map(([lng, lat]) => ({ lat, lng }))
        );

        const isActive = feat.attributes.attr_FireOutDateTime === null &&
          feat.attributes.poly_FeatureCategory !== "Wildfire Final Fire Perimeter";

        const polygon = new google.maps.Polygon({
          paths,
          strokeColor: isActive ? "#8B2500" : "#3a3a3a",
          strokeOpacity: 0.9,
          strokeWeight: isActive ? 2 : 1.5,
          fillColor: isActive ? "#6B3020" : "#555555",
          fillOpacity: 0.38,
          map,
          zIndex: 5,
        });
        firePolygonsRef.current.push(polygon);

        // Label at centroid of first ring
        const ring0 = rings[0];
        const centLng = ring0.reduce((s, p) => s + p[0], 0) / ring0.length;
        const centLat = ring0.reduce((s, p) => s + p[1], 0) / ring0.length;

        const dateStr = attr_FireDiscoveryDateTime
          ? new Date(attr_FireDiscoveryDateTime).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })
          : "Date unknown";
        const acresStr = poly_GISAcres
          ? `${Math.round(poly_GISAcres).toLocaleString()} ac`
          : "";
        const labelEl = document.createElement("div");
        labelEl.style.cssText = `
          display:flex;flex-direction:column;align-items:center;gap:1px;
          pointer-events:none;
          transform:translate(-50%,-50%);
        `;

        const nameSpan = document.createElement("span");
        nameSpan.style.cssText = `
          font-family:'Source Sans 3',sans-serif;font-size:10px;font-weight:800;
          color:${isActive ? "#8B1A00" : "#1a1a1a"};white-space:nowrap;line-height:1.2;
          text-shadow:0 0 3px #fff,0 0 6px #fff,0 0 10px #fff,
            1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff;
          background:none;padding:0;
        `;
        nameSpan.textContent =
          poly_IncidentName
            ? poly_IncidentName.replace(/\b\w/g, (c) => c.toUpperCase())
            : "Unknown Fire";
        if (isActive) nameSpan.textContent = "🔥 " + nameSpan.textContent;
        labelEl.appendChild(nameSpan);

        const dateSpan = document.createElement("span");
        dateSpan.style.cssText = `
          font-family:'Source Sans 3',sans-serif;font-size:9px;font-weight:600;
          color:#444;white-space:nowrap;line-height:1.2;
          text-shadow:0 0 3px #fff,0 0 6px #fff,1px 1px 0 #fff,-1px -1px 0 #fff;
        `;
        dateSpan.textContent = acresStr
          ? `${dateStr} · ${acresStr}${isActive ? " · ACTIVE" : ""}`
          : `${dateStr}${isActive ? " · ACTIVE" : ""}`;
        labelEl.appendChild(dateSpan);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: centLat, lng: centLng },
          content: labelEl,
          zIndex: 6,
        });
        fireLabelsRef.current.push(marker);
      });
    })();
  }, [fireLayerOn, fetchFireData]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setOptions({
      mapTypeId: "terrain",
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    MOUNTAIN_RANGES.forEach((r) => {
      // Range polygon
      const polygon = new google.maps.Polygon({
        paths: r.polygon.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: r.color, strokeOpacity: 0.85, strokeWeight: 2,
        fillColor: r.color, fillOpacity: 0.18, map,
      });
      polygon.addListener("click", () => setSelected(r));
      polygonsRef.current.push(polygon);

      // Range label at centroid (unused — range name shown below peak pin)
      const centLat = r.polygon.reduce((s, p) => s + p[0], 0) / r.polygon.length;
      const centLng = r.polygon.reduce((s, p) => s + p[1], 0) / r.polygon.length;
      void centLat; void centLng;

      // Peak pin
      const pinEl = createPinElement("#CC0000");
      const peakMarker = new google.maps.marker.AdvancedMarkerElement({
        map, position: { lat: r.lat, lng: r.lon }, content: pinEl,
        title: `${r.peak} — ${r.elevation}`, zIndex: 10,
      });
      peakMarker.addListener("click", () => setSelected(r));

      // Peak name + range name label (two lines, to the right of pin)
      const peakLabelEl = document.createElement("div");
      peakLabelEl.style.cssText = `
        display:flex;flex-direction:column;align-items:flex-start;gap:1px;
        pointer-events:none;
        transform:translate(22px, -26px);
      `;
      const textSpan = document.createElement("span");
      textSpan.style.cssText = `
        font-family:'Source Sans 3',sans-serif;font-size:11.5px;font-weight:800;letter-spacing:0.01em;
        color:#111;white-space:nowrap;line-height:1.2;
        text-shadow:
          0 0 3px #fff, 0 0 6px #fff, 0 0 10px #fff, 0 0 14px #fff,
          1px 1px 0 #fff, -1px -1px 0 #fff,
          1px -1px 0 #fff, -1px 1px 0 #fff,
          2px 2px 0 #fff, -2px -2px 0 #fff,
          2px -2px 0 #fff, -2px 2px 0 #fff;
        background:none;padding:0;
      `;
      textSpan.textContent = r.peak;
      peakLabelEl.appendChild(textSpan);

      const rangeSpan = document.createElement("span");
      rangeSpan.style.cssText = `
        font-family:'Source Sans 3',sans-serif;font-size:10.5px;font-weight:700;
        color:${r.color};white-space:nowrap;line-height:1.2;
        text-shadow:1px 1px 2px #fff,-1px -1px 2px #fff,1px -1px 2px #fff,-1px 1px 2px #fff,
          0 0 4px #fff, 0 0 8px #fff;
      `;
      rangeSpan.textContent = r.range;
      peakLabelEl.appendChild(rangeSpan);
      new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: r.lat, lng: r.lon }, content: peakLabelEl, zIndex: 9 });
    });

    // If fire layer was already on when map became ready, trigger render
    // (handled by the useEffect dependency on fireLayerOn + mapRef)
  }, []);

  const switchMapType = (type: "terrain" | "satellite" | "roadmap") => {
    setMapType(type);
    mapRef.current?.setMapTypeId(type);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>

      {/* ── Header ── */}
      <header
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ height: 56, background: "rgba(28,35,51,0.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <path d="M10 18L17 4L24 18H10Z" fill="#C0522A" />
            <path d="M2 18L9 8L16 18H2Z" fill="#A04020" />
            <path d="M14 6L17 4L20 9" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          </svg>
          <div>
            <div className="text-base font-bold leading-tight" style={{ color: "#EEE8DC", fontFamily: "var(--font-body)" }}>
              Utah Mountain Ranges
            </div>
            <div className="text-xs" style={{ color: "rgba(238,232,220,0.55)" }}>
              Highest Peaks &amp; Range Locations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Peak List button */}
          <button
            onClick={() => setTableOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{
              background: "rgba(192,82,42,0.85)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#C0522A")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(192,82,42,0.85)")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M3 15h18M9 3v18"/>
            </svg>
            Peak List
          </button>

          {/* Fire footprint toggle */}
          <button
            onClick={() => setFireLayerOn((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: fireLayerOn ? "rgba(200,60,20,0.92)" : "rgba(255,255,255,0.10)",
              color: "#fff",
              border: fireLayerOn ? "1px solid rgba(255,120,80,0.5)" : "1px solid rgba(255,255,255,0.15)",
            }}
            title="Toggle recent Utah wildfire perimeters (past 3 years, NIFC/WFIGS data)"
          >
            {fireLoading ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c0 0-5.5 5-5.5 10.5a5.5 5.5 0 0 0 11 0C17.5 7 12 2 12 2z"/>
                <path d="M12 13c0 0-2.5 2-2.5 4a2.5 2.5 0 0 0 5 0C14.5 15 12 13 12 13z" fill="currentColor" strokeWidth="0"/>
              </svg>
            )}
            {fireLoading ? "Loading…" : fireLayerOn ? "Fires: On" : "Fires"}
          </button>

          {/* National Parks toggle */}
          <button
            onClick={() => setParksLayerOn((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: parksLayerOn ? "rgba(29,92,42,0.92)" : "rgba(255,255,255,0.10)",
              color: "#fff",
              border: parksLayerOn ? "1px solid rgba(80,180,100,0.5)" : "1px solid rgba(255,255,255,0.15)",
            }}
            title="Toggle Utah National Park boundaries (Zion, Bryce Canyon, Canyonlands, Arches, Capitol Reef)"
          >
            {parksLoading ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 17l4-8 4 5 3-4 4 7H3z"/>
                <circle cx="17" cy="7" r="2" fill="currentColor" strokeWidth="0"/>
              </svg>
            )}
            {parksLoading ? "Loading…" : parksLayerOn ? "Parks: On" : "Parks"}
          </button>

          {/* Fire footprint toggle */}
          <button
            onClick={() => setFireLayerOn((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: fireLayerOn ? "rgba(200,60,20,0.92)" : "rgba(255,255,255,0.10)",
              color: "#fff",
              border: fireLayerOn ? "1px solid rgba(255,120,80,0.5)" : "1px solid rgba(255,255,255,0.15)",
            }}
            title="Toggle recent Utah wildfire perimeters (past 3 years, NIFC/WFIGS data)"
          >
            {fireLoading ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c0 0-5.5 5-5.5 10.5a5.5 5.5 0 0 0 11 0C17.5 7 12 2 12 2z"/>
                <path d="M12 13c0 0-2.5 2-2.5 4a2.5 2.5 0 0 0 5 0C14.5 15 12 13 12 13z" fill="currentColor" strokeWidth="0"/>
              </svg>
            )}
            {fireLoading ? "Loading…" : fireLayerOn ? "Fires: On" : "Fires"}
          </button>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
            {(["terrain", "satellite", "roadmap"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchMapType(t)}
                className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={{
                  background: mapType === t ? "#C0522A" : "rgba(255,255,255,0.07)",
                  color: mapType === t ? "#fff" : "rgba(238,232,220,0.7)",
                  borderRight: t !== "roadmap" ? "1px solid rgba(255,255,255,0.1)" : undefined,
                }}
              >
                {t === "terrain" ? "Topo" : t === "satellite" ? "Satellite" : "Street"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Fire error toast ── */}
      {fireError && (
        <div
          className="absolute top-16 left-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
          style={{
            transform: "translateX(-50%)",
            background: "rgba(180,30,10,0.95)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            marginTop: 8,
          }}
        >
          {fireError}
          <button
            className="ml-3 text-white/70 hover:text-white"
            onClick={() => setFireError(null)}
          >×</button>
        </div>
      )}

      {/* ── Parks error toast ── */}
      {parksError && (
        <div
          className="absolute z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
          style={{
            top: fireError ? 100 : 72,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,80,30,0.95)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            marginTop: 8,
          }}
        >
          {parksError}
          <button
            className="ml-3 text-white/70 hover:text-white"
            onClick={() => setParksError(null)}
          >×</button>
        </div>
      )}

      {/* ── Map ── */}
      <MapView
        className="absolute inset-0 w-full h-full"
        initialCenter={{ lat: 39.5, lng: -111.5 }}
        initialZoom={7}
        onMapReady={handleMapReady}
      />

      {/* ── Legend ── */}
      <Legend selected={selected} onSelect={handleSelect} />

      {/* ── Detail Sidebar ── */}
      <DetailSidebar range={selected} onClose={() => setSelected(null)} />

      {/* ── Data Table Drawer ── */}
      <DataTableDrawer
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        onSelectRange={(r) => { handleSelect(r); setTableOpen(false); }}
      />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
// ── NPS Park Boundary Types ───────────────────────────────────────────────
interface NpsParkFeature {
  attributes: {
    UNIT_NAME: string;
    UNIT_CODE: string;
    GIS_Acres: number | null;
  };
  geometry: {
    rings: number[][][];
  };
}

// ── Fire Perimeter Types ───────────────────────────────────────────────────
