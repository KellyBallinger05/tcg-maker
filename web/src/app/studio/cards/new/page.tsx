import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardCreateForm from "./CardCreateForm";

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ gameId?: string }>;
}) {
  const { gameId } = await searchParams;

  const supa = await createClient();

  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) {
    redirect(
      `/signin?next=/studio/cards/new${
        gameId ? `?gameId=${encodeURIComponent(gameId)}` : ""
      }`
    );
  }

  const { data: games, error } = await supa
    .from("games")
    .select("id,title")
    .order("title", { ascending: true });

  if (error) {
    console.error("load games for card create error:", error);

    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          Games could not be loaded. Please refresh the page and try again.
        </div>
      </main>
    );
  }

  const safeGames = games ?? [];
  const defaultGameId =
    gameId && safeGames.some((g) => g.id === gameId) ? gameId : "";

  const invalidRequestedGame = Boolean(gameId && !defaultGameId);

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">New Card</h1>

      <CardCreateForm
        games={safeGames}
        defaultGameId={defaultGameId}
        invalidRequestedGame={invalidRequestedGame}
      />
    </main>
  );
}