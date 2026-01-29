import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function formatDate(iso: string) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(d);
}

export default async function GamesList() {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect("/signin?next=/studio/games");

    // RLS filters to owner_id automatically; no need for .eq("owner_id", user.id)
    const { data: games, error } = await supa
        .from("games")
        .select("id,title,status,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <main className="mx-auto max-w-2xl p-6">
                <h1 className="text-2xl font-semibold">My Games</h1>
                <p className="mt-4">Error loading games.</p>
            </main>
        );
    }

    const list = games ?? [];

    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="flex items-baseline justify-between">
                <h1 className="text-2xl font-semibold">My Games</h1>
                <Link className="underline" href="/studio/games/new">
                    + Create Game
                </Link>
            </div>

            {list.length === 0 ? (
                <div className="mt-6 rounded border p-5">
                    <div className="font-medium">No games yet.</div>
                    <div className="mt-1 text-sm opacity-80">
                        Create your first game to start adding cards.
                    </div>
                    <Link
                        className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        href="/studio/games/new"
                    >
                        Create Game
                    </Link>
                </div>
            ) : (
                <ul className="mt-4 space-y-2">
                    {list.map((g) => (
                        <li key={g.id} className="rounded border p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="font-medium">{g.title}</div>
                                    <div className="mt-1 text-sm opacity-80">
                                        {g.status} · Created {formatDate(g.created_at)}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                                        href={`/studio/games/${g.id}/cards`}
                                    >
                                        Open
                                    </Link>
                                    <Link
                                        className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                                        href={`/studio/games/${g.id}/cards`}
                                    >
                                        Cards
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
