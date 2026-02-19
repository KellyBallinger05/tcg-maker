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
            <div className="p-6">
                <h1 className="text-xl font-semibold">Edit card</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Please sign in to edit cards.
                </p>
                <Link className="mt-4 inline-block underline" href="/login">
                    Sign in
                </Link>
            </div>
        );
    }

    const { data: card, error } = await supa
        .from("cards")
        .select("id, name, type, cost, attack, defense, rules_text, image_url")
        .eq("id", id)
        .single();

    if (error || !card) notFound();

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit card</h1>
                    <p className="text-xs text-muted-foreground">ID: {card.id}</p>
                </div>
                <Link className="underline" href={`/studio/cards/${card.id}`}>
                    Back
                </Link>
            </div>

            <CardEditForm card={card} />
        </div>
    );
}
