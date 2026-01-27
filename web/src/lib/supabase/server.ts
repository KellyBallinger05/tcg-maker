import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type SupaCookie = { name: string; value: string; options: CookieOptions };

export async function supabaseServerReadOnly() {
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
        cookies: {
            getAll() {
                return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
            },
            setAll() {
                // no-op: server components can't write cookies reliably
            },
        },
    });
}

export async function supabaseServerMutable() {
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
        cookies: {
            getAll() {
                return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
            },
            setAll(cookiesToSet: SupaCookie[]) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set({ name, value, ...options });
                });
            },
        },
    });
}

export const createClient = supabaseServerReadOnly;
export default createClient;
