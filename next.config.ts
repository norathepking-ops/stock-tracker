import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.yimg.com" },
      { protocol: "https", hostname: "**.yahoo.com" },
      { protocol: "https", hostname: "s.yimg.com" },
      { protocol: "https", hostname: "media.zenfs.com" },
    ],
  },
};

export default nextConfig;
