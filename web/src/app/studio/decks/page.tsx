import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeckBuilderClient from "../../../components/DeckBuilderClient";
import { createClient } from "@/lib/supabase/server";


export default async function DecksPage() {
  const supa = await createClient();

  async function createDeck(formData: FormData) {
    "use server";

    const supa = await createClient();

    const name = String(formData.get("name") ?? "").trim();
    const gameId = String(formData.get("game_id") ?? "").trim();

    if (!name || !gameId) return;

    const { data } = await supa.auth.getUser();

    const userId = data?.user?.id ?? null;

    const { error } = await supa.from("decks").insert({
      name: name,
      game_id: gameId,
      user_id: userId,
    });

    if (error) {
      console.error("createDeck error:", error);
      return;
    }

    revalidatePath("/decks");
  }

  const { data: gamesData } = await supa
    .from("games")
    .select("id,title")
    .order("title", { ascending: true });

  const games = (gamesData ?? []).map((g: any) => ({
    id: g.id,
    title: g.title,
  }));

  const firstGameId = games[0]?.id ?? null;

  let initialCards: any[] = [];

  if (firstGameId) {
    const { data: cards } = await supa
      .from("cards")
      .select("id,name,type,cost,attack,defense")
      .eq("game_id", firstGameId)
      .order("created_at", { ascending: false });

    initialCards = (cards ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      cost: c.cost ?? 0,
      attack: c.attack ?? 0,
      defense: c.defense ?? 0,
    }));
  }

  const { data: decksData } = await supa
    .from("decks")
    .select(`
      id,
      name,
      game_id,
      created_at,
      games (
        title
      )
    `)
    .order("created_at", { ascending: false });

  const decks = decksData ?? [];

  return (
    <main className="p-6 space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Decks</h1>

      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">My Decks</h2>

        {decks.length === 0 ? (
          <p>No decks yet.</p>
        ) : (
          <div className="grid gap-4">
            {decks.map((deck: any) => {
              const gameTitle = Array.isArray(deck.games)
                ? deck.games[0]?.title
                : deck.games?.title;

              return (
                <div key={deck.id} className="border rounded p-4 space-y-2">
                  <h3 className="text-lg font-bold">{deck.name}</h3>
                  <p className="text-sm">Game: {gameTitle ?? "Unknown game"}</p>

                  <div className="flex gap-4">
                    <Link href={`/playtest/${deck.id}`} className="underline">
                      Playtest
                    </Link>

                    {/* <Link href={`/decks/${deck.id}`} className="underline">
                      View Deck
                    </Link> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <DeckBuilderClient
          title="Deck Builder"
          games={games}
          initialGameId={firstGameId}
          initialCards={initialCards}
        />
      </section>
    </main>
  );
}