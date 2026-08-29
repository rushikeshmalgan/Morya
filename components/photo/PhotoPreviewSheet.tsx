"use client";

import { motion } from "framer-motion";

interface PhotoPreviewSheetProps {
  previewUrl: string;
  addToLens: boolean;
  onToggleLens: (value: boolean) => void;
  onUpload: () => void;
  onRetake: () => void;
  uploading: boolean;
}

export default function PhotoPreviewSheet({
  previewUrl,
  addToLens,
  onToggleLens,
  onUpload,
  onRetake,
  uploading,
}: PhotoPreviewSheetProps) {
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
        style={{ maxHeight: "90dvh", overflowY: "auto" }}
      >
        <div className="bottom-sheet-handle" />

        <div className="text-center mb-4">
          <p className="text-xs font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--muted-gold)" }}>
            📸 MOMENT CAPTURED
          </p>
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--warm-cream)" }}>
            Beautiful Bappa moment?
          </h2>
        </div>

        <div
          className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5"
          style={{ background: "var(--bg-card)" }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mb-5">
          <label className="flex items-center justify-between p-4 rounded-xl cursor-pointer" style={{ background: "var(--bg-card)", border: "1px solid var(--border-cream)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">📸</span>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--warm-cream)" }}>
                  Add to Bappa Lens
                </p>
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  Share with the community
                </p>
              </div>
            </div>
            <div
              className="w-12 h-7 rounded-full relative transition-colors"
              style={{ background: addToLens ? "var(--saffron)" : "var(--bg-surface)" }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: addToLens ? "translateX(22px)" : "translateX(4px)" }}
              />
            </div>
            <input
              type="checkbox"
              checked={addToLens}
              onChange={(e) => onToggleLens(e.target.checked)}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpload}
            disabled={uploading}
            className="btn-primary w-full disabled:opacity-50"
            id="upload-photo-btn"
          >
            {uploading ? "UPLOADING..." : "UPLOAD PHOTO"}
          </button>
          <button onClick={onRetake} className="btn-secondary w-full" id="retake-photo-btn">
            RETAKE
          </button>
        </div>
      </motion.div>
    </>
  );
}
