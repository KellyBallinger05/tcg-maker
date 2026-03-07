import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlaytestClient from "@/components/PlaytestClient";

type CardRow = {
    id: string;
    name: string;
    type?: string | null;
    cost?: number | null;
    attack?: number | null;
    defense?: number | null;
};

type DeckCardRow = {
    card_id: string;
    qty: number;
};

type PlaytestCard = CardRow & {
    instanceId: string;
};

function shuffleDeck<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export default async function PlaytestDeckPage({
    params,
}: {
    params: Promise<{ deckId: string }>;
}) {
    const supa = await createClient();
    const { deckId } = await params;

    const { data: deck, error: deckError } = await supa
        .from("decks")
        .select("id,name")
        .eq("id", deckId)
        .maybeSingle();

    if (deckError || !deck) {
        return (
            <main className="p-6">
                <p>Deck not found. ID: {deckId}</p>
                <pre>{JSON.stringify(deckError, null, 2)}</pre>
            </main>
        );
    }

    const { data: deckCardRows, error: deckCardsError } = await supa
        .from("deck_cards")
        .select("card_id, qty")
        .eq("deck_id", deckId);

    if (deckCardsError) {
        console.error(deckCardsError);
        return <main className="p-6">Failed to load deck cards.</main>;
    }

    const cardIds = (deckCardRows ?? []).map((row: DeckCardRow) => row.card_id);

    const { data: cardsData, error: cardsError } = await supa
        .from("cards")
        .select("id,name,type,cost,attack,defense")
        .in("id", cardIds);

    if (cardsError) {
        return (
            <main className="p-6">
                <p>Failed to load card details.</p>
                <pre>{JSON.stringify(cardsError, null, 2)}</pre>
            </main>
        );
    }

    const cardMap = new Map((cardsData ?? []).map((card: CardRow) => [card.id, card]));

    const expandedDeck: PlaytestCard[] = (deckCardRows ?? []).flatMap(
        (row: DeckCardRow, rowIndex: number) => {
            const card = cardMap.get(row.card_id);
            if (!card) return [];

            return Array.from({ length: row.qty }, (_, copyIndex) => ({
                ...card,
                instanceId: `${card.id}-${rowIndex}-${copyIndex}`,
            }));
        }
    );

    if (expandedDeck.length === 0) {
        return <main className="p-6">This deck has no cards and cannot be playtested yet.</main>;
    }

    const shuffledDeck = shuffleDeck(expandedDeck);

    return <PlaytestClient initialDeck={shuffledDeck} deckName={deck.name} />;
}