import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore TypeScript errors during build (we'll handle them separately)
    // Set to false if you want to fail builds on TypeScript errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
