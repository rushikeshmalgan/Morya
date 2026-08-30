"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/shared/BottomNav";
import { getStoredUser, BappaUser } from "@/lib/store";
import Image from "next/image";
import MushakAvatar from "@/components/mushak/MushakAvatar";
import MushakEmptyState from "@/components/mushak/MushakEmptyState";

interface Visit {
  id: string;
  timestamp: string;
  pandal: {
    id: string;
    name: string;
    city: string;
    isRare: boolean;
    photos: { imageUrl: string }[];
  };
}

interface Achievement {
  achievement: {
    name: string;
    description: string;
    icon: string;
  };
  unlockedAt: string;
}

export default function JourneyPage() {
  const [user, setUser] = useState<BappaUser | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<"pandals" | "achievements">("pandals");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;
    setUser(stored);
    fetchJourney(stored.sessionToken);
  }, []);

  const fetchJourney = async (token: string) => {
    setIsLoading(true);
    try {
      const [visitsRes, userRes] = await Promise.all([
        fetch("/api/visits", { headers: { "x-session-token": token } }),
        fetch("/api/user", { headers: { "x-session-token": token } }),
      ]);
      const visitsData = await visitsRes.json();
      const userData = await userRes.json();
      setVisits(visitsData.visits || []);
      setAchievements(userData.achievements || []);
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!user) return;
    const text = `🐘 I've discovered ${user.uniquePandals} Ganpati pandals in ${user.city || "my city"}!\n\n${user.generatedName} #${user.generatedNumber} | BAPPA MODE 2026\n\nGANPATI BAPPA MORYA! 🌸`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Bappa Mode Journey", text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard?.writeText(text);
      alert("Copied journey card to clipboard! Share with your friends 🐘");
    }
  };

  return (
    <div className="min-h-screen mandala-bg pb-24 safe-top safe-bottom">
      {/* Header / Stats */}
      <div className="px-4 pt-10 pb-4 max-w-md mx-auto">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bappa-card p-6 text-center mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
              border: "1.5px solid var(--border-gold)",
            }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-5xl mb-2"
            >
              🐘
            </motion.div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: "var(--saffron-dark)" }}>
              COLLECTOR IDENTITY
            </span>
            <h1 className="font-display font-bold text-2xl mt-0.5" style={{ color: "var(--warm-brown)" }}>
              {user.generatedName.toUpperCase()}
            </h1>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--muted-brown)" }}>
              #{user.generatedNumber} • 📍 {user.city || "Festival Explorer"}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 text-center">
                <p className="font-display font-bold text-2xl" style={{ color: "var(--saffron-dark)" }}>
                  {user.uniquePandals}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>
                  Pandals
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 text-center">
                <p className="font-display font-bold text-2xl" style={{ color: "var(--muted-gold-dark)" }}>
                  {user.score}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>
                  Score XP
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 text-center">
                <p className="font-display font-bold text-2xl" style={{ color: "var(--success)" }}>
                  {achievements.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>
                  Badges
                </p>
              </div>
            </div>

            {/* Share CTA */}
            <button
              id="share-journey-btn"
              className="btn-primary w-full mt-4 text-xs font-bold"
              onClick={handleShare}
            >
              📤 SHARE MY BAPPA JOURNEY
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bappa-card mb-4" style={{ background: "rgba(255, 249, 241, 0.95)" }}>
          <button
            id="tab-pandals"
            onClick={() => setActiveTab("pandals")}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={
              activeTab === "pandals"
                ? {
                    background: "linear-gradient(135deg, #E9784F, #E0673B)",
                    color: "#FFFFFF",
                    boxShadow: "var(--shadow-primary)",
                  }
                : { color: "var(--muted-brown)" }
            }
          >
            🐘 MY COLLECTION ({visits.length})
          </button>
          <button
            id="tab-achievements"
            onClick={() => setActiveTab("achievements")}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={
              activeTab === "achievements"
                ? {
                    background: "linear-gradient(135deg, #E9784F, #E0673B)",
                    color: "#FFFFFF",
                    boxShadow: "var(--shadow-primary)",
                  }
                : { color: "var(--muted-brown)" }
            }
          >
            🏆 BADGES ({achievements.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "pandals" && (
          <div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-2xl" />
                ))}
              </div>
            ) : visits.length === 0 ? (
              <div className="py-8">
                <MushakEmptyState
                  mood="curious"
                  title="Your Bappa Album is Empty"
                  description="Head to the map, discover pandals around your city, and add them to your darshan collection!"
                  actionText="🗺️ EXPLORE THE MAP"
                  onAction={() => window.location.href = "/map"}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit, i) => (
                  <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="collection-card discovered flex gap-3.5 p-3 items-center"
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative flex items-center justify-center"
                      style={{ background: "#FFE8D2" }}
                    >
                      {visit.pandal.photos[0] ? (
                        <Image
                          src={visit.pandal.photos[0].imageUrl}
                          alt={visit.pandal.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-3xl">🐘</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm truncate" style={{ color: "var(--warm-brown)" }}>
                          {visit.pandal.name}
                        </h4>
                        {visit.pandal.isRare && <span className="text-xs">⭐</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-brown)" }}>
                        📍 {visit.pandal.city}
                      </p>
                      <p className="text-[10px] mt-2 font-semibold" style={{ color: "var(--success)" }}>
                        ✓ Discovered {new Date(visit.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div>
            {achievements.length === 0 ? (
              <div className="text-center py-14 bappa-card p-6">
                <div className="text-5xl mb-3">🏆</div>
                <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--warm-brown)" }}>
                  No Badges Unlocked Yet
                </h3>
                <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--muted-brown)" }}>
                  Discover your first pandal or capture a moment to earn festival badges!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((ua, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="achievement-badge w-full"
                  >
                    <span className="text-3xl">{ua.achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: "var(--warm-brown)" }}>
                        {ua.achievement.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
                        {ua.achievement.description}
                      </p>
                    </div>
                    <div className="text-[10px] font-semibold" style={{ color: "var(--muted-brown)" }}>
                      {new Date(ua.unlockedAt).toLocaleDateString("en-IN")}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav active="journey" />
    </div>
  );
}
