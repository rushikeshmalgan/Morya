"use client";

import { useState, useEffect } from "react";

interface Photo {
  id: string;
  imageUrl: string;
  likeCount: number;
  category: string;
  timestamp: string;
  user: { generatedName: string; generatedNumber: number };
  pandal: { name: string; city: string };
}

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
      });
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
          ? { ...p, likeCount: data.voted ? p.likeCount + 1 : p.likeCount - 1 }
          : p
      )
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 mandala-bg">
        <div className="text-4xl animate-pulse">📸</div>
        <p style={{ color: "var(--fog-gray)" }}>Loading Bappa Lens...</p>
      </div>
    );
  }

  return (
    <div className="p-4 mandala-bg min-h-screen">
      <h1 className="text-2xl font-bold mb-1 font-display">📸 Bappa Lens</h1>
      <p className="text-sm mb-4" style={{ color: "var(--fog-gray)" }}>
        Community photos from pandals across India
      </p>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {["", "BEST_BAPPA", "BEST_DECORATION", "BEST_VIBE", "NIGHT_DARSHAN", "BEST_SHOT"].map((cat) => (
          <button
            key={cat || "all"}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              category === cat
                ? "text-white"
                : ""
            }`}
            style={category === cat ? { background: "var(--saffron)" } : { background: "var(--bg-card)", color: "var(--fog-gray)", border: "1px solid var(--border-cream)" }}
          >
            {cat || "All"}
          </button>
        ))}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📸</p>
          <p style={{ color: "var(--fog-gray)" }}>No photos yet. Be the first to upload!</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="photo-card"
            >
              <img
                src={photo.imageUrl}
                alt={photo.pandal.name}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-xs font-medium text-white truncate">{photo.pandal.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-white/70">
                    {photo.user.generatedName} #{photo.user.generatedNumber}
                  </span>
                  <button
                    onClick={() => handleVote(photo.id)}
                    className="text-xs"
                  >
                    {votedIds.has(photo.id) ? "❤️" : "🤍"} {photo.likeCount}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
