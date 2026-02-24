import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeckCreateForm } from "./DeckCreateForm";

export default async function NewDeckPage(props: {
    searchParams?:
    | { created?: string; deckId?: string }
    | Promise<{ created?: string; deckId?: string }>;
}) {
    const sp = props.searchParams ? await Promise.resolve(props.searchParams) : {};

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();

    if (!auth.user) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">Create deck</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Please sign in to create decks.
                </p>
                <Link className="mt-4 inline-block underline" href="/login">
                    Sign in
                </Link>
            </div>
        );
    }

    const { data: games, error: gamesError } = await supa
        .from("games")
        .select("id,title")
        .order("created_at", { ascending: false });

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create deck</h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a game and name your deck.
                    </p>

                    {sp.created === "1" && (
                        <p className="mt-2 text-sm">
                            Deck created{sp.deckId ? ` (ID: ${sp.deckId})` : ""}.
                        </p>
                    )}
                </div>

                <Link className="underline" href="/studio/decks">
                    Back to decks
                </Link>
            </div>

            {gamesError ? (
                <div className="rounded border p-4 text-sm">
                    Could not load games. (Check games RLS / policies)
                </div>
            ) : !games || games.length === 0 ? (
                <div className="rounded border p-4 text-sm text-muted-foreground">
                    You don’t have any games yet. Create a game first, then you can create decks for it.
                    <div className="mt-3">
                        <Link className="underline" href="/studio/games/new">
                            Create a game
                        </Link>
                    </div>
                </div>
            ) : (
                <DeckCreateForm
                    games={games.map((g) => ({ id: g.id, title: g.title }))}
                />
            )}
        </div>
    );
}
