"use client";

import { motion } from "framer-motion";

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

        <div className="text-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-5xl mb-3"
          >
            📸
          </motion.div>
          <p
            className="text-xs font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: "#4ADE80" }}
          >
            MOMENT CAPTURED
          </p>
          <p className="text-sm mb-2" style={{ color: "var(--fog-gray)" }}>
            Your photo has been added to your Bappa journey.
          </p>
          <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
            {pandalName}
          </p>
        </div>

        {addedToLens && (
          <div
            className="mb-5 p-3 rounded-xl text-center text-sm"
            style={{
              background: "rgba(255, 107, 0, 0.1)",
              border: "1px solid rgba(255, 107, 0, 0.3)",
              color: "var(--saffron)",
            }}
          >
            ✨ Your photo will appear in Bappa Lens after moderation
          </div>
        )}

        <div className="space-y-3">
          {addedToLens && (
            <button onClick={onViewLens} className="btn-primary w-full" id="view-lens-btn">
              📸 View in Bappa Lens
            </button>
          )}
          <button onClick={onContinue} className="btn-secondary w-full" id="continue-explore-btn">
            Continue Exploring →
          </button>
        </div>
      </motion.div>
    </>
  );
}
