"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CreateDeckSchema = z.object({
    gameId: z.string().uuid("Invalid game id"),
    name: z.string().trim().min(1, "Deck name is required").max(80, "Deck name is too long"),
});

export type CreateDeckState =
    | { ok: false; message: string; fieldErrors?: Record<string, string> }
    | { ok: true };

export async function createDeckAction(
    _prev: CreateDeckState,
    formData: FormData
): Promise<CreateDeckState> {
    const parsed = CreateDeckSchema.safeParse({
        gameId: formData.get("gameId"),
        name: formData.get("name"),
    });

    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
            const key = String(issue.path[0] ?? "form");
            fieldErrors[key] = issue.message;
        }
        return { ok: false, message: "Fix the highlighted fields.", fieldErrors };
    }

    const supa = await createClient();
    const { data: auth } = await supa.auth.getUser();
    if (!auth.user) return { ok: false, message: "You must be signed in." };

    const { gameId, name } = parsed.data;

    const { data, error } = await supa
        .from("decks")
        .insert({
            owner_id: auth.user.id,
            game_id: gameId,
            name,
        })
        .select("id")
        .single();

    if (error || !data) {
        return {
            ok: false,
            message: "Could not create deck (no access to game or invalid data).",
        };
    }

    revalidatePath("/studio/decks");
    redirect(`/studio/decks/new?created=1&deckId=${data.id}`);
}
