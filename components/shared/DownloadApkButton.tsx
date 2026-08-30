"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DownloadApkButtonProps {
  variant?: "banner" | "button" | "compact";
  className?: string;
}

export default function DownloadApkButton({
  variant = "button",
  className = "",
}: DownloadApkButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/downloads/bappa-morya.apk";
    link.download = "Bappa-Morya.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 ${className}`}
          style={{
            background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
            border: "1.5px solid var(--border-gold)",
            color: "var(--warm-brown)",
            boxShadow: "0 4px 12px rgba(74, 48, 40, 0.08)",
          }}
          title="Download Android APK"
        >
          <span className="text-sm">🤖</span>
          <span>Download App</span>
          <span
            className="text-[9px] px-1 py-0.2 rounded font-extrabold text-white"
            style={{ background: "var(--saffron-dark)" }}
          >
            APK
          </span>
        </button>

        <ApkModal isOpen={showModal} onClose={() => setShowModal(false)} onDownload={handleDownload} />
      </>
    );
  }

  if (variant === "banner") {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bappa-card p-4 relative overflow-hidden ${className}`}
          style={{
            background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
            border: "1.5px solid var(--border-gold)",
            boxShadow: "0 6px 20px rgba(74, 48, 40, 0.08)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #E9784F, #D8A94A)",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(233, 120, 79, 0.3)",
                }}
              >
                🤖
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs" style={{ color: "var(--warm-brown)" }}>
                    Bappa Morya Android App
                  </h4>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold text-white"
                    style={{ background: "#43A047" }}
                  >
                    APK v1.0
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-brown)" }}>
                  Experience haptic vibration & background 1km radar
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="btn-primary py-2 px-3 text-xs font-bold whitespace-nowrap flex items-center gap-1 flex-shrink-0"
              style={{ fontSize: "11px" }}
            >
              <span>⬇️</span> Get APK
            </button>
          </div>
        </motion.div>

        <ApkModal isOpen={showModal} onClose={() => setShowModal(false)} onDownload={handleDownload} />
      </>
    );
  }

  // Standard Button
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
        style={{
          background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
          border: "1.5px solid var(--border-gold)",
          color: "var(--warm-brown)",
          boxShadow: "0 4px 15px rgba(74, 48, 40, 0.08)",
        }}
      >
        <span className="text-base">🤖</span>
        <span>Download Android App (APK)</span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-extrabold text-white ml-1"
          style={{ background: "var(--saffron-dark)" }}
        >
          13 MB
        </span>
      </button>

      <ApkModal isOpen={showModal} onClose={() => setShowModal(false)} onDownload={handleDownload} />
    </>
  );
}

function ApkModal({
  isOpen,
  onClose,
  onDownload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl p-5 shadow-2xl relative"
            style={{
              background: "linear-gradient(145deg, #FFF9F1, #FFE8D2)",
              border: "2px solid var(--border-gold)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#FFE8D2", color: "var(--warm-brown)" }}
            >
              ✕
            </button>

            <div className="text-center pt-2 pb-3">
              <div
                className="w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center text-3xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #E9784F, #D8A94A)",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 20px rgba(233, 120, 79, 0.35)",
                }}
              >
                🐘
              </div>

              <h3 className="font-display font-bold text-base" style={{ color: "var(--warm-brown)" }}>
                Download Bappa Morya APK
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--muted-brown)" }}>
                Install the official Android application directly on your phone
              </p>
            </div>

            {/* Feature Perks */}
            <div className="space-y-2 mb-4">
              <div
                className="p-2.5 rounded-xl flex items-center gap-2.5"
                style={{ background: "#FFF4E3", border: "1px solid var(--border-cream)" }}
              >
                <span className="text-base">📳</span>
                <div className="text-left">
                  <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
                    Real Haptic Vibrations
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                    Feel the divine pulse when entering 1km of a pandal
                  </p>
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl flex items-center gap-2.5"
                style={{ background: "#FFF4E3", border: "1px solid var(--border-cream)" }}
              >
                <span className="text-base">📍</span>
                <div className="text-left">
                  <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
                    Continuous GPS Radar
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                    Smooth walking directions and proximity discovery
                  </p>
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl flex items-center gap-2.5"
                style={{ background: "#FFF4E3", border: "1px solid var(--border-cream)" }}
              >
                <span className="text-base">⚡</span>
                <div className="text-left">
                  <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
                    Fast & Offline-Ready
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                    Cached audio chimes and smooth animations
                  </p>
                </div>
              </div>
            </div>

            {/* Install instructions reminder */}
            <p className="text-[10px] text-center mb-4" style={{ color: "var(--muted-brown)", opacity: 0.8 }}>
              💡 If prompted, enable &quot;Install unknown apps&quot; in Chrome/browser settings to install.
            </p>

            <button
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <span>⬇️</span> DOWNLOAD APK (13 MB)
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
