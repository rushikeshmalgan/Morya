"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/shared/BottomNav";
import PandalBottomSheet from "@/components/map/PandalBottomSheet";
import QuestCard from "@/components/quest/QuestCard";
import DiscoveryAnimation from "@/components/discovery/DiscoveryAnimation";
import PhotoPromptSheet from "@/components/photo/PhotoPromptSheet";
import PhotoCaptureSheet from "@/components/photo/PhotoCaptureSheet";
import PhotoPreviewSheet from "@/components/photo/PhotoPreviewSheet";
import PhotoSuccessSheet from "@/components/photo/PhotoSuccessSheet";
import AddPandalSheet from "@/components/pandals/AddPandalSheet";
import { getStoredUser, isDemoMode, BappaUser } from "@/lib/store";
import { formatDistance } from "@/lib/geo";

// Dynamic import of map (no SSR — Leaflet requires browser)
const BappaMap = dynamic(() => import("@/components/map/BappaMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "#FFF4E3" }}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-5xl mb-3"
        >
          🐘
        </motion.div>
        <p className="text-sm font-semibold" style={{ color: "var(--muted-brown)" }}>
          Loading Bappa Map...
        </p>
      </div>
    </div>
  ),
});

export interface NearbyPandal {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string;
  aartiTimes: string | null;
  isRare: boolean;
  isNew: boolean;
  visitCount: number;
  photoCount: number;
  distance: number;
  state: "detected" | "revealed" | "in_range" | "discovered";
}

