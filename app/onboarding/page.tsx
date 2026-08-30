"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOrCreateDeviceId, getStoredUser, saveUser } from "@/lib/store";

import MushakAvatar from "@/components/mushak/MushakAvatar";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "city" | "ready">("loading");
  const [city, setCity] = useState<string>("");
  const [suggestedCity, setSuggestedCity] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [identityRevealed, setIdentityRevealed] = useState(false);

  useEffect(() => {
    const existingUser = getStoredUser();
    if (existingUser?.sessionToken) {
      router.replace("/map");
      return;
    }

    const id = getOrCreateDeviceId();
    setDeviceId(id);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`/api/geocode/reverse?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
            const data = await res.json();
            if (data.city) {
              setSuggestedCity(data.city);
              setCity(data.city);
            }
          } catch {
            // ignore
          }
          setStep("city");
        },
        () => setStep("city"),
        { timeout: 5000 }
      );
    } else {
      setStep("city");
    }
  }, [router]);

  const handleCreateUser = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      saveUser({
        userId: data.userId,
        sessionToken: data.sessionToken,
        generatedName: data.generatedName,
        generatedNumber: data.generatedNumber,
        city: data.city,
        score: data.score,
        uniquePandals: data.uniquePandals,
      });

      if (city) {
        await fetch("/api/user/city", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": data.sessionToken,
          },
          body: JSON.stringify({ city }),
        });
      }

      router.push("/map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 mandala-bg">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 8, -8, 0],
            y: [0, -8, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-2"
        >
          <MushakAvatar mood="excited" size="xl" />
        </motion.div>
        <motion.p
          className="text-base font-semibold text-center"
          style={{ color: "var(--muted-brown)" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Mushak is summoning your Bappa identity...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 mandala-bg safe-top safe-bottom">
      {/* Hero Identity Card with Mushak Companion */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="w-full max-w-sm"
      >
        <div
          className="bappa-card p-6 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFF9F1 0%, #FFE8D2 100%)",
            border: "2px solid var(--border-gold)",
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-3 left-3 text-lg opacity-30">✨</div>
          <div className="absolute top-3 right-3 text-lg opacity-30">✨</div>
          <div className="absolute bottom-3 left-3 text-lg opacity-30">🪷</div>
          <div className="absolute bottom-3 right-3 text-lg opacity-30">🪷</div>

          <div className="flex justify-center items-center gap-3 mb-3">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 4, -4, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl"
            >
              🐘
            </motion.div>
            <div className="w-1 h-8 bg-amber-200/60 rounded-full" />
            <MushakAvatar mood="excited" size="lg" />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-1"
            style={{ color: "var(--warm-brown)" }}
          >
            BAPPA MODE
          </h1>

          {/* Mushak Speech Box */}
          <div
            className="p-3 rounded-2xl my-3 text-left flex items-start gap-2.5"
            style={{
              background: "rgba(255, 249, 241, 0.9)",
              border: "1px solid rgba(216, 169, 74, 0.35)",
            }}
          >
            <MushakAvatar mood="happy" size="xs" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--saffron-dark)" }}>
                MUSHAK MAHARAJ
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--warm-brown)" }}>
                &quot;Arre bhau! Bappa has sent us on a city-wide pandal hunt. Let&apos;s go discover!&quot;
              </p>
            </div>
          </div>

          <p
            className="text-xs mb-3 max-w-xs mx-auto leading-relaxed"
            style={{ color: "var(--muted-brown)" }}
          >
            Discover pandals across Maharashtra, earn XP & climb the leaderboard.
          </p>

          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold"
            style={{
              background: "linear-gradient(135deg, #FFE8D2, #FCE0DC)",
              border: "1.5px solid var(--saffron)",
              color: "var(--saffron-dark)",
            }}
          >
            <span>✨</span>
            <span>Ready for the Bappa Hunt?</span>
          </div>
        </div>
      </motion.div>

      {/* City Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {suggestedCity && (
          <div
            className="bappa-card p-5 mb-4"
            style={{
              background: "rgba(255, 249, 241, 0.95)",
              border: "1.5px solid var(--border-gold)",
            }}
          >
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--muted-brown)" }}>
              <span>📍</span> We detected you are in <strong style={{ color: "var(--warm-brown)" }}>{suggestedCity}</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCity(suggestedCity)}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
                style={
                  city === suggestedCity
                    ? { background: "linear-gradient(135deg, #E9784F, #E0673B)", color: "#FFFFFF", boxShadow: "var(--shadow-primary)" }
                    : { background: "var(--bg-card)", color: "var(--warm-brown)", border: "1px solid var(--border-cream)" }
                }
              >
                ✓ Yes, {suggestedCity}
              </button>
              <button
                onClick={() => setCity("")}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
                style={
                  city === ""
                    ? { background: "linear-gradient(135deg, #E9784F, #E0673B)", color: "#FFFFFF" }
                    : { background: "var(--bg-card)", color: "var(--warm-brown)", border: "1px solid var(--border-cream)" }
                }
              >
                Different City
              </button>
            </div>

            {city !== suggestedCity && (
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Mumbai, Satara..."
                  className="mt-3 w-full bappa-input text-sm"
                  autoFocus
                />
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {["Pune", "Mumbai", "Satara", "Nashik", "Nagpur"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: city === c ? "linear-gradient(135deg, #E9784F, #E0673B)" : "#FFE8D2",
                        color: city === c ? "#FFFFFF" : "var(--warm-brown)",
                        border: "1px solid var(--border-cream)",
                      }}
                    >
                      📍 {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!suggestedCity && (
          <div
            className="bappa-card p-5"
            style={{
              background: "rgba(255, 249, 241, 0.95)",
              border: "1.5px solid var(--border-gold)",
            }}
          >
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted-brown)" }}>
              📍 Select your city
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune, Mumbai, Satara, Nagpur..."
              className="w-full bappa-input text-sm"
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Pune", "Mumbai", "Satara", "Nashik", "Nagpur"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: city === c ? "linear-gradient(135deg, #E9784F, #E0673B)" : "#FFE8D2",
                    color: city === c ? "#FFFFFF" : "var(--warm-brown)",
                    border: "1px solid var(--border-cream)",
                  }}
                >
                  📍 {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {error && (
        <p className="text-xs text-center font-medium" style={{ color: "var(--vermillion)" }}>
          {error}
        </p>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCreateUser}
        disabled={loading || !city}
        className="w-full max-w-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base py-4"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              🐘
            </motion.span>
            Generating Identity...
          </span>
        ) : (
          "ENTER BAPPA MODE 🐘"
        )}
      </motion.button>

      <motion.p
        className="text-[10px] text-center max-w-xs"
        style={{ color: "var(--muted-brown)", opacity: 0.7 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        By continuing, you agree to explore responsibly and respect all pandal guidelines.
      </motion.p>
    </div>
  );
}
