import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addCardToDeckAction, removeCardFromDeckAction } from "./actions";

type DeckRow = {
    id: string;
    name: string;
    game_id: string;
    game?: { title: string | null } | { title: string | null }[] | null;
};

type DeckCardRow = {
    card?: {
        id: string;
        name: string | null;
        type: string | null;
        cost: number | null;
        attack: number | null;
        defense: number | null;
    } | null;
};

function normalizeGameTitle(deck: DeckRow) {
    const g = deck.game;
    if (!g) return null;
    return Array.isArray(g) ? g[0]?.title ?? null : g.title ?? null;
}

export default async function DeckBuilderPage(props: {
    params: { id: string } | Promise<{ id: string }>;
    searchParams?:
    | { added?: string; removed?: string; error?: string }
    | Promise<{ added?: string; removed?: string; error?: string }>;
}) {
    const { id: deckId } = await Promise.resolve(props.params);
    const sp = props.searchParams ? await Promise.resolve(props.searchParams) : {};

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();

    if (!auth.user) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">Deck Builder</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Please sign in to build decks.
                </p>
                <Link className="mt-4 inline-block underline" href="/login">
                    Sign in
                </Link>
            </div>
        );
    }

    // deck + game title (RLS ensures you can only see your deck)
    const { data: deck, error: deckErr } = await supa
        .from("decks")
        .select("id, name, game_id, game:games(title)")
        .eq("id", deckId)
        .single<DeckRow>();

    if (deckErr || !deck) notFound();

    // current deck contents (join deck_cards -> cards)
    const { data: deckCards } = await supa
        .from("deck_cards")
        .select("card:cards(id, name, type, cost, attack, defense)")
        .eq("deck_id", deckId)
        .returns<DeckCardRow[]>();

    const counts = new Map<string, number>();
    for (const row of deckCards ?? []) {
        const cid = row.card?.id;
        if (!cid) continue;
        counts.set(cid, (counts.get(cid) ?? 0) + 1);
    }

    // All cards available for this deck's game
    const { data: cards } = await supa
        .from("cards")
        .select("id, name, type, cost, attack, defense")
        .eq("game_id", deck.game_id)
        .order("created_at", { ascending: false });

    const gameTitle = normalizeGameTitle(deck);
    const totalCardsInDeck = (deckCards ?? []).length;

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">{deck.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        Game: {gameTitle ?? "—"} • Cards in deck:{" "}
                        <span className="font-medium">{totalCardsInDeck}</span>
                    </p>

                    {sp.added === "1" && <p className="mt-2 text-sm">Card added.</p>}
                    {sp.removed === "1" && <p className="mt-2 text-sm">Card removed.</p>}
                    {sp.error && (
                        <p className="mt-2 text-sm text-red-600">Action failed: {sp.error}</p>
                    )}
                </div>

                <Link className="underline" href="/studio/decks" prefetch={false}>
                    Back to decks
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* left: Deck contents */}
                <div className="rounded border p-4">
                    <h2 className="font-medium">Current deck</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        (This is just a verification builder, duplicates are allowed.)
                    </p>

                    {!deckCards?.length ? (
                        <div className="mt-3 text-sm text-muted-foreground">No cards added yet.</div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {Array.from(counts.entries()).map(([cardId, qty]) => {
                                const c = (cards ?? []).find((x) => x.id === cardId);
                                return (
                                    <div key={cardId} className="flex items-center justify-between rounded border p-2">
                                        <div className="text-sm">
                                            <div className="font-medium">{c?.name ?? "Card"}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Qty: {qty}
                                            </div>
                                        </div>

                                        <form action={removeCardFromDeckAction}>
                                            <input type="hidden" name="deckId" value={deckId} />
                                            <input type="hidden" name="cardId" value={cardId} />
                                            <button className="rounded border px-2 py-1 text-xs">
                                                Remove
                                            </button>
                                        </form>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* right: Available cards */}
                <div className="rounded border p-4">
                    <h2 className="font-medium">Available cards</h2>

                    {!cards?.length ? (
                        <div className="mt-3 text-sm text-muted-foreground">
                            No cards exist for this game yet.
                        </div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {cards.map((c) => {
                                const qty = counts.get(c.id) ?? 0;

                                return (
                                    <div key={c.id} className="flex items-center justify-between rounded border p-2">
                                        <div className="text-sm">
                                            <div className="font-medium">{c.name ?? "Untitled"}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {c.type ?? "—"} • Cost {c.cost ?? "—"} • ATK {c.attack ?? "—"} • DEF{" "}
                                                {c.defense ?? "—"}
                                            </div>
                                            {qty > 0 && (
                                                <div className="text-xs mt-1 text-muted-foreground">
                                                    In deck: {qty}
                                                </div>
                                            )}
                                        </div>

                                        <form action={addCardToDeckAction}>
                                            <input type="hidden" name="deckId" value={deckId} />
                                            <input type="hidden" name="cardId" value={c.id} />
                                            <button className="rounded border px-2 py-1 text-xs">
                                                Add
                                            </button>
                                        </form>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
