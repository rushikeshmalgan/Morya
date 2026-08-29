"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "bappa-admin-secret";

type Tab = "pandals" | "photos";

interface PendingPandal {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string;
  address: string | null;
  status: string;
  submittedBy: string | null;
  isNew: boolean;
  isRare: boolean;
  createdAt: string;
  photos: { imageUrl: string }[];
  submitter?: { generatedName: string; generatedNumber: number };
}

interface PendingPhoto {
  id: string;
  imageUrl: string;
  moderationStatus: string;
  category: string;
  createdAt: string;
  user: { generatedName: string; generatedNumber: number };
  pandal: { name: string; city: string };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pandals");
  const [pendingPandals, setPendingPandals] = useState<PendingPandal[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [stats, setStats] = useState({ pendingPandals: 0, approvedPandals: 0, pendingPhotos: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPandal, setSelectedPandal] = useState<PendingPandal | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PendingPhoto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { "x-admin-token": ADMIN_TOKEN };

      const [pandalsRes, photosRes, statsRes] = await Promise.all([
        fetch("/api/admin/pandals?status=PENDING", { headers }),
        fetch("/api/admin/photos?moderationStatus=PENDING", { headers }),
        fetch("/api/admin/stats", { headers }),
      ]);

      if (pandalsRes.ok) {
        const data = await pandalsRes.json();
        setPendingPandals(data.pandals || []);
      }

      if (photosRes.ok) {
        const data = await photosRes.json();
        setPendingPhotos(data.photos || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprovePandal = async (pandalId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/pandals/${pandalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (res.ok) {
        setPendingPandals((prev) => prev.filter((p) => p.id !== pandalId));
        setSelectedPandal(null);
        setStats((s) => ({ ...s, pendingPandals: s.pendingPandals - 1, approvedPandals: s.approvedPandals + 1 }));
      }
    } catch {
      setError("Failed to approve pandal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPandal = async (pandalId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/pandals/${pandalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (res.ok) {
        setPendingPandals((prev) => prev.filter((p) => p.id !== pandalId));
        setSelectedPandal(null);
        setStats((s) => ({ ...s, pendingPandals: s.pendingPandals - 1 }));
      }
    } catch {
      setError("Failed to reject pandal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePhoto = async (photoId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ moderationStatus: "APPROVED" }),
      });

      if (res.ok) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSelectedPhoto(null);
        setStats((s) => ({ ...s, pendingPhotos: s.pendingPhotos - 1 }));
      }
    } catch {
      setError("Failed to approve photo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPhoto = async (photoId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ moderationStatus: "REJECTED" }),
      });

      if (res.ok) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSelectedPhoto(null);
        setStats((s) => ({ ...s, pendingPhotos: s.pendingPhotos - 1 }));
      }
    } catch {
      setError("Failed to reject photo");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mandala-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🐘</div>
          <p style={{ color: "var(--fog-gray)" }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mandala-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-12 pb-4 safe-top" style={{ background: "rgba(15,11,8,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🐘</span>
            <div>
              <h1 className="font-display font-bold text-xl" style={{ color: "var(--warm-cream)" }}>
                BAPPA MODE ADMIN
              </h1>
              <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                Internal Moderation Dashboard
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bappa-card p-3 text-center">
              <p className="text-xs font-bold" style={{ color: "var(--muted-gold)" }}>PENDING PANDAALS</p>
              <p className="text-2xl font-bold" style={{ color: "var(--saffron)" }}>{stats.pendingPandals}</p>
            </div>
            <div className="bappa-card p-3 text-center">
              <p className="text-xs font-bold" style={{ color: "var(--muted-gold)" }}>APPROVED PANDAALS</p>
              <p className="text-2xl font-bold" style={{ color: "#4ADE80" }}>{stats.approvedPandals}</p>
            </div>
            <div className="bappa-card p-3 text-center">
              <p className="text-xs font-bold" style={{ color: "var(--muted-gold)" }}>PENDING PHOTOS</p>
              <p className="text-2xl font-bold" style={{ color: "var(--saffron)" }}>{stats.pendingPhotos}</p>
            </div>
            <div className="bappa-card p-3 text-center">
              <p className="text-xs font-bold" style={{ color: "var(--muted-gold)" }}>TOTAL USERS</p>
              <p className="text-2xl font-bold" style={{ color: "var(--warm-cream)" }}>{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("pandals")}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={
                activeTab === "pandals"
                  ? { background: "var(--saffron)", color: "white" }
                  : { background: "var(--bg-card)", color: "var(--fog-gray)", border: "1px solid var(--border-cream)" }
              }
            >
              🐘 Pandals ({pendingPandals.length})
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={
                activeTab === "photos"
                  ? { background: "var(--saffron)", color: "white" }
                  : { background: "var(--bg-card)", color: "var(--fog-gray)", border: "1px solid var(--border-cream)" }
              }
            >
              📸 Photos ({pendingPhotos.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "rgba(204,34,0,0.1)", border: "1px solid rgba(204,34,0,0.3)", color: "var(--vermillion)" }}>
            {error}
          </div>
        )}

        {/* Pending Pandals */}
        {activeTab === "pandals" && (
          <>
            {pendingPandals.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
                  All Caught Up!
                </h3>
                <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
                  No pending pandals to review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPandals.map((pandal, i) => (
                  <motion.div
                    key={pandal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bappa-card p-4 cursor-pointer"
                    onClick={() => setSelectedPandal(pandal)}
                  >
                    <div className="flex gap-3">
                      {pandal.photos[0] && (
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                          <img src={pandal.photos[0].imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate" style={{ color: "var(--warm-cream)" }}>
                          {pandal.name}
                        </h3>
                        <p className="text-xs mt-1" style={{ color: "var(--fog-gray)" }}>
                          📍 {pandal.city}
                        </p>
                        {pandal.submitter && (
                          <p className="text-xs mt-1" style={{ color: "var(--fog-gray)" }}>
                            By: {pandal.submitter.generatedName} #{pandal.submitter.generatedNumber}
                          </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "var(--fog-gray)", opacity: 0.7 }}>
                          {new Date(pandal.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pending Photos */}
        {activeTab === "photos" && (
          <>
            {pendingPhotos.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
                  All Caught Up!
                </h3>
                <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
                  No pending photos to review.
                </p>
              </div>
            ) : (
              <div className="photo-grid">
                {pendingPhotos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="photo-card cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img src={photo.imageUrl} alt="" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-xs font-medium text-white truncate">{photo.pandal.name}</p>
                      <p className="text-[10px] text-white/70">
                        {photo.user.generatedName} #{photo.user.generatedNumber}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pandal Detail Modal */}
      <AnimatePresence>
        {selectedPandal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 max-h-[90dvh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-600 rounded-full mx-auto mb-4" />

              {selectedPandal.photos[0] && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={selectedPandal.photos[0].imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <h2 className="font-display font-bold text-xl mb-2" style={{ color: "var(--warm-cream)" }}>
                {selectedPandal.name}
              </h2>

              {selectedPandal.description && (
                <p className="text-sm mb-3" style={{ color: "var(--fog-gray)" }}>
                  {selectedPandal.description}
                </p>
              )}

              <div className="space-y-2 mb-5">
                <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
                  📍 {selectedPandal.city}
                </p>
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  Coordinates: {selectedPandal.latitude.toFixed(6)}, {selectedPandal.longitude.toFixed(6)}
                </p>
                {selectedPandal.address && (
                  <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                    Address: {selectedPandal.address}
                  </p>
                )}
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  Submitted: {new Date(selectedPandal.createdAt).toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--fog-gray)" }}>Status:</span>
                  <span className="bappa-pill">{selectedPandal.status}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprovePandal(selectedPandal.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  ✓ APPROVE
                </button>
                <button
                  onClick={() => handleRejectPandal(selectedPandal.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-secondary disabled:opacity-50"
                  style={{ borderColor: "var(--vermillion)", color: "var(--vermillion)" }}
                >
                  ✕ REJECT
                </button>
              </div>

              <button
                onClick={() => setSelectedPandal(null)}
                className="w-full mt-3 py-2 text-sm"
                style={{ color: "var(--fog-gray)" }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 max-h-[90dvh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-600 rounded-full mx-auto mb-4" />

              <div className="w-full aspect-square rounded-xl overflow-hidden mb-4">
                <img src={selectedPhoto.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>

              <h2 className="font-display font-bold text-lg mb-2" style={{ color: "var(--warm-cream)" }}>
                {selectedPhoto.pandal.name}
              </h2>

              <div className="space-y-2 mb-5">
                <p className="text-sm" style={{ color: "var(--fog-gray)" }}>
                  📍 {selectedPhoto.pandal.city}
                </p>
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  By: {selectedPhoto.user.generatedName} #{selectedPhoto.user.generatedNumber}
                </p>
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  Category: {selectedPhoto.category.replace(/_/g, " ")}
                </p>
                <p className="text-xs" style={{ color: "var(--fog-gray)" }}>
                  Submitted: {new Date(selectedPhoto.createdAt).toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--fog-gray)" }}>Status:</span>
                  <span className="bappa-pill">{selectedPhoto.moderationStatus}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprovePhoto(selectedPhoto.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  ✓ APPROVE
                </button>
                <button
                  onClick={() => handleRejectPhoto(selectedPhoto.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-secondary disabled:opacity-50"
                  style={{ borderColor: "var(--vermillion)", color: "var(--vermillion)" }}
                >
                  ✕ REJECT
                </button>
              </div>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full mt-3 py-2 text-sm"
                style={{ color: "var(--fog-gray)" }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
