export default function Loading() {
    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="flex items-baseline justify-between">
                <div>
                    <div className="h-4 w-28 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                    <div className="mt-2 h-7 w-64 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                </div>
                <div className="h-5 w-24 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="rounded border border-gray-300 p-3 shadow-sm bg-white">
                        <div className="h-5 w-40 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                        <div className="mt-2 h-4 w-32 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                        <div className="mt-3 h-4 w-24 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                    </li>
                ))}
            </ul>
        </main>
    );
}
