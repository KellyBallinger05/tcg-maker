import { createClient } from "@/lib/supabase/server";
export default async function GamesList() {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return <main className="p-6">Sign in first.</main>;

    const { data: games } = await supa
        .from("games")
        .select("id,title,status,created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">My Games</h1>
            <a className="underline" href="/studio/games/new">+ Create Game</a>
            <ul className="mt-4 space-y-2">
                {(games ?? []).map(g => (
                    <li key={g.id} className="rounded border p-3">
                        <div className="font-medium">{g.title}</div>
                        <div className="text-sm text-gray-700">{g.status}</div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
