"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/shared/BottomNav";
import { getStoredUser, BappaUser } from "@/lib/store";
import Image from "next/image";
import MushakEmptyState from "@/components/mushak/MushakEmptyState";
import DownloadApkButton from "@/components/shared/DownloadApkButton";

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

interface UserBadgeProgress {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  threshold: number | null;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt: string | null;
  hidden: boolean;
}

interface ScoreTx {
  id: string;
  eventType: string;
  points: number;
  createdAt: string;
}

export default function JourneyPage() {
  const [user, setUser] = useState<BappaUser | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [badges, setBadges] = useState<UserBadgeProgress[]>([]);
  const [badgeCategory, setBadgeCategory] = useState<string>("ALL");
  const [scoreHistory, setScoreHistory] = useState<ScoreTx[]>([]);
  const [activeTab, setActiveTab] = useState<"pandals" | "achievements" | "score">("pandals");
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
      const [visitsRes, scoreRes, badgesRes] = await Promise.all([
        fetch("/api/visits", { headers: { "x-session-token": token } }),
        fetch("/api/score", { headers: { "x-session-token": token } }),
        fetch("/api/me/badges", { headers: { "x-session-token": token } }),
      ]);
      const visitsData = await visitsRes.json();
      const scoreData = await scoreRes.json();
      const badgesData = await badgesRes.json();
      setVisits(visitsData.visits || []);
      setScoreHistory(scoreData.history || []);
      setBadges(badgesData.allBadges || []);
    } catch {
      // Ignore
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

  const earnedBadgesCount = badges.filter((b) => b.unlocked).length;

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
              EXPLORER PROFILE
            </span>
            <h2 className="font-display font-black text-2xl mt-0.5 mb-1 text-slate-900">
              {user.generatedName} #{user.generatedNumber}
            </h2>
            <p className="text-xs font-semibold mb-4 text-slate-500">
              📍 {user.city || "Maharashtra"}
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 text-center">
                <p className="font-display font-bold text-2xl text-amber-700">
                  {user.uniquePandals}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Pandals
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 text-center">
                <p className="font-display font-bold text-2xl text-amber-700">
                  {user.score}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Score XP
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-amber-900/10 text-center">
                <p className="font-display font-bold text-2xl text-amber-700">
                  {earnedBadgesCount}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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

        {/* Download Android APK Banner */}
        <div className="mb-4">
          <DownloadApkButton variant="banner" />
        </div>

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
            🐘 COLLECTION ({visits.length})
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
            🏆 BADGES ({earnedBadgesCount}/{badges.length})
          </button>
          <button
            id="tab-score"
            onClick={() => setActiveTab("score")}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={
              activeTab === "score"
                ? {
                    background: "linear-gradient(135deg, #E9784F, #E0673B)",
                    color: "#FFFFFF",
                    boxShadow: "var(--shadow-primary)",
                  }
                : { color: "var(--muted-brown)" }
            }
          >
            ✨ XP LEDGER ({scoreHistory.length})
          </button>
        </div>

        {/* Collection Tab */}
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
                  onAction={() => (window.location.href = "/map")}
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
                    className="bappa-card p-4 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-amber-100 flex items-center justify-center">
                      {visit.pandal.photos[0]?.imageUrl ? (
                        <Image
                          src={visit.pandal.photos[0].imageUrl}
                          alt={visit.pandal.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-2xl">🐘</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm truncate text-slate-800">
                          {visit.pandal.name}
                        </h3>
                        {visit.pandal.isRare && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-extrabold border border-amber-300">
                            RARE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        📍 {visit.pandal.city}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(visit.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badges Collection Tab */}
        {activeTab === "achievements" && (
          <div>
            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
              {["ALL", "EXPLORATION", "PHOTOGRAPHY", "YATRA", "STREAK"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setBadgeCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap transition-all ${
                    badgeCategory === cat
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-100/60 text-amber-800 hover:bg-amber-200/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {badges.filter((b) => badgeCategory === "ALL" || b.category === badgeCategory).length === 0 ? (
              <div className="py-8">
                <MushakEmptyState
                  mood="thinking"
                  title="No Badges Found"
                  description="Explore different areas of the app to unlock badges in this category!"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {badges
                  .filter((b) => badgeCategory === "ALL" || b.category === badgeCategory)
                  .map((badge, i) => {
                    const isUnlocked = badge.unlocked;
                    const threshold = badge.threshold || 1;
                    const progress = Math.min(badge.currentProgress || 0, threshold);
                    const percent = Math.round((progress / threshold) * 100);

                    return (
                      <motion.div
                        key={badge.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all ${
                          isUnlocked
                            ? "bg-gradient-to-r from-amber-50/90 to-orange-50/90 border-amber-300 shadow-sm"
                            : "bg-slate-100/60 border-slate-200 opacity-75"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                            isUnlocked
                              ? "bg-amber-200/60 border border-amber-300 text-slate-900"
                              : "bg-slate-200/80 border border-slate-300 grayscale opacity-60"
                          }`}
                        >
                          {badge.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`font-bold text-sm truncate ${isUnlocked ? "text-slate-900" : "text-slate-600"}`}>
                              {badge.name}
                            </h4>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                                badge.rarity === "LEGENDARY"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : badge.rarity === "EPIC"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : badge.rarity === "RARE"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {badge.rarity}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5 font-medium leading-tight">
                            {badge.description}
                          </p>

                          {/* Progress Bar or Earned Date */}
                          {isUnlocked ? (
                            <p className="text-[10px] text-amber-700 font-bold mt-2 flex items-center gap-1">
                              <span>✓ Earned</span>
                              {badge.unlockedAt && (
                                <span className="text-slate-400 font-normal">
                                  • {new Date(badge.unlockedAt).toLocaleDateString("en-IN")}
                                </span>
                              )}
                            </p>
                          ) : (
                            <div className="mt-2.5">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mb-1">
                                <span>Progress</span>
                                <span>{progress} / {threshold}</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Score History Tab */}
        {activeTab === "score" && (
          <div>
            {scoreHistory.length === 0 ? (
              <div className="py-8">
                <MushakEmptyState
                  mood="thinking"
                  title="No Score Transactions Yet"
                  description="Start discovering pandals, completing quests, and uploading photos to populate your XP ledger!"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {scoreHistory.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bappa-card p-3.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100/80 border border-amber-300 text-amber-700 flex items-center justify-center text-sm font-bold">
                        +{tx.points}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800 capitalize">
                          {tx.eventType.replace(/_/g, " ").toLowerCase()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      +{tx.points} XP
                    </span>
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
