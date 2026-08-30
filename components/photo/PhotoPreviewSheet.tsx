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
        style={{ maxHeight: "92dvh", overflowY: "auto" }}
      >
        <div className="bottom-sheet-handle" />

        <div className="text-center mb-3">
          <p className="text-xs font-extrabold tracking-[0.15em] uppercase mb-1" style={{ color: "var(--saffron-dark)" }}>
            📸 MOMENT CAPTURED
          </p>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--warm-brown)" }}>
            Review Your Photo
          </h2>
        </div>

        <div
          className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-md"
          style={{ background: "#FFE8D2", border: "1px solid var(--border-gold)" }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mb-5">
          <label
            className="flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-colors"
            style={{ background: "#FFE8D2", border: "1px solid rgba(216, 169, 74, 0.3)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
                  Post to Bappa Lens
                </p>
                <p className="text-[11px]" style={{ color: "var(--muted-brown)" }}>
                  Share with the community
                </p>
              </div>
            </div>
            <div
              className="w-12 h-7 rounded-full relative transition-colors"
              style={{ background: addToLens ? "var(--saffron)" : "rgba(128,102,92,0.2)" }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{ transform: addToLens ? "translateX(22px)" : "translateX(3px)" }}
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

        <div className="space-y-2.5">
          <button
            onClick={onUpload}
            disabled={uploading}
            className="btn-primary w-full text-xs font-bold disabled:opacity-50"
            id="upload-photo-btn"
          >
            {uploading ? "SAVING MOMENT..." : "SAVE & UPLOAD PHOTO 🌸"}
          </button>
          <button onClick={onRetake} className="btn-secondary w-full text-xs font-bold" id="retake-photo-btn">
            RETAKE PHOTO
          </button>
        </div>
      </motion.div>
    </>
  );
}
