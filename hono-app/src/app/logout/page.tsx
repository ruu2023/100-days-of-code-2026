export const dynamic = "force-dynamic";


import { createAuthClient } from "better-auth/react"; // React用の場合
import { redirect } from 'next/navigation';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_AUTH_URL
});

const Page = async () => {
    await authClient.signOut();
    return redirect("/");
}

export default Page

