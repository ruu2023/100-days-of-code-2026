"use client";

import dynamic from "next/dynamic";

// Canvas requires browser APIs → disable SSR
const DrawingApp = dynamic(() => import("@/app/day058/components/DrawingApp"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#f8f9fb]">
      <div className="font-mono text-[#8a92a3] text-sm tracking-widest animate-pulse">
        LOADING...
      </div>
    </div>
  ),
});

export default function Home() {
  return <DrawingApp />;
}
