import Link from "next/link";

export default function PlaytestPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Playtest</h1>
      <p>Select a deck from the Decks page to start playtesting.</p>
      <Link href="/studio/decks" className="underline">
        Go to Decks
      </Link>
    </main>
  );
}