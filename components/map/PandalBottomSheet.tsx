"use client";

import { motion } from "framer-motion";
import { NearbyPandal } from "@/app/map/page";
import { formatDistance } from "@/lib/geo";
import MushakAvatar from "@/components/mushak/MushakAvatar";

interface PandalBottomSheetProps {
  pandal: NearbyPandal;
  userLocation: { lat: number; lng: number } | null;
  checkinRadius: number;
  isDemoMode: boolean;
  onClose: () => void;
  onCheckin: (pandalId: string) => void;
  onNavigate?: (pandal: NearbyPandal) => void;
  isRouting?: boolean;
}

function StateLabel({ state }: { state: NearbyPandal["state"] }) {
  const config = {
    detected: { label: "SOMETHING IS NEARBY...", bg: "#FFE8D2", color: "#80665C", icon: "🪷" },
    revealed: { label: "BAPPA DETECTED", bg: "#FFF4E3", color: "#B88A2E", icon: "🐘" },
    in_range: { label: "WITHIN DISCOVERY RANGE", bg: "#FFE8D2", color: "#D46237", icon: "✨" },
    discovered: { label: "ALREADY DISCOVERED", bg: "#EBF5ED", color: "#6D9275", icon: "✅" },
  };
  const c = config[state];
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-[0.1em] mb-3"
      style={{ background: c.bg, color: c.color }}
    >
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </div>
  );
}

export default function PandalBottomSheet({
  pandal,
  userLocation: _userLocation,
  checkinRadius,
  isDemoMode,
  onClose,
  onCheckin,
  onNavigate,
  isRouting,
}: PandalBottomSheetProps) {
  const aartiTimes = pandal.aartiTimes ? JSON.parse(pandal.aartiTimes) : [];
  const canCheckin = pandal.state === "in_range" || isDemoMode;

  const openDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${pandal.latitude},${pandal.longitude}`,
      "_blank"
    );
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bottom-sheet-overlay"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="bottom-sheet"
        style={{ paddingBottom: "96px" }}
      >
        {/* Handle */}
        <div className="bottom-sheet-handle" />

        {/* State label */}
        <div className="flex items-center justify-between">
          <StateLabel state={pandal.state} />
          {pandal.isRare && (
            <span className="bappa-pill font-bold">
              ⭐ Rare Pandal
            </span>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "1.5rem",
              color: pandal.name === "???" ? "var(--muted-brown)" : "var(--warm-brown)",
              letterSpacing: "-0.01em",
            }}
          >
            {pandal.name === "???" ? "Unknown Bappa" : pandal.name}
          </h2>
          {pandal.address && (
            <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "var(--muted-brown)" }}>
              <span>📍</span> {pandal.address}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 p-3 rounded-2xl mb-4" style={{ background: "#FFE8D2", border: "1px solid rgba(216,169,74,0.2)" }}>
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--saffron-dark)" }}>
            <span>📍</span>
            <span>{formatDistance(pandal.distance)}</span>
          </div>
          <span style={{ color: "rgba(128,102,92,0.4)" }}>•</span>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--warm-brown)" }}>
            <span>👥</span>
            <span>{pandal.visitCount.toLocaleString()} explorers</span>
          </div>
          {pandal.photoCount > 0 && (
            <>
              <span style={{ color: "rgba(128,102,92,0.4)" }}>•</span>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--warm-brown)" }}>
                <span>📸</span>
                <span>{pandal.photoCount} photos</span>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        {pandal.description && (
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "var(--muted-brown)" }}
          >
            {pandal.description}
          </p>
        )}

        {/* Aarti timings */}
        {aartiTimes.length > 0 && (
          <div className="mb-5">
            <p
              className="text-xs font-bold tracking-[0.1em] uppercase mb-2 flex items-center gap-1.5"
              style={{ color: "var(--muted-gold-dark)" }}
            >
              <span>🪔</span> AARTI TIMINGS
            </p>
            <div className="flex flex-wrap gap-2">
              {aartiTimes.map((time: string) => (
                <span
                  key={time}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "#FFF4E3", border: "1px solid var(--border-gold)", color: "var(--warm-brown)" }}
                >
                  🕐 {time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Distance guidance */}
        {pandal.state !== "discovered" && pandal.state !== "in_range" && (
          <div
            className="mb-5 p-3 rounded-2xl flex items-center gap-2.5"
            style={{
              background: "#FFF4E3",
              border: "1px solid var(--border-cream)",
            }}
          >
            <MushakAvatar mood={pandal.state === "revealed" ? "excited" : "curious"} size="xs" />
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-brown)" }}>
              {pandal.state === "revealed"
                ? `\"Arre bhau, you're ${formatDistance(pandal.distance)} away! Keep walking to unlock!\"`
                : `\"Walk closer to reveal this Bappa. Something special is nearby...\"`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          {canCheckin ? (
            <div className="flex gap-2.5">
              <button
                id={`checkin-${pandal.id}`}
                className="btn-primary flex-1 text-sm font-bold"
                onClick={() => onCheckin(pandal.id)}
              >
                {isDemoMode ? "🎮 UNLOCK THIS BAPPA (DEMO)" : "🐘 DISCOVER THIS BAPPA"}
              </button>
              {onNavigate && (
                <button
                  id={`navigate-${pandal.id}`}
                  className="btn-secondary px-3.5 text-xs font-bold flex items-center gap-1.5"
                  title="Show walking path on map"
                  onClick={() => onNavigate(pandal)}
                  disabled={isRouting}
                >
                  <span>🧭</span>
                  <span>Path</span>
                </button>
              )}
              <button
                id={`directions-${pandal.id}`}
                className="btn-secondary px-3 text-sm"
                title="Open in Google Maps"
                onClick={openDirections}
              >
                ↗️
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {onNavigate && (
                <button
                  id={`navigate-main-${pandal.id}`}
                  className="btn-primary w-full text-sm font-bold py-3.5 flex items-center justify-center gap-2"
                  onClick={() => onNavigate(pandal)}
                  disabled={isRouting}
                >
                  {isRouting ? (
                    <>
                      <span className="animate-spin text-base">⏳</span>
                      <span>Finding shortest path...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🧭</span>
                      <span>WALK TO BAPPA</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center gap-2">
                <div
                  className="flex-1 p-2.5 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5"
                  style={{
                    background: "#FFE8D2",
                    border: "1px solid var(--border-cream)",
                    color: "var(--muted-brown)",
                  }}
                >
                  <span>📍</span> Get within {checkinRadius}m to unlock
                </div>

                <button
                  id={`directions-${pandal.id}`}
                  className="btn-secondary py-2.5 px-3.5 text-xs font-semibold flex items-center gap-1"
                  title="Open in Google Maps"
                  onClick={openDirections}
                >
                  <span>Google Maps</span>
                  <span>↗️</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
