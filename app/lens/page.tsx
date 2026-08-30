"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BottomNav from "@/components/shared/BottomNav";

import MushakEmptyState from "@/components/mushak/MushakEmptyState";

interface Photo {
  id: string;
  imageUrl: string;
  likeCount: number;
  category: string;
  caption?: string;
  isPhotoOfDay?: boolean;
  isFeatured?: boolean;
  timestamp: string;
  user: { generatedName: string; generatedNumber: number };
  pandal: { name: string; city: string };
}

const CATEGORIES = [
  { key: "", label: "✨ All Moments" },
  { key: "BEST_BAPPA", label: "🐘 Best Bappa" },
  { key: "BEST_DECORATION", label: "🌸 Best Decoration" },
  { key: "BEST_VIBE", label: "🥁 Dhol & Vibe" },
  { key: "NIGHT_DARSHAN", label: "🌙 Night Darshan" },
  { key: "BEST_SHOT", label: "📸 Best Shot" },
];

export default function LensPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    fetch(`/api/photos?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const handleVote = async (photoId: string) => {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    const res = await fetch(`/api/photos/${photoId}/vote`, {
      method: "POST",
      headers: { "x-session-token": token },
    });
    const data = await res.json();

    if (data.voted) {
      setVotedIds((prev) => new Set(prev).add(photoId));
    } else {
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
    }

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, likeCount: data.voted ? p.likeCount + 1 : Math.max(0, p.likeCount - 1) }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen mandala-bg pb-24 safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "var(--saffron-dark)" }}>
              COMMUNITY FEED
            </span>
            <h1 className="text-2xl font-bold font-display tracking-tight" style={{ color: "var(--warm-brown)" }}>
              📸 BAPPA LENS
            </h1>
          </div>
          <span className="text-3xl">🌸</span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
          Moments captured by explorers from pandals across the city
        </p>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-4 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.key;
            return (
              <button
                key={cat.key || "all"}
                onClick={() => setCategory(cat.key)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  isSelected
                    ? {
                        background: "linear-gradient(135deg, #E9784F, #E0673B)",
                        color: "#FFFFFF",
                        boxShadow: "var(--shadow-primary)",
                      }
                    : {
                        background: "var(--bg-card)",
                        color: "var(--warm-brown)",
                        border: "1px solid var(--border-cream)",
                      }
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 max-w-md mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-2xl" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="py-12">
            <MushakEmptyState
              mood="curious"
              title="No Moments Shared Yet"
              description="Discover a pandal on the map and be the first to capture and share a Bappa moment!"
              actionText="🗺️ EXPLORE MAP"
              onAction={() => window.location.href = "/map"}
            />
          </div>
        ) : (
          <div className="photo-grid pt-2">
            {photos.map((photo, index) => {
              const isLiked = votedIds.has(photo.id);
              return (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="photo-card group"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.pandal?.name || "Bappa Moment"}
                    loading="lazy"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {photo.isPhotoOfDay && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-400 text-amber-950 shadow-md">
                        ✨ Photo of Day
                      </span>
                    )}
                    {photo.isFeatured && !photo.isPhotoOfDay && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-orange-400 text-white shadow-md">
                        🔥 Trending
                      </span>
                    )}
                  </div>

                  {/* Overlay on hover/mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                    <p className="text-xs font-bold leading-tight truncate drop-shadow-sm">
                      {photo.pandal?.name || "Bappa Darshan"}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="opacity-90 truncate max-w-[90px]">
                        {photo.user?.generatedName || "Explorer"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(photo.id);
                        }}
                        className="flex items-center gap-1 font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                      >
                        <span>{isLiked ? "❤️" : "🤍"}</span>
                        <span>{photo.likeCount}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="lens" />
    </div>
  );
}
