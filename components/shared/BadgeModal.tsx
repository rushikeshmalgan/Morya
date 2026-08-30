"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface UnlockedBadgeItem {
  key: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  rarity?: string;
}

export interface BadgeModalProps {
  badge: UnlockedBadgeItem | null;
  onClose: () => void;
}

export function BadgeModal({ badge, onClose }: BadgeModalProps) {
  const handleShare = async () => {
    if (!badge) return;
    const text = `🏆 BADGE UNLOCKED IN BAPPA MODE!\n\n${badge.icon} ${badge.name}\n"${badge.description}"\n\nGanpati Bappa Morya! 🌸`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Bappa Mode Achievement", text });
      } catch {
        // User cancelled
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert("Achievement copied to clipboard! Share with your friends 🐘");
    }
  };

  return (
    <AnimatePresence>
      {badge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-sm bappa-card p-6 text-center relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-400 shadow-2xl shadow-amber-500/20"
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-800 text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <span>🏆</span>
              <span>BADGE UNLOCKED</span>
            </div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-6xl mb-3"
            >
              {badge.icon}
            </motion.div>

            {/* Title & Description */}
            <h3 className="font-display font-extrabold text-xl text-slate-900 mb-1">
              {badge.name}
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto mb-6">
              &ldquo;{badge.description}&rdquo;
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleShare}
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
              >
                <span>📤</span>
                <span>SHARE ACHIEVEMENT</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                CONTINUE EXPLORING
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
