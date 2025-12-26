import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {},
    serverMinification: true,
    serverSourceMaps: false,
    optimizePackageImports: ["lodash", "date-fns"],
  },
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
