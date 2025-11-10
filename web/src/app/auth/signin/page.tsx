"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignIn() {
    const supa = supabaseBrowser();
    return (
        <main className="mx-auto max-w-md p-6">
            <button
                className="rounded bg-blue-600 px-4 py-2 text-white"
                onClick={async () => {
                    const email = prompt("Enter email:"); if (!email) return;
                    await supabaseBrowser().auth.signInWithOtp({
                        email,
                        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                    });
                    alert("Check your email.");
                }}
            >Send Magic Link</button>
        </main>
    );
}
