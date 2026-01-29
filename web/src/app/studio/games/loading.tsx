export default function Loading() {
    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="flex items-baseline justify-between">
                <div className="h-7 w-40 rounded border" />
                <div className="h-5 w-28 rounded border" />
            </div>

            <ul className="mt-6 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="rounded border p-3">
                        <div className="h-5 w-56 rounded border" />
                        <div className="mt-2 h-4 w-48 rounded border" />
                    </li>
                ))}
            </ul>
        </main>
    );
}
