"use client";

import React from "react";
import { motion } from "framer-motion";

interface BappaLoaderProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg" | "fullscreen";
}

export default function BappaLoader({
  message = "Loading Bappa...",
  subMessage = "Seeking blessings across the gallis",
  size = "fullscreen",
}: BappaLoaderProps) {
  if (size === "sm") {
    return (
      <div className="flex flex-col items-center justify-center p-3 gap-2">
        <div
          className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 bg-black"
          style={{ borderColor: "var(--border-gold)" }}
        >
          <video
            src="/videos/loading-magic.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-110"
          />
        </div>
        {message && (
          <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 gap-3 text-center">
        <div className="relative">
          <motion.div
            className="absolute -inset-2 rounded-full blur-md opacity-50"
            style={{ background: "radial-gradient(circle, #E9784F, #D8A94A)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden shadow-xl border-3 bg-black flex items-center justify-center"
            style={{
              borderColor: "var(--border-gold)",
              boxShadow: "0 8px 25px rgba(233, 120, 79, 0.3)",
            }}
          >
            <video
              src="/videos/loading-magic.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-110"
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
            {message}
          </p>
          {subMessage && (
            <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-brown)" }}>
              {subMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Fullscreen / lg mode
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center"
      style={{
        background: "radial-gradient(circle at center, #FFF9F1 0%, #FFE8D2 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="flex flex-col items-center max-w-xs w-full"
      >
        {/* Glowing Magical Video Orb */}
        <div className="relative mb-5">
          <motion.div
            className="absolute -inset-4 rounded-full blur-lg opacity-60"
            style={{ background: "radial-gradient(circle, #E9784F, #D8A94A)" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl border-4 bg-black flex items-center justify-center"
            style={{
              borderColor: "var(--border-gold)",
              boxShadow: "0 12px 35px rgba(233, 120, 79, 0.4)",
            }}
          >
            <video
              src="/videos/loading-magic.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-110"
            />
          </div>
        </div>

        {/* Text & Indicator */}
        <h2 className="font-display font-bold text-base" style={{ color: "var(--warm-brown)" }}>
          {message}
        </h2>
        {subMessage && (
          <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted-brown)" }}>
            {subMessage}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-4">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ background: "var(--saffron)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--saffron)" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--muted-gold)" }} />
        </div>
      </motion.div>
    </div>
  );
}
