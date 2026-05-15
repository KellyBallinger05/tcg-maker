import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CardRow = {
    id: string;
    game_id: string;
    name: string | null;
    type: string | null;
    cost: number | null;
    attack: number | null;
    defense: number | null;
    rules_text: string | null;
    image_url: string | null;
    created_at: string | null;
};

export default async function CardDetailPage(props: {
    params: { id: string } | Promise<{ id: string }>;
    searchParams?: { updated?: string } | Promise<{ updated?: string }>;
}) {
    const { id } = await Promise.resolve(props.params);
    const sp = props.searchParams ? await Promise.resolve(props.searchParams) : {};

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();

    if (!auth.user) {
        redirect(`/auth/signin?next=/studio/cards/${id}`);
    }

    const { data: card, error } = await supa
        .from("cards")
        .select(
            "id, game_id, name, type, cost, attack, defense, rules_text, image_url, created_at"
        )
        .eq("id", id)
        .single<CardRow>();

    // under RLS, other users' cards SHOULD behave like "not found"
    if (error || !card) notFound();

    return (
        <div className="mx-auto max-w-4xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">{card.name ?? "Untitled card"}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {card.type ? card.type.charAt(0).toUpperCase() + card.type.slice(1) : "—"} • Cost: {card.cost ?? "—"}
                    </p>

                    {sp.updated === "1" && (
                        <p className="mt-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1.5 inline-block">
                            Card updated successfully.
                        </p>
                    )}
                </div>

                <Link
                    className="rounded border border-gray-300 shadow-sm px-3 py-1.5 text-sm hover:bg-gray-50 transition"
                    href={`/studio/cards/${card.id}/edit`}
                >
                    Edit
                </Link>
            </div>

            {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={card.image_url}
                    alt={card.name ?? "Card image"}
                    className="max-w-md rounded border"
                />
            ) : (
                <div className="text-sm text-gray-500">No image.</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded border border-gray-300 shadow-sm p-3">
                    <div className="text-xs text-gray-500">Cost</div>
                    <div className="text-lg font-semibold">{card.cost ?? "—"}</div>
                </div>
                <div className="rounded border border-gray-300 shadow-sm p-3">
                    <div className="text-xs text-gray-500">Attack</div>
                    <div className="text-lg font-semibold">{card.attack ?? "—"}</div>
                </div>
                <div className="rounded border border-gray-300 shadow-sm p-3">
                    <div className="text-xs text-gray-500">Defense</div>
                    <div className="text-lg font-semibold">{card.defense ?? "—"}</div>
                </div>
            </div>

            <div>
                <h2 className="font-medium">Rules Text</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                    {card.rules_text || "—"}
                </p>
            </div>

            <div className="text-xs text-gray-500">
                Created:{" "}
                {card.created_at ? new Date(card.created_at).toLocaleString() : "—"}
            </div>
        </div>
    );
}
