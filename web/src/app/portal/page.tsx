import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Portal() {
    const supa = await createClient();
    const { data: games } = await supa
        .from("games")
        .select("id,title,description,created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    const list = games ?? [];

    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="text-2xl font-semibold">Portal</h1>
            <p className="mt-1 text-sm text-gray-500">Browse published games.</p>

            {list.length === 0 ? (
                <div className="mt-6 rounded border border-gray-300 shadow-sm p-5">
                    <div className="font-medium">No published games yet.</div>
                    <div className="mt-1 text-sm text-gray-500">
                        Games published from My Studio will appear here.
                    </div>
                </div>
            ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {list.map(g => (
                        <li key={g.id} className="rounded border border-gray-300 shadow-sm p-4">
                            <div className="font-medium">{g.title}</div>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{g.description}</p>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6">
                <Link
                    href="/studio/games"
                    className="rounded border border-gray-300 shadow-sm px-4 py-2 text-sm hover:bg-gray-50 transition"
                >
                    My Studio
                </Link>
            </div>
        </main>
    );
}
