"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
    deckId: z.string().uuid(),
    cardId: z.string().uuid(),
});

export async function addCardToDeckAction(formData: FormData) {
    const parsed = Schema.safeParse({
        deckId: formData.get("deckId"),
        cardId: formData.get("cardId"),
    });
    if (!parsed.success) return;

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();
    if (!auth.user) redirect("/login");

    const { deckId, cardId } = parsed.data;

    // RLS will enforce permissions + same-game constraint (per policy)
    const { error } = await supa.from("deck_cards").insert({
        deck_id: deckId,
        card_id: cardId,
    });

    // if something fails under RLS, bounce back with a flag
    if (error) redirect(`/studio/decks/${deckId}?error=add_failed`);

    revalidatePath(`/studio/decks/${deckId}`);
    revalidatePath(`/studio/decks`);
    redirect(`/studio/decks/${deckId}?added=1`);
}

export async function removeCardFromDeckAction(formData: FormData) {
    const parsed = Schema.safeParse({
        deckId: formData.get("deckId"),
        cardId: formData.get("cardId"),
    });
    if (!parsed.success) return;

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();
    if (!auth.user) redirect("/login");

    const { deckId, cardId } = parsed.data;

    // simple remove: deletes ALL rows for that card in that deck
    // (good enough for verifying the deck is "real")
    const { error } = await supa
        .from("deck_cards")
        .delete()
        .eq("deck_id", deckId)
        .eq("card_id", cardId);

    if (error) redirect(`/studio/decks/${deckId}?error=remove_failed`);

    revalidatePath(`/studio/decks/${deckId}`);
    revalidatePath(`/studio/decks`);
    redirect(`/studio/decks/${deckId}?removed=1`);
}
