import Link from "next/link";
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
            <main className="mx-auto max-w-4xl p-6 space-y-4">
                <h1 className="text-2xl font-semibold">Deck not found</h1>
                <div className="rounded border border-gray-300 shadow-sm p-5 space-y-2">
                    <p className="text-sm text-gray-500">
                        This deck doesn't exist or you don't have access to it.
                    </p>
                    <Link
                        href="/studio/decks"
                        className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                    >
                        Back to My Decks
                    </Link>
                </div>
            </main>
        );
    }

    const { data: deckCardRows, error: deckCardsError } = await supa
        .from("deck_cards")
        .select("card_id, qty")
        .eq("deck_id", deckId);

    if (deckCardsError) {
        console.error(deckCardsError);
        return (
            <main className="mx-auto max-w-4xl p-6 space-y-4">
                <h1 className="text-2xl font-semibold">Something went wrong</h1>
                <div className="rounded border border-gray-300 shadow-sm p-5 space-y-2">
                    <p className="text-sm text-gray-500">
                        We couldn't load the cards for <strong>{deck.name}</strong>. Try again or go back to your decks.
                    </p>
                    <Link
                        href="/studio/decks"
                        className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                    >
                        Back to My Decks
                    </Link>
                </div>
            </main>
        );
    }

    const cardIds = (deckCardRows ?? []).map((row: DeckCardRow) => row.card_id);

    const { data: cardsData, error: cardsError } = await supa
        .from("cards")
        .select("id,name,type,cost,attack,defense")
        .in("id", cardIds);

    if (cardsError) {
        console.error(cardsError);
        return (
            <main className="mx-auto max-w-4xl p-6 space-y-4">
                <h1 className="text-2xl font-semibold">Something went wrong</h1>
                <div className="rounded border border-gray-300 shadow-sm p-5 space-y-2">
                    <p className="text-sm text-gray-500">
                        We couldn't load the card details for <strong>{deck.name}</strong>. Try again or go back to your decks.
                    </p>
                    <Link
                        href="/studio/decks"
                        className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                    >
                        Back to My Decks
                    </Link>
                </div>
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
        return (
            <main className="mx-auto max-w-4xl p-6 space-y-4">
                <h1 className="text-2xl font-semibold">{deck.name}</h1>
                <div className="rounded border border-gray-300 shadow-sm p-5 space-y-2">
                    <div className="font-medium">This deck has no cards yet</div>
                    <p className="text-sm text-gray-500">
                        Add cards to this deck in the Deck Builder before playtesting.
                    </p>
                    <Link
                        href="/studio/decks"
                        className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                    >
                        Go to Deck Builder
                    </Link>
                </div>
            </main>
        );
    }

    const shuffledDeck = shuffleDeck(expandedDeck);

    return <PlaytestClient initialDeck={shuffledDeck} deckName={deck.name} />;
}