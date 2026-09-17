/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const GOOGLE_MAPS_SCRIPT_URL = "https://maps.googleapis.com/maps/api/js";
// In dev, use the Vite server proxy to avoid CORS/auth issues with the dev preview URL.
// Cloud Run builds receive a browser-restricted Maps key through VITE_GOOGLE_MAPS_API_KEY.
const IS_DEV = import.meta.env.DEV;
const MAPS_PROXY_URL = IS_DEV
  ? `${window.location.origin}/__maps_proxy`
  : `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise(resolve => {
    // If Google Maps is already loaded, resolve immediately
    if (window.google?.maps) {
      resolve(null);
      return;
    }
    // If a script with the same src is already in the DOM, wait for it
    const existingScript = document.querySelector(`script[src*="maps/api/js"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(null));
      return;
    }
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${FORGE_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.onload = () => {
      resolve(null);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      resolve(null); // resolve anyway so UI doesn't hang
    };
    document.head.appendChild(script);
  });
}
// Production runs in Cloud Run and uses the repository's browser-restricted
// Google Maps key, injected at build time by the deployment workflow.
function loadMapScriptProd(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps) { resolve(); return; }
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key is not configured for production");
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `${GOOGLE_MAPS_SCRIPT_URL}?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      resolve();
    };
    document.head.appendChild(script);
  });
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  const init = usePersistFn(async () => {
    if (IS_DEV) {
      await loadMapScript();
    } else {
      await loadMapScriptProd();
    }
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }
    if (!window.google?.maps) {
      console.error("Google Maps failed to load");
      return;
    }
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
      mapId: "DEMO_MAP_ID",
    });
    // Dismiss the "This page can't load Google Maps correctly" dialog
    // that appears in dev when the domain isn't registered
    if (IS_DEV) {
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[role="dialog"], .dismissButton, .gm-err-container');
        dialogs.forEach(el => (el as HTMLElement).style.display = 'none');
        // Also try clicking any close/dismiss button
        const closeBtn = document.querySelector('.gm-err-container button, [aria-label="Close"]') as HTMLElement;
        if (closeBtn) closeBtn.click();
      }, 500);
    }
    if (onMapReady) {
      onMapReady(map.current);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
