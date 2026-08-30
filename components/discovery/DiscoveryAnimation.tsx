"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MushakCelebration from "@/components/mushak/MushakCelebration";

interface DiscoveryAnimationProps {
  pandalName: string;
  scoreEarned: number;
  isRare: boolean;
  newAchievements: string[];
  currentStreak?: number;
  onDismiss: () => void;
}

// Soft festival petal & gold particles
function FestivalPetals() {
  const petals = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    color: ["#E9784F", "#D8A94A", "#EFA6A0", "#FFF9F1", "#F29572"][Math.floor(Math.random() * 5)],
    size: 8 + Math.random() * 8,
    symbol: ["🌸", "🌼", "✨", "🪷", "•"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute flex items-center justify-center select-none"
          style={{ left: `${p.x}%`, top: "-20px", fontSize: p.size }}
          animate={{
            y: ["0vh", "110vh"],
            x: [`${p.x}%`, `${p.x + (Math.random() * 15 - 7.5)}%`],
            rotate: [0, 360 + Math.random() * 360],
            opacity: [1, 0.9, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: p.delay,
            ease: "easeOut",
          }}
        >
          <span>{p.symbol}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function DiscoveryAnimation({
  pandalName,
  scoreEarned,
  isRare,
  newAchievements,
  currentStreak,
  onDismiss,
}: DiscoveryAnimationProps) {
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowScore(true), 600);
    const t2 = setTimeout(() => onDismiss(), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  return (
    <>
      <FestivalPetals />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-5"
        style={{ background: "rgba(74, 48, 40, 0.65)", backdropFilter: "blur(8px)" }}
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bappa-card p-6 text-center w-full max-w-xs shadow-2xl relative overflow-hidden"
          style={{ background: "#FFF9F1", border: "2px solid var(--border-gold)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle warm glow circle */}
          <div className="relative flex items-center justify-center mb-4 mt-2">
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 130, height: 130,
                background: isRare
                  ? "radial-gradient(circle, rgba(216,169,74,0.35), transparent 70%)"
                  : "radial-gradient(circle, rgba(233,120,79,0.25), transparent 70%)",
              }}
              animate={{ scale: [1, 1.4, 1.4], opacity: [0.9, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="text-6xl z-10 filter drop-shadow-md"
              animate={{ scale: [0.6, 1.15, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              🐘
            </motion.div>
          </div>

          {/* Shimmer header */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="shimmer-text font-bold tracking-[0.2em] text-xs uppercase mb-1"
          >
            {isRare ? "⭐ RARE BAPPA DISCOVERED" : "✨ BAPPA FOUND ✨"}
          </motion.p>

          {/* Pandal name */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display font-bold mb-2"
            style={{ fontSize: "1.45rem", color: "var(--warm-brown)" }}
          >
            {pandalName}
          </motion.h2>

          {/* Mushak Celebration Badge */}
          <MushakCelebration pandalName={pandalName} scoreEarned={scoreEarned} />

          {/* Score Badge */}
          {showScore && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-2 font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #FFE8D2, #FCE0DC)",
                border: "1.5px solid var(--saffron)",
                color: "var(--saffron-dark)",
              }}
            >
              <span>+{scoreEarned}</span>
              <span style={{ color: "var(--warm-brown)", fontSize: "0.8rem" }}>BAPPA XP</span>
            </motion.div>
          )}

          {/* Streak Badge */}
          {currentStreak && currentStreak >= 2 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 20, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-2 font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #FFF9F1, #FFE8D2)",
                border: "1.5px solid var(--muted-gold)",
                color: "var(--muted-gold-dark)",
              }}
            >
              <span>🔥</span>
              <span>{currentStreak} Day Streak!</span>
            </motion.div>
          )}

          {/* New achievements */}
          {newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-3"
            >
              {newAchievements.map((key) => (
                <div key={key} className="achievement-badge justify-center text-xs py-2 px-3 mb-1.5">
                  🏆 Unlocked: {key.replace(/_/g, " ").toUpperCase()}
                </div>
              ))}
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-display font-bold text-xl mb-5"
            style={{ color: "var(--muted-gold-dark)" }}
          >
            GANPATI BAPPA MORYA! 🌸
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            id="dismiss-discovery"
            className="btn-primary w-full text-sm font-bold"
            onClick={onDismiss}
          >
            Continue Journey →
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}
