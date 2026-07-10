/**
 * Utah Mountain Ranges & Highest Peaks — Home Page
 * Design: Utah Topo Field Guide
 * Full-viewport Google Map with floating header, legend, detail sidebar,
 * full-screen data table drawer, and Google Maps directions links.
 */
import { useRef, useState, useCallback } from "react";
import { MapView } from "@/components/Map";
import { MOUNTAIN_RANGES, type MountainRange } from "@/data/ranges";

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

  const handleSelect = useCallback((r: MountainRange) => {
    setSelected(r);
    mapRef.current?.panTo({ lat: r.lat, lng: r.lon });
  }, []);

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

      // Range label at centroid
      const centLat = r.polygon.reduce((s, p) => s + p[0], 0) / r.polygon.length;
      const centLng = r.polygon.reduce((s, p) => s + p[1], 0) / r.polygon.length;
      const labelEl = document.createElement("div");
      labelEl.style.cssText = `font-family:'Source Sans 3',sans-serif;font-size:11px;font-weight:700;color:${r.color};
        text-shadow:1px 1px 2px #fff,-1px -1px 2px #fff,1px -1px 2px #fff,-1px 1px 2px #fff;
        white-space:nowrap;pointer-events:none;transform:translateX(-50%);`;
      labelEl.textContent = r.range;
      const lm = new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: centLat, lng: centLng }, content: labelEl, zIndex: 1 });
      labelsRef.current.push(lm);

      // Peak pin
      const pinEl = createPinElement("#CC0000");
      const peakMarker = new google.maps.marker.AdvancedMarkerElement({
        map, position: { lat: r.lat, lng: r.lon }, content: pinEl,
        title: `${r.peak} — ${r.elevation}`, zIndex: 10,
      });
      peakMarker.addListener("click", () => setSelected(r));

      // Peak name label
      const peakLabelEl = document.createElement("div");
      peakLabelEl.style.cssText = `font-family:'Source Sans 3',sans-serif;font-size:10px;font-weight:600;color:#1a1a1a;
        text-shadow:1px 1px 2px #fff,-1px -1px 2px #fff,1px -1px 2px #fff,-1px 1px 2px #fff;
        white-space:nowrap;pointer-events:none;transform:translate(12px,-20px);`;
      peakLabelEl.textContent = r.peak;
      new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: r.lat, lng: r.lon }, content: peakLabelEl, zIndex: 9 });
    });
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

        <div className="flex items-center gap-3">
          {/* View Data Table button */}
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
            View Data Table
          </button>

          {/* Map type toggle */}
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
      `}</style>
    </div>
  );
}
