import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** safe for server components */
export async function supabaseServerReadOnly() {
    const cookieStore = await cookies(); 
    return createServerClient(url, anon, {
        cookies: {
            get: (name: string) => cookieStore.get(name)?.value,
            set: () => { },
            remove: () => { },
        },
    });
}

/** use ONLY in server actions / rroute hndlers (can write cookies), seems to be working now */
export async function supabaseServerMutable() {
    const cookieStore = await cookies(); 
    return createServerClient(url, anon, {
        cookies: {
            get: (name: string) => cookieStore.get(name)?.value,
            set: (name: string, value: string, options: any) => {
                cookieStore.set({ name, value, ...options });
            },
            remove: (name: string, options: any) => {
                cookieStore.set({ name, value: "", ...options });
            },
        },
    });
}

export const createClient = supabaseServerReadOnly;
export default createClient;
