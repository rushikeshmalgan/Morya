"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MushakAvatar from "./MushakAvatar";
import { NearbyPandal } from "@/app/map/page";

interface MushakRadarProps {
  pandals: NearbyPandal[];
  onFocusPandal?: (pandal: NearbyPandal) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function MushakRadar({ pandals, onFocusPandal, className, style }: MushakRadarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Group visible pandals according to discovery states
  const inRangePandals = pandals.filter((p) => p.state === "in_range");
  const revealedPandals = pandals.filter((p) => p.state === "revealed");
  const detectedPandals = pandals.filter((p) => p.state === "detected");
  const totalVisible = inRangePandals.length + revealedPandals.length + detectedPandals.length;

  const handleStartScan = () => {
    setIsOpen(true);
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1600);
  };

  return (
    <>
      {/* Floating Radar Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.38, type: "spring" }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleStartScan}
        className={className || "px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-lg transition-all"}
        style={{
          background: "#FFF9F1",
          border: "1.5px solid rgba(216, 169, 74, 0.4)",
          boxShadow: "0 4px 14px rgba(74, 48, 40, 0.12)",
          ...style,
        }}
        id="mushak-radar-btn"
        title="Mushak Maharaj Bappa Radar"
      >
        <MushakAvatar mood="searching" size="xs" />
        <span className="text-[10px] font-bold" style={{ color: "var(--warm-brown)" }}>
          Maharaj Radar
        </span>
        {totalVisible > 0 && (
          <span
            className="w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white"
            style={{ background: "var(--saffron-dark)" }}
          >
            {totalVisible}
          </span>
        )}
      </motion.button>

      {/* Radar Overlay Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-20 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="w-full max-w-sm rounded-3xl p-5 shadow-2xl relative mx-4"
              style={{
                background: "linear-gradient(145deg, #FFF9F1, #FFE8D2)",
                border: "2px solid var(--border-gold)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#FFE8D2", color: "var(--warm-brown)" }}
              >
                ✕
              </button>

              <div className="text-center pt-2 pb-4">
                <div className="relative inline-block mb-3">
                  {isScanning && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: "2px solid #E9784F" }}
                      animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <MushakAvatar mood={isScanning ? "searching" : "excited"} size="lg" />
                </div>

                <h3 className="font-display font-bold text-base" style={{ color: "var(--warm-brown)" }}>
                  {isScanning ? "Sniffing for Modaks... 👃" : "Mushak Maharaj Bappa Radar"}
                </h3>

                <p className="text-xs mt-1" style={{ color: "var(--muted-brown)" }}>
                  {isScanning
                    ? "Scanning nearby streets and gallis for Bappas..."
                    : totalVisible > 0
                    ? `Found ${totalVisible} pandals around your area!`
                    : "No pandals detected right here. Walk a bit or add one!"}
                </p>
              </div>

              {/* Scan Results */}
              {scanComplete && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {inRangePandals.length > 0 && (
                    <div
                      className="p-2.5 rounded-xl flex items-center justify-between"
                      style={{ background: "#FFE8D2", border: "1px solid var(--saffron)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: "var(--saffron-dark)" }}>
                            {inRangePandals.length} Bappa within reach!
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                            Ready to discover right now
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {revealedPandals.length > 0 && (
                    <div
                      className="p-2.5 rounded-xl flex items-center justify-between"
                      style={{ background: "#FFF4E3", border: "1px solid var(--border-gold)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🐘</span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
                            {revealedPandals.length} Pandal{revealedPandals.length > 1 ? "s" : ""} nearby
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                            150m – 500m walking distance
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {detectedPandals.length > 0 && (
                    <div
                      className="p-2.5 rounded-xl flex items-center justify-between"
                      style={{ background: "rgba(255, 249, 241, 0.8)", border: "1px solid var(--border-cream)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪷</span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: "var(--muted-brown)" }}>
                            {detectedPandals.length} Mystery Bappa{detectedPandals.length > 1 ? "s" : ""} in the area
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--muted-brown)" }}>
                            Within 2 km zone
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 btn-primary w-full py-2.5 text-xs font-bold"
              >
                {scanComplete ? "LET'S GO EXPLORE 🐘" : "CLOSE"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
