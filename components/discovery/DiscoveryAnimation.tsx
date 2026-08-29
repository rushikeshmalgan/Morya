"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DiscoveryAnimationProps {
  pandalName: string;
  scoreEarned: number;
  isRare: boolean;
  newAchievements: string[];
  onDismiss: () => void;
}

// Simple confetti particle
function Confetti() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#FF6B00", "#C9933A", "#E8BE6A", "#FFF8E7", "#CC2200"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ left: `${p.x}%`, top: "-10px", background: p.color }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360 + Math.random() * 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

export default function DiscoveryAnimation({
  pandalName,
  scoreEarned,
  isRare,
  newAchievements,
  onDismiss,
}: DiscoveryAnimationProps) {
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowScore(true), 800);
    const t2 = setTimeout(() => onDismiss(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-6"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center w-full max-w-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow ring */}
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 120, height: 120,
                background: isRare
                  ? "radial-gradient(circle, rgba(255,215,0,0.3), transparent)"
                  : "radial-gradient(circle, rgba(255,107,0,0.3), transparent)",
              }}
              animate={{ scale: [1, 1.5, 1.5], opacity: [1, 0, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="text-7xl z-10"
              animate={{ scale: [0.5, 1.2, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.8 }}
            >
              🐘
            </motion.div>
          </div>

          {/* Shimmer header */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="shimmer-text font-bold tracking-[0.2em] text-xs uppercase mb-2"
          >
            {isRare ? "⭐ RARE BAPPA UNLOCKED" : "✨ BAPPA UNLOCKED"}
          </motion.p>

          {/* Pandal name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display font-bold mb-4"
            style={{ fontSize: "1.6rem", color: "var(--warm-cream)" }}
          >
            {pandalName.toUpperCase()}
          </motion.h2>

          {/* Score */}
          {showScore && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4 font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(201,147,58,0.2))",
                border: "1.5px solid var(--saffron)",
                color: "var(--saffron)",
              }}
            >
              <span>+{scoreEarned}</span>
              <span style={{ color: "var(--muted-gold)" }}>BAPPA SCORE</span>
            </motion.div>
          )}

          {/* New achievements */}
          {newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mb-4"
            >
              {newAchievements.map((key) => (
                <div key={key} className="achievement-badge justify-center mb-2">
                  🏆 Achievement Unlocked: {key.replace(/_/g, " ").toUpperCase()}
                </div>
              ))}
            </motion.div>
          )}

          {/* Morya! */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display font-bold text-2xl mb-6"
            style={{ color: "var(--muted-gold)" }}
          >
            🐘 MORYA!
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            id="dismiss-discovery"
            className="btn-secondary w-full"
            onClick={onDismiss}
          >
            Continue Exploring →
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}