type FlowStep =
  | { phase: "map" }
  | { phase: "discovery" }
  | { phase: "photoPrompt" }
  | { phase: "photoCapture" }
  | { phase: "photoPreview"; previewUrl: string; addToLens: boolean }
  | { phase: "photoSuccess"; addedToLens: boolean }
  | { phase: "addPandal" };

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState<BappaUser | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPandals, setNearbyPandals] = useState<NearbyPandal[]>([]);
  const [selectedPandal, setSelectedPandal] = useState<NearbyPandal | null>(null);
  const [activeQuest, setActiveQuest] = useState<{
    title: string; requirement: number; progress: number; completed: boolean;
  } | null>(null);
  const [showQuest, setShowQuest] = useState(true);
  const [discoveryResult, setDiscoveryResult] = useState<{
    pandalName: string; scoreEarned: number; isRare: boolean; newAchievements: string[];
    visitId?: string;
  } | null>(null);
  const [checkinRadius, setCheckinRadius] = useState(150);
  const [isDemo, setIsDemo] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [flow, setFlow] = useState<FlowStep>({ phase: "map" });
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [_pendingPhotoPreview, setPendingPhotoPreview] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [_photoError, setPhotoError] = useState("");

  const watchIdRef = useRef<number | null>(null);
  const fetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo location — Kasba Ganpati area, Pune
  const DEMO_LOCATION = { lat: 18.5196, lng: 73.8553 };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation && !isDemo) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(newLoc);
          setLocationDenied(false);
          setRecenterKey((k) => k + 1);
          fetchNearby(newLoc.lat, newLoc.lng);
          setIsLocating(false);
        },
        () => {
          // Fallback to current location and recenter
          setRecenterKey((k) => k + 1);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setRecenterKey((k) => k + 1);
      setTimeout(() => setIsLocating(false), 300);
    }
  };

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setUser(stored);
    setIsDemo(isDemoMode());

    if (isDemoMode()) {
      setUserLocation(DEMO_LOCATION);
    } else {
      startLocationWatch();
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLocationWatch = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setUserLocation(DEMO_LOCATION);
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationDenied(false);
      },
      () => {
        setLocationDenied(true);
        setUserLocation(DEMO_LOCATION);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
    );
  };

  // Fetch nearby pandals when location changes
  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    try {
      const token = getStoredUser()?.sessionToken;
      const headers: Record<string, string> = {};
      if (token) headers["x-session-token"] = token;

      const res = await fetch(`/api/pandals/nearby?lat=${lat}&lng=${lng}&radius=5000`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setNearbyPandals(data.pandals || []);
      setCheckinRadius(data.checkinRadius || 150);
    } catch {
      // Network error — keep existing pandals
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    fetchNearby(userLocation.lat, userLocation.lng);
    fetchIntervalRef.current = setInterval(
      () => fetchNearby(userLocation.lat, userLocation.lng),
      30000
    );
    return () => { if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current); };
  }, [userLocation, fetchNearby]);

  // Fetch active quests
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const token = getStoredUser()?.sessionToken;
        const headers: Record<string, string> = {};
        if (token) headers["x-session-token"] = token;
        const res = await fetch("/api/quests/active", { headers });
        const data = await res.json();
        if (data.quests?.length > 0) {
          const q = data.quests[0];
          setActiveQuest({
            title: q.title,
            requirement: q.requirement,
            progress: q.progress || 0,
            completed: q.completed || false,
          });
        }
      } catch {
        // Non-critical
      }
    };
    fetchQuests();
  }, []);

  const handlePandalTap = (pandal: NearbyPandal) => {
    setSelectedPandal(pandal);
  };

  const handleCheckin = async (pandalId: string) => {
    const stored = getStoredUser();
    if (!stored) return;

    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": stored.sessionToken,
        },
        body: JSON.stringify({
          pandalId,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
          isDemoMode: isDemo,
        }),
      });

      const data = await res.json();

      if (data.alreadyDiscovered) {
        alert(`🐘 You've already discovered this Bappa!\n\nFirst discovered: ${new Date(data.firstVisit).toLocaleDateString()}`);
        return;
      }

      if (data.error === "not_close_enough") {
        alert(`📍 ${data.message}`);
        return;
      }

      if (data.success) {
        setDiscoveryResult({
          pandalName: data.pandal.name,
          scoreEarned: data.scoreEarned,
          isRare: data.pandal.isRare,
          newAchievements: data.newAchievements || [],
          visitId: data.visit.id,
        });
        setSelectedPandal(null);
        setFlow({ phase: "discovery" });

        // Update local user score
        const newUser = { ...stored, uniquePandals: data.uniquePandals, score: data.newScore };
        setUser(newUser);
        localStorage.setItem("bappa_user", JSON.stringify(newUser));

        // Update quest
        if (activeQuest) {
          setActiveQuest((prev) =>
            prev ? { ...prev, progress: Math.min(prev.progress + 1, prev.requirement) } : prev
          );
        }

        // Refresh nearby
        if (userLocation) fetchNearby(userLocation.lat, userLocation.lng);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDiscoveryDismiss = () => {
    setDiscoveryResult(null);
    if (discoveryResult?.visitId) {
      setFlow({ phase: "photoPrompt" });
    } else {
      setFlow({ phase: "map" });
    }
  };

  const handlePhotoPromptTake = () => {
    setFlow({ phase: "photoCapture" });
  };

  const handlePhotoPromptUpload = () => {
    setFlow({ phase: "photoCapture" });
  };

  const handlePhotoTaken = (file: File, previewUrl: string) => {
    setPendingPhotoFile(file);
    setPendingPhotoPreview(previewUrl);
    setFlow({ phase: "photoPreview", previewUrl, addToLens: true });
  };

  const handlePhotoSkip = () => {
    setPendingPhotoFile(null);
    setPendingPhotoPreview("");
    setPhotoError("");
    setFlow({ phase: "map" });
  };

  const handlePhotoUpload = async () => {
    if (!pendingPhotoFile || !discoveryResult?.visitId) return;

    setPhotoUploading(true);
    setPhotoError("");

    try {
      const token = getStoredUser()?.sessionToken;
      if (!token) throw new Error("No session");

      const formData = new FormData();
      formData.append("photo", pendingPhotoFile);
      formData.append("visitId", discoveryResult.visitId);
      formData.append("category", "BEST_BAPPA");

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        headers: { "x-session-token": token },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFlow({ phase: "photoSuccess", addedToLens: true });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoRetake = () => {
    setPendingPhotoFile(null);
    setPendingPhotoPreview("");
    setPhotoError("");
    setFlow({ phase: "photoCapture" });
  };

  const handlePhotoSuccessContinue = () => {
    setPendingPhotoFile(null);
    setPendingPhotoPreview("");
    setPhotoError("");
    setDiscoveryResult(null);
    setFlow({ phase: "map" });
  };

  const handlePhotoSuccessViewLens = () => {
    router.push("/lens");
  };

  const handleAddPandal = () => {
    setFlow({ phase: "addPandal" });
  };

  const handleAddPandalSubmitted = () => {
    setFlow({ phase: "map" });
    if (userLocation) fetchNearby(userLocation.lat, userLocation.lng);
  };

  // Closest undiscovered in-range pandal
  const closestInRange = nearbyPandals.find((p) => p.state === "in_range");

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#FFF4E3" }}>
      {/* ── THE MAP ── */}
      {userLocation && flow.phase === "map" && (
        <BappaMap
          userLocation={userLocation}
          pandals={nearbyPandals}
          onPandalTap={handlePandalTap}
          checkinRadius={checkinRadius}
          isDemoMode={isDemo}
          recenterKey={recenterKey}
        />
      )}

      {/* ── TOP FLOATING PLAYER CARD ── */}
      {flow.phase === "map" && (
        <div className="fixed top-0 left-0 right-0 z-20 p-4 safe-top pointer-events-none">
          <div className="flex items-center justify-between max-w-md mx-auto pointer-events-auto">
            {/* Identity Card */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card px-3.5 py-2 flex items-center gap-2.5"
                style={{ background: "rgba(255, 249, 241, 0.94)", border: "1px solid rgba(216,169,74,0.3)" }}
              >
                <span className="text-xl">🐘</span>
                <div>
                  <p className="text-xs font-bold leading-none" style={{ color: "var(--warm-brown)" }}>
                    {user.generatedName}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-brown)" }}>
                    #{user.generatedNumber}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Score & Collection stats */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card px-3.5 py-2 flex items-center gap-3"
                style={{ background: "rgba(255, 249, 241, 0.94)", border: "1px solid rgba(216,169,74,0.3)" }}
              >
                <div className="text-center">
                  <p className="text-xs font-extrabold" style={{ color: "var(--saffron-dark)" }}>
                    {user.uniquePandals} 🐘
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-brown)" }}>
                    Pandals
                  </p>
                </div>
                <div className="w-[1px] h-5" style={{ background: "rgba(120,80,50,0.15)" }} />
                <div className="text-center">
                  <p className="text-xs font-extrabold" style={{ color: "var(--muted-gold-dark)" }}>
                    ⭐ {user.score}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-brown)" }}>
                    XP
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── GOOGLE MAPS STYLE LOCATE ME BUTTON ── */}
      {flow.phase === "map" && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleLocateMe}
          disabled={isLocating}
          className="fixed bottom-36 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all"
          style={{
            background: "#FFF9F1",
            border: "1.5px solid rgba(216, 169, 74, 0.4)",
            boxShadow: "0 6px 20px rgba(74, 48, 40, 0.15)",
          }}
          id="locate-me-btn"
          title="Recenter on my location"
        >
          {isLocating ? (
            <span className="inline-block animate-spin text-lg">⏳</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E9784F"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="7" />
              <polyline points="12 2 12 5" />
              <polyline points="12 19 12 22" />
              <polyline points="2 12 5 12" />
              <polyline points="19 12 22 12" />
              <circle cx="12" cy="12" r="2.5" fill="#E9784F" />
            </svg>
          )}
        </motion.button>
      )}

      {/* ── ADD PANDAL FLOATING ACTION BUTTON ── */}
      {flow.phase === "map" && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddPandal}
          className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl"
          style={{
            background: "linear-gradient(135deg, #E9784F, #E0673B)",
            border: "2.5px solid #FFFFFF",
            boxShadow: "0 8px 25px rgba(233, 120, 79, 0.45)",
          }}
          id="add-pandal-fab"
          title="Add a Pandal"
        >
          🐘
        </motion.button>
      )}

      {/* ── DEMO BANNER ── */}
      {isDemo && flow.phase === "map" && (
        <div className="fixed top-16 left-0 right-0 z-20 flex justify-center pointer-events-none safe-top">
          <div className="demo-banner">🎮 DEMO MODE — GPS verification disabled</div>
        </div>
      )}

      {/* ── LOCATION DENIED BANNER ── */}
      {locationDenied && !isDemo && flow.phase === "map" && (
        <div
          className="fixed top-16 left-0 right-0 z-20 mx-4 p-3 text-xs text-center rounded-xl shadow-md"
          style={{
            background: "#FFE8D2",
            border: "1px solid var(--border-gold)",
            color: "var(--warm-brown)",
          }}
        >
          📍 Location access unavailable — Showing Pune pandals. Enable GPS to explore nearby.
        </div>
      )}

      {/* ── IN-RANGE ALERT ── */}
      {flow.phase === "map" && (
        <AnimatePresence>
          {closestInRange && !selectedPandal && !discoveryResult && (
            <motion.div
              key="in-range"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed left-4 right-4 z-20"
              style={{ bottom: "88px" }}
            >
              <button
                id="bappa-detected-btn"
                onClick={() => handlePandalTap(closestInRange)}
                className="w-full p-4 rounded-2xl text-left shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
                  border: "2px solid var(--saffron)",
                  boxShadow: "var(--shadow-warm)",
                }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🐘
                  </motion.div>
                  <div>
                    <p className="font-extrabold text-xs tracking-wider uppercase" style={{ color: "var(--saffron-dark)" }}>
                      BAPPA WITHIN REACH!
                    </p>
                    <p className="text-sm font-bold" style={{ color: "var(--warm-brown)" }}>
                      {closestInRange.name === "???" ? "Unknown Pandal" : closestInRange.name} •{" "}
                      {formatDistance(closestInRange.distance)}
                    </p>
                  </div>
                  <div className="ml-auto text-xl font-bold" style={{ color: "var(--saffron-dark)" }}>
                    →
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── COMPACT QUEST CARD ── */}
      {flow.phase === "map" && (
        <AnimatePresence>
          {showQuest && activeQuest && !selectedPandal && !discoveryResult && !closestInRange && (
            <motion.div
              key="quest"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed left-4 right-4 z-20"
              style={{ bottom: "88px" }}
            >
              <QuestCard quest={activeQuest} onDismiss={() => setShowQuest(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── PANDAL BOTTOM SHEET ── */}
      {flow.phase === "map" && (
        <AnimatePresence>
          {selectedPandal && (
            <PandalBottomSheet
              pandal={selectedPandal}
              userLocation={userLocation}
              checkinRadius={checkinRadius}
              isDemoMode={isDemo}
              onClose={() => setSelectedPandal(null)}
              onCheckin={handleCheckin}
            />
          )}
        </AnimatePresence>
      )}

      {/* ── DISCOVERY CELEBRATION MOMENT ── */}
      {flow.phase === "discovery" && discoveryResult && (
        <DiscoveryAnimation
          pandalName={discoveryResult.pandalName}
          scoreEarned={discoveryResult.scoreEarned}
          isRare={discoveryResult.isRare}
          newAchievements={discoveryResult.newAchievements}
          onDismiss={handleDiscoveryDismiss}
        />
      )}

      {/* ── PHOTO PROMPT ── */}
      {flow.phase === "photoPrompt" && discoveryResult && (
        <PhotoPromptSheet
          pandalName={discoveryResult.pandalName}
          isRare={discoveryResult.isRare}
          onClose={handlePhotoSkip}
          onTakePhoto={handlePhotoPromptTake}
          onUploadGallery={handlePhotoPromptUpload}
          onSkip={handlePhotoSkip}
        />
      )}

      {/* ── PHOTO CAPTURE ── */}
      {flow.phase === "photoCapture" && (
        <PhotoCaptureSheet
          onClose={handlePhotoSkip}
          onPhotoTaken={handlePhotoTaken}
          onGallerySelected={handlePhotoTaken}
        />
      )}

      {/* ── PHOTO PREVIEW ── */}
      {flow.phase === "photoPreview" && (
        <PhotoPreviewSheet
          previewUrl={flow.previewUrl}
          addToLens={flow.addToLens}
          onToggleLens={(addToLens) => setFlow((f) => f.phase === "photoPreview" ? { ...f, addToLens } : f)}
          onUpload={handlePhotoUpload}
          onRetake={handlePhotoRetake}
          uploading={photoUploading}
        />
      )}

      {/* ── PHOTO SUCCESS ── */}
      {flow.phase === "photoSuccess" && (
        <PhotoSuccessSheet
          pandalName={discoveryResult?.pandalName || ""}
          addedToLens={flow.addedToLens}
          onContinue={handlePhotoSuccessContinue}
          onViewLens={handlePhotoSuccessViewLens}
        />
      )}

      {/* ── ADD PANDAAL ── */}
      {flow.phase === "addPandal" && user && (
        <AddPandalSheet
          userLocation={userLocation}
          sessionToken={user.sessionToken}
          onClose={() => setFlow({ phase: "map" })}
          onSubmitted={handleAddPandalSubmitted}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      {flow.phase === "map" && <BottomNav active="map" />}
    </div>
  );
}
