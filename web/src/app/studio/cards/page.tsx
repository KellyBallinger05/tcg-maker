import Link from "next/link";
import Card from "@/components/Card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation"

export default async function CardsList() {
    const supa = await createClient();

    
    const { data: { user } } = await supa.auth.getUser();
    if (!user) {
        return <main className="p-6">Sign in first.</main>;
    }

    const { data: cards, error } = await supa
        .from("cards")
        .select("id, name, type, cost, attack, defense, rules_text, image_url, game_id, created_at")
        .order("created_at", { ascending: false });

    if (error) return <p className="text-red-600">Error: {error.message}</p>;

    return (
        <main className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">My Cards</h1>
                <Link
                    href="/studio/cards/new"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    + New Card
                </Link>
            </div>

            {!cards?.length ? (
                <>
                    <p>No cards yet.</p>
                    <Link href="/studio/cards/new" className="underline">Create your first card</Link>
                </>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c) => (
                        <Card key={c.id} card={c} detailsHref={`/studio/cards/${c.id}`} />
                    ))}
                </div>
            )}
        </main>
    );
}