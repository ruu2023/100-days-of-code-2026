'use client'
import { createAuthClient } from "better-auth/react"

// baseURL は /api/auth に向くように設定
const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_AUTH_URL
})

export default function Client() {
    const handleGoogleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard", // ログイン後の遷移先
        })
    }
    return <button onClick={handleGoogleLogin}>Googleでログイン</button>
}