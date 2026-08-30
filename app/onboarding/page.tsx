"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getOrCreateDeviceId, getStoredUser, saveUser } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "city" | "ready">("loading");
  const [city, setCity] = useState<string>("");
  const [suggestedCity, setSuggestedCity] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl mb-2"
        >
          🐘
        </motion.div>
        <p className="text-base font-semibold" style={{ color: "var(--muted-brown)" }}>
          Finding nearby celebrations...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-5 mandala-bg safe-top safe-bottom">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center"
      >
        <div className="text-7xl mb-3">🐘</div>
        <h1
          className="text-3xl sm:text-4xl font-bold font-display tracking-tight"
          style={{ color: "var(--warm-brown)" }}
        >
          BAPPA MODE
        </h1>
        <p className="text-sm mt-2 max-w-xs mx-auto leading-relaxed" style={{ color: "var(--muted-brown)" }}>
          Your city&apos;s biggest Bappa hunt. Discover pandals, capture festive moments & compete with friends.
        </p>
      </motion.div>

      {suggestedCity && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bappa-card p-5"
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
                  ? { background: "var(--saffron)", color: "#FFFFFF", boxShadow: "var(--shadow-primary)" }
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
                  ? { background: "var(--saffron)", color: "#FFFFFF" }
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
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: city === c ? "var(--saffron)" : "#FFE8D2",
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
      )}

      {!suggestedCity && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bappa-card p-5"
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
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: city === c ? "var(--saffron)" : "#FFE8D2",
                  color: city === c ? "#FFFFFF" : "var(--warm-brown)",
                  border: "1px solid var(--border-cream)",
                }}
              >
                📍 {c}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <p className="text-xs text-center font-medium" style={{ color: "var(--vermillion)" }}>
          {error}
        </p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCreateUser}
        disabled={loading || !city}
        className="w-full max-w-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-bold"
      >
        {loading ? "Generating Bappa Identity..." : "ENTER BAPPA MODE 🐘"}
      </motion.button>
    </div>
  );
}
