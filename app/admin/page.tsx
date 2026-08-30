"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "pandals" | "photos";

interface PendingPandal {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string;
  status: string;
  createdAt: string;
  photos: { imageUrl: string }[];
  submitter?: {
    id: string;
    generatedName: string;
    generatedNumber: number;
  } | null;
}

interface PendingPhoto {
  id: string;
  imageUrl: string;
  category: string;
  moderationStatus: string;
  createdAt: string;
  user: { generatedName: string; generatedNumber: number };
  pandal: { name: string; city: string };
}

interface AdminStats {
  pendingPandals: number;
  approvedPandals: number;
  pendingPhotos: number;
  totalUsers: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("pandals");
  const [pendingPandals, setPendingPandals] = useState<PendingPandal[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [stats, setStats] = useState<AdminStats>({ pendingPandals: 0, approvedPandals: 0, pendingPhotos: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedPandal, setSelectedPandal] = useState<PendingPandal | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PendingPhoto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setLoginError("");
      } else {
        const data = await res.json();
        setLoginError(data.error || "Invalid password");
      }
    } catch {
      setLoginError("Login failed");
    }
  };

  const proxyFetch = async (action: string, method = "GET", body?: Record<string, unknown>) => {
    const params = new URLSearchParams({ action });
    if (method === "GET" && body) {
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) params.set(key, String(value));
      }
    }
    const res = await fetch(`/api/admin/proxy?${params}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : body ? JSON.stringify(body) : undefined,
    });
    return res;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pandalsRes, photosRes] = await Promise.all([
        proxyFetch("stats"),
        proxyFetch("pandals", "GET", { status: "PENDING" }),
        proxyFetch("photos", "GET", { moderationStatus: "PENDING" }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (pandalsRes.ok) {
        const data = await pandalsRes.json();
        setPendingPandals(data.pandals || []);
      }

      if (photosRes.ok) {
        const data = await photosRes.json();
        setPendingPhotos(data.photos || []);
      }
    } catch {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const handleApprovePandal = async (pandalId: string) => {
    setActionLoading(true);
    try {
      const res = await proxyFetch("approve_pandal", "PATCH", { action: "approve_pandal", id: pandalId });
      if (res.ok) {
        setPendingPandals((prev) => prev.filter((p) => p.id !== pandalId));
        setSelectedPandal(null);
        setStats((s) => ({ ...s, pendingPandals: Math.max(0, s.pendingPandals - 1), approvedPandals: s.approvedPandals + 1 }));
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
      const res = await proxyFetch("reject_pandal", "PATCH", { action: "reject_pandal", id: pandalId });
      if (res.ok) {
        setPendingPandals((prev) => prev.filter((p) => p.id !== pandalId));
        setSelectedPandal(null);
        setStats((s) => ({ ...s, pendingPandals: Math.max(0, s.pendingPandals - 1) }));
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
      const res = await proxyFetch("approve_photo", "PATCH", { action: "approve_photo", id: photoId });
      if (res.ok) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSelectedPhoto(null);
        setStats((s) => ({ ...s, pendingPhotos: Math.max(0, s.pendingPhotos - 1) }));
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
      const res = await proxyFetch("reject_photo", "PATCH", { action: "reject_photo", id: photoId });
      if (res.ok) {
        setPendingPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setSelectedPhoto(null);
        setStats((s) => ({ ...s, pendingPhotos: Math.max(0, s.pendingPhotos - 1) }));
      }
    } catch {
      setError("Failed to reject photo");
    } finally {
      setActionLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen mandala-bg flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bappa-card p-6" style={{ background: "#FFF9F1" }}>
          <div className="text-center mb-6">
            <p className="text-4xl mb-3">🔒</p>
            <h1 className="font-display font-bold text-xl" style={{ color: "var(--warm-brown)" }}>
              ADMIN ACCESS
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted-brown)" }}>
              Internal Moderation Dashboard
            </p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="bappa-input mb-3 text-xs"
            autoFocus
          />
          {loginError && (
            <p className="text-xs mb-3 font-semibold" style={{ color: "var(--vermillion)" }}>{loginError}</p>
          )}
          <button type="submit" className="btn-primary w-full text-xs font-bold">
            ACCESS DASHBOARD
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen mandala-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🐘</div>
          <p className="text-xs font-bold" style={{ color: "var(--muted-brown)" }}>Loading moderation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mandala-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-10 pb-4 safe-top" style={{ background: "rgba(255,249,241,0.96)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🐘</span>
            <div>
              <h1 className="font-display font-bold text-xl" style={{ color: "var(--warm-brown)" }}>
                BAPPA MODE ADMIN
              </h1>
              <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
                Pandal & Photo Moderation
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bappa-card p-3 text-center" style={{ background: "#FFE8D2" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>PENDING PANDALS</p>
              <p className="text-xl font-bold" style={{ color: "var(--saffron-dark)" }}>{stats.pendingPandals}</p>
            </div>
            <div className="bappa-card p-3 text-center" style={{ background: "#FFE8D2" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>APPROVED PANDALS</p>
              <p className="text-xl font-bold" style={{ color: "var(--success)" }}>{stats.approvedPandals}</p>
            </div>
            <div className="bappa-card p-3 text-center" style={{ background: "#FFE8D2" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>PENDING PHOTOS</p>
              <p className="text-xl font-bold" style={{ color: "var(--saffron-dark)" }}>{stats.pendingPhotos}</p>
            </div>
            <div className="bappa-card p-3 text-center" style={{ background: "#FFE8D2" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-brown)" }}>TOTAL USERS</p>
              <p className="text-xl font-bold" style={{ color: "var(--warm-brown)" }}>{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-2xl bappa-card" style={{ background: "#FFF9F1" }}>
            <button
              onClick={() => setActiveTab("pandals")}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={
                activeTab === "pandals"
                  ? { background: "linear-gradient(135deg, #E9784F, #E0673B)", color: "white" }
                  : { color: "var(--muted-brown)" }
              }
            >
              🐘 Pandals ({pendingPandals.length})
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={
                activeTab === "photos"
                  ? { background: "linear-gradient(135deg, #E9784F, #E0673B)", color: "white" }
                  : { color: "var(--muted-brown)" }
              }
            >
              📸 Photos ({pendingPhotos.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "rgba(217,72,59,0.1)", border: "1px solid rgba(217,72,59,0.3)", color: "var(--vermillion)" }}>
            {error}
          </div>
        )}

        {/* Pending Pandals */}
        {activeTab === "pandals" && (
          <>
            {pendingPandals.length === 0 ? (
              <div className="text-center py-14 bappa-card p-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--warm-brown)" }}>
                  All Caught Up!
                </h3>
                <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
                  No pending pandals to review right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPandals.map((pandal, i) => (
                  <motion.div
                    key={pandal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bappa-card p-3.5 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedPandal(pandal)}
                  >
                    <div className="flex gap-3 items-center">
                      {pandal.photos[0] && (
                        <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: "#FFE8D2" }}>
                          <img src={pandal.photos[0].imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate" style={{ color: "var(--warm-brown)" }}>
                          {pandal.name}
                        </h3>
                        <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
                          📍 {pandal.city}
                        </p>
                        {pandal.submitter && (
                          <p className="text-[11px]" style={{ color: "var(--muted-brown)" }}>
                            By: {pandal.submitter.generatedName} #{pandal.submitter.generatedNumber}
                          </p>
                        )}
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
              <div className="text-center py-14 bappa-card p-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--warm-brown)" }}>
                  All Caught Up!
                </h3>
                <p className="text-xs" style={{ color: "var(--muted-brown)" }}>
                  No pending photos to review right now.
                </p>
              </div>
            ) : (
              <div className="photo-grid">
                {pendingPhotos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="photo-card cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img src={photo.imageUrl} alt="" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2.5 text-white">
                      <p className="text-xs font-bold truncate">{photo.pandal.name}</p>
                      <p className="text-[10px] opacity-80 truncate">
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
            className="bottom-sheet-overlay flex items-end justify-center"
            onClick={() => setSelectedPandal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="bottom-sheet"
              style={{ paddingBottom: "32px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bottom-sheet-handle" />

              {selectedPandal.photos[0] && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm" style={{ background: "#FFE8D2" }}>
                  <img src={selectedPandal.photos[0].imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--warm-brown)" }}>
                {selectedPandal.name}
              </h2>

              {selectedPandal.description && (
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--muted-brown)" }}>
                  {selectedPandal.description}
                </p>
              )}

              <div className="space-y-1.5 mb-5 text-xs" style={{ color: "var(--muted-brown)" }}>
                <p>📍 City: <strong style={{ color: "var(--warm-brown)" }}>{selectedPandal.city}</strong></p>
                <p>Coordinates: {selectedPandal.latitude.toFixed(6)}, {selectedPandal.longitude.toFixed(6)}</p>
                {selectedPandal.submitter && (
                  <p>Submitted By: {selectedPandal.submitter.generatedName} #{selectedPandal.submitter.generatedNumber}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprovePandal(selectedPandal.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-primary text-xs font-bold disabled:opacity-50"
                >
                  ✓ APPROVE PANDAL
                </button>
                <button
                  onClick={() => handleRejectPandal(selectedPandal.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-secondary text-xs font-bold disabled:opacity-50"
                  style={{ color: "var(--vermillion)", borderColor: "var(--vermillion)" }}
                >
                  ✕ REJECT
                </button>
              </div>
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
            className="bottom-sheet-overlay flex items-end justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="bottom-sheet"
              style={{ paddingBottom: "32px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bottom-sheet-handle" />

              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-sm" style={{ background: "#FFE8D2" }}>
                <img src={selectedPhoto.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>

              <h2 className="font-display font-bold text-lg mb-1" style={{ color: "var(--warm-brown)" }}>
                {selectedPhoto.pandal.name}
              </h2>
              <p className="text-xs mb-4" style={{ color: "var(--muted-brown)" }}>
                Submitted by {selectedPhoto.user.generatedName} #{selectedPhoto.user.generatedNumber}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprovePhoto(selectedPhoto.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-primary text-xs font-bold disabled:opacity-50"
                >
                  ✓ APPROVE PHOTO
                </button>
                <button
                  onClick={() => handleRejectPhoto(selectedPhoto.id)}
                  disabled={actionLoading}
                  className="flex-1 btn-secondary text-xs font-bold disabled:opacity-50"
                  style={{ color: "var(--vermillion)", borderColor: "var(--vermillion)" }}
                >
                  ✕ REJECT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
