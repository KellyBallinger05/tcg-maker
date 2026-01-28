import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CardsByGamePage({
    params,
}: {
    params: Promise<{ gameId: string }>;
}) {
    const { gameId } = await params; // ✅ unwrap params

    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect(`/signin?next=/studio/games/${gameId}/cards`);

    const { data: game } = await supa
        .from("games")
        .select("id,title")
        .eq("id", gameId)
        .maybeSingle();

    if (!game) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <p>Game not found.</p>
                <Link className="underline" href="/studio/games">
                    Back to My Games
                </Link>
            </main>
        );
    }

    const { data: cards, error } = await supa
        .from("cards")
        .select("id,name,type,cost,attack,defense,created_at")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="text-2xl font-semibold">{game.title} — Cards</h1>
                <p className="mt-4">Error loading cards.</p>
            </main>
        );
    }

    const list = cards ?? [];

    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="flex items-baseline justify-between">
                <div>
                    <Link className="underline text-sm" href="/studio/games">
                        ← Back to My Games
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">{game.title} — Cards</h1>
                </div>

                <Link className="underline" href={`/studio/cards/new?gameId=${encodeURIComponent(gameId)}`}>
                    + New Card
                </Link>
            </div>

            {list.length === 0 ? (
                <div className="mt-6 rounded border p-5">
                    <div className="font-medium">No cards yet.</div>
                    <div className="mt-1 text-sm opacity-80">Create your first card for this game.</div>
                </div>
            ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {list.map((c) => (
                        <li key={c.id} className="rounded border p-3">
                            <div className="font-medium">{c.name}</div>
                            <div className="mt-1 text-sm opacity-80">
                                {c.type ?? "—"} · Cost {c.cost ?? 0}
                            </div>
                            {(c.attack != null || c.defense != null) && (
                                <div className="mt-2 text-sm">
                                    ATK {c.attack ?? 0} · DEF {c.defense ?? 0}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
