import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TurnLogDemo from "./TurnLogDemo";

export default async function TurnLogSandboxPage() {
    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();

    if (!auth.user) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">Turn Log Sandbox</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Please sign in to view this demo.
                </p>
                <Link className="mt-4 inline-block underline" href="/login">
                    Sign in
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Turn + Action Log Sandbox</h1>
                    <p className="text-sm text-muted-foreground">
                        Demo-only page. Not connected to the game engine state model.
                    </p>
                </div>
                <Link className="underline" href="/studio">
                    Back to Studio
                </Link>
            </div>

            <TurnLogDemo />
        </div>
    );
}
