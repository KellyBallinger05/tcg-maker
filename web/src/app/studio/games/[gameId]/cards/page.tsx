import Link from "next/link";
import Card from "@/components/Card";
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
           .select("id,name,type,cost,attack,defense,created_at,image_url,rules_text")
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
        <main className="space-y-4">
            <div className="flex items-center justify-between">
                <Link
                    href="/studio/games"
                    className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition text-base"
                >
                    ← Back to My Games
                </Link>
                <h1 className="text-2xl font-semibold text-center flex-1">
                    {game.title}
                </h1>
                <Link
                    href={`/studio/cards/new?gameId=${encodeURIComponent(gameId)}`}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    + New Card
                </Link>
            </div>
            <div className="mb-10" />
            {list.length === 0 ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href={`/studio/cards/new?gameId=${encodeURIComponent(gameId)}`}
                        className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow duration-150 hover:shadow-md flex flex-col items-center justify-center min-h-44 max-h-44"
                    >
                        <span className="text-5xl text-gray-400 group-hover:text-blue-600 transition">+</span>
                        <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-600 transition">No cards yet. Create first card</span>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => (
                        <Card key={c.id} card={c} detailsHref={`/studio/cards/${c.id}`} />
                    ))}
                </div>
            )}
        </main>
    );
}
