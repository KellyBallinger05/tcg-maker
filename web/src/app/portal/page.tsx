import { createClient } from "@/lib/supabase/server";

export default async function Portal() {
    const supa = await createClient();
    const { data: games } = await supa
        .from("games")
        .select("id,title,description,created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="text-2xl font-semibold">Portal</h1>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {(games ?? []).map(g => (
                    <li key={g.id} className="rounded border p-4">
                        <div className="font-medium">{g.title}</div>
                        <p className="text-sm text-gray-700 line-clamp-2">{g.description}</p>
                    </li>
                ))}
            </ul>
            <div className="mt-6 text-sm">
                <a className="underline" href="/studio/games">My Studio</a>
            </div>
        </main>
    );
}
