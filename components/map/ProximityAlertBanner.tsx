"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistance } from "@/lib/geo";
import { NearbyPandal } from "@/app/map/page";

export interface ProximityAlert {
  id: string;
  pandal: NearbyPandal;
  type: "in_range" | "detected" | "revealed";
  timestamp: number;
}

interface ProximityAlertBannerProps {
  alert: ProximityAlert | null;
  onDismiss: () => void;
  onAction: (pandal: NearbyPandal) => void;
}

export default function ProximityAlertBanner({
  alert,
  onDismiss,
  onAction,
}: ProximityAlertBannerProps) {
  if (!alert) return null;

  const { pandal, type } = alert;
  const isInRange = type === "in_range";
  const displayName = pandal.name === "???" ? "Mystic Bappa Signal" : pandal.name;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto pointer-events-auto"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all"
          style={{
            background: isInRange
              ? "linear-gradient(135deg, rgba(255, 244, 227, 0.98) 0%, rgba(255, 232, 210, 0.98) 100%)"
              : "linear-gradient(135deg, rgba(255, 249, 241, 0.98) 0%, rgba(255, 244, 227, 0.98) 100%)",
            borderColor: isInRange ? "rgba(233, 120, 79, 0.65)" : "rgba(216, 169, 74, 0.55)",
            boxShadow: isInRange
              ? "0 12px 36px rgba(233, 120, 79, 0.3), 0 0 0 1px rgba(233, 120, 79, 0.2)"
              : "0 10px 30px rgba(74, 48, 40, 0.18)",
          }}
        >
          {/* Top glowing indicator bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: isInRange
                ? "linear-gradient(90deg, #E9784F, #D8A94A, #E9784F)"
                : "linear-gradient(90deg, #D8A94A, #EFA6A0, #D8A94A)",
              animation: "shimmer 2s linear infinite",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="flex items-start gap-3.5">
            {/* Animated Icon Avatar */}
            <motion.div
              animate={
                isInRange
                  ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }
                  : { scale: [1, 1.08, 1] }
              }
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
              style={{
                background: isInRange
                  ? "linear-gradient(135deg, #E9784F, #D46237)"
                  : "linear-gradient(135deg, #FFE8D2, #FCE0DC)",
                border: "1px solid rgba(216, 169, 74, 0.4)",
              }}
            >
              {isInRange ? "🛕" : "🔔"}
            </motion.div>

            {/* Alert Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: isInRange ? "rgba(233, 120, 79, 0.2)" : "rgba(216, 169, 74, 0.2)",
                    color: isInRange ? "var(--saffron-dark)" : "var(--muted-gold-dark)",
                  }}
                >
                  {isInRange ? "Ready to Check In!" : "Pandal Detected in 1 km"}
                </span>
                <span className="text-[11px] font-bold" style={{ color: "var(--muted-brown)" }}>
                  • {formatDistance(pandal.distance)} away
                </span>
              </div>

              <h4
                className="text-sm font-extrabold truncate leading-tight"
                style={{ color: "var(--warm-brown)" }}
              >
                {displayName}
              </h4>
              <p
                className="text-xs mt-0.5 line-clamp-1"
                style={{ color: "var(--muted-brown)" }}
              >
                {isInRange
                  ? "You are inside the darshan radius. Claim your discovery!"
                  : pandal.address || "Pandal signal detected nearby. Walk closer to reveal!"}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => onAction(pandal)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-transform active:scale-95 shadow-sm"
                  style={{
                    background: isInRange
                      ? "linear-gradient(135deg, #E9784F, #D46237)"
                      : "linear-gradient(135deg, #4A3028, #2A1810)",
                  }}
                >
                  {isInRange ? "✨ View & Check In" : "🧭 View on Map"}
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors hover:bg-black/5"
                  style={{ color: "var(--muted-brown)" }}
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close Cross */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close notification"
              className="absolute top-3 right-3 text-sm p-1 text-stone-400 hover:text-stone-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
