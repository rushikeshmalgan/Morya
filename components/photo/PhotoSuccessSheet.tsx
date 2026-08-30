"use client";

import { motion } from "framer-motion";
import MushakAvatar from "@/components/mushak/MushakAvatar";

interface PhotoSuccessSheetProps {
  pandalName: string;
  addedToLens: boolean;
  onContinue: () => void;
  onViewLens: () => void;
}

export default function PhotoSuccessSheet({
  pandalName,
  addedToLens,
  onContinue,
  onViewLens,
}: PhotoSuccessSheetProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bottom-sheet-overlay"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="bottom-sheet"
        style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))" }}
      >
        <div className="bottom-sheet-handle" />

        <div className="text-center mb-5">
          <div className="flex justify-center mb-2">
            <MushakAvatar mood="celebrating" size="lg" />
          </div>
          <p
            className="text-xs font-extrabold tracking-[0.15em] uppercase mb-1"
            style={{ color: "var(--success)" }}
          >
            MOMENT SAVED
          </p>
          <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-brown)" }}>
            Bappa Darshan Captured!
          </h2>
          <p className="text-xs font-semibold" style={{ color: "var(--muted-brown)" }}>
            {pandalName}
          </p>
        </div>

        {addedToLens && (
          <div
            className="mb-5 p-3 rounded-2xl text-center text-xs font-semibold"
            style={{
              background: "#FFE8D2",
              border: "1px solid var(--border-gold)",
              color: "var(--warm-brown)",
            }}
          >
            ✨ Added to Bappa Lens! Fellow explorers will see your darshan photo.
          </div>
        )}

        <div className="space-y-2.5">
          {addedToLens && (
            <button onClick={onViewLens} className="btn-primary w-full text-xs font-bold" id="view-lens-btn">
              📸 VIEW IN BAPPA LENS
            </button>
          )}
          <button onClick={onContinue} className="btn-secondary w-full text-xs font-bold" id="continue-explore-btn">
            CONTINUE EXPLORING →
          </button>
        </div>
      </motion.div>
    </>
  );
}
