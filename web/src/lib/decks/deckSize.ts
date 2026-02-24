import { createClient } from "@/lib/supabase/server";

export type DeckSizeStatus = "too_small" | "ok" | "too_large";

type GameEmbed = {
    title: string | null;
    min_deck_size: number | null;
    max_deck_size: number | null;
};

type DeckRow = {
    id: string;
    name: string;
    game_id: string;
    // Supabase embedding can be typed as object OR array depending on relationship typing
    game?: GameEmbed | GameEmbed[] | null;
};

function normalizeGame(game: DeckRow["game"]): GameEmbed | null {
    if (!game) return null;
    return Array.isArray(game) ? game[0] ?? null : game;
}

export async function getDeckSizeStatus(deckId: string): Promise<{
    ok: boolean;
    deckName?: string;
    gameId?: string;
    gameTitle?: string;
    min?: number;
    max?: number;
    count?: number;
    status?: DeckSizeStatus;
    message?: string;
}> {
    const supa = await createClient();

    // fetch deck + embedded game rules
    const { data: deck, error: deckErr } = await supa
        .from("decks")
        .select("id, name, game_id, game:games(title, min_deck_size, max_deck_size)")
        .eq("id", deckId)
        .maybeSingle<DeckRow>();

    if (deckErr || !deck) {
        return { ok: false, message: "Deck not found or no access." };
    }

    const game = normalizeGame(deck.game);

    // count cards in deck (one row per card copy in deck_cards)
    const { count, error: countErr } = await supa
        .from("deck_cards")
        .select("id", { count: "exact", head: true })
        .eq("deck_id", deckId);

    if (countErr) {
        return { ok: false, message: "Could not count deck cards." };
    }

    const cardCount = count ?? 0;

    // default to 0 to avoid crashing if any rules are miossing
    const min = game?.min_deck_size ?? 0;
    const max = game?.max_deck_size ?? 0;

    let status: DeckSizeStatus = "ok";
    if (cardCount < min) status = "too_small";
    if (cardCount > max) status = "too_large";

    return {
        ok: true,
        deckName: deck.name,
        gameId: deck.game_id,
        gameTitle: game?.title ?? undefined,
        min,
        max,
        count: cardCount,
        status,
    };
}
