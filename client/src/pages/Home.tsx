/*
 * Utah Mountain Ranges & Highest Peaks — Home Page
 * Design: Utah Topo Field Guide
 * Full-viewport Google Map with floating header, legend, detail sidebar,
 * full-screen data table drawer, and Google Maps directions links.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import React from "react";
import { MapView } from "@/components/Map";
import { MOUNTAIN_RANGES, type MountainRange } from "@/data/ranges";
import { WURL_CENTER, WURL_COLOR, WURL_PEAKS, WURL_ZOOM, type WurlPeak } from "@/data/wurl";
import { WURL_ROUTE_DIRECTION, WURL_ROUTE_DISTANCE_MI, WURL_ROUTE_PATH } from "@/data/wurlRoute";
import { OTHER_PEAK_COLOR, OTHER_PEAK_GROUPS, OTHER_PEAKS, type OtherPeak } from "@/data/otherPeaks";
import { SKI_RESORT_COLOR, UTAH_SKI_RESORTS } from "@/data/skiResorts";
import { PROTECTED_AREA_COLORS, PROTECTED_AREA_SOURCES, type ProtectedAreaKind } from "@/data/protectedAreas";
import { WIRE_PASS_BUCKSKIN_ROUTE, type TrailRoute } from "@/data/southernUtahTrail";

const WURL_GROUP = "WURL · Central Wasatch";
const SORTED_MOUNTAIN_RANGES = [...MOUNTAIN_RANGES].sort((a, b) => b.elevationFt - a.elevationFt);
const OTHER_PEAK_FILTERS = [
  "All areas",
  "Central Wasatch",
  WURL_GROUP,
  ...OTHER_PEAK_GROUPS.filter((name) => name !== "Central Wasatch"),
];
const SKIER_OUTLINE_URL = "/manus-storage/utah-peaks-skier-outline-192_4bb0a0ee.png";

function mapLabelScale(zoom: number) {
  // Maintain the base label size at overview zooms, then outpace standard
  // Google basemap labels as the user zooms into detailed terrain.
  return Math.min(1.45, Math.max(1, 1 + Math.max(0, zoom - 10) * 0.09));
}

function syncMapLabelSizes(map: google.maps.Map) {
  const scale = mapLabelScale(map.getZoom() ?? 10);
  document.querySelectorAll<HTMLElement>("[data-map-label-base-size]").forEach((label) => {
    const baseSize = Number(label.dataset.mapLabelBaseSize);
    if (Number.isFinite(baseSize)) label.style.fontSize = `${(baseSize * scale).toFixed(2)}px`;
  });
}

function syncMapLabelSizesAfterRender(map: google.maps.Map) {
  // AdvancedMarker content is attached asynchronously. The short follow-up pass
  // catches image-backed ski markers, which may mount after the next frame.
  requestAnimationFrame(() => {
    syncMapLabelSizes(map);
    window.setTimeout(() => syncMapLabelSizes(map), 250);
  });
}

// ── About Modal ───────────────────────────────────────────────────────────
function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden overflow-y-auto"
        style={{
          background: "#F5F0E8",
          maxWidth: 520,
          width: "calc(100% - 32px)",
          maxHeight: "90vh",
          fontFamily: "var(--font-body)",
          animation: "modalIn 0.22s cubic-bezier(0.23,1,0.32,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ background: "#1C2333", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-1">
            <img
              src="/manus-storage/utah-peaks-heritage-logo-512_354899d2.png"
              alt="Utah Peaks heritage emblem"
              style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <div style={{ color: "#EEE8DC", fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                Utah Peaks
              </div>
              <div style={{ color: "rgba(238,232,220,0.5)", fontSize: 11 }}>
                A project by Chris Roberts
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4" style={{ color: "#3D3D3D", fontSize: 14, lineHeight: 1.7 }}>
          <p>
            I was born and raised at the base of the Wasatch Mountains and found myself in the canyons and
            climbing peaks on a regular basis. After almost 3 decades away, I moved back
            full time in the fall of 2025. This map is my attempt to explore the entire state again —
            not from a car window, but from the top of it.
          </p>
          {/* Photo */}
          <div>
            <img
              src="/manus-storage/markagunt_zion_27b24df0_238bd347.jpg"
              alt="Chris Roberts on the Markagunt Plateau with Zion NP in the distance"
              style={{
                width: "100%",
                borderRadius: 10,
                objectFit: "cover",
                border: "2px solid rgba(192,82,42,0.3)",
                display: "block",
              }}
            />
            <div style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 5 }}>
              Zion NP from the Markagunt Plateau
            </div>
          </div>
          <p style={{ color: "#888", fontSize: 13, fontStyle: "italic", margin: 0 }}>
            The goal is simple: hike to the highest point of each of Utah's major mountain ranges.
            Some are long days. Some are scrambles. All of them are worth it.
            <br /><br />
            This is a work in progress. New summits added as they happen.
          </p>

          {/* Progress bar */}
          <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Progress
            </div>
            {(() => {
              const summited = MOUNTAIN_RANGES.filter(r => r.summited).length;
              const attempted = MOUNTAIN_RANGES.filter(r => r.attempted && !r.summited).length;
              const total = MOUNTAIN_RANGES.length;
              const pct = Math.round((summited / total) * 100);
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 6 }}>
                    <span>{summited} of {total} summited</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(0,0,0,0.1)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "#1A6B3A", borderRadius: 4, transition: "width 0.6s ease" }} />
                  </div>
                  {attempted > 0 && (
                    <div style={{ fontSize: 11, color: "#B7950B", marginTop: 6 }}>
                      + {attempted} attempted (not yet summited)
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#C0522A" }}
          >
            Close
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors text-xl leading-none"
          aria-label="Close"
        >×</button>
      </div>
    </div>
  );
}

