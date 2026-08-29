"use client";

import { motion } from "framer-motion";

interface QuestCardProps {
  quest: {
    title: string;
    requirement: number;
    progress: number;
    completed: boolean;
  };
  onDismiss: () => void;
}

export default function QuestCard({ quest, onDismiss }: QuestCardProps) {
  const pct = Math.min((quest.progress / quest.requirement) * 100, 100);
  const remaining = quest.requirement - quest.progress;

  return (
    <div className="quest-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="text-xs font-bold tracking-[0.15em] uppercase mb-1"
            style={{ color: "var(--muted-gold)" }}
          >
            🎯 TODAY&apos;S BAPPA QUEST
          </p>
          <h3
            className="font-display font-bold"
            style={{ fontSize: "1.1rem", color: "var(--warm-cream)" }}
          >
            {quest.title.toUpperCase()}
          </h3>
        </div>
        <button
          onClick={onDismiss}
          className="text-xl ml-2 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "var(--fog-gray)" }}
        >
          ×
        </button>
      </div>

      {quest.completed ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 py-2"
        >
          <span className="text-xl">🎉</span>
          <span
            className="font-bold"
            style={{ color: "#4ADE80", fontSize: "0.9rem" }}
          >
            QUEST COMPLETE! Well done, Bappa Explorer!
          </span>
        </motion.div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: "var(--saffron)" }}>
              {quest.progress} / {quest.requirement}
            </span>
            <span className="text-xs" style={{ color: "var(--fog-gray)" }}>
              {remaining === 1 ? "ONE MORE BAPPA 👀" : `${remaining} to go`}
            </span>
          </div>
          <div className="quest-progress-bar mb-3">
            <motion.div
              className="quest-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
            Tap a pandal marker to start exploring 🐘
          </p>
        </>
      )}
    </div>
  );
}
