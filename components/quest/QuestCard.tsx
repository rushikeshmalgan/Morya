"use client";

import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const pct = Math.min((quest.progress / quest.requirement) * 100, 100);
  const remaining = Math.max(0, quest.requirement - quest.progress);

  if (collapsed) {
    return (
      <div
        className="glass-card px-4 py-2.5 flex items-center justify-between cursor-pointer"
        onClick={() => setCollapsed(false)}
        style={{ background: "rgba(255, 249, 241, 0.95)" }}
      >
        <div className="flex items-center gap-2">
          <span>🔥</span>
          <span className="text-xs font-bold" style={{ color: "var(--warm-brown)" }}>
            Quest: {quest.title} ({quest.progress}/{quest.requirement})
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--muted-brown)" }}>▲</span>
      </div>
    );
  }

  return (
    <div className="quest-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span>🔥</span>
          <p
            className="text-[11px] font-extrabold tracking-[0.12em] uppercase"
            style={{ color: "var(--saffron-dark)" }}
          >
            TODAY&apos;S BAPPA HUNT
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
            className="text-xs px-1.5 py-0.5 rounded text-gray-500 hover:text-gray-800 transition-colors"
            title="Minimize"
          >
            ▼
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="text-base px-1.5 py-0.5 leading-none text-gray-400 hover:text-gray-700 transition-colors"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3
          className="font-bold text-sm"
          style={{ color: "var(--warm-brown)" }}
        >
          {quest.title}
        </h3>
        <span className="text-xs font-bold" style={{ color: "var(--saffron-dark)" }}>
          {quest.progress} / {quest.requirement}
        </span>
      </div>

      {quest.completed ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 py-1"
        >
          <span className="text-base">🎉</span>
          <span
            className="font-bold text-xs"
            style={{ color: "var(--success)" }}
          >
            Quest Complete! +Points earned!
          </span>
        </motion.div>
      ) : (
        <>
          <div className="quest-progress-bar mb-2">
            <motion.div
              className="quest-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-[11px]" style={{ color: "var(--muted-brown)" }}>
            {remaining === 1 ? "Just 1 more pandal nearby!" : `Find ${remaining} nearby pandals to complete`}
          </p>
        </>
      )}
    </div>
  );
}
