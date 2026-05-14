import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CardsByGamePage({
    params,
}: {
    params: Promise<{ gameId: string }>;
}) {
    const { gameId } = await params; 

    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect(`/auth/signin?next=/studio/games/${gameId}/cards`);

    const { data: game } = await supa
        .from("games")
        .select("id,title")
        .eq("id", gameId)
        .maybeSingle();

    if (!game) {
        return (
            <main className="mx-auto max-w-4xl p-6">
                <p>Game not found.</p>
                <Link className="underline" href="/studio/games">
                    Back to My Games
                </Link>
            </main>
        );
    }

    const { data: cards, error } = await supa
        .from("cards")
        .select("id,name,type,cost,attack,defense,created_at,image_url")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="text-2xl font-semibold">{game.title} — Cards</h1>
                <p className="mt-4">Error loading cards.</p>
            </main>
        );
    }

    const list = cards ?? [];

    return (
        <main className="mx-auto max-w-4xl p-6">
            <div className="flex items-baseline justify-between">
                <div>
                    <Link className="underline text-sm" href="/studio/games">
                        ← Back to My Games
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold">{game.title} — Cards</h1>
                </div>

                <Link
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                    href={`/studio/cards/new?gameId=${encodeURIComponent(gameId)}`}
                >
                    + New Card
                </Link>
            </div>

            {list.length === 0 ? (
                <div className="mt-6 rounded border border-gray-300 shadow-sm p-5">
                    <div className="font-medium">No cards yet.</div>
                    <div className="mt-1 text-sm text-gray-500">Create your first card for this game.</div>
                    <Link
                        className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                        href={`/studio/cards/new?gameId=${encodeURIComponent(gameId)}`}
                    >
                        Create Card
                    </Link>
                </div>
            ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => (
                        <li
                            key={c.id}
                            className="group overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md"
                        >
                            <div className="w-full bg-gray-100 overflow-hidden relative card-image-wrapper card-image-ratio max-h-44">
                                {c.image_url ? (
                                    <>
                                        <div
                                            className="absolute inset-0 filter blur-sm scale-105"
                                            style={{
                                                backgroundImage: `url(${c.image_url})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }}
                                        />
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={c.image_url}
                                            alt={c.name ?? "Card image"}
                                            className="relative mx-auto h-full w-full object-contain z-20"
                                            loading="lazy"
                                        />
                                    </>
                                ) : (
                                    <div className="grid h-full w-full place-items-center card-no-image relative z-20">
                                        No image
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-30">
                                    <div className="flex justify-between items-end text-white">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs stat-label">Cost</span>
                                                <span className="text-lg font-bold stat-outline">{c.cost || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs stat-label">ATK</span>
                                                <span className="text-lg font-bold stat-outline">{c.attack || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs stat-label">DEF</span>
                                                <span className="text-lg font-bold stat-outline">{c.defense || 0}</span>
                                            </div>
                                        </div>
                                        {(() => {
                                            const t = (c.type || "unit").toString().toLowerCase();
                                            const cls =
                                                t === "unit"  ? "bg-blue-600" :
                                                t === "spell" ? "bg-violet-600" :
                                                t === "item" || t === "equipment" ? "bg-amber-500" :
                                                "bg-white/30";
                                            return (
                                                <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider text-white ${cls}`}>
                                                    {t}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-lg font-semibold">{c.name}</h2>
                                </div>
                                <Link
                                    href={`/studio/cards/${c.id}/edit`}
                                    className="inline-block text-sm underline text-blue-600 mt-2"
                                >
                                    Edit
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
