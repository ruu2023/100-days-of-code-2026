"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BackToDashboardButton() {
	const pathname = usePathname();
	// ログインページとダッシュボードページでは非表示
	if (pathname === "/login" || pathname === "/dashboard" || pathname === "/") {
		return null;
	}

	return (
		<Link
			href="/dashboard"
			className="fixed top-4 left-4 z-50 px-3 py-1.5 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm rounded-md border border-border/40 hover:bg-background/80 hover:text-foreground transition-all duration-300 opacity-60 hover:opacity-100"
		>
			← Dashboard
		</Link>
	);
}
