"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Game = { id: string; title: string };
type Card = {
  id: string;
  name: string;
  type: string;
  cost: number;
  attack: number;
  defense: number;
  image_url?: string | null;
};

export default function DeckBuilderClient({
  games,
  initialGameId = null,
  initialCards = [],
  title = "Deck Builder",
}: {
  games: Game[];
  initialGameId?: string | null;
  initialCards?: Card[];
  title?: string;
}) {
  const [gameId, setGameId] = useState<string | null>(initialGameId ?? games[0]?.id ?? null);
  const [deckName, setDeckName] = useState("");
  const [selected, setSelected] = useState<Record<string, Card>>({});
  const [cards, setCards] = useState<Card[]>(initialCards ?? []);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [cardsCache, setCardsCache] = useState<Record<string, Card[]>>(() =>
    initialGameId ? { [initialGameId]: initialCards ?? [] } : {}
  );

  useEffect(() => {
    let mounted = true;
    if (!gameId) return;

    if (cardsCache[gameId]) {
      setCards(cardsCache[gameId]);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    const supa = supabaseBrowser();

    (async () => {
      try {
        const { data, error } = await supa
          .from("cards")
          .select("id,name,type,cost,attack,defense,image_url")
          .eq("game_id", gameId)
          .order("created_at", { ascending: false });

        if (!mounted) return;

        if (error || !data) {
          setCards([]);
        } else {
          const mapped = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            cost: d.cost ?? 0,
            attack: d.attack ?? 0,
            defense: d.defense ?? 0,
            image_url: d.image_url ?? null,
          }));
          setCards(mapped);
          setCardsCache((prev) => ({ ...prev, [gameId]: mapped }));
        }
      } catch {
        setCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [gameId, cardsCache, initialGameId, initialCards]);

  function toggleCard(card: Card) {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[card.id]) delete copy[card.id];
      else copy[card.id] = card;
      return copy;
    });
  }

  useEffect(() => {
    setSelected({});
  }, [gameId]);

  async function handleCreateDeck() {
    if (!gameId || Object.keys(selected).length === 0 || creating) return;

    const trimmedName = deckName.trim();
    if (!trimmedName) {
      alert("Please enter a deck name.");
      return;
    }

    setCreating(true);
    const supa = supabaseBrowser();

    try {
      const { data: userData, error: userError } = await supa.auth.getUser();
      if (userError || !userData?.user) {
        console.error("auth error:", userError);
        alert("You must be signed in to create a deck.");
        return;
      }

      const ownerId = userData.user.id;

      const { data: deckRow, error: deckError } = await supa
        .from("decks")
        .insert({
          name: trimmedName,
          game_id: gameId,
          owner_id: ownerId,
        })
        .select("id")
        .single();

      if (deckError || !deckRow) {
        console.error("deck create error:", deckError);
        alert("Error creating deck.");
        return;
      }

      const deckCardRows = Object.values(selected).map((card) => ({
        deck_id: deckRow.id,
        card_id: card.id,
        qty: 1,
      }));

      const { error: deckCardsError } = await supa.from("deck_cards").insert(deckCardRows);

      if (deckCardsError) {
        console.error("deck_cards error:", deckCardsError);
        alert("Deck was created, but saving selected cards failed.");
        return;
      }

      alert("Deck created successfully.");
      window.location.reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white font-semibold shadow hover:bg-green-700 transition disabled:opacity-50"
            disabled={Object.keys(selected).length === 0 || creating}
            onClick={handleCreateDeck}
            type="button"
          >
            {creating ? "Creating..." : `Create Deck (${Object.keys(selected).length})`}
          </button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <label className="block mb-2 font-medium">Deck Name</label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Enter deck name"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex gap-6">
        <section className="w-3/4">
          <label className="block mb-2 font-medium">Choose game</label>
          <select
            value={gameId ?? ""}
            onChange={(e) => setGameId(e.target.value)}
            className="mb-4 rounded border px-3 py-2"
          >
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>

          {loading ? (
            <div>Loading cards…</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => (
                <article
                  key={c.id}
                  className="group overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md"
                >
                  <div className="w-full bg-gray-100 overflow-hidden relative card-image-wrapper card-image-ratio max-h-44">
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2 z-40 w-5 h-5 accent-blue-600"
                      checked={!!selected[c.id]}
                      onChange={() => toggleCard(c)}
                    />

                    {c.image_url ? (
                      <>
                        <div
                          className="absolute inset-0 filter blur-sm scale-105"
                          style={{
                            backgroundImage: `url(${c.image_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="relative mx-auto h-full w-full object-contain z-20"
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="grid h-full w-full place-items-center card-no-image relative z-20">
                        No image
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-30">
                      <div className="flex justify-between items-end text-white">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-xs stat-label">Cost</span>
                            <span className="text-lg font-bold stat-outline">{c.cost || 0}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs stat-label">ATK</span>
                            <span className="text-lg font-bold stat-outline">{c.attack || 0}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs stat-label">DEF</span>
                            <span className="text-lg font-bold stat-outline">{c.defense || 0}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-white/20 text-black">
                          {(c.type || "unit").toString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold">{c.name}</h2>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="w-1/4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2">Selected Cards</h2>
          {Object.keys(selected).length === 0 ? (
            <div className="text-gray-500">No cards selected.</div>
          ) : (
            <div className="text-sm text-gray-800 whitespace-normal break-words">
              {Object.values(selected).map((c) => c.name).join(", ")}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}