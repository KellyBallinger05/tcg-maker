import Link from "next/link";

export default function PlaytestPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Playtest</h1>
        <p className="mt-1 text-sm text-gray-500">Test your deck against an AI opponent.</p>
      </div>

      <div className="rounded border border-gray-300 shadow-sm p-5 space-y-2">
        <div className="font-medium">No deck selected</div>
        <p className="text-sm text-gray-500">
          Go to your decks, build or pick a deck, then click <strong>Playtest</strong> to start a game.
        </p>
        <Link
          href="/studio/decks"
          className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          Go to My Decks
        </Link>
      </div>
    </main>
  );
}
