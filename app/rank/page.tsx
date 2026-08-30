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
  if (rank === 1) return <span className="text-2xl font-bold">🥇</span>;
  if (rank === 2) return <span className="text-2xl font-bold">🥈</span>;
  if (rank === 3) return <span className="text-2xl font-bold">🥉</span>;
  return (
    <span
      className="font-extrabold text-sm w-7 text-center rounded-lg py-0.5"
      style={{ color: "var(--muted-brown)", background: "#FFE8D2" }}
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
    <div className="min-h-screen mandala-bg pb-24 safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "var(--saffron-dark)" }}>
              FESTIVAL RANKS
            </span>
            <h1 className="font-display font-bold text-2xl" style={{ color: "var(--warm-brown)" }}>
              🏆 BAPPA BATTLE
            </h1>
          </div>
          <span className="text-3xl">🌸</span>
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--muted-brown)" }}>
          Friendly community leaderboard across cities and squads
        </p>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bappa-card" style={{ background: "rgba(255, 249, 241, 0.95)" }}>
          {(["global", "city", "squad"] as LeaderboardType[]).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => switchTab(t)}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={
                type === t
                  ? {
                      background: "linear-gradient(135deg, #E9784F, #E0673B)",
                      color: "#FFFFFF",
                      boxShadow: "var(--shadow-primary)",
                    }
                  : { color: "var(--muted-brown)" }
              }
            >
              {t === "global" ? "🌎 Global" : t === "city" ? `📍 ${myCity || "City"}` : "👥 Squad"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* Squad Panel */}
        {type === "squad" && !squadData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bappa-card p-6 mb-5 text-center"
            style={{ background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)" }}
          >
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--warm-brown)" }}>
              Bappa is Better with Friends
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--muted-brown)" }}>
              Create a festival squad with your friends or join one using an invite code.
            </p>
            <button id="create-squad-btn" className="btn-primary w-full mb-3 text-xs font-bold" onClick={handleCreateSquad}>
              👥 CREATE NEW SQUAD
            </button>
            <div className="flex gap-2">
              <input
                className="bappa-input flex-1 text-xs"
                placeholder="Enter code (e.g. MORYA-XXXX)"
                value={squadInput}
                onChange={(e) => setSquadInput(e.target.value.toUpperCase())}
                id="squad-code-input"
              />
              <button
                id="join-squad-btn"
                className="btn-secondary px-4 text-xs font-bold"
                onClick={handleJoinSquad}
              >
                JOIN
              </button>
            </div>
            {squadError && <p className="text-xs mt-2 font-semibold" style={{ color: "var(--vermillion)" }}>{squadError}</p>}
          </motion.div>
        )}

        {/* Squad code display */}
        {type === "squad" && squadData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bappa-card p-4 mb-4 flex items-center justify-between"
            style={{ background: "#FFE8D2" }}
          >
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--muted-gold-dark)" }}>
                YOUR SQUAD CODE
              </p>
              <p className="font-display font-bold text-lg" style={{ color: "var(--warm-brown)" }}>
                {squadCode}
              </p>
            </div>
            <button
              id="copy-squad-code"
              className="btn-secondary text-xs px-3 py-1.5 font-bold"
              onClick={() => {
                navigator.clipboard?.writeText(squadCode);
                alert("Squad code copied to clipboard!");
              }}
            >
              📋 Copy Code
            </button>
          </motion.div>
        )}

        {/* Total pandals (squad) */}
        {type === "squad" && totalPandals !== null && (
          <div className="text-center mb-4">
            <span className="score-chip">🐘 {totalPandals} Total Pandals Discovered</span>
          </div>
        )}

        {/* My rank banner */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-2xl text-center text-xs font-bold"
            style={{ background: "#FFE8D2", border: "1.5px solid var(--border-gold)", color: "var(--warm-brown)" }}
          >
            🌟 You are currently ranked <strong style={{ color: "var(--saffron-dark)" }}>#{myRank}</strong> {type === "global" ? "globally" : `in ${type}`}!
          </motion.div>
        )}

        {/* Leaderboard list */}
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 && type !== "squad" ? (
          <div className="text-center py-12 bappa-card p-6">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
              No explorers found yet. Be the first to explore!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {leaderboard.map((entry, i) => {
              const isMe = entry.id === myUserId;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bappa-card p-3.5 flex items-center gap-3.5"
                  style={
                    isMe
                      ? {
                          background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
                          border: "2px solid var(--saffron)",
                          boxShadow: "var(--shadow-warm)",
                        }
                      : {}
                  }
                >
                  <RankBadge rank={entry.rank} />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate flex items-center gap-1.5"
                      style={{ color: "var(--warm-brown)" }}
                    >
                      <span>{entry.generatedName} #{entry.generatedNumber}</span>
                      {isMe && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-orange-200 text-orange-800">
                          YOU
                        </span>
                      )}
                    </p>
                    {entry.city && (
                      <p className="text-[11px]" style={{ color: "var(--muted-brown)" }}>
                        📍 {entry.city}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-sm" style={{ color: "var(--saffron-dark)" }}>
                      {entry.uniquePandals} 🐘
                    </p>
                    <p className="text-[10px] font-semibold" style={{ color: "var(--muted-brown)" }}>
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
