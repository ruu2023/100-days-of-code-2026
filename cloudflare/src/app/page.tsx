import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Client from "./client";

export default async function Home() {
	const { env } = getCloudflareContext();
	const { results } = await env.DB.prepare("SELECT * FROM posts").all();

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

				<Client />
			</main>
		</div>
	);
}
