"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MushakAvatar from "@/components/mushak/MushakAvatar";

type Step = "confirm" | "location" | "photo" | "details" | "submitting" | "success" | "duplicate";

interface AddPandalSheetProps {
  userLocation: { lat: number; lng: number } | null;
  sessionToken: string;
  onClose: () => void;
  onSubmitted: () => void;
}

interface DuplicateInfo {
  confirmationToken: string;
  id: string;
  name: string;
  distance: number;
}

export default function AddPandalSheet({ userLocation, sessionToken, onClose, onSubmitted }: AddPandalSheetProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [city, setCity] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "location" && userLocation) {
      setLat(userLocation.lat);
      setLng(userLocation.lng);
      reverseGeocode(userLocation.lat, userLocation.lng);
    }
  }, [step, userLocation]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
      const data = await res.json();
      if (data.city) setCity(data.city);
    } catch {
      // ignore
    }
  };

  const handleLocationCapture = () => {
    if (!navigator.geolocation) {
      setError("Location is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setStep("photo");
      },
      (err) => {
        setError(err.message || "Unable to get location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoTaken = (file: File, url: string) => {
    setPhotoFile(file);
    setPreviewUrl(url);
    setStep("details");
  };

  const handleGallerySelected = (file: File, url: string) => {
    setPhotoFile(file);
    setPreviewUrl(url);
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a name for the pandal.");
      return;
    }
    if (!photoFile) {
      setError("Please add a photo of the pandal.");
      return;
    }
    if (!lat || !lng) {
      setError("Location is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("latitude", String(lat));
      formData.append("longitude", String(lng));
      formData.append("city", city || "Unknown");
      formData.append("photo", photoFile);

      const res = await fetch("/api/pandals", {
        method: "POST",
        headers: { "x-session-token": sessionToken },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate) {
          setDuplicate({
            confirmationToken: data.confirmationToken,
            id: data.suggestedPandal.id,
            name: data.suggestedPandal.name,
            distance: Math.round(data.suggestedPandal.distance),
          });
          setStep("duplicate");
          return;
        }
        throw new Error(data.error || "Failed to submit pandal");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceSubmit = async () => {
    setSubmitting(true);
    setError("");
    setDuplicate(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (description.trim()) formData.append("description", description.trim());
      formData.append("latitude", String(lat!));
      formData.append("longitude", String(lng!));
      formData.append("city", city || "Unknown");
      formData.append("photo", photoFile!);
      formData.append("duplicateConfirmationToken", duplicate?.confirmationToken || "");

      const res = await fetch("/api/pandals", {
        method: "POST",
        headers: { "x-session-token": sessionToken },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate) {
          setDuplicate({
            confirmationToken: data.confirmationToken,
            id: data.suggestedPandal.id,
            name: data.suggestedPandal.name,
            distance: Math.round(data.suggestedPandal.distance),
          });
          setStep("duplicate");
          return;
        }
        throw new Error(data.error || "Failed to submit pandal");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    onSubmitted();
    onClose();
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
        style={{ maxHeight: "90dvh", overflowY: "auto" }}
      >
        <div className="bottom-sheet-handle" />

        <AnimatePresence mode="wait">
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center mb-6"
            >
              <div className="flex justify-center mb-3">
                <MushakAvatar mood="excited" size="lg" />
              </div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-brown)" }}>
                Found a New Bappa?
              </h2>

              <div
                className="p-3 rounded-2xl my-3 text-left flex items-start gap-2.5"
                style={{
                  background: "#FFE8D2",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <MushakAvatar mood="pointing" size="xs" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--saffron-dark)" }}>
                    MUSHAK MAHARAJ SAYS:
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--warm-brown)" }}>
                    &quot;Found a pandal that isn&apos;t on the map? Let&apos;s add it so all explorers in Maharashtra can visit!&quot;
                  </p>
                </div>
              </div>

              <button onClick={() => setStep("location")} className="btn-primary w-full text-xs font-bold" id="add-pandal-start-btn">
                🐘 START PANDAL SUBMISSION
              </button>
            </motion.div>
          )}

          {step === "location" && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-xs font-extrabold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--saffron-dark)" }}>
                STEP 1 • 📍 LOCATION
              </p>
              <div
                className="mb-5 p-4 rounded-2xl"
                style={{ background: "#FFE8D2", border: "1px solid var(--border-gold)" }}
              >
                {!lat ? (
                  <div className="text-center py-4">
                    <p className="text-3xl mb-2">📍</p>
                    <p className="text-xs font-bold mb-3" style={{ color: "var(--warm-brown)" }}>
                      Capture the exact coordinates of this pandal.
                    </p>
                    <button onClick={handleLocationCapture} className="btn-primary w-full text-xs font-bold" id="capture-location-btn">
                      📍 CAPTURE CURRENT LOCATION
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold" style={{ color: "var(--saffron-dark)" }}>
                        📍 Location Captured
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--success)" }}>✓ Ready</span>
                    </div>
                    <p className="text-sm font-bold mb-1" style={{ color: "var(--warm-brown)" }}>
                      {city || "Current Area"}
                    </p>
                    {accuracy && (
                      <p className="text-[11px]" style={{ color: "var(--muted-brown)" }}>
                        GPS Accuracy: ~{Math.round(accuracy)}m
                      </p>
                    )}
                    <p className="text-[10px] mt-1" style={{ color: "var(--muted-brown)" }}>
                      {lat.toFixed(6)}, {lng != null ? lng.toFixed(6) : "..."}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("confirm")} className="btn-secondary flex-1 text-xs font-bold">
                  Back
                </button>
                <button
                  onClick={() => setStep("photo")}
                  disabled={!lat}
                  className="btn-primary flex-1 text-xs font-bold disabled:opacity-50"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {step === "photo" && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-xs font-extrabold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--saffron-dark)" }}>
                STEP 2 • 📸 PANDAL PHOTO
              </p>
              <div
                className="mb-5 p-5 rounded-2xl text-center"
                style={{ background: "#FFE8D2", border: "1px solid var(--border-gold)" }}
              >
                <p className="text-3xl mb-2">📸</p>
                <p className="text-sm font-bold mb-1" style={{ color: "var(--warm-brown)" }}>
                  Show us the Bappa setup
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--muted-brown)" }}>
                  Take a photo so other explorers recognize the pandal when nearby.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="btn-primary flex-1 text-xs font-bold"
                    id="pandal-camera-btn"
                  >
                    📸 TAKE PHOTO
                  </button>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="btn-secondary flex-1 text-xs font-bold"
                    id="pandal-gallery-btn"
                  >
                    🖼️ GALLERY
                  </button>
                </div>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoTaken(file, URL.createObjectURL(file));
                  }}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleGallerySelected(file, URL.createObjectURL(file));
                  }}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("location")} className="btn-secondary flex-1 text-xs font-bold">
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-xs font-extrabold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--saffron-dark)" }}>
                STEP 3 • PANDAL DETAILS
              </p>

              {previewUrl && (
                <div
                  className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm"
                  style={{ background: "#FFE8D2" }}
                >
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--warm-brown)" }}>
                    Pandal Name <span style={{ color: "var(--vermillion)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shree Ganesh Mitra Mandal"
                    className="bappa-input text-xs"
                    id="pandal-name-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--warm-brown)" }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Beautiful eco-friendly idol with traditional dhol-tasha..."
                    rows={3}
                    className="bappa-input resize-none text-xs"
                    id="pandal-desc-input"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-brown)" }}>
                  <span>📍</span>
                  <span>Location detected: {city || "City Area"}</span>
                </div>
              </div>

              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(217, 72, 59, 0.1)",
                    border: "1px solid rgba(217, 72, 59, 0.3)",
                    color: "var(--vermillion)",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("photo")} className="btn-secondary flex-1 text-xs font-bold">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 text-xs font-bold disabled:opacity-50"
                  id="submit-pandal-btn"
                >
                  {submitting ? "Submitting..." : "Submit to Map 🌸"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "duplicate" && duplicate && (
            <motion.div
              key="duplicate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-4">
                <p className="text-4xl mb-2">🐘</p>
                <h2 className="font-display font-bold text-lg mb-1" style={{ color: "var(--warm-brown)" }}>
                  Similar Pandal Found Nearby
                </h2>
                <p className="text-xs mb-3" style={{ color: "var(--muted-brown)" }}>
                  There&apos;s already a pandal registered within {duplicate.distance}m.
                </p>
                <div
                  className="p-3.5 rounded-2xl text-left mb-4"
                  style={{ background: "#FFE8D2", border: "1px solid var(--border-gold)" }}
                >
                  <p className="text-sm font-bold" style={{ color: "var(--warm-brown)" }}>
                    {duplicate.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-brown)" }}>
                    {duplicate.distance}m away
                  </p>
                </div>
                <p className="text-xs font-bold mb-3" style={{ color: "var(--saffron-dark)" }}>
                  Is your submission a different pandal?
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => window.open(`/pandals/${duplicate.id}`, "_blank")}
                  className="btn-secondary w-full text-xs font-bold"
                  id="view-existing-pandal-btn"
                >
                  View Existing Pandal
                </button>
                <button onClick={handleForceSubmit} className="btn-primary w-full text-xs font-bold" id="force-submit-btn">
                  Yes, This is a Different Pandal
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-3"
            >
              <div className="flex justify-center mb-2">
                <MushakAvatar mood="celebrating" size="xl" />
              </div>
              <p
                className="text-xs font-extrabold tracking-[0.15em] uppercase mb-1"
                style={{ color: "var(--saffron-dark)" }}
              >
                PANDAL ADDED!
              </p>
              <h3 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-brown)" }}>
                You Found a New Bappa!
              </h3>
              <p className="text-xs max-w-xs mx-auto mb-4 leading-relaxed" style={{ color: "var(--muted-brown)" }}>
                Once approved by moderators, other explorers can discover it too!
              </p>

              <div
                className="mb-5 p-3.5 rounded-2xl"
                style={{
                  background: "#FFE8D2",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <p className="text-xl mb-0.5">🌟</p>
                <p className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
                  + Pandal Pioneer XP
                </p>
                <p className="text-[11px]" style={{ color: "var(--muted-brown)" }}>
                  Bonus XP awarded after moderation review.
                </p>
              </div>

              <button onClick={handleDone} className="btn-primary w-full text-xs font-bold" id="pandal-success-done-btn">
                Back to Bappa Map 🗺️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
