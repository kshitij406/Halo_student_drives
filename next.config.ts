import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    FIREBASE_API: process.env.FIREBASE_API,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    dangerouslyAllowSVG: true, // ✅ allow base64 and inline SVGs
    remotePatterns: [], // You can add patterns here if needed later
  },
};

export default nextConfig;
