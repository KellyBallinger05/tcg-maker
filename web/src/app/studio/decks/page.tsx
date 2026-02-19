export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DecksAutoRefresh from "./DecksAutoRefresh";


type DeckRow = {
    id: string;
    name: string;
    game_id: string;
    created_at: string | null;
    game?: {
        title: string | null;
        min_deck_size: number;
        max_deck_size: number;
    } | null;
};

export default async function DecksPage() {
    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();

    if (!auth.user) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">Decks</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Please sign in to view your decks.
                </p>
                <Link className="mt-4 inline-block underline" href="/login">
                    Sign in
                </Link>
            </div>
        );
    }

    const { data: decks, error } = await supa
        .from("decks")
        .select("id, name, game_id, created_at, game:games(title, min_deck_size, max_deck_size)")
        .order("created_at", { ascending: false })
        .returns<DeckRow[]>();

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Decks</h1>
                <div className="mt-4 rounded border p-4 text-sm">
                    Failed to load decks. (Check RLS policies)
                </div>
            </div>
        );
    }

    // count cards per deck (simple N+1 for now; ok for small lists)
    const withCounts = await Promise.all(
        (decks ?? []).map(async (d) => {
            const { count } = await supa
                .from("deck_cards")
                .select("id", { count: "exact", head: true })
                .eq("deck_id", d.id);

            const cardCount = count ?? 0;
            const min = d.game?.min_deck_size ?? 0;
            const max = d.game?.max_deck_size ?? 0;

            const status =
                cardCount < min ? "too_small" : cardCount > max ? "too_large" : "ok";

            return { ...d, cardCount, min, max, status };
        })
    );

    return (
        <div className="p-6 space-y-4">
            <DecksAutoRefresh />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Decks</h1>
                    <p className="text-sm text-muted-foreground">Your created decks.</p>
                </div>

                <Link className="rounded border px-3 py-2 text-sm" href="/studio/decks/new">
                    + New deck
                </Link>
            </div>

            {!withCounts.length ? (
                <div className="rounded border p-4 text-sm text-muted-foreground">
                    No decks yet. Click <span className="font-medium">New deck</span> to create one.
                </div>
            ) : (
                <div className="space-y-2">
                    {withCounts.map((d) => {
                        const warning =
                            d.status === "too_small"
                                ? `Needs ${d.min - d.cardCount} more card(s)`
                                : d.status === "too_large"
                                    ? `Remove ${d.cardCount - d.max} card(s)`
                                    : null;

                        return (
                            <div key={d.id} className="rounded border p-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="font-medium">{d.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Game: {d.game?.title ?? "—"}
                                        </div>
                                        <div className="mt-1 text-xs">
                                            Size: <span className="font-medium">{d.cardCount}</span>{" "}
                                            <span className="text-muted-foreground">
                                                (min {d.min} / max {d.max})
                                            </span>
                                        </div>
                                        {warning ? (
                                            <div className="mt-2 text-xs text-red-600">{warning}</div>
                                        ) : (
                                            <div className="mt-2 text-xs text-green-700">✅ Size valid</div>
                                        )}
                                    </div>

                                    <Link className="underline text-sm" href={`/studio/decks/${d.id}`}>
                                        Open builder
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
