import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PlaytestDeckSelectPage() {
  const supabase = await createClient();

  const { data: decks, error } = await supabase
    .from("decks")
    .select(`
      id,
      name,
      created_at,
      deck_cards (
        qty
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl font-bold">Choose a Deck</h1>
        <p className="mt-4 text-red-500">
          There was a problem loading your decks.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold">Choose a Deck to Playtest</h1>
        <p className="mt-2 text-gray-600">
          Select one of your saved decks below, then start playtest mode.
        </p>
      </section>

      {!decks || decks.length === 0 ? (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">No decks available</h2>
          <p className="mt-2 text-gray-600">
            You need to create a deck before entering playtest mode.
          </p>

          <Link
            href="/deck-builder"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Create a Deck
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {decks.map((deck) => {
            const cardCount =
              deck.deck_cards?.reduce(
                (total: number, card: { qty: number | null }) =>
                  total + (card.qty ?? 0),
                0
              ) ?? 0;

            return (
              <div
                key={deck.id}
                className="rounded-lg border bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold">{deck.name}</h2>

                <p className="mt-2 text-sm text-gray-600">
                  {cardCount} card{cardCount === 1 ? "" : "s"} in this deck
                </p>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/playtest/${deck.id}`}
                    className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                  >
                    Start Playtest
                  </Link>

                  <Link
                    href="/deck-builder"
                    className="rounded border px-4 py-2 font-medium hover:bg-gray-100"
                  >
                    Edit Decks
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}