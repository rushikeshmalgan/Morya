"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NearbyPandal } from "@/app/map/page";
import { WalkingRoute } from "@/lib/routing";

interface BappaMapProps {
  userLocation: { lat: number; lng: number };
  pandals: NearbyPandal[];
  onPandalTap: (pandal: NearbyPandal) => void;
  checkinRadius: number;
  isDemoMode: boolean;
  recenterKey?: number;
  flyToTarget?: { lat: number; lng: number; zoom?: number; timestamp: number } | null;
  activeRoute?: WalkingRoute | null;
}

// Custom SVG markers with warm festival styling
function createMarkerSvg(state: NearbyPandal["state"], isRare: boolean): string {
  if (state === "detected") {
    // Foggy / mystery marker (soft dusty pink & marigold)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
      <defs>
        <filter id="shadow-det" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#80665C" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#shadow-det)">
        <circle cx="19" cy="19" r="15" fill="#FFF9F1" stroke="#EFA6A0" stroke-width="2" stroke-dasharray="3 2"/>
        <text x="19" y="24" text-anchor="middle" font-size="15">🪷</text>
      </g>
    </svg>`;
  }

  if (state === "discovered") {
    // Discovered marker (warm ivory card with gold highlight & checkmark)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="shadow-disc" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#4A3028" flood-opacity="0.2"/>
        </filter>
      </defs>
      <g filter="url(#shadow-disc)">
        <circle cx="20" cy="20" r="16" fill="#FFF9F1" stroke="#D8A94A" stroke-width="2.2"/>
        <circle cx="20" cy="20" r="13" fill="#FFE8D2" fill-opacity="0.4"/>
        <text x="20" y="26" text-anchor="middle" font-size="17">🐘</text>
        <circle cx="29" cy="11" r="6.5" fill="#6D9275" stroke="#FFFFFF" stroke-width="1.5"/>
        <text x="29" y="14" text-anchor="middle" font-size="8" fill="#FFFFFF" font-weight="bold">✓</text>
        ${isRare ? '<circle cx="20" cy="20" r="18" fill="none" stroke="#D8A94A" stroke-width="1.5" stroke-dasharray="3 2"/>' : ""}
      </g>
    </svg>`;
  }

  if (state === "in_range") {
    // In-range animated festival marker (soft terracotta orange with gold ring)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <defs>
        <filter id="shadow-range" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#E9784F" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="terracotta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F29572"/>
          <stop offset="100%" stop-color="#E9784F"/>
        </linearGradient>
      </defs>
      <g filter="url(#shadow-range)">
        <circle cx="24" cy="24" r="22" fill="#E9784F" fill-opacity="0.2" stroke="#E9784F" stroke-width="1.5" stroke-dasharray="4 2"/>
        <circle cx="24" cy="24" r="17" fill="url(#terracotta-grad)" stroke="#FFFFFF" stroke-width="2.5"/>
        <text x="24" y="30" text-anchor="middle" font-size="19">🐘</text>
        ${isRare ? '<circle cx="36" cy="12" r="7" fill="#D8A94A" stroke="#FFFFFF" stroke-width="1.5"/><text x="36" y="16" text-anchor="middle" font-size="9" fill="#FFF">★</text>' : ""}
      </g>
    </svg>`;
  }

  // revealed state
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <defs>
      <filter id="shadow-rev" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#80665C" flood-opacity="0.25"/>
      </filter>
    </defs>
    <g filter="url(#shadow-rev)">
      <circle cx="20" cy="20" r="16" fill="#FFF9F1" stroke="#E9784F" stroke-width="2"/>
      <circle cx="20" cy="20" r="13" fill="#FFE8D2" fill-opacity="0.5"/>
      <text x="20" y="26" text-anchor="middle" font-size="16">🐘</text>
      ${isRare ? '<circle cx="29" cy="11" r="6" fill="#D8A94A" stroke="#FFFFFF" stroke-width="1.5"/><text x="29" y="14.5" text-anchor="middle" font-size="8" fill="#FFF">★</text>' : ""}
    </g>
  </svg>`;
}

function createLeafletIcon(state: NearbyPandal["state"], isRare: boolean): L.DivIcon {
  const svg = createMarkerSvg(state, isRare);
  const size = state === "in_range" ? 48 : 40;
  const anchor = state === "in_range" ? 24 : 20;
  return L.divIcon({
    html: svg,
    className: `bappa-marker state-${state}`,
    iconSize: [size, size + 8],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor],
  });
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <defs>
        <filter id="user-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#4A3028" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(#user-shadow)">
        <circle cx="14" cy="14" r="12" fill="#FFE8D2" fill-opacity="0.8"/>
        <circle cx="14" cy="14" r="9" fill="#E9784F" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="14" cy="14" r="4" fill="#FFFFFF"/>
      </g>
    </svg>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function BappaMap({
  userLocation,
  pandals,
  onPandalTap,
  checkinRadius,
  isDemoMode: _isDemoMode,
  recenterKey,
  flyToTarget,
  activeRoute,
}: BappaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);
  const initialCenterSet = useRef(false);

  // Smoothly fly to user location when recenterKey changes
  useEffect(() => {
    if (!recenterKey || !mapRef.current) return;
    mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
      animate: true,
      duration: 1.2,
    });
  }, [recenterKey, userLocation]);

  // Smoothly fly to custom target (e.g. famous pandal)
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom || 16, {
      animate: true,
      duration: 1.5,
    });
  }, [flyToTarget]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap tiles (watermark-free, fast, reliable)
    const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
    const isCartoKeyConfigured = Boolean(
      cartoApiKey &&
        cartoApiKey.length > 20 &&
        !cartoApiKey.startsWith("cb1_2kgj") &&
        cartoApiKey !== "your-carto-api-key"
    );

    const tileUrl = isCartoKeyConfigured
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${cartoApiKey}`
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const subdomains = isCartoKeyConfigured ? "abcd" : "abc";

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains,
    }).addTo(map);

    // Attribution
    L.control
      .attribution({ prefix: isCartoKeyConfigured ? "© CartoDB © OSM" : "© OpenStreetMap contributors" })
      .addTo(map);

    mapRef.current = map;
    initialCenterSet.current = true;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latlng: L.LatLngExpression = [userLocation.lat, userLocation.lng];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latlng);
    } else {
      userMarkerRef.current = L.marker(latlng, { icon: createUserIcon(), zIndexOffset: 1000 }).addTo(map);
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng(latlng);
    } else {
      radiusCircleRef.current = L.circle(latlng, {
        radius: checkinRadius,
        color: "#E9784F",
        fillColor: "#FFE8D2",
        fillOpacity: 0.2,
        weight: 1.5,
        dashArray: "5 5",
      }).addTo(map);
    }

    // Center on user on first update
    if (!initialCenterSet.current) {
      map.setView(latlng, 15);
      initialCenterSet.current = true;
    }
  }, [userLocation, checkinRadius]);

  // Update pandal markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const pandalIds = new Set(pandals.map((p) => p.id));

    // Remove markers for pandals no longer nearby
    markersRef.current.forEach((marker, id) => {
      if (!pandalIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    pandals.forEach((pandal) => {
      const latlng: L.LatLngExpression = [pandal.latitude, pandal.longitude];
      const icon = createLeafletIcon(pandal.state, pandal.isRare);

      if (markersRef.current.has(pandal.id)) {
        const marker = markersRef.current.get(pandal.id)!;
        marker.setLatLng(latlng);
        marker.setIcon(icon);
      } else {
        const marker = L.marker(latlng, { icon }).addTo(map);
        marker.on("click", () => onPandalTap(pandal));
        markersRef.current.set(pandal.id, marker);
      }
    });
  }, [pandals, onPandalTap]);

  // Render and update active walking route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up existing route layers
    if (routeGlowRef.current) {
      routeGlowRef.current.remove();
      routeGlowRef.current = null;
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (activeRoute && activeRoute.coordinates.length > 0) {
      const latlngs: L.LatLngExpression[] = activeRoute.coordinates;

      // Soft warm glow underlay
      routeGlowRef.current = L.polyline(latlngs, {
        color: "#FFE8D2",
        weight: 9,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Main saffron / marigold walking path
      routePolylineRef.current = L.polyline(latlngs, {
        color: "#E9784F",
        weight: 4.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        dashArray: activeRoute.source === "fallback" ? "6 6" : undefined,
      }).addTo(map);

      // Fit map view to encompass the entire route comfortably
      try {
        const bounds = routePolylineRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [70, 70],
            maxZoom: 17,
            animate: true,
            duration: 1.2,
          });
        }
      } catch {
        // Fallback view update if bounds error
      }
    }
  }, [activeRoute]);

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ cursor: "grab" }}
    />
  );
}
