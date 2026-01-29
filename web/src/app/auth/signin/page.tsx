"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * read ?next= from the URL so middleware can send users back to the page they tried to access
 * only allow internal paths (avoid open redirect shenanigans)
 */
function getSafeNext() {
    const sp = new URLSearchParams(window.location.search);
    const next = sp.get("next");

    // match callback safety rules
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;

    // default landing page after login
    return "/studio/games";
}

export default function SignIn() {
    const supa = useMemo(() => supabaseBrowser(), []);
    const [loading, setLoading] = useState<"magic" | "github" | null>(null);

    async function sendMagicLink() {
        if (loading) return;

        const email = prompt("Enter email:");
        if (!email) return;

        setLoading("magic");

        const next = getSafeNext();

        // preserve where the user was trying to go (middleware sets ?next=...)
        const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

        const { error } = await supa.auth.signInWithOtp({
            email: email.trim(),
            options: { emailRedirectTo: redirectUrl },
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

        const next = getSafeNext();

        // same idea as magic link: don't hardcode /studio/games, send them back to intended page
        const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

        const { error } = await supa.auth.signInWithOAuth({
            provider: "github",
            options: { redirectTo: redirectUrl },
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
