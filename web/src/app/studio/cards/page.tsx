import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation"

export default async function CardsList() {
    const supa = await createClient();

    
    const { data: { user } } = await supa.auth.getUser();
    if (!user) {
        return <main className="p-6">Sign in first.</main>;
    }

    const { data: cards, error } = await supa
        .from("cards")
        .select("id, name, type, cost, attack, defense, rules_text, image_url, game_id, created_at")
        .order("created_at", { ascending: false });

    if (error) return <p className="text-red-600">Error: {error.message}</p>;

    return (
        <main className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">My Cards</h1>
                <Link
                    href="/studio/cards/new"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    + New Card
                </Link>
            </div>

            {!cards?.length ? (
                <>
                    <p>No cards yet.</p>
                    <Link href="/studio/cards/new" className="underline">Create your first card</Link>
                </>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c) => {
                        return (
                            <article
                                key={c.id}
                                className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                            >
                                <div className="h-52 w-full bg-gray-100 overflow-hidden relative">
                                    {c.image_url ? (
                                        <>
                                            <img
                                                src={c.image_url}
                                                alt={c.name}
                                                className="h-full w-full object-contain"
                                                loading="lazy"
                                            />
                                            {/* stats overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                                <div className="flex justify-between items-end text-white">
                                                    <div className="flex gap-3">
                                                        {/* cost */}
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xs opacity-80">Cost</span>
                                                            <span className="text-lg font-bold">{c.cost || 0}</span>
                                                        </div>
                                                        {/* attack */}
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xs opacity-80">ATK</span>
                                                            <span className="text-lg font-bold">{c.attack || 0}</span>
                                                        </div>
                                                        {/* defense */}
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xs opacity-80">DEF</span>
                                                            <span className="text-lg font-bold">{c.defense || 0}</span>
                                                        </div>
                                                    </div>
                                                    {/* type badge needs work */}
                                                    <span className="bg-white/20 backdrop-blur px-2 py-1 rounded text-xs uppercase">
                                                        {c.type || 'unit'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-gray-400">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-lg font-semibold">{c.name}</h2>
                                        <Link
                                            href={`/studio/cards/${c.id}`}
                                            className="text-sm underline opacity-80 transition group-hover:opacity-100"
                                        >
                                            Details
                                        </Link>
                                    </div>

                                    {c.rules_text ? (
                                        <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                                            {c.rules_text}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm italic text-gray-500">
                                            No rules/description provided.
                                        </p>
                                    )}

                                    <div className="mt-3 text-xs text-gray-500">
                                        Game:{" "}
                                        <Link className="underline" href={`/studio/games/${c.game_id}`}>
                                            {c.game_id}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}