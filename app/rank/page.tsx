"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/shared/BottomNav";
import { getStoredUser } from "@/lib/store";

type LeaderboardType = "global" | "city" | "squad";

interface LeaderEntry {
  id: string;
  generatedName: string;
  generatedNumber: number;
  city?: string;
  uniquePandals: number;
  score: number;
  rank: number;
}

interface SquadData {
  id: string;
  code: string;
  name: string | null;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span
      className="font-bold text-sm w-8 text-center"
      style={{ color: "var(--fog-gray)" }}
    >
      #{rank}
    </span>
  );
}

export default function RankPage() {
  const [type, setType] = useState<LeaderboardType>("global");
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myCity, setMyCity] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [squadData, setSquadData] = useState<SquadData | null>(null);
  const [squadCode, setSquadCode] = useState("");
  const [squadInput, setSquadInput] = useState("");
  const [squadError, setSquadError] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [totalPandals, setTotalPandals] = useState<number | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setMyUserId(stored.userId);
      setMyCity(stored.city);
      setSessionToken(stored.sessionToken);
    }
    fetchLeaderboard("global");
    fetchMySquad(stored?.sessionToken || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaderboard = async (t: LeaderboardType, squadId?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ type: t });
      if (t === "city" && myCity) params.set("city", myCity);
      if (t === "squad" && squadId) params.set("squadId", squadId);
      const res = await fetch(`/api/leaderboard?${params}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setTotalPandals(data.totalPandals || null);

      // Find my rank
      if (myUserId) {
        const myEntry = data.leaderboard?.find((e: LeaderEntry) => e.id === myUserId);
        setMyRank(myEntry?.rank || null);
      }
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySquad = async (token: string | null) => {
    if (!token) return;
    try {
      const res = await fetch("/api/user", { headers: { "x-session-token": token } });
      const data = await res.json();
      if (data.squadMemberships?.length > 0) {
        const squad = data.squadMemberships[0].squad;
        setSquadData({ id: squad.id, code: squad.code, name: squad.name });
        setSquadCode(squad.code);
        fetchLeaderboard("squad", squad.id);
      }
    } catch {
      // No squad
    }
  };

  const handleCreateSquad = async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch("/api/squads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSquadData({ id: data.squad.id, code: data.squad.code, name: data.squad.name });
      setSquadCode(data.squad.code);
      setType("squad");
      fetchLeaderboard("squad", data.squad.id);
    } catch {
      setSquadError("Failed to create squad. Try again.");
    }
  };

  const handleJoinSquad = async () => {
    if (!sessionToken || !squadInput.trim()) return;
    setSquadError("");
    try {
      const res = await fetch("/api/squads/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
        body: JSON.stringify({ code: squadInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.error) {
        setSquadError(data.error);
        return;
      }
      setSquadData({ id: data.squad.id, code: data.squad.code, name: data.squad.name });
      setSquadCode(data.squad.code);
      setType("squad");
      fetchLeaderboard("squad", data.squad.id);
    } catch {
      setSquadError("Failed to join squad. Check your code.");
    }
  };

  const switchTab = (t: LeaderboardType) => {
    setType(t);
    if (t === "squad" && squadData) {
      fetchLeaderboard("squad", squadData.id);
    } else if (t !== "squad") {
      fetchLeaderboard(t);
    }
  };

  return (
    <div className="min-h-screen mandala-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-12 pb-4 safe-top" style={{ background: "rgba(15,11,8,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="font-display font-bold text-xl" style={{ color: "var(--warm-cream)" }}>
                LEADERBOARD
              </h1>
              <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                Soft Competition — MVP
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["global", "city", "squad"] as LeaderboardType[]).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                onClick={() => switchTab(t)}
                className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={
                  type === t
                    ? { background: "var(--saffron)", color: "white" }
                    : { background: "var(--bg-card)", color: "var(--fog-gray)", border: "1px solid var(--border-cream)" }
                }
              >
                {t === "global" ? "🌎 Global" : t === "city" ? `📍 ${myCity || "City"}` : "👥 Squad"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Squad Panel */}
        {type === "squad" && !squadData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bappa-card p-6 mb-6 text-center"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
              Bappa is Better with Friends
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--fog-gray)" }}>
              Create a squad or join one with a code.
            </p>
            <button id="create-squad-btn" className="btn-primary w-full mb-3" onClick={handleCreateSquad}>
              👥 CREATE SQUAD
            </button>
            <div className="flex gap-2">
              <input
                className="bappa-input flex-1 text-sm"
                placeholder="Enter squad code (MORYA-XXXX)"
                value={squadInput}
                onChange={(e) => setSquadInput(e.target.value.toUpperCase())}
                id="squad-code-input"
              />
              <button
                id="join-squad-btn"
                className="btn-secondary px-4 text-sm"
                onClick={handleJoinSquad}
              >
                JOIN
              </button>
            </div>
            {squadError && <p className="text-xs mt-2" style={{ color: "var(--vermillion)" }}>{squadError}</p>}
          </motion.div>
        )}

        {/* Squad code display */}
        {type === "squad" && squadData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bappa-card p-4 mb-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--muted-gold)" }}>YOUR SQUAD CODE</p>
              <p className="font-display font-bold text-xl" style={{ color: "var(--warm-cream)" }}>{squadCode}</p>
            </div>
            <button
              id="copy-squad-code"
              className="btn-ghost text-xs"
              onClick={() => navigator.clipboard?.writeText(squadCode)}
            >
              📋 Copy
            </button>
          </motion.div>
        )}

        {/* Total pandals (squad) */}
        {type === "squad" && totalPandals !== null && (
          <div className="text-center mb-4">
            <span className="score-chip">🐘 {totalPandals} Total Pandals Discovered</span>
          </div>
        )}

        {/* My rank */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-xl text-center"
            style={{ background: "rgba(255, 107, 0, 0.1)", border: "1px solid rgba(255, 107, 0, 0.3)" }}
          >
            <span style={{ color: "var(--saffron)" }}>
              You are <strong>#{myRank}</strong> {type === "global" ? "globally" : `in ${type}`}
            </span>
          </motion.div>
        )}

        {/* Leaderboard list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 && type !== "squad" ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏆</div>
            <p style={{ color: "var(--fog-gray)" }}>No explorers found yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, i) => {
              const isMe = entry.id === myUserId;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bappa-card p-4 flex items-center gap-4"
                  style={isMe ? { border: "1.5px solid var(--saffron)" } : {}}
                >
                  <RankBadge rank={entry.rank} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold truncate"
                      style={{ color: isMe ? "var(--saffron)" : "var(--warm-cream)", fontSize: "0.9rem" }}
                    >
                      {entry.generatedName} #{entry.generatedNumber}
                      {isMe && <span className="ml-2 text-xs">(YOU)</span>}
                    </p>
                    {entry.city && (
                      <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                        📍 {entry.city}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: "var(--saffron)", fontSize: "1rem" }}>
                      {entry.uniquePandals} 🐘
                    </p>
                    <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                      {entry.score} pts
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="rank" />
    </div>
  );
}
