"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BappaLoader from "@/components/shared/BappaLoader";

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
    <BappaLoader
      message="Entering Bappa Sanctuary..."
      subMessage="Connecting to divine radar across the gallis"
      size="fullscreen"
    />
  );
}
