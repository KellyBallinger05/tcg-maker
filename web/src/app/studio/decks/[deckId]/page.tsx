import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function DeckDetailPage({ params }: PageProps) {
  const { deckId } = await params;
  const supa = await createClient();

  const { data: deck, error } = await supa
    .from("decks")
    .select("id,name")
    .eq("id", deckId)
    .single();

  if (error || !deck) {
    notFound();
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{deck.name}</h1>

      <div className="flex gap-4">
        <Link href={`/playtest/${deck.id}`} className="underline">
          Playtest
        </Link>
        <Link href="/studio/decks" className="underline">
          Back to Decks
        </Link>
      </div>
    </main>
  );
}