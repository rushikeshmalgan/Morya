"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/shared/BottomNav";
import { getStoredUser, BappaUser } from "@/lib/store";
import Image from "next/image";

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
    const text = `🐘 I've discovered ${user.uniquePandals} Ganpati pandals!\n\n${user.generatedName} #${user.generatedNumber}\n\nBAPPA MODE 2026 — Find Bappa. Explore. Compete.\n\nGANPATI BAPPA MORYA! 🐘`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Bappa Mode", text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard?.writeText(text);
      alert("Copied to clipboard! Share with your friends 🐘");
    }
  };

  return (
    <div className="min-h-screen mandala-bg pb-20">
      {/* Header / Stats */}
      <div
        className="px-4 pt-14 pb-6 safe-top"
        style={{ background: "linear-gradient(to bottom, rgba(201,147,58,0.1), transparent)" }}
      >
        <div className="max-w-md mx-auto">
          {/* Identity */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                🐘
              </motion.div>
              <h1
                className="font-display font-bold text-2xl"
                style={{ color: "var(--muted-gold-light)" }}
              >
                {user.generatedName.toUpperCase()}
              </h1>
              <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
                #{user.generatedNumber} • {user.city || "Explorer"}
              </p>
            </motion.div>
          )}

          {/* Stats grid */}
          {user && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bappa-card p-4 text-center">
                <p className="font-display font-bold text-3xl" style={{ color: "var(--saffron)" }}>
                  {user.uniquePandals}
                </p>
                <p className="text-xs font-bold mt-1" style={{ color: "var(--fog-gray)" }}>
                  PANDALS DISCOVERED
                </p>
              </div>
              <div className="bappa-card p-4 text-center">
                <p className="font-display font-bold text-3xl" style={{ color: "var(--muted-gold)" }}>
                  {user.score}
                </p>
                <p className="text-xs font-bold mt-1" style={{ color: "var(--fog-gray)" }}>
                  BAPPA SCORE
                </p>
              </div>
              <div className="bappa-card p-4 text-center">
                <p className="font-display font-bold text-3xl" style={{ color: "var(--terracotta)" }}>
                  {achievements.length}
                </p>
                <p className="text-xs font-bold mt-1" style={{ color: "var(--fog-gray)" }}>
                  ACHIEVEMENTS
                </p>
              </div>
              <div className="bappa-card p-4 text-center">
                <p className="font-display font-bold text-3xl" style={{ color: "#4ADE80" }}>
                  {visits.length}
                </p>
                <p className="text-xs font-bold mt-1" style={{ color: "var(--fog-gray)" }}>
                  VISITS
                </p>
              </div>
            </div>
          )}

          {/* Share button */}
          <button
            id="share-journey-btn"
            className="btn-primary w-full"
            onClick={handleShare}
          >
            📤 SHARE MY BAPPA JOURNEY
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: "rgba(15,11,8,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-md mx-auto flex gap-2">
          <button
            id="tab-pandals"
            onClick={() => setActiveTab("pandals")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={
              activeTab === "pandals"
                ? { background: "var(--saffron)", color: "white" }
                : { background: "var(--bg-card)", color: "var(--fog-gray)", border: "1px solid var(--border-cream)" }
            }
          >
            🐘 MY PANDALS
          </button>
          <button
            id="tab-achievements"
            onClick={() => setActiveTab("achievements")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={
              activeTab === "achievements"
                ? { background: "var(--saffron)", color: "white" }
                : { background: "var(--bg-card)", color: "var(--fog-gray)", border: "1px solid var(--border-cream)" }
            }
          >
            🏆 ACHIEVEMENTS
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Pandal Collection */}
        {activeTab === "pandals" && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : visits.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🐘</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
                  No Pandals Yet
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--fog-gray)" }}>
                  Head to the map and start discovering Bappa!
                </p>
                <a href="/map" className="btn-primary">
                  🗺️ EXPLORE MAP
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit, i) => (
                  <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="collection-card discovered flex gap-3 overflow-hidden"
                  >
                    {/* Photo thumbnail */}
                    <div
                      className="w-20 h-20 flex-shrink-0 flex items-center justify-center"
                      style={{ background: "var(--bg-surface)" }}
                    >
                      {visit.pandal.photos[0] ? (
                        <div className="relative w-20 h-20">
                          <Image
                            src={visit.pandal.photos[0].imageUrl}
                            alt={visit.pandal.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <span className="text-3xl">🐘</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 py-3 pr-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--warm-cream)" }}>
                            {visit.pandal.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                            📍 {visit.pandal.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {visit.pandal.isRare && <span className="text-xs">⭐</span>}
                          <span className="text-xs" style={{ color: "#4ADE80" }}>✅</span>
                        </div>
                      </div>
                      <p className="text-xs mt-2" style={{ color: "var(--fog-gray)", opacity: 0.7 }}>
                        Discovered {new Date(visit.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Achievements */}
        {activeTab === "achievements" && (
          <>
            {achievements.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
                  No Achievements Yet
                </h3>
                <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
                  Discover your first pandal to unlock your first achievement!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((ua, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="achievement-badge w-full"
                  >
                    <span className="text-2xl">{ua.achievement.icon}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--muted-gold-light)" }}>
                        {ua.achievement.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                        {ua.achievement.description}
                      </p>
                    </div>
                    <div className="ml-auto text-xs" style={{ color: "var(--fog-gray)" }}>
                      {new Date(ua.unlockedAt).toLocaleDateString("en-IN")}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="journey" />
    </div>
  );
}