// ── Peak Journal Modal ────────────────────────────────────────────────────
function PeakJournalModal({ range, onClose }: { range: MountainRange | null; onClose: () => void }) {
  if (!range) return null;
  const isSummited = range.summited === true;
  const isAttempted = range.attempted === true && !isSummited;
  const hasPhotos = !!(range.trailheadPhoto || range.summitPhoto);
  const hasExtra = !!(range.extraPhotos?.length || range.videoUrl);
  const journalPhotos = [range.trailheadPhoto, range.summitPhoto, ...(range.extraPhotos ?? [])].filter(
    (photo): photo is { url: string; caption?: string } => Boolean(photo),
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightbox = lightboxIndex === null ? null : journalPhotos[lightboxIndex] ?? null;
  const openLightbox = (photo: { url: string; caption?: string }) => {
    const index = journalPhotos.findIndex((item) => item.url === photo.url);
    setLightboxIndex(index >= 0 ? index : 0);
  };
  const moveLightbox = useCallback((direction: -1 | 1) => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null || journalPhotos.length < 2) return currentIndex;
      return (currentIndex + direction + journalPhotos.length) % journalPhotos.length;
    });
  }, [journalPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveLightbox(1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setLightboxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, moveLightbox]);

  return (
    <>
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "#F5F0E8",
          maxWidth: 560,
          width: "calc(100% - 16px)",
          maxHeight: "92vh",
          overflowY: "auto",
          fontFamily: "var(--font-body)",
          animation: "modalIn 0.22s cubic-bezier(0.23,1,0.32,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between gap-2" style={{ background: range.color }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              {range.range}
            </div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", lineHeight: 1.2 }}>
              {range.peak}
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
              {range.elevation}
            </div>
          </div>
          {/* Status badge */}
          <div style={{
            background: isSummited ? "rgba(255,255,255,0.25)" : isAttempted ? "rgba(255,200,0,0.3)" : "rgba(0,0,0,0.2)",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {isSummited ? "✓ Summited" : isAttempted ? "⚡ Attempted" : "○ Not yet hiked"}
          </div>
        </div>

        {/* Date & note */}
        {(isSummited || isAttempted) && (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            {isSummited && range.summitDate && (
              <div style={{ fontSize: 13, color: "#1A6B3A", fontWeight: 700, marginBottom: 8 }}>
                📅 Summited {range.summitDate}
              </div>
            )}
            {isAttempted && range.attemptDate && (
              <div style={{ fontSize: 13, color: "#B7950B", fontWeight: 700, marginBottom: 8 }}>
                📅 Attempted {range.attemptDate}
              </div>
            )}
            {(range.hikeNote || range.attemptNote) && (
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65, margin: 0 }}>
                {range.hikeNote ?? range.attemptNote}
              </p>
            )}
          </div>
        )}

        {/* Access and route advisory */}
        {range.accessNotes && range.accessNotes.length > 0 && (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ background: "#EEE4D0", border: "1px solid rgba(133,88,18,0.25)", borderRadius: 9, padding: "12px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#735111", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 3 2.8 20h18.4L12 3Z" />
                  <path d="M12 9v4.5M12 17h.01" />
                </svg>
                Access &amp; route advisory
              </div>
              <ul style={{ margin: 0, paddingLeft: 17, color: "#51472E", fontSize: 12, lineHeight: 1.55 }}>
                {range.accessNotes.map((note) => (
                  <li key={note} style={{ marginBottom: 5 }}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Photos */}
        {hasPhotos && (
          <div className="px-5 py-4 grid gap-4" style={{ gridTemplateColumns: range.trailheadPhoto && range.summitPhoto ? "1fr 1fr" : "1fr", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            {range.trailheadPhoto && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 6 }}>Trailhead</div>
                <img
                  src={range.trailheadPhoto.url}
                  alt={`${range.peak} trailhead`}
                  style={{ width: "100%", borderRadius: 8, objectFit: "cover", aspectRatio: "4/3", cursor: "zoom-in" }}
                  onClick={() => openLightbox(range.trailheadPhoto!)}
                />
                {range.trailheadPhoto.caption && (
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{range.trailheadPhoto.caption}</div>
                )}
              </div>
            )}
            {range.summitPhoto && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 6 }}>Summit</div>
                <img
                  src={range.summitPhoto.url}
                  alt={`${range.peak} summit`}
                  style={{ width: "100%", borderRadius: 8, objectFit: "cover", aspectRatio: "4/3", cursor: "zoom-in" }}
                  onClick={() => openLightbox(range.summitPhoto!)}
                />
                {range.summitPhoto.caption && (
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{range.summitPhoto.caption}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Extra gallery photos + video */}
        {hasExtra && (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            {range.extraPhotos && range.extraPhotos.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 8 }}>
                  More from this hike
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {range.extraPhotos.map((photo, i) => (
                    <div key={i}>
                      <img
                        src={photo.url}
                        alt={photo.caption ?? `Photo ${i + 1}`}
                        style={{ width: "100%", borderRadius: 6, objectFit: "cover", aspectRatio: "4/3", display: "block", cursor: "zoom-in" }}
                        title={photo.caption}
                        onClick={() => openLightbox(photo)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            {range.videoUrl && (
              <a
                href={range.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  marginTop: range.extraPhotos?.length ? 12 : 0,
                  background: "#1C2333",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Watch Video
              </a>
            )}
          </div>
        )}

        {/* Not yet hiked placeholder */}
        {!isSummited && !isAttempted && (
          <div className="px-5 py-8 text-center" style={{ color: "#aaa", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏔</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#888" }}>Not yet attempted</div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Photos and notes will appear here after the hike.</div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, color: "#aaa" }}>
            {range.trailhead} · {range.gain} gain
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: range.color }}
          >
            Close
          </button>
        </div>
      </div>
    </div>

    {/* Lightbox overlay — rendered outside the modal card so it covers the full screen */}
    {lightbox && (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={() => setLightboxIndex(null)}
      >
        <img
          src={lightbox.url}
          alt={lightbox.caption ?? "Photo"}
          style={{ maxWidth: "min(92vw, 1000px)", maxHeight: "82vh", borderRadius: 10, objectFit: "contain", boxShadow: "0 8px 60px rgba(0,0,0,0.6)" }}
          onClick={(e) => e.stopPropagation()}
        />
        {journalPhotos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }}
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.35)", background: "rgba(15,20,28,0.64)", color: "#fff", fontSize: 34, lineHeight: 1, cursor: "pointer", display: "grid", placeItems: "center", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), background 160ms ease" }}
              onMouseEnter={(event) => { event.currentTarget.style.background = "rgba(45,58,76,0.92)"; event.currentTarget.style.transform = "translateY(-50%) scale(1.06)"; }}
              onMouseLeave={(event) => { event.currentTarget.style.background = "rgba(15,20,28,0.64)"; event.currentTarget.style.transform = "translateY(-50%)"; }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => { event.stopPropagation(); moveLightbox(1); }}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.35)", background: "rgba(15,20,28,0.64)", color: "#fff", fontSize: 34, lineHeight: 1, cursor: "pointer", display: "grid", placeItems: "center", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), background 160ms ease" }}
              onMouseEnter={(event) => { event.currentTarget.style.background = "rgba(45,58,76,0.92)"; event.currentTarget.style.transform = "translateY(-50%) scale(1.06)"; }}
              onMouseLeave={(event) => { event.currentTarget.style.background = "rgba(15,20,28,0.64)"; event.currentTarget.style.transform = "translateY(-50%)"; }}
            >
              ›
            </button>
            <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", borderRadius: 999, background: "rgba(15,20,28,0.72)", color: "rgba(255,255,255,0.85)", padding: "6px 11px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
              {(lightboxIndex ?? 0) + 1} / {journalPhotos.length}
            </div>
          </>
        )}
        {lightbox.caption && (
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 12, textAlign: "center", maxWidth: 600 }}>
            {lightbox.caption}
          </div>
        )}
        <button
          type="button"
          aria-label="Close photo viewer"
          onClick={(event) => { event.stopPropagation(); setLightboxIndex(null); }}
          style={{ position: "absolute", top: 16, right: 20, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >×</button>
      </div>
    )}
    </>
  );
}

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

function otherPeakDirectionsUrl(peak: OtherPeak) {
  return peak.trailheadDirectionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(peak.trailhead)}&travelmode=driving`;
}

function trailRouteDirectionsUrl(route: TrailRoute) {
  return `https://www.google.com/maps/dir/?api=1&destination=${route.trailheadLat},${route.trailheadLon}&travelmode=driving`;
}

function createPinElement(color = "#CC0000", badge?: "summited" | "attempted"): HTMLElement {
  const div = document.createElement("div");
  div.style.cssText = "position:relative;width:18px;height:26px;cursor:pointer;";
  div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 18 26">
      <path d="M9 0 C4.03 0 0 4.03 0 9 C0 15.75 9 26 9 26 C9 26 18 15.75 18 9 C18 4.03 13.97 0 9 0 Z"
            fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
      <circle cx="9" cy="9" r="3.2" fill="white" opacity="0.9"/>
    </svg>
    ${badge === "summited" ? `<div style="position:absolute;top:-7px;right:-7px;width:14px;height:14px;border-radius:50%;background:#1A6B3A;border:1.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:700;line-height:1;">✓</div>` : ""}
    ${badge === "attempted" ? `<div style="position:absolute;top:-7px;right:-7px;width:14px;height:14px;border-radius:50%;background:#B7950B;border:1.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:700;line-height:1;">!</div>` : ""}
  `;
  return div;
}

function createWurlPinElement(): HTMLElement {
  const div = document.createElement("div");
  div.style.cssText = "position:relative;width:20px;height:28px;cursor:pointer;filter:drop-shadow(0 2px 2px rgba(43,18,70,0.35));";
  div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20 28">
      <path d="M10 1 C4.48 1 0 5.48 0 11 C0 18.5 10 27 10 27 C10 27 20 18.5 20 11 C20 5.48 15.52 1 10 1 Z" fill="#6B3FA0" stroke="rgba(255,255,255,0.95)" stroke-width="1.6"/>
      <path d="M5.1 13.6l3.2-5 2.1 2.8 2.1-3.5 3 5.7H5.1z" fill="white" opacity="0.94"/>
    </svg>
  `;
  return div;
}

function createOtherPeakPinElement(): HTMLElement {
  const div = document.createElement("div");
  div.style.cssText = "position:relative;width:20px;height:28px;cursor:pointer;filter:drop-shadow(0 2px 2px rgba(10,39,62,0.35));";
  div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20 28" aria-hidden="true">
      <path d="M10 1 C4.48 1 0 5.48 0 11 C0 18.5 10 27 10 27 C10 27 20 18.5 20 11 C20 5.48 15.52 1 10 1 Z" fill="${OTHER_PEAK_COLOR}" stroke="rgba(255,255,255,0.95)" stroke-width="1.6"/>
      <path d="M4.8 14.4 8.4 8.2l2.4 3.1 2.2-3.7 2.7 6.8H4.8z" fill="white" opacity="0.95"/>
    </svg>
  `;
  return div;
}

function SkierIcon({ size = 13 }: { size?: number }) {
  return (
    <img
      src={SKIER_OUTLINE_URL}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size, display: "block", objectFit: "contain" }}
    />
  );
}

function createSkiResortPinElement(): HTMLElement {
  const div = document.createElement("div");
  div.style.cssText = "position:relative;width:22px;height:22px;cursor:pointer;filter:drop-shadow(0 2px 2px rgba(8,47,73,0.32));";
  div.innerHTML = `
    <span style="display:grid;place-items:center;width:22px;height:22px;border-radius:999px;background:${SKI_RESORT_COLOR};border:1.5px solid rgba(255,255,255,0.96);box-sizing:border-box;color:#fff;">
      <img src="${SKIER_OUTLINE_URL}" alt="" aria-hidden="true" style="display:block;width:15px;height:15px;object-fit:contain;"/>
    </span>
  `;
  return div;
}

// ── Data Table Drawer ─────────────────────────────────────────────────────
function DataTableDrawer({
  open,
  onClose,
  onSelectRange,
  onOpenJournal,
  onOpenOtherPeaks,
}: {
  open: boolean;
  onClose: () => void;
  onSelectRange: (r: MountainRange) => void;
  onOpenJournal: (r: MountainRange) => void;
  onOpenOtherPeaks: () => void;
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
            <img
              src="/manus-storage/utah-peaks-heritage-logo-512_354899d2.png"
              alt="Utah Peaks heritage emblem"
              style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <div style={{ color: "#EEE8DC", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>
                Utah Peaks
              </div>
              <div style={{ color: "rgba(238,232,220,0.5)", fontSize: 11 }}>
                {MOUNTAIN_RANGES.length} ranges · highest peaks &amp; trailheads
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenOtherPeaks}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors hover:bg-[#E7F3FB]"
              style={{ color: OTHER_PEAK_COLOR, border: "1px solid #A4C6DD", background: "#FFFFFF" }}
              title="Open the Other Peaks catalog"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m3 18 5-9 4 5 3-4 6 8H3Z"/><path d="m8 9 2-3 2 3"/>
              </svg>
              <span className="hidden sm:inline">Other Peaks</span>
              <span className="sm:hidden">Other</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close highest peaks table"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="overflow-auto flex-1">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#2D2D2D", color: "#EEE8DC", position: "sticky", top: 0, zIndex: 1 }}>
                {[
                  { label: "Range", mobile: true },
                  { label: "Highest Peak", mobile: true },
                  { label: "Elevation", mobile: true },
                  { label: "Coordinates", mobile: false },
                  { label: "Primary Trailhead", mobile: false },
                  { label: "Elev. Gain", mobile: false },
                  { label: "Directions", mobile: true },
                  { label: "Hike & Photos", mobile: true },
                ].map(({ label, mobile }) => (
                  <th
                    key={label}
                    className={mobile ? "" : "hidden sm:table-cell"}
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
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SORTED_MOUNTAIN_RANGES.map((r, i) => {
                const photoCount = (r.trailheadPhoto ? 1 : 0) + (r.summitPhoto ? 1 : 0) + (r.extraPhotos?.length ?? 0);
                return (
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
                  <td className="hidden sm:table-cell" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#555", fontFamily: "monospace", fontSize: 12, whiteSpace: "nowrap" }}>
                    {r.lat}° N, {Math.abs(r.lon)}° W
                  </td>
                  {/* Trailhead */}
                  <td className="hidden sm:table-cell" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#3D3D3D" }}>
                    {r.trailhead}
                  </td>
                  {/* Elevation gain */}
                  <td className="hidden sm:table-cell" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#555", whiteSpace: "nowrap" }}>
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
                  {/* Summit status and photo journal */}
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }} title={r.summited ? `Summited ${r.summitDate ?? ""}` : r.attempted ? `Attempted ${r.attemptDate ?? ""}` : "Not yet hiked"}>
                        <span
                          aria-label={r.summited ? "Summited" : "Not summited"}
                          style={{ width: 15, height: 15, borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", background: r.summited ? "#1A6B3A" : "transparent", border: r.summited ? "1px solid #1A6B3A" : "1.5px solid #A6A6A6", color: "#fff", flexShrink: 0 }}
                        >
                          {r.summited && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M2 6.2 4.7 9 10 3" /></svg>}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: r.summited ? "#1A6B3A" : r.attempted ? "#9A6C00" : "#777" }}>
                          {r.summited ? "Summited" : r.attempted ? "Attempted" : "Not hiked"}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={photoCount === 0}
                        onClick={() => { onOpenJournal(r); onClose(); }}
                        aria-label={photoCount ? `Open ${r.peak} photos` : `No photos available for ${r.peak}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: photoCount ? r.color : "#B7B2A8",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        transition: "filter 0.15s, opacity 0.15s",
                        cursor: photoCount ? "pointer" : "not-allowed",
                      }}
                        onMouseEnter={(e) => { if (photoCount) e.currentTarget.style.filter = "brightness(0.85)"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        {photoCount ? `${photoCount} ${photoCount === 1 ? "photo" : "photos"}` : "No photos"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
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
          Click any row to jump to that range on the map · Directions open in Google Maps · Photos open the hike journal
        </div>
      </div>
    </>
  );
}

// ── WURL Peak Table Drawer ─────────────────────────────────────────────────
function WurlTableDrawer({
  open,
  onClose,
  onSelectPeak,
}: {
  open: boolean;
  onClose: () => void;
  onSelectPeak: (peak: WurlPeak) => void;
}) {
  const directionsUrl = (peak: WurlPeak) =>
    `https://www.google.com/maps/dir/?api=1&destination=${peak.trailheadLat},${peak.trailheadLon}&travelmode=driving`;

  const formatNumber = (value: number | null) =>
    value === null ? "—" : Math.round(value).toLocaleString();

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
        aria-label="WURL major peaks and recommended routes"
        style={{
          background: "#F5F0E8",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          height: "min(82vh, 680px)",
          maxHeight: "82vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.23,1,0.32,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-body)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "#34214E", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 30, height: 30, background: "rgba(194,166,233,0.18)", border: "1px solid rgba(214,193,244,0.3)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D9C3F2" strokeWidth="2">
                <path d="M3 18l5-9 4 5 3-4 6 8H3z"/><path d="M8 9l2-3 2 3"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div style={{ color: "#F5EFFF", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>
                WURL Peaks
              </div>
              <div style={{ color: "rgba(245,239,255,0.62)", fontSize: 11 }}>
                {WURL_PEAKS.length} curated major summits · Little Cottonwood Canyon
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close WURL peaks table"
          >
            ×
          </button>
        </div>

        <div className="overflow-auto flex-1">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#4A3070", color: "#F7F0FF", position: "sticky", top: 0, zIndex: 1 }}>
                {[
                  { label: "WURL Peak", mobile: true },
                  { label: "Elevation", mobile: true },
                  { label: "Recommended Route", mobile: false },
                  { label: "Round Trip", mobile: false },
                  { label: "Elev. Gain", mobile: false },
                  { label: "Directions", mobile: true },
                ].map(({ label, mobile }) => (
                  <th
                    key={label}
                    className={mobile ? "" : "hidden sm:table-cell"}
                    style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WURL_PEAKS.map((peak, i) => (
                <tr
                  key={peak.name}
                  style={{ background: i % 2 === 0 ? "rgba(245,240,232,1)" : "rgba(235,229,218,0.7)", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,63,160,0.10)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(245,240,232,1)" : "rgba(235,229,218,0.7)")}
                  onClick={() => { onSelectPeak(peak); onClose(); }}
                >
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                    <a
                      href={peak.peakSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      style={{ fontWeight: 700, color: "#392258", textDecoration: "none" }}
                      title="Open Peakbagger peak page"
                    >
                      {peak.name}
                    </a>
                  </td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 600, color: WURL_COLOR, whiteSpace: "nowrap" }}>
                    {Math.round(peak.elevationFt).toLocaleString()} ft
                  </td>
                  <td className="hidden sm:table-cell" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#3D3D3D", minWidth: 220 }}>
                    <div style={{ fontWeight: 600 }}>{peak.recommendedTrailhead}</div>
                    <div style={{ fontSize: 11, color: "#777", marginTop: 2, maxWidth: 430 }}>{peak.routeNote}</div>
                  </td>
                  <td className="hidden sm:table-cell" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#555", whiteSpace: "nowrap" }}>
                    {peak.distanceRtMi === null ? "—" : `${peak.distanceRtMi} mi`}
                  </td>
                  <td className="hidden sm:table-cell" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#555", whiteSpace: "nowrap" }}>
                    {peak.elevationGainFt === null ? "—" : `${formatNumber(peak.elevationGainFt)} ft`}
                  </td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.06)" }} onClick={(event) => event.stopPropagation()}>
                    <a
                      href={directionsUrl(peak)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#1A6B3A", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                      Directions
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 text-xs flex-shrink-0" style={{ color: "#74677E", borderTop: "1px solid rgba(0,0,0,0.08)", background: "#EDE8DF" }}>
          Click a row to locate the summit · Directions open the recommended trailhead in Google Maps · Route figures vary by line and access.
        </div>
      </div>
    </>
  );
}

// ── Other Peaks Catalog Drawer ──────────────────────────────────────────────
function OtherPeaksDrawer({
  open,
  onClose,
  onSelectPeak,
  onSelectTrailRoute,
  onSelectWurlPeak,
  wurlVisible,
  onToggleWurl,
  onOpenPeakList,
}: {
  open: boolean;
  onClose: () => void;
  onSelectPeak: (peak: OtherPeak) => void;
  onSelectTrailRoute: (route: TrailRoute) => void;
  onSelectWurlPeak: (peak: WurlPeak) => void;
  wurlVisible: boolean;
  onToggleWurl: () => void;
  onOpenPeakList: () => void;
}) {
  const [group, setGroup] = useState<string>("All areas");
  const isWurlGroup = group === WURL_GROUP;
  const isSouthernUtahGroup = group === "Southern Utah";
  const visiblePeaks = group === "All areas"
    ? OTHER_PEAKS
    : OTHER_PEAKS.filter((peak) => peak.group === group);

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
        aria-label="Other prominent Utah peaks"
        style={{
          background: "#F5F0E8",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          height: "min(84vh, 720px)",
          maxHeight: "84vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.23,1,0.32,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-body)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 flex-shrink-0"
          style={{ background: OTHER_PEAK_COLOR, borderBottom: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-hidden="true"
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 30, height: 30, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E9F4FF" strokeWidth="2">
                <path d="m3 18 5-9 4 5 3-4 6 8H3Z" /><path d="m8 9 2-3 2 3" />
              </svg>
            </div>
            <div className="min-w-0">
              <div style={{ color: "#F3F8FC", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700 }}>
                Other Peaks
              </div>
              <div style={{ color: "rgba(232,244,255,0.72)", fontSize: 11 }}>
                {OTHER_PEAKS.length} independent summits · plus curated route cards
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPeakList}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors hover:bg-[#E7F3FB]"
              style={{ color: OTHER_PEAK_COLOR, border: "1px solid #A4C6DD", background: "#FFFFFF" }}
              title="Return to highest peaks in every range"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
              </svg>
              <span className="hidden sm:inline">Highest Peaks</span>
              <span className="sm:hidden">Peaks</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close Other Peaks catalog"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter Other Peaks by area">
            {OTHER_PEAK_FILTERS.map((name) => {
              const selected = group === name;
              const isWurlFilter = name === WURL_GROUP;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setGroup(name)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
                  style={{
                    background: selected ? (isWurlFilter ? WURL_COLOR : OTHER_PEAK_COLOR) : (isWurlFilter ? "rgba(107,63,160,0.10)" : "rgba(18,59,93,0.08)"),
                    color: selected ? "#fff" : (isWurlFilter ? WURL_COLOR : OTHER_PEAK_COLOR),
                    border: selected ? "1px solid transparent" : (isWurlFilter ? "1px solid rgba(107,63,160,0.20)" : "1px solid rgba(18,59,93,0.16)"),
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-auto flex-1 px-4 sm:px-6 py-4">
          {isWurlGroup ? (
            <>
              <div className="rounded-xl p-4 mb-4" style={{ background: "#F1EAF9", border: "1px solid rgba(107,63,160,0.28)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div style={{ color: WURL_COLOR, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Central Wasatch route group</div>
                    <div style={{ color: "#392258", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Wasatch Ultimate Ridge Linkup</div>
                    <div style={{ color: "#705B85", fontSize: 12, lineHeight: 1.42, marginTop: 4 }}>A dedicated, advanced 17-summit Little Cottonwood Canyon linkup. Purple pins and a {WURL_ROUTE_DISTANCE_MI}-mile reference line show the {WURL_ROUTE_DIRECTION} route; either direction is valid.</div>
                    <a
                      href="https://runuphill.wordpress.com/2015/08/23/wasatch-ultimate-ridge-linkup-wurl/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 rounded-md px-2 py-1 text-[11px] font-extrabold transition-colors"
                      style={{ color: "#5A338B", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(107,63,160,0.28)", textDecoration: "none" }}
                    >
                      Official WURL page · verified completions &amp; records ↗
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleWurl}
                    className="flex-shrink-0 rounded-lg px-3 py-2 text-xs font-extrabold transition-colors"
                    style={{ background: wurlVisible ? WURL_COLOR : "#fff", color: wurlVisible ? "#fff" : WURL_COLOR, border: `1px solid ${WURL_COLOR}` }}
                    aria-pressed={wurlVisible}
                  >
                    {wurlVisible ? "WURL Layer: On" : "WURL Layer: Off"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {WURL_PEAKS.map((peak) => (
                  <div
                    key={peak.name}
                    role="button"
                    tabIndex={0}
                    onClick={() => { onSelectWurlPeak(peak); onClose(); }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectWurlPeak(peak);
                        onClose();
                      }
                    }}
                    className="text-left rounded-xl p-4 transition-transform active:scale-[0.98]"
                    style={{ background: "#FFFDF9", border: "1px solid rgba(107,63,160,0.18)", boxShadow: "0 2px 9px rgba(25,38,52,0.06)" }}
                    onMouseEnter={(event) => { event.currentTarget.style.borderColor = "rgba(107,63,160,0.48)"; event.currentTarget.style.boxShadow = "0 6px 18px rgba(107,63,160,0.13)"; }}
                    onMouseLeave={(event) => { event.currentTarget.style.borderColor = "rgba(107,63,160,0.18)"; event.currentTarget.style.boxShadow = "0 2px 9px rgba(25,38,52,0.06)"; }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div style={{ color: WURL_COLOR, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>WURL · Central Wasatch</div>
                        <div style={{ color: "#392258", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, lineHeight: 1.15 }}>{peak.name}</div>
                      </div>
                      <div className="flex-shrink-0 rounded-md px-2 py-1" style={{ background: "#F1EAF9", color: WURL_COLOR, fontSize: 11, fontWeight: 800 }}>{Math.round(peak.elevationFt).toLocaleString()} ft</div>
                    </div>
                    <div style={{ color: "#705B85", fontSize: 11, marginTop: 7, fontWeight: 700 }}>{peak.recommendedTrailhead}</div>
                    <div style={{ color: "#776D7F", fontSize: 11, lineHeight: 1.42, marginTop: 5 }}>{peak.routeNote}</div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span style={{ color: WURL_COLOR, fontSize: 11, fontWeight: 800 }}>Locate on map →</span>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${peak.trailheadLat},${peak.trailheadLon}&travelmode=driving`} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} style={{ color: "#1A6B3A", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>Directions ↗</a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {isSouthernUtahGroup && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => { onSelectTrailRoute(WIRE_PASS_BUCKSKIN_ROUTE); onClose(); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectTrailRoute(WIRE_PASS_BUCKSKIN_ROUTE);
                    onClose();
                  }
                }}
                className="text-left rounded-xl p-4 transition-transform active:scale-[0.98]"
                style={{ background: "#FFFDF9", border: "1px solid rgba(18,59,93,0.32)", boxShadow: "0 2px 9px rgba(25,38,52,0.07)" }}
                onMouseEnter={(event) => { event.currentTarget.style.borderColor = "rgba(18,59,93,0.60)"; event.currentTarget.style.boxShadow = "0 6px 18px rgba(18,59,93,0.15)"; }}
                onMouseLeave={(event) => { event.currentTarget.style.borderColor = "rgba(18,59,93,0.32)"; event.currentTarget.style.boxShadow = "0 2px 9px rgba(25,38,52,0.07)"; }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div style={{ color: OTHER_PEAK_COLOR, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>Southern Utah · Trail route</div>
                    <div style={{ color: "#263442", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, lineHeight: 1.15 }}>{WIRE_PASS_BUCKSKIN_ROUTE.name}</div>
                  </div>
                  <div className="flex-shrink-0 rounded-md px-2 py-1" style={{ background: "#E8F0F7", color: OTHER_PEAK_COLOR, fontSize: 11, fontWeight: 800 }}>17+ mi</div>
                </div>
                <div style={{ color: "#354B5E", fontSize: 12, fontWeight: 700, marginTop: 9 }}>Distance · {WIRE_PASS_BUCKSKIN_ROUTE.distance}</div>
                <div style={{ color: OTHER_PEAK_COLOR, fontSize: 11, fontWeight: 800, marginTop: 8 }}>Trailhead · {WIRE_PASS_BUCKSKIN_ROUTE.trailhead}</div>
                <div className="flex items-center justify-between gap-2 mt-3">
                  <span style={{ color: OTHER_PEAK_COLOR, fontSize: 11, fontWeight: 800 }}>Locate on map →</span>
                  <a
                    href={trailRouteDirectionsUrl(WIRE_PASS_BUCKSKIN_ROUTE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    style={{ display: "inline-flex", alignItems: "center", background: "#1A6B3A", color: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 800, textDecoration: "none" }}
                    onMouseEnter={(event) => (event.currentTarget.style.background = "#145229")}
                    onMouseLeave={(event) => (event.currentTarget.style.background = "#1A6B3A")}
                  >
                    Trailhead directions ↗
                  </a>
                </div>
              </div>
            )}
            {visiblePeaks.map((peak) => (
              <div
                key={peak.id}
                role="button"
                tabIndex={0}
                onClick={() => { onSelectPeak(peak); onClose(); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectPeak(peak);
                    onClose();
                  }
                }}
                className="text-left rounded-xl p-4 transition-transform active:scale-[0.98]"
                style={{ background: "#FFFDF9", border: "1px solid rgba(18,59,93,0.14)", boxShadow: "0 2px 9px rgba(25,38,52,0.06)" }}
                onMouseEnter={(event) => { event.currentTarget.style.borderColor = "rgba(18,59,93,0.42)"; event.currentTarget.style.boxShadow = "0 6px 18px rgba(18,59,93,0.13)"; }}
                onMouseLeave={(event) => { event.currentTarget.style.borderColor = "rgba(18,59,93,0.14)"; event.currentTarget.style.boxShadow = "0 2px 9px rgba(25,38,52,0.06)"; }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div style={{ color: OTHER_PEAK_COLOR, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>{peak.group}</div>
                    <div style={{ color: "#263442", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, lineHeight: 1.15 }}>{peak.name}</div>
                  </div>
                  <div className="flex-shrink-0 rounded-md px-2 py-1" style={{ background: "#E8F0F7", color: OTHER_PEAK_COLOR, fontSize: 11, fontWeight: 800 }}>
                    {peak.elevationFt.toLocaleString()} ft
                  </div>
                </div>
                <div style={{ color: "#687683", fontSize: 11, marginTop: 6, lineHeight: 1.35 }}>{peak.area}</div>
                <div style={{ color: "#354B5E", fontSize: 12, fontWeight: 700, marginTop: 9 }}>{peak.character}</div>
                <div style={{ color: OTHER_PEAK_COLOR, fontSize: 11, fontWeight: 800, marginTop: 8 }}>Primary trailhead · {peak.trailhead}</div>
                <div style={{ color: "#687683", fontSize: 11, lineHeight: 1.42, marginTop: 4 }}>{peak.accessNote}</div>
                <div className="flex items-center justify-between gap-2 mt-3">
                  <span style={{ color: OTHER_PEAK_COLOR, fontSize: 11, fontWeight: 800 }}>Locate on map →</span>
                  <a
                    href={otherPeakDirectionsUrl(peak)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    style={{ display: "inline-flex", alignItems: "center", background: "#1A6B3A", color: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 800, textDecoration: "none" }}
                    onMouseEnter={(event) => (event.currentTarget.style.background = "#145229")}
                    onMouseLeave={(event) => (event.currentTarget.style.background = "#1A6B3A")}
                  >
                    Trailhead directions ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
          )}

        </div>

        <div className="px-5 sm:px-6 py-3 text-xs flex-shrink-0" style={{ color: "#65717B", borderTop: "1px solid rgba(0,0,0,0.08)", background: "#EDE8DF" }}>
          Navy identifies Other Peaks and the Wire Pass–Buckskin Gulch route. Purple is reserved for the WURL route and its 17 Little Cottonwood summits.
        </div>
      </div>
    </>
  );
}

// ── Detail Sidebar ────────────────────────────────────────────────────────
function DetailSidebar({
  range,
  onClose,
  onOpenJournal,
}: {
  range: MountainRange | null;
  onClose: () => void;
  onOpenJournal: (r: MountainRange) => void;
}) {
  if (!range) return null;
  const hasPictures = !!(range.trailheadPhoto || range.summitPhoto || range.extraPhotos?.length);
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

      {range.accessNotes && range.accessNotes.length > 0 && (
        <div className="mx-4 mb-3 rounded-lg px-3 py-2.5" style={{ background: "#EEE4D0", border: "1px solid rgba(133,88,18,0.25)" }}>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] mb-1.5" style={{ color: "#735111" }}>Driving Access</div>
          <ul className="pl-4 space-y-1" style={{ color: "#51472E", fontSize: 11, lineHeight: 1.45 }}>
            {range.accessNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 pb-4 space-y-2">
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
        {hasPictures && (
          <button
            type="button"
            onClick={() => onOpenJournal(range)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: range.color, border: "none" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            View Pictures
          </button>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 text-xs text-gray-400 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        Click another pin to switch peaks
      </div>
    </div>
  );
}

function TrailRouteSidebar({ route, onClose }: { route: TrailRoute | null; onClose: () => void }) {
  if (!route) return null;

  return (
    <div
      className="absolute top-16 right-3 z-20 w-72 rounded-xl shadow-2xl overflow-hidden"
      style={{ background: "#F5F0E8", border: "1px solid rgba(0,0,0,0.12)", fontFamily: "var(--font-body)", animation: "slideIn 0.22s cubic-bezier(0.23,1,0.32,1)" }}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ background: route.color }}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>{route.group}</div>
          <div className="text-lg font-bold leading-tight" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>{route.name}</div>
        </div>
        <button onClick={onClose} className="mt-0.5 text-white/70 hover:text-white transition-colors text-xl leading-none" aria-label="Close trail route details">×</button>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Trailhead</div>
          <div className="text-sm text-gray-700">{route.trailhead}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Distance</div>
          <div className="text-sm text-gray-700">{route.distance}</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <a
          href={trailRouteDirectionsUrl(route)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1A6B3A", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Get Directions to Trailhead
        </a>
      </div>
    </div>
  );
}

function OtherPeakSidebar({ peak, onClose }: { peak: OtherPeak | null; onClose: () => void }) {
  if (!peak) return null;

  return (
    <div
      className="absolute top-16 right-3 z-20 w-72 rounded-xl shadow-2xl overflow-hidden"
      style={{ background: "#F5F0E8", border: "1px solid rgba(0,0,0,0.12)", fontFamily: "var(--font-body)", animation: "slideIn 0.22s cubic-bezier(0.23,1,0.32,1)" }}
    >
      <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ background: OTHER_PEAK_COLOR }}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>{peak.group}</div>
          <div className="text-lg font-bold leading-tight" style={{ color: "#fff", fontFamily: "var(--font-display)" }}>{peak.name}</div>
        </div>
        <button onClick={onClose} className="mt-0.5 text-white/70 hover:text-white transition-colors text-xl leading-none" aria-label="Close">×</button>
      </div>

      <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(18,59,93,0.06)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1 13 13H1L7 1Z" fill={OTHER_PEAK_COLOR} /></svg>
        <span className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "#2D2D2D" }}>{peak.elevationFt.toLocaleString()} ft</span>
        <span className="text-xs text-gray-500 ml-1">elevation</span>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Area</div>
          <div className="text-sm text-gray-700">{peak.area}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Trip character</div>
          <div className="text-sm text-gray-700">{peak.character}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Primary trailhead</div>
          <div className="text-sm text-gray-700">{peak.trailhead}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Summit coordinates</div>
          <div className="text-sm text-gray-700 font-mono">{peak.lat.toFixed(4)}° N, {Math.abs(peak.lon).toFixed(4)}° W</div>
        </div>
      </div>

      <div className="mx-4 mb-3 rounded-lg px-3 py-2.5" style={{ background: "#E8F0F7", border: "1px solid rgba(18,59,93,0.18)" }}>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] mb-1.5" style={{ color: OTHER_PEAK_COLOR }}>Before you go</div>
        <div style={{ color: "#354B5E", fontSize: 11, lineHeight: 1.48 }}>{peak.accessNote}</div>
      </div>

      <div className="px-4 pb-4">
        <a
          href={otherPeakDirectionsUrl(peak)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1A6B3A", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          Get Directions to Trailhead
        </a>
      </div>

      <div className="px-4 py-2 text-xs text-gray-400 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        Verify current road, trail, weather, and land-access conditions before departure.
      </div>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────
function Legend({
  selected,
  onSelect,
  onOpenJournal,
  trailRoute,
  onSelectTrailRoute,
}: {
  selected: MountainRange | null;
  onSelect: (r: MountainRange) => void;
  onOpenJournal: (r: MountainRange) => void;
  trailRoute: TrailRoute;
  onSelectTrailRoute: (route: TrailRoute) => void;
}) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);

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
      {/* Header — click to collapse/expand */}
      <button
        className="w-full flex items-center justify-between px-3 py-2"
        style={{ background: "#2D2D2D", color: "#EEE8DC" }}
        onClick={() => setCollapsed((v) => !v)}
        title={collapsed ? "Expand range list" : "Collapse range list"}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ letterSpacing: "0.12em" }}>Mountain Ranges</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transition: "transform 0.2s", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Collapsible body */}
      {!collapsed && (
        <>
          <div className="py-1.5 px-2">
            {SORTED_MOUNTAIN_RANGES.map((r) => (
              <React.Fragment key={r.range}>
              <button
                onClick={() => onSelect(r)}
                className="w-full flex items-center gap-2 px-1.5 py-1 rounded-md text-left transition-colors hover:bg-black/5"
                style={{ background: selected?.range === r.range ? `${r.color}18` : undefined }}
              >
                <span className="flex-shrink-0 rounded-sm" style={{ width: 12, height: 12, background: r.color }} />
                <span className="text-xs text-gray-700 leading-tight flex-1">{r.range}</span>
                {r.summited && (
                  <span title={`Summited ${r.summitDate ?? ""}`} style={{ fontSize: 10, color: "#1A6B3A", fontWeight: 700, flexShrink: 0 }}>✓</span>
                )}
                {r.attempted && !r.summited && (
                  <span title={`Attempted ${r.attemptDate ?? ""}`} style={{ fontSize: 10, color: "#B7950B", fontWeight: 700, flexShrink: 0 }}>⚡</span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${r.peak} hike journal`}
                  onClick={(e) => { e.stopPropagation(); onOpenJournal(r); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenJournal(r);
                    }
                  }}
                  title="View hike journal"
                  style={{ flexShrink: 0, padding: "1px 3px", borderRadius: 4, background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", lineHeight: 1 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </span>
              </button>
              </React.Fragment>
            ))}
          </div>
          <div className="px-3 py-1.5 text-xs text-gray-400 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            Click a pin or range for details
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function Home() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<MountainRange | null>(null);
  const [selectedOtherPeak, setSelectedOtherPeak] = useState<OtherPeak | null>(null);
  const [selectedTrailRoute, setSelectedTrailRoute] = useState<TrailRoute | null>(null);
  const [mapType, setMapType] = useState<"terrain" | "satellite" | "roadmap">("terrain");
  const [tableOpen, setTableOpen] = useState(false);
  const [otherPeaksOpen, setOtherPeaksOpen] = useState(false);
  const [otherPeaksVisible, setOtherPeaksVisible] = useState(false);
  const [skiResortsVisible, setSkiResortsVisible] = useState(false);
  const [wurlTableOpen, setWurlTableOpen] = useState(false);
  const [wurlVisible, setWurlVisible] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [journalRange, setJournalRange] = useState<MountainRange | null>(null);
  const peakListModalOpen = tableOpen || otherPeaksOpen || wurlTableOpen;
  const polygonsRef = useRef<Array<google.maps.Polygon | google.maps.Polyline>>([]);
  const labelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const otherPeakMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const otherPeakLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const skiResortMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const skiResortLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const wurlMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const wurlLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const wurlRouteLineRef = useRef<google.maps.Polyline | null>(null);
  const southernUtahTrailLinesRef = useRef<google.maps.Polyline[]>([]);
  const southernUtahTrailLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

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
  const [menuOpen, setMenuOpen] = useState(false);
  const parksPolygonsRef = useRef<google.maps.Polygon[]>([]);
  const parksLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const parksDataRef = useRef<NpsParkFeature[] | null>(null);

  // ── Curated protected areas layer state ──
  const [protectedAreasOn, setProtectedAreasOn] = useState(false);
  const [protectedAreasLoading, setProtectedAreasLoading] = useState(false);
  const [protectedAreasError, setProtectedAreasError] = useState<string | null>(null);
  const protectedAreaPolygonsRef = useRef<google.maps.Polygon[]>([]);
  const protectedAreaLabelsRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const protectedAreasDataRef = useRef<ProtectedAreaFeature[] | null>(null);

  // Fetch all U.S. National Park boundaries once. The seven regional parks stay detailed;
  // the other 56 are intentionally generalized for quick nationwide map rendering.
  const fetchParksData = useCallback(async (): Promise<NpsParkFeature[]> => {
    if (parksDataRef.current) return parksDataRef.current;
    setParksLoading(true);
    setParksError(null);
    try {
      // NPS Land Resources Division Boundary Service.
      // Must use outFields=* when returnGeometry=true (service rejects named fields + geometry)
      const serviceUrl =
        `https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/` +
        `NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query`;
      const detailedCodes = ["ZION", "BRCA", "CANY", "ARCH", "CARE", "GRCA", "GRBA"];
      const detailedWhere = detailedCodes.map((code) => `UNIT_CODE='${code}'`).join(" OR ");
      // NERI is the 63rd U.S. National Park, but the NPS source classifies it as a National Preserve.
      const overviewWhere =
        `(UNIT_TYPE='National Parks' OR UNIT_CODE='NERI') AND ` +
        `UNIT_CODE NOT IN (${detailedCodes.map((code) => `'${code}'`).join(",")})`;

      const requestFeatures = async (
        where: string,
        geometryPrecision: number,
        maxAllowableOffset: number,
        precision: NpsParkFeature["precision"],
      ): Promise<NpsParkFeature[]> => {
        const params = new URLSearchParams({
          where,
          outFields: "*",
          returnGeometry: "true",
          outSR: "4326",
          geometryPrecision: String(geometryPrecision),
          maxAllowableOffset: String(maxAllowableOffset),
          f: "json",
          resultRecordCount: "100",
        });
        const response = await fetch(`${serviceUrl}?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (json.error) throw new Error(json.error.message ?? "API error");
        return (json.features ?? []).map((feature: NpsParkFeature) => ({ ...feature, precision }));
      };

      const [detailedFeatures, overviewFeatures] = await Promise.all([
        // Roughly 110 m tolerance: retains the currently featured parks' recognizable outlines.
        requestFeatures(detailedWhere, 5, 0.001, "detailed"),
        // Roughly 11 km tolerance: intentional nationwide overview geometry for all other parks.
        requestFeatures(overviewWhere, 2, 0.1, "overview"),
      ]);
      const features = [...detailedFeatures, ...overviewFeatures];
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
          strokeColor: "#CC0000",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.15,
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
          color:#8B0000;white-space:nowrap;line-height:1.2;
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
            color:#CC0000;white-space:nowrap;line-height:1.2;
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

  // Fetch the curated national conservation areas, monuments, state parks, and regional-neighbor areas only
  // when requested. Every configured source returns Esri polygon geometry in WGS84.
  const fetchProtectedAreasData = useCallback(async (): Promise<ProtectedAreaFeature[]> => {
    if (protectedAreasDataRef.current) return protectedAreasDataRef.current;
    setProtectedAreasLoading(true);
    setProtectedAreasError(null);

    try {
      const fetchSource = async (source: (typeof PROTECTED_AREA_SOURCES)[number]) => {
        try {
          const params = new URLSearchParams({
            where: source.where,
            outFields: "*",
            returnGeometry: "true",
            outSR: "4326",
            geometryPrecision: "5",
            maxAllowableOffset: "0.001",
            f: "json",
          });
          const response = await fetch(`${source.endpoint}?${params.toString()}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const json = await response.json();
          if (json.error) throw new Error(json.error.message ?? "API error");

          return (json.features ?? []).map((feature: EsriBoundaryFeature) => {
            const rawName = String(feature.attributes?.[source.nameField] ?? source.name).trim();
            const name = source.nameOverrides?.[rawName] ?? rawName;
            return {
              name,
              kind: source.kind,
              jurisdiction: source.jurisdiction,
              sourceLabel: source.sourceLabel,
              sourceUrl: source.sourceUrl,
              geometryNote: source.geometryNote,
              geometry: feature.geometry,
            } satisfies ProtectedAreaFeature;
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          throw new Error(`${source.shortName}: ${msg}`);
        }
      };

      // A third-party GIS service can be temporarily unavailable. Preserve the
      // remaining overlay instead of letting one rejected request hide every area.
      const results = await Promise.allSettled(PROTECTED_AREA_SOURCES.map(fetchSource));
      const failureMessages = results.flatMap((result) =>
        result.status === "rejected"
          ? [result.reason instanceof Error ? result.reason.message : "Unknown source failure"]
          : [],
      );
      const features = results
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .filter((feature) => feature.geometry?.rings?.length);
      if (!features.length) {
        throw new Error(failureMessages.join("; ") || "No protected-area boundaries returned");
      }
      protectedAreasDataRef.current = features;
      if (failureMessages.length) {
        setProtectedAreasError(
          "Some protected areas are temporarily unavailable. Other boundaries are shown.",
        );
      }
      return features;
    } catch (err) {
      console.warn("Protected-area boundary load failed", err);
      setProtectedAreasError("Could not load protected areas. Please try again.");
      // Never leave the control active when no polygons are available to show.
      setProtectedAreasOn(false);
      return [];
    } finally {
      setProtectedAreasLoading(false);
    }
  }, []);

  // Draw the complete research-register layer: national conservation areas,
  // federal monuments, recreation areas, state parks, and regional neighbors
  // use one treatment.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!protectedAreasOn) {
      protectedAreaPolygonsRef.current.forEach((polygon) => polygon.setMap(null));
      protectedAreaPolygonsRef.current = [];
      protectedAreaLabelsRef.current.forEach((label) => { label.map = null; });
      protectedAreaLabelsRef.current = [];
      return;
    }

    let cancelled = false;
    (async () => {
      const features = await fetchProtectedAreasData();
      if (cancelled || !features.length) return;

      const labelCandidates = new Map<string, { feature: ProtectedAreaFeature; ring: number[][] }>();
      features.forEach((feature) => {
        const rings = feature.geometry?.rings;
        if (!rings?.length) return;
        const palette = PROTECTED_AREA_COLORS[feature.kind];
        const paths = rings.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })));
        const polygon = new google.maps.Polygon({
          paths,
          strokeColor: palette.stroke,
          strokeOpacity: 0.92,
          strokeWeight: feature.kind === "regional_neighbor" ? 1.6 : 2,
          fillColor: palette.fill,
          fillOpacity: feature.kind === "regional_neighbor" ? 0.105 : 0.14,
          map,
          zIndex: 3,
        });
        protectedAreaPolygonsRef.current.push(polygon);

        const largestRing = rings.reduce((largest, ring) => (ring.length > largest.length ? ring : largest), rings[0]);
        const current = labelCandidates.get(feature.name);
        if (!current || largestRing.length > current.ring.length) {
          labelCandidates.set(feature.name, { feature, ring: largestRing });
        }
      });

      labelCandidates.forEach(({ feature, ring }) => {
        const palette = PROTECTED_AREA_COLORS[feature.kind];
        const center = ring.reduce(
          (total, [lng, lat]) => ({ lat: total.lat + lat, lng: total.lng + lng }),
          { lat: 0, lng: 0 },
        );
        center.lat /= ring.length;
        center.lng /= ring.length;

        const labelEl = document.createElement("div");
        labelEl.style.cssText = `
          max-width:140px;text-align:center;pointer-events:none;transform:translate(-50%,-50%);
          font-family:'Source Sans 3',sans-serif;font-size:10px;font-weight:800;line-height:1.15;
          color:${palette.stroke};text-shadow:0 0 3px #fff,0 0 6px #fff,0 0 10px #fff,
            1px 1px 0 #fff,-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff;
        `;
        labelEl.textContent = feature.name;
        const label = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: center,
          content: labelEl,
          title: `${feature.name} · ${feature.jurisdiction}`,
          zIndex: 4,
        });
        protectedAreaLabelsRef.current.push(label);
      });
    })();

    return () => {
      cancelled = true;
      protectedAreaPolygonsRef.current.forEach((polygon) => polygon.setMap(null));
      protectedAreaPolygonsRef.current = [];
      protectedAreaLabelsRef.current.forEach((label) => { label.map = null; });
      protectedAreaLabelsRef.current = [];
    };
  }, [protectedAreasOn, fetchProtectedAreasData]);

  const handleSelect = useCallback((r: MountainRange) => {
    setTableOpen(false);
    setOtherPeaksOpen(false);
    setWurlTableOpen(false);
    setSelectedOtherPeak(null);
    setSelectedTrailRoute(null);
    setSelected(r);
    mapRef.current?.panTo({ lat: r.lat, lng: r.lon });
  }, []);

  const handleSelectOtherPeak = useCallback((peak: OtherPeak) => {
    setTableOpen(false);
    setOtherPeaksOpen(false);
    setWurlTableOpen(false);
    setSelected(null);
    setSelectedTrailRoute(null);
    setSelectedOtherPeak(peak);
    mapRef.current?.panTo({ lat: peak.lat, lng: peak.lon });
    mapRef.current?.setZoom(10);
  }, []);

  const handleSelectTrailRoute = useCallback((route: TrailRoute) => {
    setTableOpen(false);
    setOtherPeaksOpen(false);
    setWurlTableOpen(false);
    setSelected(null);
    setSelectedOtherPeak(null);
    setSelectedTrailRoute(route);
    const map = mapRef.current;
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    route.pathSegments.forEach((segment) => segment.forEach(([lat, lng]) => bounds.extend({ lat, lng })));
    map.fitBounds(bounds, 64);
  }, []);

  const handleOpenJournal = useCallback((r: MountainRange) => {
    setJournalRange(r);
  }, []);

  const toggleWurl = useCallback(() => {
    setWurlVisible((visible) => !visible);
    setWurlTableOpen(false);
  }, []);

  const toggleOtherPeaks = useCallback(() => {
    if (otherPeaksVisible) setSelectedOtherPeak(null);
    setOtherPeaksVisible((visible) => !visible);
  }, [otherPeaksVisible]);

  const toggleSkiResorts = useCallback(() => {
    setSkiResortsVisible((visible) => !visible);
  }, []);

  const handleSelectWurlPeak = useCallback((peak: WurlPeak) => {
    setTableOpen(false);
    setOtherPeaksOpen(false);
    setWurlTableOpen(false);
    setSelected(null);
    setSelectedOtherPeak(null);
    setSelectedTrailRoute(null);
    setWurlVisible(true);
    mapRef.current?.panTo({ lat: peak.lat, lng: peak.lon });
    mapRef.current?.setZoom(13);
  }, []);

  // Render the statewide Other Peaks catalog as a navy-blue toggleable marker layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (!otherPeaksVisible) {
      otherPeakMarkersRef.current.forEach((marker) => { marker.map = null; });
      otherPeakMarkersRef.current = [];
      otherPeakLabelsRef.current.forEach((label) => { label.map = null; });
      otherPeakLabelsRef.current = [];
      return;
    }

    if (otherPeakMarkersRef.current.length > 0) return;

    OTHER_PEAKS.forEach((peak) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: peak.lat, lng: peak.lon },
        content: createOtherPeakPinElement(),
        title: `${peak.name} — ${peak.elevationFt.toLocaleString()} ft · Other Peaks`,
        zIndex: 11,
      });
      marker.addListener("click", () => handleSelectOtherPeak(peak));
      otherPeakMarkersRef.current.push(marker);

      // Mirror the primary-range name treatment while reserving navy for Other Peaks.
      const labelEl = document.createElement("div");
      labelEl.style.cssText = `
        display:flex;flex-direction:column;align-items:flex-start;gap:1px;
        pointer-events:auto;cursor:pointer;background:transparent!important;border:0!important;
        border-radius:0!important;box-shadow:none!important;
        transform:translate(calc(50% + 14px), -7px);
      `;

      const peakName = document.createElement("span");
      peakName.style.cssText = `
        font-family:'Source Sans 3',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:0.01em;
        color:${OTHER_PEAK_COLOR}!important;white-space:nowrap;line-height:1.2;
        text-shadow:
          0 0 2px #fff, 0 0 3px #fff,
          1px 1px 0 #fff, -1px -1px 0 #fff,
          1px -1px 0 #fff, -1px 1px 0 #fff!important;
        background:transparent!important;border:0!important;border-radius:0!important;
        box-shadow:none!important;padding:0;
      `;
      peakName.dataset.mapLabelBaseSize = "11.5";
      peakName.textContent = peak.name;
      labelEl.appendChild(peakName);

      const label = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: peak.lat, lng: peak.lon },
        content: labelEl,
        title: `${peak.name} — ${peak.elevationFt.toLocaleString()} ft · Other Peaks`,
        zIndex: 10,
      });
      label.addListener("click", () => handleSelectOtherPeak(peak));
      otherPeakLabelsRef.current.push(label);
    });
    syncMapLabelSizesAfterRender(map);

    return () => {
      otherPeakMarkersRef.current.forEach((marker) => { marker.map = null; });
      otherPeakMarkersRef.current = [];
      otherPeakLabelsRef.current.forEach((label) => { label.map = null; });
      otherPeakLabelsRef.current = [];
    };
  }, [mapReady, otherPeaksVisible, handleSelectOtherPeak]);

  // Render Utah's ski resort locations as a separately toggled, labeled layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (!skiResortsVisible) {
      skiResortMarkersRef.current.forEach((marker) => { marker.map = null; });
      skiResortMarkersRef.current = [];
      skiResortLabelsRef.current.forEach((label) => { label.map = null; });
      skiResortLabelsRef.current = [];
      return;
    }

    if (skiResortMarkersRef.current.length > 0) return;

    UTAH_SKI_RESORTS.forEach((resort) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: resort.lat, lng: resort.lon },
        content: createSkiResortPinElement(),
        title: `${resort.name} — Utah ski resort`,
        zIndex: 9,
      });
      skiResortMarkersRef.current.push(marker);

      const labelEl = document.createElement("div");
      labelEl.style.cssText = `
        font-family:'Source Sans 3',sans-serif;font-size:11.5px;font-weight:700;font-synthesis:none;letter-spacing:0.01em;
        color:#111;white-space:nowrap;line-height:1.2;pointer-events:none;
        transform:translate(calc(50% + 14px), -4px);
        text-shadow:
          0 0 2px #fff, 0 0 4px #fff,
          1px 1px 0 #fff, -1px -1px 0 #fff,
          1px -1px 0 #fff, -1px 1px 0 #fff;
      `;
      labelEl.dataset.mapLabelBaseSize = "11.5";
      labelEl.textContent = resort.name;
      const label = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: resort.lat, lng: resort.lon },
        content: labelEl,
        zIndex: 8,
      });
      skiResortLabelsRef.current.push(label);
    });
    syncMapLabelSizesAfterRender(map);

    return () => {
      skiResortMarkersRef.current.forEach((marker) => { marker.map = null; });
      skiResortMarkersRef.current = [];
      skiResortLabelsRef.current.forEach((label) => { label.map = null; });
      skiResortLabelsRef.current = [];
    };
  }, [mapReady, skiResortsVisible]);

  // Render the common WURL reference track together with its route-specific
  // summits. The line is deliberately direction-neutral, not turn-by-turn guidance.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !wurlVisible) return;

    const routeLine = new google.maps.Polyline({
      path: WURL_ROUTE_PATH,
      strokeColor: WURL_COLOR,
      strokeOpacity: 0.92,
      strokeWeight: 4,
      clickable: false,
      geodesic: false,
      map,
      zIndex: 12,
    });
    wurlRouteLineRef.current = routeLine;

    return () => {
      routeLine.setMap(null);
      if (wurlRouteLineRef.current === routeLine) wurlRouteLineRef.current = null;
    };
  }, [mapReady, wurlVisible]);

  // Southern Utah trail-only overlay: the full Buckskin Gulch corridor plus
  // the Wire Pass access line. It intentionally has no peak marker or elevation.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !otherPeaksVisible) return;

    const lines = WIRE_PASS_BUCKSKIN_ROUTE.pathSegments.map((segment) => {
      const line = new google.maps.Polyline({
        path: segment.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: WIRE_PASS_BUCKSKIN_ROUTE.color,
        strokeOpacity: 0.94,
        strokeWeight: 4,
        clickable: true,
        geodesic: false,
        map,
        zIndex: 13,
      });
      line.addListener("click", () => handleSelectTrailRoute(WIRE_PASS_BUCKSKIN_ROUTE));
      return line;
    });
    southernUtahTrailLinesRef.current = lines;

    // Use the same unboxed navy label treatment as Other Peaks, while keeping
    // this trail-only route free of a summit/peak pin.
    const labelEl = document.createElement("div");
    labelEl.style.cssText = `
      display:flex;flex-direction:column;align-items:flex-start;gap:1px;
      pointer-events:auto;cursor:pointer;background:transparent!important;border:0!important;
      border-radius:0!important;box-shadow:none!important;
      transform:translate(calc(50% + 14px), -7px);
    `;
    const routeName = document.createElement("span");
    routeName.style.cssText = `
      font-family:'Source Sans 3',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:0.01em;
      color:${WIRE_PASS_BUCKSKIN_ROUTE.color}!important;white-space:nowrap;line-height:1.2;
      text-shadow:
        0 0 2px #fff, 0 0 3px #fff,
        1px 1px 0 #fff, -1px -1px 0 #fff,
        1px -1px 0 #fff, -1px 1px 0 #fff!important;
      background:transparent!important;border:0!important;border-radius:0!important;
      box-shadow:none!important;padding:0;
    `;
    routeName.dataset.mapLabelBaseSize = "11.5";
    routeName.textContent = WIRE_PASS_BUCKSKIN_ROUTE.name;
    labelEl.appendChild(routeName);
    const routeLabel = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: 37.0075, lng: -111.931 },
      content: labelEl,
      title: `${WIRE_PASS_BUCKSKIN_ROUTE.name} · Southern Utah trail`,
      zIndex: 12,
    });
    routeLabel.addListener("click", () => handleSelectTrailRoute(WIRE_PASS_BUCKSKIN_ROUTE));
    southernUtahTrailLabelsRef.current = [routeLabel];
    syncMapLabelSizesAfterRender(map);

    return () => {
      lines.forEach((line) => line.setMap(null));
      if (southernUtahTrailLinesRef.current === lines) southernUtahTrailLinesRef.current = [];
      routeLabel.map = null;
      if (southernUtahTrailLabelsRef.current[0] === routeLabel) southernUtahTrailLabelsRef.current = [];
    };
  }, [mapReady, otherPeaksVisible, handleSelectTrailRoute]);

  // Render the curated WURL major peaks only after the WURL control is activated.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!wurlVisible) {
      wurlMarkersRef.current.forEach((marker) => { marker.map = null; });
      wurlMarkersRef.current = [];
      wurlLabelsRef.current.forEach((label) => { label.map = null; });
      wurlLabelsRef.current = [];
      return;
    }

    if (wurlMarkersRef.current.length > 0) return;

    WURL_PEAKS.forEach((peak) => {
      const pin = createWurlPinElement();
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: peak.lat, lng: peak.lon },
        content: pin,
        title: `${peak.name} — ${Math.round(peak.elevationFt).toLocaleString()} ft (WURL major peak)`,
        zIndex: 15,
      });
      marker.addListener("click", () => {
        handleSelectWurlPeak(peak);
      });
      wurlMarkersRef.current.push(marker);

      const labelEl = document.createElement("div");
      labelEl.style.cssText = `
        display:flex;align-items:center;justify-content:center;
        font-family:'Source Sans 3',sans-serif;font-size:10.5px;font-weight:800;
        color:#43236B;white-space:nowrap;line-height:1.2;text-align:center;pointer-events:auto;cursor:pointer;
        background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;
        transform:translate(0, -42px);
        text-shadow:0 0 3px #fff,0 0 6px #fff,0 0 10px #fff,1px 1px 0 #fff,-1px -1px 0 #fff!important;
      `;
      labelEl.dataset.mapLabelBaseSize = "10.5";
      labelEl.textContent = peak.name;
      const label = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: peak.lat, lng: peak.lon },
        content: labelEl,
        title: `${peak.name} — ${Math.round(peak.elevationFt).toLocaleString()} ft (WURL major peak)`,
        zIndex: 14,
      });
      label.addListener("click", () => handleSelectWurlPeak(peak));
      wurlLabelsRef.current.push(label);
    });
    syncMapLabelSizesAfterRender(map);
  }, [wurlVisible, handleSelectWurlPeak]);

  // Fetch fire perimeters once (lazy, on first toggle-on)
  const fetchFireData = useCallback(async (): Promise<FireFeature[]> => {
    if (fireDataRef.current) return fireDataRef.current;
    setFireLoading(true);
    setFireError(null);
    try {
      // NIFC WFIGS Interagency Perimeters — Utah plus the Grand Canyon / Kaibab
      // region of northern Arizona. Major fires are limited to the past 3 years.
      // Strategy: fetch Final + Daily perimeters, then deduplicate per incident
      // keeping the Final perimeter if available, otherwise the newest Daily perimeter.
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 3);
      const dateStr = cutoff.toISOString().slice(0, 10);
      const serviceUrl =
        "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/" +
        "WFIGS_Interagency_Perimeters/FeatureServer/0/query";
      const fetchPerimeters = async (state: "US-UT" | "US-AZ", geometry?: string) => {
        const params = new URLSearchParams({
          where: `attr_POOState='${state}' AND attr_FireDiscoveryDateTime >= DATE '${dateStr}' AND poly_GISAcres >= 5000`,
          outFields: "poly_IncidentName,attr_FireDiscoveryDateTime,poly_GISAcres,attr_POOState,attr_IncidentTypeCategory,poly_FeatureCategory,attr_FireOutDateTime,poly_DateCurrent",
          returnGeometry: "true",
          outSR: "4326",
          f: "json",
          resultRecordCount: "500",
          orderByFields: "poly_DateCurrent DESC",
        });
        if (geometry) {
          params.set("geometry", geometry);
          params.set("geometryType", "esriGeometryEnvelope");
          params.set("spatialRel", "esriSpatialRelIntersects");
        }
        const response = await fetch(`${serviceUrl}?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (json.error) throw new Error(json.error.message ?? "API error");
        return (json.features ?? []) as FireFeature[];
      };

      const [utahFeatures, northernArizonaFeatures] = await Promise.all([
        fetchPerimeters("US-UT"),
        // AZ-only envelope: Arizona Strip, Kaibab National Forest, and Grand Canyon vicinity.
        fetchPerimeters("US-AZ", "-114.75,35.5,-108.5,38.5"),
      ]);
      const allFeatures = [...utahFeatures, ...northernArizonaFeatures];

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
          strokeColor: "#000000",
          strokeOpacity: 0.92,
          strokeWeight: isActive ? 2 : 1.5,
          fillColor: "#3A3A3A",
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
          color:#1a1a1a;white-space:nowrap;line-height:1.2;
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
      const polygonGroups = r.polygonGroups ?? [[r.polygon]];
      const boundaries = r.boundaryType === "line"
        ? [new google.maps.Polyline({
            path: r.polygon.map(([lat, lng]) => ({ lat, lng })),
            strokeColor: r.color,
            strokeOpacity: 0.9,
            strokeWeight: 3,
            map,
          })]
        : polygonGroups.map((group) => new google.maps.Polygon({
            // Google Maps treats the first path as the exterior and following
            // paths as holes, preserving the spatial-audit exclusions.
            paths: group.map((ring) => ring.map(([lat, lng]) => ({ lat, lng }))),
            strokeColor: r.color,
            strokeOpacity: 0.85,
            strokeWeight: 2,
            fillColor: r.color,
            fillOpacity: 0.18,
            map,
          }));
      boundaries.forEach((boundary) => {
        boundary.addListener("click", () => setSelected(r));
        polygonsRef.current.push(boundary);
      });

      // Range label at centroid (unused — range name shown below peak pin)
      const centLat = r.polygon.reduce((s, p) => s + p[0], 0) / r.polygon.length;
      const centLng = r.polygon.reduce((s, p) => s + p[1], 0) / r.polygon.length;
      void centLat; void centLng;

      // Peak pin
      const badge = r.summited ? "summited" : r.attempted ? "attempted" : undefined;
      const pinEl = createPinElement("#CC0000", badge);
      const peakMarker = new google.maps.marker.AdvancedMarkerElement({
        map, position: { lat: r.lat, lng: r.lon }, content: pinEl,
        title: `${r.peak} — ${r.elevation}`, zIndex: 10,
      });
      peakMarker.addListener("click", () => setSelected(r));

      // Peak name + range name label (two lines, centered above the red pin)
      const peakLabelEl = document.createElement("div");
      peakLabelEl.style.cssText = `
        display:flex;flex-direction:column;align-items:center;gap:1px;
        pointer-events:none;
        text-align:center;
        transform:translate(0, -32px);
      `;
      const textSpan = document.createElement("span");
      textSpan.style.cssText = `
        font-family:'Source Sans 3',sans-serif;font-size:12.5px;font-weight:700;font-synthesis:none;letter-spacing:0.01em;
        color:#111;white-space:nowrap;line-height:1.2;
        text-shadow:
          0 0 2px #fff, 0 0 4px #fff,
          1px 1px 0 #fff, -1px -1px 0 #fff,
          1px -1px 0 #fff, -1px 1px 0 #fff;
        background:none;padding:0;
      `;
      textSpan.dataset.mapLabelBaseSize = "12.5";
      textSpan.textContent = r.peak;
      peakLabelEl.appendChild(textSpan);

      const rangeSpan = document.createElement("span");
      rangeSpan.style.cssText = `
        font-family:'Source Sans 3',sans-serif;font-size:11px;font-weight:600;font-synthesis:none;
        color:${r.color};white-space:nowrap;line-height:1.2;
        text-shadow:0 0 2px #fff,0 0 4px #fff,1px 1px 0 #fff,-1px -1px 0 #fff;
      `;
      rangeSpan.dataset.mapLabelBaseSize = "11";
      rangeSpan.textContent = r.range;
      peakLabelEl.appendChild(rangeSpan);
      new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: r.lat, lng: r.lon }, content: peakLabelEl, zIndex: 9 });
    });

    syncMapLabelSizes(map);
    map.addListener("zoom_changed", () => syncMapLabelSizes(map));

    setMapReady(true);

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
      {/* ── Header ── */}
      <header
        className="absolute top-0 left-0 right-0 z-[55]"
        style={{ height: 56, background: "rgba(28,35,51,0.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between h-full px-3 sm:px-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/manus-storage/utah-peaks-heritage-logo-512_354899d2.png"
              alt="Utah Peaks heritage emblem"
              style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }}
            />
            <div>
              <div className="text-sm sm:text-base font-bold leading-tight" style={{ color: "#EEE8DC", fontFamily: "var(--font-body)" }}>
                Utah Peaks
              </div>
              <div className="hidden sm:block text-xs" style={{ color: "rgba(238,232,220,0.55)" }}>
                Highest Peaks, Other Peaks &amp; Range Locations
              </div>
            </div>
          </div>

          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => { setWurlTableOpen(false); setOtherPeaksOpen(false); setTableOpen((open) => !open); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: peakListModalOpen ? "rgba(192,82,42,0.85)" : "rgba(255,255,255,0.10)", color: peakListModalOpen ? "#fff" : "rgba(238,232,220,0.8)", border: peakListModalOpen ? "1px solid rgba(255,185,145,0.38)" : "1px solid rgba(255,255,255,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = peakListModalOpen ? "#C0522A" : "rgba(255,255,255,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = peakListModalOpen ? "rgba(192,82,42,0.85)" : "rgba(255,255,255,0.10)")}
              aria-pressed={peakListModalOpen}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
              </svg>
              Peak Lists
            </button>
            <button
              onClick={toggleOtherPeaks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: otherPeaksVisible ? OTHER_PEAK_COLOR : "rgba(255,255,255,0.10)",
                color: otherPeaksVisible ? "#fff" : "rgba(238,232,220,0.8)",
                border: otherPeaksVisible ? "1px solid rgba(193,220,241,0.4)" : "1px solid rgba(255,255,255,0.15)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = otherPeaksVisible ? OTHER_PEAK_COLOR : "rgba(255,255,255,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = otherPeaksVisible ? OTHER_PEAK_COLOR : "rgba(255,255,255,0.10)")}
              title={otherPeaksVisible ? "Hide Other Peaks markers" : "Show Other Peaks markers"}
              aria-pressed={otherPeaksVisible}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 18l5-9 4 5 3-4 6 8H3z"/><path d="M8 9l2-3 2 3"/>
              </svg>
              {otherPeaksVisible ? "Other Peaks: On" : "Other Peaks"}
            </button>
            <button
              onClick={toggleSkiResorts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: skiResortsVisible ? SKI_RESORT_COLOR : "rgba(255,255,255,0.10)", color: skiResortsVisible ? "#fff" : "rgba(238,232,220,0.8)", border: skiResortsVisible ? "1px solid rgba(165,243,252,0.48)" : "1px solid rgba(255,255,255,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = skiResortsVisible ? SKI_RESORT_COLOR : "rgba(255,255,255,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = skiResortsVisible ? SKI_RESORT_COLOR : "rgba(255,255,255,0.10)")}
              title={skiResortsVisible ? "Hide Utah ski resorts" : "Show Utah ski resorts"}
              aria-pressed={skiResortsVisible}
            >
              <SkierIcon size={12} />
              {skiResortsVisible ? "Ski Resorts: On" : "Ski Resorts"}
            </button>
            <button
              onClick={() => setFireLayerOn((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: fireLayerOn ? "rgba(200,60,20,0.92)" : "rgba(255,255,255,0.10)", color: "#fff", border: fireLayerOn ? "1px solid rgba(255,120,80,0.5)" : "1px solid rgba(255,255,255,0.15)" }}
            >
              {fireLoading
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c0 0-5.5 5-5.5 10.5a5.5 5.5 0 0 0 11 0C17.5 7 12 2 12 2z"/><path d="M12 13c0 0-2.5 2-2.5 4a2.5 2.5 0 0 0 5 0C14.5 15 12 13 12 13z" fill="currentColor" strokeWidth="0"/></svg>
              }
              {fireLoading ? "Loading…" : fireLayerOn ? "Fires: On" : "Fires"}
            </button>
            <button
              onClick={() => setProtectedAreasOn((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: protectedAreasOn ? "rgba(90,60,136,0.96)" : "rgba(255,255,255,0.10)", color: "#fff", border: protectedAreasOn ? "1px solid rgba(220,200,255,0.46)" : "1px solid rgba(255,255,255,0.15)" }}
              title={protectedAreasOn ? "Hide national conservation areas, monuments, recreation areas, state parks, and regional neighbors" : "Show national conservation areas, monuments, recreation areas, state parks, and regional neighbors"}
              aria-pressed={protectedAreasOn}
            >
              {protectedAreasLoading
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 4v5c0 4.4-3.1 7.4-8 9-4.9-1.6-8-4.6-8-9V7l8-4z"/><path d="M8 12l2.5 2.5L16 9"/></svg>
              }
              {protectedAreasLoading ? "Loading…" : protectedAreasOn ? "Protected: On" : "Protected Areas"}
            </button>
            <button
              onClick={() => setParksLayerOn((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: parksLayerOn ? "rgba(200,20,20,0.92)" : "rgba(255,255,255,0.10)", color: "#fff", border: parksLayerOn ? "1px solid rgba(255,80,80,0.5)" : "1px solid rgba(255,255,255,0.15)" }}
            >
              {parksLoading
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l4-8 4 5 3-4 4 7H3z"/><circle cx="17" cy="7" r="2" fill="currentColor" strokeWidth="0"/></svg>
              }
              {parksLoading ? "Loading…" : parksLayerOn ? "Nat'l Parks: On" : "Nat'l Parks"}
            </button>
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              {(["terrain", "satellite", "roadmap"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchMapType(t)}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{ background: mapType === t ? "#C0522A" : "rgba(255,255,255,0.07)", color: mapType === t ? "#fff" : "rgba(238,232,220,0.7)", borderRight: t !== "roadmap" ? "1px solid rgba(255,255,255,0.1)" : undefined }}
                >
                  {t === "terrain" ? "Topo" : t === "satellite" ? "Satellite" : "Street"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAboutOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{ background: "#5A3C88", color: "#FFFFFF", border: "1px solid rgba(227,210,250,0.42)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6A4A9A")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#5A3C88")}
            >
              About
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg transition-colors"
            style={{ background: menuOpen ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(238,232,220,0.9)" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <>
                <span style={{ display: "block", width: 18, height: 2, background: "rgba(238,232,220,0.85)", borderRadius: 2 }} />
                <span style={{ display: "block", width: 18, height: 2, background: "rgba(238,232,220,0.85)", borderRadius: 2 }} />
                <span style={{ display: "block", width: 18, height: 2, background: "rgba(238,232,220,0.85)", borderRadius: 2 }} />
              </>
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="sm:hidden absolute left-0 right-0 z-40 px-3 py-3 flex flex-col gap-2"
            style={{ top: 56, background: "rgba(22,28,42,0.98)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <button
              onClick={() => { setWurlTableOpen(false); setOtherPeaksOpen(false); setTableOpen((open) => !open); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
              style={{ background: peakListModalOpen ? "rgba(192,82,42,0.85)" : "rgba(255,255,255,0.08)", color: peakListModalOpen ? "#fff" : "rgba(238,232,220,0.9)", border: peakListModalOpen ? "1px solid rgba(255,185,145,0.38)" : "1px solid rgba(255,255,255,0.12)" }}
              aria-pressed={peakListModalOpen}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
              </svg>
              Peak Lists
            </button>
            <button
              onClick={() => { toggleOtherPeaks(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
              style={{
                background: otherPeaksVisible ? OTHER_PEAK_COLOR : "rgba(255,255,255,0.08)",
                color: otherPeaksVisible ? "#fff" : "rgba(238,232,220,0.9)",
                border: otherPeaksVisible ? "1px solid rgba(193,220,241,0.4)" : "1px solid rgba(255,255,255,0.12)",
              }}
              aria-pressed={otherPeaksVisible}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 18l5-9 4 5 3-4 6 8H3z"/><path d="M8 9l2-3 2 3"/>
              </svg>
              {otherPeaksVisible ? "Other Peaks: On (tap to hide)" : "Show Other Peaks"}
            </button>
            <button
              onClick={() => { toggleSkiResorts(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
              style={{ background: skiResortsVisible ? SKI_RESORT_COLOR : "rgba(255,255,255,0.08)", color: skiResortsVisible ? "#fff" : "rgba(238,232,220,0.9)", border: skiResortsVisible ? "1px solid rgba(165,243,252,0.45)" : "1px solid rgba(255,255,255,0.12)" }}
              aria-pressed={skiResortsVisible}
            >
              <SkierIcon size={14} />
              {skiResortsVisible ? "Ski Resorts: On (tap to hide)" : "Show Ski Resorts"}
            </button>
            <button
              onClick={() => { setFireLayerOn((v) => !v); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
              style={{ background: fireLayerOn ? "rgba(200,60,20,0.92)" : "rgba(255,255,255,0.08)", color: "#fff", border: fireLayerOn ? "1px solid rgba(255,120,80,0.4)" : "1px solid rgba(255,255,255,0.12)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c0 0-5.5 5-5.5 10.5a5.5 5.5 0 0 0 11 0C17.5 7 12 2 12 2z"/>
                <path d="M12 13c0 0-2.5 2-2.5 4a2.5 2.5 0 0 0 5 0C14.5 15 12 13 12 13z" fill="currentColor" strokeWidth="0"/>
              </svg>
              {fireLayerOn ? "Fires: On (tap to hide)" : "Show Recent Fires"}
            </button>
            <button
              onClick={() => { setProtectedAreasOn((v) => !v); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
              style={{ background: protectedAreasOn ? "rgba(90,60,136,0.96)" : "rgba(255,255,255,0.08)", color: "#fff", border: protectedAreasOn ? "1px solid rgba(220,200,255,0.42)" : "1px solid rgba(255,255,255,0.12)" }}
              aria-pressed={protectedAreasOn}
            >
              {protectedAreasLoading
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l8 4v5c0 4.4-3.1 7.4-8 9-4.9-1.6-8-4.6-8-9V7l8-4z"/><path d="M8 12l2.5 2.5L16 9"/></svg>
              }
              {protectedAreasLoading ? "Loading Protected Areas…" : protectedAreasOn ? "Protected Areas: On (tap to hide)" : "Show Protected Areas"}
            </button>
            <button
              onClick={() => { setParksLayerOn((v) => !v); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors"
              style={{ background: parksLayerOn ? "rgba(200,20,20,0.92)" : "rgba(255,255,255,0.08)", color: "#fff", border: parksLayerOn ? "1px solid rgba(255,80,80,0.4)" : "1px solid rgba(255,255,255,0.12)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 17l4-8 4 5 3-4 4 7H3z"/><circle cx="17" cy="7" r="2" fill="currentColor" strokeWidth="0"/>
              </svg>
              {parksLayerOn ? "Nat'l Parks: On (tap to hide)" : "Show Nat'l Parks"}
            </button>
            <button
              onClick={() => { setAboutOpen(true); setMenuOpen(false); }}
              className="w-full px-3 py-2.5 rounded-lg text-sm font-bold text-left transition-colors"
              style={{ background: "#5A3C88", color: "#FFFFFF", border: "1px solid rgba(227,210,250,0.42)" }}
            >
              About
            </button>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 2 }}>
              <div style={{ fontSize: 10, color: "rgba(238,232,220,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Map Style</div>
              <div className="flex gap-2">
                {(["terrain", "satellite", "roadmap"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { switchMapType(t); setMenuOpen(false); }}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: mapType === t ? "#C0522A" : "rgba(255,255,255,0.08)", color: mapType === t ? "#fff" : "rgba(238,232,220,0.7)", border: mapType === t ? "1px solid rgba(255,120,80,0.4)" : "1px solid rgba(255,255,255,0.12)" }}
                  >
                    {t === "terrain" ? "Topo" : t === "satellite" ? "Satellite" : "Street"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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

      {/* ── Protected areas error toast ── */}
      {protectedAreasError && (
        <div
          className="absolute z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
          style={{
            top: fireError || parksError ? 128 : 72,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(72,42,112,0.97)",
            color: "#fff",
            border: "1px solid rgba(227,210,250,0.35)",
            marginTop: 8,
          }}
        >
          {protectedAreasError}
          <button
            className="ml-3 text-white/70 hover:text-white"
            onClick={() => setProtectedAreasError(null)}
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
      <Legend
        selected={selected}
        onSelect={handleSelect}
        onOpenJournal={handleOpenJournal}
        trailRoute={WIRE_PASS_BUCKSKIN_ROUTE}
        onSelectTrailRoute={handleSelectTrailRoute}
      />

      {/* ── Detail Sidebar ── */}
      <DetailSidebar range={selected} onClose={() => setSelected(null)} onOpenJournal={handleOpenJournal} />
      <TrailRouteSidebar route={selectedTrailRoute} onClose={() => setSelectedTrailRoute(null)} />
      <OtherPeakSidebar peak={selectedOtherPeak} onClose={() => setSelectedOtherPeak(null)} />

      {/* ── Data Table Drawer ── */}
      <DataTableDrawer
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        onSelectRange={(r) => { handleSelect(r); setTableOpen(false); }}
        onOpenJournal={handleOpenJournal}
        onOpenOtherPeaks={() => { setTableOpen(false); setOtherPeaksOpen(true); }}
      />

      {/* ── Other Peaks Catalog ── */}
      <OtherPeaksDrawer
        open={otherPeaksOpen}
        onClose={() => setOtherPeaksOpen(false)}
        onSelectPeak={handleSelectOtherPeak}
        onSelectTrailRoute={handleSelectTrailRoute}
        onSelectWurlPeak={handleSelectWurlPeak}
        wurlVisible={wurlVisible}
        onToggleWurl={toggleWurl}
        onOpenPeakList={() => { setOtherPeaksOpen(false); setTableOpen(true); }}
      />

      {/* ── WURL Peaks Table Drawer ── */}
      <WurlTableDrawer
        open={wurlTableOpen}
        onClose={() => setWurlTableOpen(false)}
        onSelectPeak={(peak) => { handleSelectWurlPeak(peak); setWurlTableOpen(false); }}
      />

      {/* ── About Modal ── */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* ── Peak Journal Modal ── */}
      <PeakJournalModal range={journalRange} onClose={() => setJournalRange(null)} />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
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
  precision?: "detailed" | "overview";
}

// ── Curated Protected Area Boundary Types ──────────────────────────────────
interface EsriBoundaryFeature {
  attributes: Record<string, string | number | null | undefined>;
  geometry?: {
    rings?: number[][][];
  };
}

interface ProtectedAreaFeature {
  name: string;
  kind: ProtectedAreaKind;
  jurisdiction: string;
  sourceLabel: string;
  sourceUrl: string;
  geometryNote?: string;
  geometry?: {
    rings?: number[][][];
  };
}

// ── Fire Perimeter Types ───────────────────────────────────────────────────
