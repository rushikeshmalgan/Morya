"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "confirm" | "location" | "photo" | "details" | "submitting" | "success" | "duplicate";

interface AddPandalSheetProps {
  userLocation: { lat: number; lng: number } | null;
  sessionToken: string;
  onClose: () => void;
  onSubmitted: () => void;
}

interface DuplicateInfo {
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
      formData.append("skipDuplicateCheck", "true");

      const res = await fetch("/api/pandals", {
        method: "POST",
        headers: { "x-session-token": sessionToken },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate) {
          setDuplicate({
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
              <p className="text-5xl mb-4">🐘</p>
              <h2 className="font-display font-bold text-xl mb-2" style={{ color: "var(--warm-cream)" }}>
                FOUND A NEW BAPPA?
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--fog-gray)" }}>
                Know a Ganpati pandal that&apos;s missing from the map? Help other explorers find it.
              </p>
              <button onClick={() => setStep("location")} className="btn-primary w-full" id="add-pandal-start-btn">
                🐘 ADD PANDAAL
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
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--muted-gold)" }}>
                📍 LOCATION
              </p>
              <div
                className="mb-5 p-4 rounded-xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-cream)" }}
              >
                {!lat ? (
                  <div className="text-center py-6">
                    <p className="text-3xl mb-3">📍</p>
                    <p className="text-sm font-bold mb-2" style={{ color: "var(--warm-cream)" }}>
                      We need your location to add this pandal to the map.
                    </p>
                    <button onClick={handleLocationCapture} className="btn-primary w-full mt-3" id="capture-location-btn">
                      📍 ENABLE LOCATION
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: "var(--saffron)" }}>
                        📍 Location captured
                      </span>
                      <span className="text-xs" style={{ color: "#4ADE80" }}>✓</span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--warm-cream)" }}>
                      {city || "Unknown location"}
                    </p>
                    {accuracy && (
                      <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                        Accuracy: ~{Math.round(accuracy)}m
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: "var(--fog-gray)" }}>
                      {lat.toFixed(6)}, {lng != null ? lng.toFixed(6) : "..."}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("confirm")} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={() => setStep("photo")}
                  disabled={!lat}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Continue
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
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--muted-gold)" }}>
                📸 PHOTO
              </p>
              <div
                className="mb-5 p-4 rounded-xl text-center"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-cream)" }}
              >
                <p className="text-3xl mb-3">📸</p>
                <p className="text-sm font-bold mb-1" style={{ color: "var(--warm-cream)" }}>
                  Show us the Bappa
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--fog-gray)" }}>
                  Take a photo so other explorers know what they&apos;re looking for.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="btn-primary flex-1"
                    id="pandal-camera-btn"
                  >
                    📸 TAKE PHOTO
                  </button>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="btn-secondary flex-1"
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
                <button onClick={() => setStep("location")} className="btn-secondary flex-1">
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
              <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--muted-gold)" }}>
                PANDAAL DETAILS
              </p>

              {previewUrl && (
                <div
                  className="relative w-full aspect-video rounded-xl overflow-hidden mb-4"
                  style={{ background: "var(--bg-card)" }}
                >
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--fog-gray)" }}>
                    Name <span style={{ color: "var(--vermillion)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ganesh Mitra Mandal"
                    className="bappa-input"
                    id="pandal-name-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--fog-gray)" }}>
                    Anything else?
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="bappa-input resize-none"
                    id="pandal-desc-input"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--fog-gray)" }}>
                  <span>📍</span>
                  <span>Location automatically detected: {city || "Unknown"}</span>
                </div>
              </div>

              {error && (
                <div
                  className="mb-4 p-3 rounded-xl text-xs"
                  style={{
                    background: "rgba(204, 34, 0, 0.1)",
                    border: "1px solid rgba(204, 34, 0, 0.3)",
                    color: "var(--vermillion)",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("photo")} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                  id="submit-pandal-btn"
                >
                  {submitting ? "Submitting..." : "Submit Pandal"}
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
                <p className="text-4xl mb-3">🐘</p>
                <h2 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
                  WAIT!
                </h2>
                <p className="text-sm mb-4" style={{ color: "var(--fog-gray)" }}>
                  There&apos;s already a pandal very close to this location.
                </p>
                <div
                  className="p-4 rounded-xl text-left mb-4"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
                >
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--warm-cream)" }}>
                    {duplicate.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                    {duplicate.distance}m away
                  </p>
                </div>
                <p className="text-sm font-bold mb-4" style={{ color: "var(--saffron)" }}>
                  Is this the same pandal?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open(`/pandals/${duplicate.id}`, "_blank")}
                  className="btn-secondary w-full"
                  id="view-existing-pandal-btn"
                >
                  View Existing Pandal
                </button>
                <button onClick={handleForceSubmit} className="btn-primary w-full" id="force-submit-btn">
                  This is a Different Pandal
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
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                ✨
              </motion.div>
              <p
                className="text-xs font-bold tracking-[0.15em] uppercase mb-2"
                style={{ color: "var(--saffron)" }}
              >
                BAPPA DISCOVERED!
              </p>
              <p className="text-sm mb-2" style={{ color: "var(--fog-gray)" }}>
                You just found a pandal that wasn&apos;t on the map.
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--fog-gray)" }}>
                Your submission is now waiting for verification.
              </p>

              <div
                className="mb-5 p-4 rounded-xl"
                style={{
                  background: "rgba(201, 147, 58, 0.08)",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <p className="text-2xl mb-2">🏆</p>
                <p className="text-sm font-bold mb-1" style={{ color: "var(--muted-gold-light)" }}>
                  PANDAL PIONEER
                </p>
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  You&apos;ll get credit when the pandal is approved.
                </p>
              </div>

              <button onClick={handleDone} className="btn-primary w-full" id="pandal-success-done-btn">
                Back to Map
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
