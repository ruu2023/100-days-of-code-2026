import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Hono をビルド時に適切に処理させるための設定
  transpilePackages: ['hono'],
  // Cloudflare 用の環境設定
  experimental: {
    // next-on-pages を使う場合に推奨されることが多い
  },
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
