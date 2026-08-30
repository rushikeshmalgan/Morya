"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      router.replace("/map");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 mandala-bg">
      <div className="text-6xl animate-bounce">🐘</div>
      <p className="text-lg font-medium" style={{ color: "var(--fog-gray)" }}>
        Loading Bappa Mode...
      </p>
    </div>
  );
}
