"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ScoreBadgeProps {
  show: boolean;
  points: number;
  label?: string;
  onComplete?: () => void;
}

export function ScoreBadge({ show, points, label = "XP Earned", onComplete }: ScoreBadgeProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full shadow-lg shadow-amber-500/10 backdrop-blur-md">
            <span className="text-xl">✨</span>
            <span className="font-extrabold text-lg text-amber-400">+{points} XP</span>
            <span className="text-xs text-amber-200/80 font-medium pl-1 border-l border-amber-500/30">
              {label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
