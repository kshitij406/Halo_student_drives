import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    FIREBASE_API: process.env.FIREBASE_API,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
