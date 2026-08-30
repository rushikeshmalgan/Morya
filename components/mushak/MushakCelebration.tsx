"use client";

import React from "react";
import { motion } from "framer-motion";
import MushakAvatar from "./MushakAvatar";

interface MushakCelebrationProps {
  pandalName: string;
  scoreEarned: number;
}

export default function MushakCelebration({ pandalName, scoreEarned }: MushakCelebrationProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
      className="p-3 rounded-2xl flex items-center gap-3 text-left mb-3"
      style={{
        background: "linear-gradient(135deg, #FFE8D2, #FFF4E3)",
        border: "1.5px solid var(--border-gold)",
      }}
    >
      <MushakAvatar mood="celebrating" size="md" />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--saffron-dark)" }}>
          MUSHAK MAHARAJ SAYS:
        </p>
        <p className="text-xs font-bold leading-tight" style={{ color: "var(--warm-brown)" }}>
          &quot;MORYA! You found {pandalName}!&quot;
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-gold-dark)", fontWeight: 600 }}>
          +{scoreEarned} XP added to your collection ✨
        </p>
      </div>
    </motion.div>
  );
}
