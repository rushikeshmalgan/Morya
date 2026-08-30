"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DownloadPage() {
  const [downloaded, setDownloaded] = useState(false);

  const startDownload = () => {
    setDownloaded(true);
    const link = document.createElement("a");
    link.href = "/downloads/bappa-morya.apk";
    link.download = "Bappa-Morya.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Optional: Auto start download when arriving on this page
  useEffect(() => {
    const timer = setTimeout(() => {
      startDownload();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-6 mandala-bg text-center"
      style={{
        background: "radial-gradient(circle at center, #FFF9F1 0%, #FFE8D2 100%)",
      }}
    >
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <Link
          href="/map"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          style={{
            background: "#FFF9F1",
            border: "1px solid var(--border-gold)",
            color: "var(--warm-brown)",
          }}
        >
          ← Back to Map
        </Link>
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-extrabold text-white"
          style={{ background: "var(--saffron-dark)" }}
        >
          Android App v1.0
        </span>
      </div>

      {/* Center Download Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-full max-w-sm bappa-card p-6 my-auto shadow-2xl relative overflow-hidden"
        style={{
          background: "rgba(255, 249, 241, 0.98)",
          border: "2px solid var(--border-gold)",
        }}
      >
        {/* Animated Glow */}
        <motion.div
          className="absolute -inset-10 rounded-full blur-xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #E9784F, #D8A94A)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl"
            style={{
              background: "linear-gradient(135deg, #E9784F, #D8A94A)",
              color: "#FFFFFF",
              boxShadow: "0 10px 25px rgba(233, 120, 79, 0.35)",
            }}
          >
            🐘
          </motion.div>

          <h1 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-brown)" }}>
            Bappa Morya
          </h1>
          <p className="text-xs font-semibold mb-4" style={{ color: "var(--saffron-dark)" }}>
            Official Android Application (APK)
          </p>

          <div className="space-y-2 text-left mb-6">
            <div
              className="p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold"
              style={{ background: "#FFF4E3", border: "1px solid var(--border-cream)" }}
            >
              <span>📳</span>
              <div>
                <p className="font-bold text-xs" style={{ color: "var(--warm-brown)" }}>
                  Real Haptic Vibrations
                </p>
                <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                  Feel nearby pandals within 1km radius
                </p>
              </div>
            </div>

            <div
              className="p-2.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold"
              style={{ background: "#FFF4E3", border: "1px solid var(--border-cream)" }}
            >
              <span>📍</span>
              <div>
                <p className="font-bold text-xs" style={{ color: "var(--warm-brown)" }}>
                  High-Precision Radar
                </p>
                <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                  Real-time walking paths and check-ins
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startDownload}
            className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-xl"
          >
            <span>⬇️</span> DOWNLOAD APK (13 MB)
          </button>

          {downloaded && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-bold mt-3 text-emerald-600 flex items-center justify-center gap-1"
            >
              <span>✅</span> Download started! Check your downloads.
            </motion.p>
          )}

          <p className="text-[10px] mt-4" style={{ color: "var(--muted-brown)", opacity: 0.8 }}>
            💡 If prompted, allow &quot;Install unknown apps&quot; in your browser settings to complete installation.
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="text-[11px] font-medium" style={{ color: "var(--muted-brown)" }}>
        Ganpati Bappa Morya! 🙏 Mangal Murti Morya!
      </p>
    </div>
  );
}
