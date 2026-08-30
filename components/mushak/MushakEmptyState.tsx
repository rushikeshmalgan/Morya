"use client";

import React from "react";
import { motion } from "framer-motion";
import MushakAvatar from "./MushakAvatar";
import { MushakMood } from "@/lib/mushak";

interface MushakEmptyStateProps {
  title: string;
  description: string;
  mood?: MushakMood;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function MushakEmptyState({
  title,
  description,
  mood = "curious",
  actionText,
  onAction,
  className = "",
}: MushakEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bappa-card p-6 text-center max-w-sm mx-auto ${className}`}
      style={{
        background: "linear-gradient(145deg, #FFF9F1, #FFE8D2)",
        border: "1.5px solid var(--border-gold)",
      }}
    >
      <div className="mb-3 flex justify-center">
        <MushakAvatar mood={mood} size="lg" />
      </div>

      <h3 className="font-display font-bold text-base mb-1" style={{ color: "var(--warm-brown)" }}>
        {title}
      </h3>

      <p className="text-xs max-w-xs mx-auto leading-relaxed mb-4" style={{ color: "var(--muted-brown)" }}>
        {description}
      </p>

      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary text-xs font-bold py-2.5 px-5">
          {actionText}
        </button>
      )}
    </motion.div>
  );
}
