"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MushakAvatar from "./MushakAvatar";
import { MushakMood } from "@/lib/mushak";

interface MushakBubbleProps {
  title?: string;
  message: string;
  mood?: MushakMood;
  actionText?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
  position?: "bottom-left" | "bottom-center" | "top-center" | "inline";
  className?: string;
}

export default function MushakBubble({
  title,
  message,
  mood = "happy",
  actionText,
  onAction,
  onDismiss,
  autoDismissMs,
  position = "bottom-left",
  className = "",
}: MushakBubbleProps) {
  useEffect(() => {
    if (autoDismissMs && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  const positionStyles = {
    "bottom-left": "fixed bottom-24 left-4 z-30 max-w-[280px] sm:max-w-xs",
    "bottom-center": "fixed bottom-24 left-4 right-4 mx-auto z-30 max-w-sm",
    "top-center": "fixed top-20 left-4 right-4 mx-auto z-30 max-w-sm",
    inline: "relative w-full",
  }[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`${positionStyles} ${className}`}
    >
      <div
        className="p-3 rounded-2xl shadow-xl backdrop-blur-md relative flex items-start gap-2.5"
        style={{
          background: "rgba(255, 249, 241, 0.97)",
          border: "1.5px solid rgba(216, 169, 74, 0.4)",
          boxShadow: "0 8px 24px rgba(74, 48, 40, 0.15)",
        }}
      >
        {/* Mushak Avatar */}
        <MushakAvatar mood={mood} size="sm" />

        {/* Text and Actions */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--saffron-dark)" }}>
              MUSHAK MAHARAJ
            </span>
          </div>

          {title && (
            <p className="text-xs font-bold leading-tight mb-0.5" style={{ color: "var(--warm-brown)" }}>
              {title}
            </p>
          )}

          <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-brown)" }}>
            {message}
          </p>

          {actionText && onAction && (
            <button
              onClick={onAction}
              className="mt-2 btn-primary py-1 px-3 text-[10px] font-bold flex items-center gap-1"
            >
              <span>✨</span>
              <span>{actionText}</span>
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--warm-brown)", background: "#FFE8D2" }}
            title="Dismiss"
            aria-label="Dismiss Mushak message"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}
