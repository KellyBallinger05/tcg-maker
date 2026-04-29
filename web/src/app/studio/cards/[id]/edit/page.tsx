import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardEditForm } from "./CardEditForm";

export default async function CardEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();

    if (!auth.user) {
        return (
            <main className="mx-auto max-w-xl p-6 space-y-4">
                <h1 className="text-2xl font-semibold">Edit card</h1>
                <p className="text-sm text-gray-600">
                    Please sign in to edit cards.
                </p>
                <Link className="mt-4 inline-block text-blue-600 underline" href="/login">
                    Sign in
                </Link>
            </main>
        );
    }

    const { data: card, error } = await supa
        .from("cards")
        .select("id, name, type, cost, attack, defense, rules_text, image_url")
        .eq("id", id)
        .single();

    if (error || !card) notFound();

    return (
        <main className="mx-auto max-w-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit card</h1>
                    <p className="text-sm text-gray-600">ID: {card.id}</p>
                </div>
                <Link className="underline text-sm text-blue-600" href={`/studio/cards/${card.id}`}>
                    Back
                </Link>
            </div>

            <CardEditForm card={card} />
        </main>
    );
}
