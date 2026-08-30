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
import FamousPandalsSheet, { FamousPandal } from "@/components/map/FamousPandalsSheet";
import { getStoredUser, isDemoMode, BappaUser, getStreakData, recordVisit, getWeeklyVisitCount } from "@/lib/store";
import { formatDistance } from "@/lib/geo";
import { WalkingRoute, getWalkingRoute, formatDuration } from "@/lib/routing";
import MushakBubble from "@/components/mushak/MushakBubble";
import MushakRadar from "@/components/mushak/MushakRadar";
import { getMushakDialogue, shouldShowMushakTip, MushakDialogue } from "@/lib/mushak";
import ProximityAlertBanner, { ProximityAlert } from "@/components/map/ProximityAlertBanner";
import { triggerHaptic, playFestiveChime, sendPandalNotification, requestNotificationPermission } from "@/lib/haptics";

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
  const [showFamousSheet, setShowFamousSheet] = useState(false);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number; timestamp: number } | null>(null);
  const [activeRoute, setActiveRoute] = useState<WalkingRoute | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeToast, setRouteToast] = useState<string | null>(null);
  const [mushakTip, setMushakTip] = useState<MushakDialogue | null>(null);
  const [flow, setFlow] = useState<FlowStep>({ phase: "map" });
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [_pendingPhotoPreview, setPendingPhotoPreview] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [_photoError, setPhotoError] = useState("");
  const [streak, setStreak] = useState(getStreakData());
  const [weeklyVisits, setWeeklyVisits] = useState(getWeeklyVisitCount());
  const [proximityAlert, setProximityAlert] = useState<ProximityAlert | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const fetchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertedPandalsRef = useRef<Map<string, { state: string; timestamp: number }>>(new Map());

  // Demo location — Kasba Ganpati area, Pune
  const DEMO_LOCATION = { lat: 18.5196, lng: 73.8553 };

  const handleLocateMe = () => {
    setIsLocating(true);
    requestNotificationPermission().catch(() => {});
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

  const handleNavigateToPandal = async (pandal: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }) => {
    const origin = userLocation || DEMO_LOCATION;
    setIsRouting(true);
    try {
      const displayName = pandal.name === "???" ? "Bappa Pandal" : pandal.name;
      const route = await getWalkingRoute(
        origin.lat,
        origin.lng,
        pandal.latitude,
        pandal.longitude,
        displayName,
        pandal.id
      );
      setActiveRoute(route);
      setSelectedPandal(null); // Close sheet to view the walking path immediately
      setShowFamousSheet(false);
      setMushakTip(getMushakDialogue("navigation_start"));
    } catch (err) {
      console.warn("Routing calculation error:", err);
      setRouteToast("Couldn't calculate walking route. Please try again.");
      setTimeout(() => setRouteToast(null), 3500);
    } finally {
      setIsRouting(false);
    }
  };

  const handleSelectFamousPandal = (pandal: FamousPandal) => {
    setShowFamousSheet(false);
    // Smoothly fly map to famous pandal coordinates
    setFlyToTarget({ lat: pandal.latitude, lng: pandal.longitude, zoom: 16, timestamp: Date.now() });
    fetchNearby(pandal.latitude, pandal.longitude);

    // Open pandal details bottom sheet
    handlePandalTap({
      id: pandal.id,
      name: pandal.name,
      description: pandal.description,
      latitude: pandal.latitude,
      longitude: pandal.longitude,
      address: pandal.address,
      city: pandal.city,
      aartiTimes: pandal.aartiTimes ? JSON.stringify(pandal.aartiTimes) : null,
      isRare: pandal.isRare,
      isNew: false,
      visitCount: pandal.visitCount || 0,
      photoCount: pandal.imageUrl ? 1 : 0,
      distance: 0,
      state: "revealed",
    });
  };

  const handleFamousPandalNavigate = (pandal: FamousPandal) => {
    handleNavigateToPandal({
      id: pandal.id,
      name: pandal.name,
      latitude: pandal.latitude,
      longitude: pandal.longitude,
    });
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
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
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 }
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
      15000
    );
    return () => { if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current); };
  }, [userLocation, fetchNearby]);

  // ── 1 KM PROXIMITY DETECTION & HAPTIC NOTIFICATION ENGINE ──
  useEffect(() => {
    if (!nearbyPandals.length || !userLocation) return;

    const now = Date.now();
    const undiscovered = nearbyPandals.filter((p) => p.state !== "discovered");

    // 1. Check for in-range pandals (<= 150m check-in radius)
    const inRangePandal = undiscovered.find((p) => p.state === "in_range");
    if (inRangePandal) {
      const prevAlert = alertedPandalsRef.current.get(inRangePandal.id);
      if (!prevAlert || prevAlert.state !== "in_range" || now - prevAlert.timestamp > 120_000) {
        alertedPandalsRef.current.set(inRangePandal.id, { state: "in_range", timestamp: now });
        triggerHaptic("in_range");
        playFestiveChime("in_range");
        const name = inRangePandal.name === "???" ? "A Bappa Pandal" : inRangePandal.name;
        sendPandalNotification(
          "🛕 Bappa in Check-in Range!",
          `${name} is only ${inRangePandal.distance}m away! Tap to claim your discovery.`
        );
        setProximityAlert({
          id: inRangePandal.id,
          pandal: inRangePandal,
          type: "in_range",
          timestamp: now,
        });
        return;
      }
    }

    // 2. Check for pandals detected within 1 km (<= 1000m)
    const detectedIn1Km = undiscovered
      .filter((p) => p.distance <= 1000 && (p.state === "revealed" || p.state === "detected"))
      .sort((a, b) => a.distance - b.distance);

    if (detectedIn1Km.length > 0) {
      const closest = detectedIn1Km[0];
      const prevAlert = alertedPandalsRef.current.get(closest.id);
      if (!prevAlert || now - prevAlert.timestamp > 240_000) {
        alertedPandalsRef.current.set(closest.id, { state: closest.state, timestamp: now });
        triggerHaptic("detected");
        playFestiveChime("detected");
        const name = closest.name === "???" ? "Mystic Bappa signal" : closest.name;
        sendPandalNotification(
          "🔔 Pandal Detected in 1 km!",
          `${name} detected ~${closest.distance}m away.`
        );
        setProximityAlert({
          id: closest.id,
          pandal: closest,
          type: closest.state === "revealed" ? "revealed" : "detected",
          timestamp: now,
        });
      }
    }
  }, [nearbyPandals, userLocation]);

  // Auto-dismiss proximity alert banner after 8 seconds
  useEffect(() => {
    if (!proximityAlert) return;
    const timer = setTimeout(() => {
      setProximityAlert(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [proximityAlert]);

  // Contextual Mushak proximity hints with frequency control
  useEffect(() => {
    if (!nearbyPandals.length || activeRoute) return;

    const hasInRange = nearbyPandals.some((p) => p.state === "in_range");
    const hasRevealed = nearbyPandals.some((p) => p.state === "revealed");

    if (hasInRange && shouldShowMushakTip("nearby_in_range", 60000)) {
      setMushakTip(getMushakDialogue("nearby_in_range"));
    } else if (hasRevealed && shouldShowMushakTip("nearby_approaching", 60000)) {
      setMushakTip(getMushakDialogue("nearby_approaching"));
    }
  }, [nearbyPandals, activeRoute]);

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
        triggerHaptic("discovery");
        playFestiveChime("discovery");

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

        // Record streak
        const newStreak = recordVisit();
        setStreak(newStreak);
        setWeeklyVisits(getWeeklyVisitCount());

        // Update quest
        if (activeQuest) {
          setActiveQuest((prev) =>
            prev ? { ...prev, progress: Math.min(prev.progress + 1, prev.requirement) } : prev
          );
        }

        // Refresh nearby
        if (userLocation) fetchNearby(userLocation.lat, userLocation.lng);

        // Clear active route if this pandal was the navigation target
        setActiveRoute((curr) => (curr?.destinationId === pandalId ? null : curr));
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
          flyToTarget={flyToTarget}
          activeRoute={activeRoute}
        />
      )}

      {/* ── TOP FLOATING PLAYER CARD ── */}
      {flow.phase === "map" && user && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-20 p-4 safe-top pointer-events-none"
        >
          <div className="glass-card max-w-md mx-auto pointer-events-auto overflow-hidden" style={{ background: "rgba(255, 249, 241, 0.96)", border: "1px solid rgba(216,169,74,0.35)" }}>
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-2xl">🐘</span>
                  {streak.currentStreak >= 3 && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-1 -right-1 text-xs"
                    >
                      🔥
                    </motion.span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold leading-none" style={{ color: "var(--warm-brown)" }}>
                    {user.generatedName}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-brown)" }}>
                    #{user.generatedNumber}
                    {streak.currentStreak >= 2 && (
                      <span style={{ color: "var(--saffron-dark)" }}> • {streak.currentStreak} day streak</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs font-extrabold" style={{ color: "var(--saffron-dark)" }}>
                    {user.uniquePandals}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-brown)" }}>
                    Pandals
                  </p>
                </div>
                <div className="w-[1px] h-4" style={{ background: "rgba(120,80,50,0.15)" }} />
                <div className="text-center">
                  <p className="text-xs font-extrabold" style={{ color: "var(--muted-gold-dark)" }}>
                    ⭐ {user.score}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-brown)" }}>
                    XP
                  </p>
                </div>
                <div className="w-[1px] h-4" style={{ background: "rgba(120,80,50,0.15)" }} />
                <div className="text-center">
                  <p className="text-xs font-extrabold" style={{ color: "var(--success)" }}>
                    📅 {weeklyVisits}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-brown)" }}>
                    This Week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 1 KM PROXIMITY NOTIFICATION & HAPTIC ALERT BANNER ── */}
      {flow.phase === "map" && (
        <ProximityAlertBanner
          alert={proximityAlert}
          onDismiss={() => setProximityAlert(null)}
          onAction={(pandal) => {
            setFlyToTarget({ lat: pandal.latitude, lng: pandal.longitude, zoom: 16, timestamp: Date.now() });
            handlePandalTap(pandal);
            setProximityAlert(null);
          }}
        />
      )}

      {/* ── LEFT-SIDE FLOATING BUTTONS (vertical stack above bottom nav) ── */}
      {flow.phase === "map" && (
        <div className="fixed left-3 z-30 flex flex-col gap-2" style={{ bottom: "76px" }}>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowFamousSheet(true)}
            className="px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-lg"
            style={{
              background: "#FFF9F1",
              border: "1.5px solid rgba(216, 169, 74, 0.4)",
              boxShadow: "0 4px 14px rgba(74, 48, 40, 0.12)",
            }}
            id="famous-pandals-btn"
            title="Explore Famous & Iconic Pandals"
          >
            <span className="text-sm">👑</span>
            <span className="text-[10px] font-bold" style={{ color: "var(--warm-brown)" }}>
              Famous
            </span>
          </motion.button>
        </div>
      )}

      {/* ── MUSHAK BAPPA RADAR FLOATING BUTTON ── */}
      {flow.phase === "map" && (
        <MushakRadar pandals={nearbyPandals} />
      )}

      {/* ── MUSHAK COMPANION FLOATING BUBBLE ── */}
      {flow.phase === "map" && !selectedPandal && (
        <AnimatePresence>
          {mushakTip && (
            <MushakBubble
              title={mushakTip.title}
              message={mushakTip.message}
              mood={mushakTip.mood}
              actionText={mushakTip.actionText}
              onDismiss={() => setMushakTip(null)}
              autoDismissMs={6500}
              position="top-center"
            />
          )}
        </AnimatePresence>
      )}

      {/* ── RIGHT-SIDE FLOATING BUTTONS (vertical stack above bottom nav) ── */}
      {flow.phase === "map" && (
        <div className="fixed right-3 z-30 flex flex-col items-center gap-2.5" style={{ bottom: "76px" }}>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring" }}
            whileTap={{ scale: 0.92 }}
            onClick={handleLocateMe}
            disabled={isLocating}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: "#FFF9F1",
              border: "1.5px solid rgba(216, 169, 74, 0.4)",
              boxShadow: "0 4px 14px rgba(74, 48, 40, 0.15)",
            }}
            id="locate-me-btn"
            title="Recenter on my location"
          >
            {isLocating ? (
              <span className="inline-block animate-spin text-base">⏳</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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

          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddPandal}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-xl"
            style={{
              background: "linear-gradient(135deg, #E9784F, #E0673B)",
              border: "2.5px solid #FFFFFF",
              boxShadow: "0 6px 20px rgba(233, 120, 79, 0.45)",
            }}
            id="add-pandal-fab"
            title="Add a Pandal"
          >
            🐘
          </motion.button>
        </div>
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

      {/* ── ROUTE ERROR TOAST ── */}
      {routeToast && flow.phase === "map" && (
        <div
          className="fixed top-20 left-4 right-4 z-40 mx-auto max-w-md p-3 text-xs text-center font-semibold rounded-xl shadow-lg animate-fade-in"
          style={{
            background: "#FFF4E3",
            border: "1.5px solid var(--saffron)",
            color: "var(--warm-brown)",
          }}
        >
          {routeToast}
        </div>
      )}

      {/* ── ACTIVE WALKING ROUTE FLOATING CARD ── */}
      {flow.phase === "map" && activeRoute && !selectedPandal && !discoveryResult && (
        <motion.div
          key="active-route-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="fixed left-4 right-4 z-30 max-w-md mx-auto"
          style={{ bottom: "130px" }}
        >
          <div
            className="p-3.5 rounded-2xl shadow-xl backdrop-blur-md"
            style={{
              background: "rgba(255, 249, 241, 0.96)",
              border: "1.5px solid rgba(216, 169, 74, 0.5)",
              boxShadow: "0 10px 28px rgba(74, 48, 40, 0.16)",
            }}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "#FFE8D2", border: "1px solid var(--border-cream)" }}
                >
                  🐘
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide truncate" style={{ color: "var(--saffron-dark)" }}>
                    {activeRoute.destinationName || "BAPPA"} IS {formatDuration(activeRoute.durationSeconds).toUpperCase()} AWAY
                  </p>
                  <p className="text-[11px] font-semibold flex items-center gap-2 mt-0.5" style={{ color: "var(--warm-brown)" }}>
                    <span>🚶 {formatDistance(activeRoute.distanceMeters)}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span>⏱ {formatDuration(activeRoute.durationSeconds)} walk</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  id="clear-route-btn"
                  onClick={handleClearRoute}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 hover:brightness-95"
                  style={{
                    background: "#FFE8D2",
                    color: "var(--warm-brown)",
                    border: "1px solid var(--border-cream)",
                  }}
                  title="Clear walking route"
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            <div
              className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px]"
              style={{ borderColor: "rgba(216, 169, 74, 0.25)" }}
            >
              <span className="font-medium truncate" style={{ color: "var(--muted-brown)" }}>
                Follow the saffron path to find Bappa 🪷
              </span>
              <button
                onClick={() => {
                  if (activeRoute.coordinates.length > 0) {
                    const lastCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${lastCoord[0]},${lastCoord[1]}`,
                      "_blank"
                    );
                  }
                }}
                className="text-[10px] font-bold underline flex-shrink-0 ml-2"
                style={{ color: "var(--saffron-dark)" }}
              >
                Maps ↗
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── IN-RANGE ALERT ── */}
      {flow.phase === "map" && !activeRoute && (
        <AnimatePresence>
          {closestInRange && !selectedPandal && !discoveryResult && (
            <motion.div
              key="in-range"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed left-4 right-4 z-20"
              style={{ bottom: "130px" }}
            >
              <button
                id="bappa-detected-btn"
                onClick={() => handlePandalTap(closestInRange)}
                className="w-full p-4 rounded-2xl text-left shadow-lg relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
                  border: "2px solid var(--saffron)",
                  boxShadow: "var(--shadow-warm)",
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "rgba(233, 120, 79, 0.08)" }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🐘
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs tracking-wider uppercase" style={{ color: "var(--saffron-dark)" }}>
                      🚨 BAPPA WITHIN REACH!
                    </p>
                    <p className="text-sm font-bold truncate" style={{ color: "var(--warm-brown)" }}>
                      {closestInRange.name === "???" ? "Unknown Pandal" : closestInRange.name} •{" "}
                      {formatDistance(closestInRange.distance)}
                    </p>
                  </div>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-xl font-bold flex-shrink-0"
                    style={{ color: "var(--saffron-dark)" }}
                  >
                    →
                  </motion.div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── COMPACT QUEST CARD ── */}
      {flow.phase === "map" && !activeRoute && (
        <AnimatePresence>
          {showQuest && activeQuest && !selectedPandal && !discoveryResult && !closestInRange && (
            <motion.div
              key="quest"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed left-4 right-4 z-20"
              style={{ bottom: "130px" }}
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
              onNavigate={handleNavigateToPandal}
              isRouting={isRouting}
            />
          )}
        </AnimatePresence>
      )}

      {/* ── FAMOUS PANDALS EXPLORER MODAL SHEET ── */}
      {flow.phase === "map" && (
        <AnimatePresence>
          {showFamousSheet && userLocation && (
            <FamousPandalsSheet
              userLocation={userLocation}
              onSelectPandal={handleSelectFamousPandal}
              onNavigatePandal={handleFamousPandalNavigate}
              onClose={() => setShowFamousSheet(false)}
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
          currentStreak={streak.currentStreak}
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
