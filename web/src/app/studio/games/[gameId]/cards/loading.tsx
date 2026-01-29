export default function Loading() {
    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="flex items-baseline justify-between">
                <div>
                    <div className="h-4 w-28 rounded border" />
                    <div className="mt-2 h-7 w-64 rounded border" />
                </div>
                <div className="h-5 w-24 rounded border" />
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="rounded border p-3">
                        <div className="h-5 w-40 rounded border" />
                        <div className="mt-2 h-4 w-32 rounded border" />
                        <div className="mt-3 h-4 w-24 rounded border" />
                    </li>
                ))}
            </ul>
        </main>
    );
}
