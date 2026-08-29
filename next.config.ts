import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from local uploads and external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Disable strict mode for Leaflet compatibility
  reactStrictMode: false,
};

export default nextConfig;
