"use client";

import { motion } from "framer-motion";

interface PhotoPromptSheetProps {
  pandalName: string;
  isRare: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onUploadGallery: () => void;
  onSkip: () => void;
}

export default function PhotoPromptSheet({
  pandalName,
  isRare,
  onClose,
  onTakePhoto,
  onUploadGallery,
  onSkip,
}: PhotoPromptSheetProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bottom-sheet-overlay"
        onClick={onSkip}
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-3"
          >
            {isRare ? "⭐" : "🐘"}
          </motion.div>
          <p
            className="text-xs font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--saffron)" }}
          >
            {isRare ? "RARE BAPPA UNLOCKED" : "BAPPA UNLOCKED"}
          </p>
          <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-cream)" }}>
            {pandalName.toUpperCase()}
          </h2>
          <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
            You found Bappa!
          </p>
        </div>

        <div
          className="mb-5 p-4 rounded-xl text-center"
          style={{
            background: "rgba(201, 147, 58, 0.08)",
            border: "1px solid var(--border-gold)",
          }}
        >
          <p className="text-2xl mb-2">📸</p>
          <p className="font-bold text-sm mb-1" style={{ color: "var(--warm-cream)" }}>
            Capture your moment
          </p>
          <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
            Take a photo of this pandal and add it to your Bappa journey.
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={onTakePhoto} className="btn-primary w-full" id="photo-take-btn">
            📸 TAKE PHOTO
          </button>
          <button onClick={onUploadGallery} className="btn-secondary w-full" id="photo-gallery-btn">
            🖼️ UPLOAD FROM GALLERY
          </button>
          <button onClick={onSkip} className="w-full py-3 text-sm font-medium" style={{ color: "var(--fog-gray)" }}>
            SKIP FOR NOW
          </button>
        </div>
      </motion.div>
    </>
  );
}
