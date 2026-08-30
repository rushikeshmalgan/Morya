"use client";

import React from "react";
import { motion, TargetAndTransition } from "framer-motion";
import { MushakMood } from "@/lib/mushak";

interface MushakAvatarProps {
  mood?: MushakMood;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const SIZE_MAP = {
  xs: 28,
  sm: 38,
  md: 52,
  lg: 72,
  xl: 96,
};

export default function MushakAvatar({
  mood = "idle",
  size = "md",
  className = "",
  animate = true,
}: MushakAvatarProps) {
  const pixelSize = SIZE_MAP[size];

  // Dynamic animation variants based on mood
  const getAnimation = (): TargetAndTransition => {
    if (!animate) return {};
    switch (mood) {
      case "excited":
      case "celebrating":
        return {
          y: [0, -6, 0, -4, 0],
          rotate: [0, -4, 4, -2, 0],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        };
      case "searching":
      case "curious":
        return {
          rotate: [-4, 6, -4],
          x: [-2, 2, -2],
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        };
      case "thinking":
        return {
          y: [0, -2, 0],
          rotate: [0, 3, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        };
      case "pointing":
      case "proud":
        return {
          scale: [1, 1.04, 1],
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        };
      default: // idle, happy
        return {
          y: [0, -3, 0],
          transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
        };
    }
  };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      animate={getAnimation()}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="mushak-body" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8C6754" />
            <stop offset="1" stopColor="#5E3F32" />
          </linearGradient>
          <linearGradient id="mushak-belly" x1="35" y1="45" x2="65" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF2E2" />
            <stop offset="1" stopColor="#FFE0C3" />
          </linearGradient>
          <linearGradient id="mushak-ear" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F5BDB8" />
            <stop offset="1" stopColor="#E59993" />
          </linearGradient>
          <linearGradient id="mushak-pagdi" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F28E2B" />
            <stop offset="1" stopColor="#D95F02" />
          </linearGradient>
          <linearGradient id="mushak-modak" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFD15C" />
            <stop offset="1" stopColor="#E5A117" />
          </linearGradient>
        </defs>

        {/* ── TAIL ── */}
        <path
          d="M25 80 C 10 82, 5 65, 12 55 C 15 50, 18 53, 16 57 C 12 65, 16 75, 26 74"
          fill="#5E3F32"
        />

        {/* ── LEFT EAR ── */}
        <circle cx="28" cy="30" r="16" fill="url(#mushak-body)" />
        <circle cx="28" cy="30" r="10" fill="url(#mushak-ear)" opacity="0.9" />

        {/* ── RIGHT EAR ── */}
        <circle cx="72" cy="30" r="16" fill="url(#mushak-body)" />
        <circle cx="72" cy="30" r="10" fill="url(#mushak-ear)" opacity="0.9" />

        {/* ── MAIN BODY & HEAD ── */}
        <ellipse cx="50" cy="58" rx="30" ry="28" fill="url(#mushak-body)" />
        <ellipse cx="50" cy="65" rx="19" ry="17" fill="url(#mushak-belly)" />

        {/* ── FESTIVE PAGDI / TURBAN ── */}
        <g>
          {/* Turban folds */}
          <path
            d="M36 28 C 36 18, 64 18, 64 28 C 66 33, 34 33, 36 28 Z"
            fill="url(#mushak-pagdi)"
          />
          <path
            d="M38 23 C 44 14, 56 14, 62 23 C 60 27, 40 27, 38 23 Z"
            fill="#E9784F"
          />
          {/* Little gold brocade gem */}
          <circle cx="50" cy="24" r="3.5" fill="#FFD15C" stroke="#B8860B" strokeWidth="0.8" />
          <circle cx="50" cy="24" r="1.5" fill="#D92121" />
          {/* Tiny feather */}
          <path d="M50 20 C 51 14, 53 10, 56 8 C 54 13, 51 16, 50 20" fill="#FFD15C" />
        </g>

        {/* ── EYES ── */}
        {mood === "happy" || mood === "celebrating" ? (
          // Joyful crescent eyes
          <g stroke="#331E15" strokeWidth="2.5" strokeLinecap="round">
            <path d="M36 48 Q 41 43 46 48" />
            <path d="M54 48 Q 59 43 64 48" />
          </g>
        ) : mood === "warning" ? (
          // Alert wide eyes
          <g>
            <circle cx="41" cy="47" r="5.5" fill="#FFFFFF" stroke="#331E15" strokeWidth="1.5" />
            <circle cx="41" cy="47" r="3" fill="#331E15" />
            <circle cx="59" cy="47" r="5.5" fill="#FFFFFF" stroke="#331E15" strokeWidth="1.5" />
            <circle cx="59" cy="47" r="3" fill="#331E15" />
          </g>
        ) : (
          // Sparkling cute eyes
          <g>
            <circle cx="41" cy="47" r="4.5" fill="#331E15" />
            <circle cx="39.5" cy="45.5" r="1.5" fill="#FFFFFF" />
            <circle cx="59" cy="47" r="4.5" fill="#331E15" />
            <circle cx="57.5" cy="45.5" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* ── CHEEKS ── */}
        <circle cx="33" cy="54" r="4.5" fill="#F5BDB8" opacity="0.65" />
        <circle cx="67" cy="54" r="4.5" fill="#F5BDB8" opacity="0.65" />

        {/* ── SNOUT / NOSE / MOUTH ── */}
        <ellipse cx="50" cy="53" rx="4.5" ry="3.5" fill="#D9756C" />
        <path d="M50 56.5 L 50 60" stroke="#4A3028" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M45 60 Q 50 63.5 55 60"
          stroke="#4A3028"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── WHISKERS ── */}
        <g stroke="#5E3F32" strokeWidth="1" strokeLinecap="round" opacity="0.7">
          <line x1="33" y1="52" x2="20" y2="49" />
          <line x1="33" y1="55" x2="19" y2="56" />
          <line x1="67" y1="52" x2="80" y2="49" />
          <line x1="67" y1="55" x2="81" y2="56" />
        </g>

        {/* ── GOLDEN MODAK (IN HANDS) ── */}
        <g>
          {/* Hands */}
          <ellipse cx="40" cy="69" rx="3.5" ry="3" fill="#7A584A" />
          <ellipse cx="60" cy="69" rx="3.5" ry="3" fill="#7A584A" />
          {/* Modak */}
          <path
            d="M50 60 C 45 68, 44 73, 50 75 C 56 73, 55 68, 50 60 Z"
            fill="url(#mushak-modak)"
            stroke="#B8860B"
            strokeWidth="0.8"
          />
          {/* Modak pleats */}
          <path d="M50 63 L 50 74" stroke="#D99B00" strokeWidth="0.7" opacity="0.7" />
          <path d="M47 66 L 46 73" stroke="#D99B00" strokeWidth="0.6" opacity="0.7" />
          <path d="M53 66 L 54 73" stroke="#D99B00" strokeWidth="0.6" opacity="0.7" />
        </g>
      </svg>
    </motion.div>
  );
}
