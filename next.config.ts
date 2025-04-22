import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    FIREBASE_API: process.env.FIREBASE_API,
  },
};

export default nextConfig;
