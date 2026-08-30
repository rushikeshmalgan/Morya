"use client";

import { motion } from "framer-motion";
import MushakAvatar from "@/components/mushak/MushakAvatar";

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
  onClose: _onClose,
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

        <div className="text-center mb-4">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-2"
          >
            {isRare ? "⭐" : "📸"}
          </motion.div>
          <p
            className="text-xs font-extrabold tracking-[0.15em] uppercase mb-1"
            style={{ color: "var(--saffron-dark)" }}
          >
            {isRare ? "RARE BAPPA DISCOVERED" : "BAPPA DISCOVERED"}
          </p>
          <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-brown)" }}>
            {pandalName}
          </h2>
          <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
            You unlocked this pandal! Capture your darshan moment.
          </p>
        </div>

        {/* Mushak Photo Tip */}
        <div
          className="mb-5 p-3.5 rounded-2xl flex items-center gap-3"
          style={{
            background: "#FFE8D2",
            border: "1.5px solid var(--border-gold)",
          }}
        >
          <MushakAvatar mood="excited" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs" style={{ color: "var(--warm-brown)" }}>
              &quot;That&apos;s a beautiful Bappa! Capture the darshan? 📸&quot;
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-brown)" }}>
              Share with fellow explorers in Bappa Lens and save it to your Journey album.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <button onClick={onTakePhoto} className="btn-primary w-full text-xs font-bold" id="photo-take-btn">
            📸 TAKE PHOTO
          </button>
          <button onClick={onUploadGallery} className="btn-secondary w-full text-xs font-bold" id="photo-gallery-btn">
            🖼️ CHOOSE FROM GALLERY
          </button>
          <button onClick={onSkip} className="btn-ghost w-full text-xs font-bold">
            SKIP FOR NOW
          </button>
        </div>
      </motion.div>
    </>
  );
}
