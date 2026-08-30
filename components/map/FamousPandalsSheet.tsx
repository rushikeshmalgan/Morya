"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface FamousPandal {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string;
  established?: number | null;
  isRare: boolean;
  visitCount: number;
  aartiTimes?: string[];
  imageUrl?: string | null;
}

interface FamousPandalsSheetProps {
  userLocation: { lat: number; lng: number };
  onSelectPandal: (pandal: FamousPandal) => void;
  onNavigatePandal?: (pandal: FamousPandal) => void;
  onClose: () => void;
}

const CITIES = ["ALL", "Pune", "Mumbai", "Satara", "Nashik", "Nagpur"];

export default function FamousPandalsSheet({
  userLocation,
  onSelectPandal,
  onNavigatePandal,
  onClose,
}: FamousPandalsSheetProps) {
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [pandals, setPandals] = useState<FamousPandal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFamous() {
      setLoading(true);
      try {
        const url = selectedCity === "ALL"
          ? "/api/pandals/famous"
          : `/api/pandals/famous?city=${encodeURIComponent(selectedCity)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.pandals) {
          setPandals(data.pandals);
        }
      } catch (err) {
        console.error("Failed to load famous pandals:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFamous();
  }, [selectedCity]);

  // Calculate rough distance in km
  const getDistanceKm = (lat: number, lng: number) => {
    const R = 6371;
    const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
    const dLng = ((lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
  };

  const filtered = pandals.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      (p.address && p.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bottom-sheet-overlay flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        className="bottom-sheet max-h-[85vh] flex flex-col"
        style={{ paddingBottom: "80px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <h2 className="font-display font-bold text-lg" style={{ color: "var(--warm-brown)" }}>
                Famous & Iconic Pandals
              </h2>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-brown)" }}>
              Explore legendary Bappas across Maharashtra
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "#FFE8D2", color: "var(--warm-brown)" }}
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search Lalbaug, Dagdusheth, Rajwada..."
            className="w-full bappa-input text-xs py-2"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none no-scrollbar">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
              style={
                selectedCity === c
                  ? {
                    background: "linear-gradient(135deg, #E9784F, #E0673B)",
                    color: "#FFFFFF",
                    boxShadow: "0 3px 10px rgba(233,120,79,0.3)",
                  }
                  : {
                    background: "#FFE8D2",
                    color: "var(--muted-brown)",
                    border: "1px solid var(--border-cream)",
                  }
              }
            >
              {c === "ALL" ? "All Cities" : c}
            </button>
          ))}
        </div>

        {/* List of Pandals */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1" style={{ maxHeight: "48vh" }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-2 animate-bounce">🐘</div>
              <p className="text-xs font-semibold" style={{ color: "var(--muted-brown)" }}>
                Loading iconic pandals...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 bappa-card p-6">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-xs font-semibold" style={{ color: "var(--muted-brown)" }}>
                No pandals found matching &quot;{search}&quot;
              </p>
            </div>
          ) : (
            filtered.map((pandal, i) => (
              <motion.div
                key={pandal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bappa-card p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectPandal(pandal)}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs"
                    style={{ background: "#FFE8D2" }}
                  >
                    {pandal.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pandal.imageUrl}
                        alt={pandal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">🐘</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs truncate" style={{ color: "var(--warm-brown)", maxWidth: "140px" }}>
                        {pandal.name}
                      </h4>
                      {pandal.isRare && (
                        <span className="bappa-pill py-0 px-1.5 text-[9px] flex-shrink-0">
                          ⭐ Rare
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--muted-brown)" }}>
                      📍 {pandal.city} • {pandal.address || pandal.city}
                    </p>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold" style={{ color: "var(--saffron-dark)" }}>
                        🎯 {getDistanceKm(pandal.latitude, pandal.longitude)} away
                      </span>
                      {pandal.established && (
                        <span className="text-[10px]" style={{ color: "var(--muted-brown)", opacity: 0.8 }}>
                          Est. {pandal.established}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons row — separate from info to prevent overlap */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t" style={{ borderColor: "rgba(216, 169, 74, 0.2)" }}>
                  {onNavigatePandal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigatePandal(pandal);
                      }}
                      className="btn-primary py-1.5 px-3 text-[10px] font-bold whitespace-nowrap flex items-center gap-1 flex-1 justify-center"
                      title="Show walking route on map"
                    >
                      <span>🧭</span> Walk There
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPandal(pandal);
                    }}
                    className="btn-secondary py-1.5 px-3 text-[10px] font-bold whitespace-nowrap flex items-center gap-1 flex-1 justify-center"
                    title="Locate on map"
                  >
                    <span>🎯</span> View
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
