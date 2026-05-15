import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">TCG Maker</h1>
        <p className="mt-1 text-sm text-gray-500">Build and playtest your own trading card games.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/studio/games"
          className="rounded border border-gray-300 shadow-sm p-4 hover:bg-gray-50 transition"
        >
          <div className="font-medium">My Studio</div>
          <p className="mt-1 text-sm text-gray-500">Create and manage your games, decks, and cards.</p>
        </Link>

        <Link
          href="/portal"
          className="rounded border border-gray-300 shadow-sm p-4 hover:bg-gray-50 transition"
        >
          <div className="font-medium">Portal</div>
          <p className="mt-1 text-sm text-gray-500">Browse games published by the community.</p>
        </Link>

        <Link
          href="/playtest"
          className="rounded border border-gray-300 shadow-sm p-4 hover:bg-gray-50 transition"
        >
          <div className="font-medium">Playtest vs AI</div>
          <p className="mt-1 text-sm text-gray-500">Test your deck against an AI opponent.</p>
        </Link>
      </div>
    </main>
  );
}
