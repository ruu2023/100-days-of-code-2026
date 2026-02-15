import { getServerAuth } from "@/lib/auth";
import { headers } from "next/headers";
import Client from "./client";
import { redirect } from "next/navigation";

export default async function Home() {
	const auth = await getServerAuth();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) return <div><h1>ログインしてください</h1><Client /></div>;

	return redirect("/dashboard");
}