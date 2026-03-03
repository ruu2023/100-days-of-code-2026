import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run: standalone mode for minimal Docker image
  output: "standalone",
};

export default nextConfig;
