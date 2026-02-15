import Client from "./client";

export default async function Home() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h1>Home</h1>
				<p>こちらの投稿は<br/>ログインが必要なアプリを集めています。</p>
				<p>Google アカウントにてログインしてください。</p>
				<div className="mt-4">
					<Client />
				</div>
			</div>
		</div>
	)
}