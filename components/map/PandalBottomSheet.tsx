"use client";

import { motion } from "framer-motion";
import { NearbyPandal } from "@/app/map/page";
import { formatDistance } from "@/lib/geo";

interface PandalBottomSheetProps {
  pandal: NearbyPandal;
  userLocation: { lat: number; lng: number } | null;
  checkinRadius: number;
  isDemoMode: boolean;
  onClose: () => void;
  onCheckin: (pandalId: string) => void;
}

function StateLabel({ state }: { state: NearbyPandal["state"] }) {
  const config = {
    detected: { label: "SOMETHING IS NEARBY...", color: "var(--fog-gray)", icon: "🔮" },
    revealed: { label: "BAPPA DETECTED", color: "var(--muted-gold)", icon: "🐘" },
    in_range: { label: "WITHIN DISCOVERY RANGE", color: "var(--saffron)", icon: "✨" },
    discovered: { label: "ALREADY DISCOVERED", color: "#4ADE80", icon: "✅" },
  };
  const c = config[state];
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{c.icon}</span>
      <span className="text-xs font-bold tracking-[0.15em]" style={{ color: c.color }}>
        {c.label}
      </span>
    </div>
  );
}

export default function PandalBottomSheet({
  pandal,
  userLocation: _userLocation,
  checkinRadius: _checkinRadius,
  isDemoMode,
  onClose,
  onCheckin,
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
        style={{ paddingBottom: "90px" }}
      >
        {/* Handle */}
        <div className="bottom-sheet-handle" />

        {/* State label */}
        <StateLabel state={pandal.state} />

        {/* Name */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "1.5rem",
                color: pandal.name === "???" ? "var(--fog-gray)" : "var(--warm-cream)",
              }}
            >
              {pandal.name === "???" ? "UNKNOWN BAPPA" : pandal.name.toUpperCase()}
            </h2>
            {pandal.address && (
              <p className="text-sm mt-1" style={{ color: "var(--fog-gray)" }}>
                📍 {pandal.address}
              </p>
            )}
          </div>
          {pandal.isRare && (
            <span className="bappa-pill ml-2">⭐ Rare</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-5">
          <div
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--saffron)" }}
          >
            <span>📍</span>
            <span className="font-bold">{formatDistance(pandal.distance)}</span>
            <span style={{ color: "var(--fog-gray)" }}>away</span>
          </div>
          <div
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "var(--fog-gray)" }}
          >
            <span>👥</span>
            <span>{pandal.visitCount.toLocaleString()} visitors</span>
          </div>
          {pandal.photoCount > 0 && (
            <div
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "var(--fog-gray)" }}
            >
              <span>📸</span>
              <span>{pandal.photoCount} photos</span>
            </div>
          )}
        </div>

        {/* Description */}
        {pandal.description && (
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "var(--fog-gray)" }}
          >
            {pandal.description}
          </p>
        )}

        {/* Aarti timings */}
        {aartiTimes.length > 0 && (
          <div className="mb-5">
            <p
              className="text-xs font-bold tracking-[0.1em] uppercase mb-2"
              style={{ color: "var(--muted-gold)" }}
            >
              🪔 AARTI TIMINGS
            </p>
            <div className="flex flex-wrap gap-2">
              {aartiTimes.map((time: string) => (
                <span key={time} className="bappa-pill">
                  🕐 {time}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Distance guidance */}
        {pandal.state !== "discovered" && pandal.state !== "in_range" && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{
              background: "rgba(201, 147, 58, 0.08)",
              border: "1px solid var(--border-gold)",
              color: "var(--fog-gray)",
            }}
          >
            {pandal.state === "revealed"
              ? `🐘 You're ${formatDistance(pandal.distance)} away. Keep walking to unlock this Bappa!`
              : `🔮 Walk closer to reveal this Bappa. Something is nearby...`}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {canCheckin ? (
            <button
              id={`checkin-${pandal.id}`}
              className="btn-primary flex-1"
              onClick={() => onCheckin(pandal.id)}
            >
              {isDemoMode ? "🎮 UNLOCK (DEMO)" : "📸 TAKE PHOTO & UNLOCK"}
            </button>
          ) : (
            <div
              className="flex-1 p-3 rounded-xl text-center text-sm font-semibold"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-cream)",
                color: "var(--fog-gray)",
              }}
            >
              📍 Get closer to unlock
            </div>
          )}
          <button
            id={`directions-${pandal.id}`}
            className="btn-secondary px-4"
            onClick={openDirections}
          >
            🗺️
          </button>
        </div>
      </motion.div>
    </>
  );
}
