import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // free plan allows 10 MB files
    },
  },
};

export default nextConfig;
