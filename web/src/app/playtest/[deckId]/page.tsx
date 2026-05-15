import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlaytestClient from "@/components/PlaytestClient";
import { validateDeckForPlaytest } from "@/lib/deckValidation";
import { notFound } from "next/navigation";

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

    if (deckError) {
        console.error(deckError);
        notFound();
    }

    if (!deck) {
        notFound();
    }

    const { data: deckCardRows, error: deckCardsError } = await supa
        .from("deck_cards")
        .select("card_id, qty")
        .eq("deck_id", deckId);

    if (deckCardsError) {
        console.error(deckCardsError);

        return (
            <main className="p-6">
                <h1 className="text-2xl font-bold">Failed to load deck cards</h1>
                <p className="mt-2 text-gray-600">
                    Something went wrong while loading this deck&apos;s cards.
                </p>
            </main>
        );
    }

    const deckRows = deckCardRows ?? [];
    const cardIds = deckRows.map((row: DeckCardRow) => row.card_id);

    let cardsData: CardRow[] = [];

    if (cardIds.length > 0) {
        const { data, error: cardsError } = await supa
            .from("cards")
            .select("id,name,type,cost,attack,defense")
            .in("id", cardIds);

        if (cardsError) {
            console.error(cardsError);

            return (
                <main className="p-6">
                    <h1 className="text-2xl font-bold">Failed to load card details</h1>
                    <p className="mt-2 text-gray-600">
                        Something went wrong while loading the cards in this deck.
                    </p>
                </main>
            );
        }

        cardsData = data ?? [];
    }

    const validation = validateDeckForPlaytest({
        deckCards: deckRows,
        cards: cardsData,
        minDeckSize: 1,
        maxDeckSize: 60,
    });

    if (!validation.valid) {
        return (
            <main className="mx-auto max-w-2xl p-6">
                <h1 className="text-2xl font-bold">Deck cannot be playtested</h1>

                <p className="mt-2 text-gray-600">
                    This deck has one or more problems that need to be fixed before a match can start.
                </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                    {validation.issues.map((issue, index) => (
                        <li key={`${issue.code}-${index}`}>{issue.message}</li>
                    ))}
                </ul>

                <a
                    href="/studio/decks"
                    className="mt-6 inline-block rounded-lg border px-4 py-2"
                >
                    Back to Decks
                </a>
            </main>
        );
    }

    const cardMap = new Map(cardsData.map((card: CardRow) => [card.id, card]));

    const expandedDeck: PlaytestCard[] = deckRows.flatMap(
        (row: DeckCardRow, rowIndex: number) => {
            const card = cardMap.get(row.card_id);

            if (!card) {
                return [];
            }

            return Array.from({ length: row.qty }, (_, copyIndex) => ({
                ...card,
                instanceId: `${card.id}-${rowIndex}-${copyIndex}`,
            }));
        }
    );

    const shuffledDeck = shuffleDeck(expandedDeck);

    return <PlaytestClient initialDeck={shuffledDeck} deckName={deck.name} />;
}