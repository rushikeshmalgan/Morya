"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NearbyPandal } from "@/app/map/page";

interface BappaMapProps {
  userLocation: { lat: number; lng: number };
  pandals: NearbyPandal[];
  onPandalTap: (pandal: NearbyPandal) => void;
  checkinRadius: number;
  isDemoMode: boolean;
}

// Custom SVG markers for each state
function createMarkerSvg(state: NearbyPandal["state"], isRare: boolean): string {
  const colors = {
    detected: "#8A7A6A",
    revealed: "#C9933A",
    in_range: "#FF6B00",
    discovered: "#4ADE80",
  };
  const color = colors[state] || "#8A7A6A";
  const size = state === "in_range" ? 44 : 36;

  if (state === "detected") {
    // Foggy/mystery marker
    return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <circle cx="18" cy="18" r="14" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 2"/>
      <text x="18" y="24" text-anchor="middle" font-size="16">🔮</text>
    </svg>`;
  }

  if (state === "discovered") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <circle cx="18" cy="18" r="14" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <text x="18" y="24" text-anchor="middle" font-size="18">✅</text>
      ${isRare ? '<circle cx="18" cy="18" r="17" fill="none" stroke="#FFD700" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"/>' : ""}
    </svg>`;
  }

  if (state === "in_range") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <circle cx="22" cy="22" r="20" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="2"/>
      <circle cx="22" cy="22" r="14" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
      <text x="22" y="28" text-anchor="middle" font-size="20">🐘</text>
      ${isRare ? '<circle cx="22" cy="22" r="19" fill="none" stroke="#FFD700" stroke-width="1.5"/>' : ""}
    </svg>`;
  }

  // revealed
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <circle cx="18" cy="18" r="14" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
    <text x="18" y="24" text-anchor="middle" font-size="16">🐘</text>
    ${isRare ? '<circle cx="18" cy="18" r="17" fill="none" stroke="#FFD700" stroke-width="1" stroke-dasharray="3 2" opacity="0.7"/>' : ""}
  </svg>`;
}

function createLeafletIcon(state: NearbyPandal["state"], isRare: boolean): L.DivIcon {
  const svg = createMarkerSvg(state, isRare);
  const size = state === "in_range" ? 44 : 36;
  const anchor = state === "in_range" ? 22 : 18;
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
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="#FF6B00" fill-opacity="0.9" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function BappaMap({
  userLocation,
  pandals,
  onPandalTap,
  checkinRadius,
  isDemoMode,
}: BappaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const initialCenterSet = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark/warm OpenStreetMap tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    // Attribution (small, bottom right)
    L.control
      .attribution({ prefix: "© CartoDB © OSM" })
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
        color: "#FF6B00",
        fillColor: "#FF6B00",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "4 4",
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

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ cursor: "grab" }}
    />
  );
}
