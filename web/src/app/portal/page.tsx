export default function Portal() {
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="text-2xl font-semibold">Portal: Demo Game</h1>
            <p className="mt-2 text-base text-gray-700">
                This is a placeholder portal listing.
            </p>

            <a
                href="/playtest"
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2
                   text-white text-base font-medium shadow-sm
                   hover:bg-blue-700 focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-amber-500
                   focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
                Playtest vs AI
            </a>
        </main>
    );
}
