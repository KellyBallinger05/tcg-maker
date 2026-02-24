export default function Loading() {
    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="flex items-baseline justify-between">
                <div className="h-7 w-40 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                <div className="h-5 w-28 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
            </div>

            <ul className="mt-6 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="rounded border border-gray-300 p-3 shadow-sm bg-white">
                        <div className="h-5 w-56 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                        <div className="mt-2 h-4 w-48 rounded border border-gray-300 bg-gray-100 shadow-sm animate-pulse" />
                    </li>
                ))}
            </ul>
        </main>
    );
}
