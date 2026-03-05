import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run: standalone mode for minimal Docker image
  output: "standalone",
  // Server Actions body size limit (for OCR image uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: "10MB",
    },
  },
};

export default nextConfig;
