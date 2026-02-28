"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
});

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    authClient.signOut().then(() => {
      router.replace("/");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      color: "rgba(248,250,252,0.5)",
      fontSize: "0.9rem",
    }}>
      ログアウト中...
    </div>
  );
}
