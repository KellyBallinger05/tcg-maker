"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignOut() {
    const router = useRouter();
    useEffect(() => {
        supabaseBrowser().auth.signOut().finally(() => router.replace("/"));
    }, [router]);
    return <main className="p-6">Signing you out</main>;
}
