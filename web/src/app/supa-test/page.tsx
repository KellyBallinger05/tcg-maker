import { createClient } from "@/lib/supabase/server";

export default async function STest() {
    const supa = await createClient();
    const { data, error } = await supa
        .from("health_checks")
        .select("id,note,created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <main className="mx-auto max-w-xl p-6">
            <h1 className="text-2xl font-semibold">Supabase wiring OK?</h1>
            {error && <pre className="text-red-600">{error.message}</pre>}
            <ul className="mt-4 space-y-2">
                {(data ?? []).map(r => (
                    <li key={r.id} className="rounded border p-2">
                        {r.note} <span className="text-xs text-gray-600">({new Date(r.created_at).toLocaleString()})</span>
                    </li>
                ))}
            </ul>
        </main>
    );
}
