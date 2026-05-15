import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeckBuilderClient from "../../../components/DeckBuilderClient";
import { createClient } from "@/lib/supabase/server";

export default async function DecksPage() {
  const supa = await createClient();

  const {
    data: { user },
  } = await supa.auth.getUser();

  const userId = user?.id ?? null;

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

    revalidatePath("/studio/decks");
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
      .select("id,name,type,cost,attack,defense,image_url")
      .eq("game_id", firstGameId)
      .order("created_at", { ascending: false });

    initialCards = (cards ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      cost: c.cost ?? 0,
      attack: c.attack ?? 0,
      defense: c.defense ?? 0,
      image_url: c.image_url ?? null,
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
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  const decks = decksData ?? [];

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">My Decks</h1>

        {decks.length === 0 ? (
          <div className="rounded border border-gray-300 shadow-sm p-5">
            <div className="font-medium">No decks yet.</div>
            <div className="mt-1 text-sm text-gray-500">Use the Deck Builder below to create your first deck.</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {decks.map((deck: any) => {
              const gameTitle = Array.isArray(deck.games)
                ? deck.games[0]?.title
                : deck.games?.title;

              return (
                <div key={deck.id} className="rounded border border-gray-300 shadow-sm p-4 space-y-2">
                  <h3 className="text-lg font-semibold">{deck.name}</h3>
                  <p className="text-sm text-gray-500">{gameTitle ?? "No game linked"}</p>

                  <div className="flex gap-3 pt-1">
                    <Link
                      href={`/playtest/${deck.id}`}
                      className="rounded border border-gray-300 shadow-sm px-3 py-1 text-sm hover:bg-gray-50 transition"
                    >
                      Playtest
                    </Link>
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