import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // next-on-pages を使う場合に推奨されることが多い
  },
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
