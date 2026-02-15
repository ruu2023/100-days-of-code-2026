'use client'
import { createAuthClient } from "better-auth/react"

// baseURL は /api/auth に向くように設定
const authClient = createAuthClient({
    baseURL: "http://localhost:3000"
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