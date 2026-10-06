import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Phase 0: Unsplash seed images. Phase 1 adds Firebase Storage here.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
