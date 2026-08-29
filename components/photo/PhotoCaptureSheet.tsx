"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PhotoCaptureSheetProps {
  onClose: () => void;
  onPhotoTaken: (file: File, previewUrl: string) => void;
  onGallerySelected: (file: File, previewUrl: string) => void;
}

export default function PhotoCaptureSheet({ onClose, onPhotoTaken, onGallerySelected }: PhotoCaptureSheetProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // Check if camera is available
    if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not available on this device");
    }
  }, []);

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onPhotoTaken(file, previewUrl);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onGallerySelected(file, previewUrl);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bottom-sheet-overlay"
        onClick={onClose}
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
          <p className="text-3xl mb-3">📸</p>
          <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-cream)" }}>
            CAPTURE BAPPA
          </h2>
          <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
            Take a photo of the pandal so other explorers know what they&apos;re looking for.
          </p>
        </div>

        {cameraError && (
          <div
            className="mb-4 p-3 rounded-xl text-xs text-center"
            style={{
              background: "rgba(204, 34, 0, 0.1)",
              border: "1px solid rgba(204, 34, 0, 0.3)",
              color: "var(--vermillion)",
            }}
          >
            {cameraError}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="btn-primary w-full"
            id="camera-capture-btn"
          >
            📸 TAKE PHOTO
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraChange}
            className="hidden"
          />

          <button
            onClick={() => galleryInputRef.current?.click()}
            className="btn-secondary w-full"
            id="gallery-select-btn"
          >
            🖼️ CHOOSE FROM GALLERY
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryChange}
            className="hidden"
          />

          <button onClick={onClose} className="w-full py-3 text-sm font-medium" style={{ color: "var(--fog-gray)" }}>
            CANCEL
          </button>
        </div>
      </motion.div>
    </>
  );
}
