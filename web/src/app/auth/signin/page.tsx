"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignIn() {
    const supa = useMemo(() => supabaseBrowser(), []);
    const [loading, setLoading] = useState<"magic" | "github" | null>(null);

    async function sendMagicLink() {
        if (loading) return;

        const email = prompt("Enter email:");
        if (!email) return;

        setLoading("magic");

        const { error } = await supa.auth.signInWithOtp({
            email: email.trim(),
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                    "/studio/games"
                )}`,
            },
        });

        setLoading(null);

        if (error) {
            alert(
                error.status === 429
                    ? "Rate limited by Supabase (429). Use GitHub sign-in or wait for the email limit to reset."
                    : error.message
            );
            return;
        }

        alert("Magic link sent! Check your email.");
    }

    async function signInGithub() {
        if (loading) return;
        setLoading("github");

        const { error } = await supa.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                    "/studio/games"
                )}`,
            },
        });

        // if successful, it will redirect away and never reach here
        if (error) {
            setLoading(null);
            alert(error.message);
        }
    }

    return (
        <main className="mx-auto max-w-md p-6 space-y-3">
            <button
                className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                disabled={loading !== null}
                onClick={sendMagicLink}
            >
                {loading === "magic" ? "Sending..." : "Send Magic Link"}
            </button>

            <div className="text-center text-sm opacity-70">or</div>

            <button
                className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                disabled={loading !== null}
                onClick={signInGithub}
            >
                {loading === "github" ? "Redirecting..." : "Continue with GitHub"}
            </button>
        </main>
    );
}
