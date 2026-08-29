"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "city" | "ready">("loading");
  const [city, setCity] = useState<string>("");
  const [suggestedCity, setSuggestedCity] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      router.push("/map");
      return;
    }

    const id = crypto.randomUUID();
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

      localStorage.setItem("sessionToken", data.sessionToken);
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
        <div className="text-6xl animate-bounce">🐘</div>
        <p className="text-lg font-medium" style={{ color: "var(--fog-gray)" }}>
          Detecting your location...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 mandala-bg">
      <div className="text-7xl">🐘</div>
      <h1 className="text-3xl font-bold text-center font-display">Bappa Mode</h1>
      <p className="text-center max-w-xs" style={{ color: "var(--fog-gray)" }}>
        Discover Ganpati pandals near you. Capture moments. Compete with friends.
      </p>

      {suggestedCity && (
        <div className="w-full max-w-sm bappa-card p-6">
          <p className="text-sm mb-3 flex items-center gap-2" style={{ color: "var(--fog-gray)" }}>
            <span>📍</span> Looks like you&apos;re in <strong style={{ color: "var(--warm-cream)" }}>{suggestedCity}</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCity(suggestedCity)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                city === suggestedCity
                  ? "text-white"
                  : ""
              }`}
              style={city === suggestedCity ? { background: "var(--saffron)" } : { background: "var(--bg-card)", color: "var(--warm-cream)", border: "1px solid var(--border-cream)" }}
            >
              Yep, {suggestedCity}
            </button>
            <button
              onClick={() => setCity("")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors`}
              style={city === "" ? { background: "var(--saffron)", color: "white" } : { background: "var(--bg-card)", color: "var(--warm-cream)", border: "1px solid var(--border-cream)" }}
            >
              Change
            </button>
          </div>

          {city && city !== suggestedCity && (
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              className="mt-3 w-full bappa-input"
            />
          )}
        </div>
      )}

      {!suggestedCity && (
        <div className="w-full max-w-sm">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter your city"
            className="w-full bappa-input"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-center" style={{ color: "var(--vermillion)" }}>{error}</p>
      )}

      <button
        onClick={handleCreateUser}
        disabled={loading || !city}
        className="w-full max-w-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating your identity..." : "Start Exploring 🐘"}
      </button>
    </div>
  );
}
