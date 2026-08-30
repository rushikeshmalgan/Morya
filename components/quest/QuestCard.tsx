"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MushakAvatar from "@/components/mushak/MushakAvatar";

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
        className="glass-card px-3.5 py-2 flex items-center justify-between cursor-pointer shadow-md rounded-2xl"
        onClick={() => setCollapsed(false)}
        style={{
          background: "rgba(255, 249, 241, 0.96)",
          border: "1.5px solid rgba(216, 169, 74, 0.45)",
          boxShadow: "0 4px 16px rgba(74, 48, 40, 0.1)",
        }}
      >
        <div className="flex items-center gap-2">
          <MushakAvatar mood="pointing" size="xs" />
          <span className="text-[11px] font-bold truncate max-w-[220px]" style={{ color: "var(--warm-brown)" }}>
            🐭 Mission: {quest.title} ({quest.progress}/{quest.requirement})
          </span>
        </div>
        <span className="text-xs font-bold" style={{ color: "var(--saffron-dark)" }}>▲</span>
      </div>
    );
  }

  return (
    <div
      className="glass-card p-3 shadow-md rounded-2xl"
      style={{
        background: "rgba(255, 249, 241, 0.96)",
        border: "1.5px solid rgba(216, 169, 74, 0.45)",
        boxShadow: "0 4px 16px rgba(74, 48, 40, 0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <MushakAvatar mood={quest.completed ? "celebrating" : "pointing"} size="xs" />
          <p
            className="text-[10px] font-extrabold tracking-[0.1em] uppercase"
            style={{ color: "var(--saffron-dark)" }}
          >
            MUSHAK MAHARAJ&apos;S MISSION
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
            className="text-[10px] px-1.5 py-0.5 rounded font-bold"
            style={{ color: "var(--muted-brown)" }}
            title="Minimize"
          >
            ▼
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="text-xs px-1.5 py-0.5 leading-none font-bold"
            style={{ color: "var(--muted-brown)" }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <h3
          className="font-bold text-xs truncate max-w-[220px]"
          style={{ color: "var(--warm-brown)" }}
        >
          {quest.title}
        </h3>
        <span className="text-[11px] font-extrabold" style={{ color: "var(--saffron-dark)" }}>
          {quest.progress} / {quest.requirement}
        </span>
      </div>

      {quest.completed ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 py-0.5"
        >
          <span className="text-sm">🎉</span>
          <span
            className="font-bold text-[11px]"
            style={{ color: "var(--success)" }}
          >
            Mission Complete! +XP earned
          </span>
        </motion.div>
      ) : (
        <>
          <div className="quest-progress-bar mb-1.5" style={{ height: "5px" }}>
            <motion.div
              className="quest-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] flex items-center gap-1 font-medium" style={{ color: "var(--muted-brown)" }}>
            <span>🐭</span>
            <span className="truncate">
              {remaining === 1
                ? "Just 1 more Bappa to complete today's mission!"
                : `Find ${remaining} nearby pandals to complete!`}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
