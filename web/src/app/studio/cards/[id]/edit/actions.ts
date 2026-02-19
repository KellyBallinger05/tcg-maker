"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const intOrNull = z.preprocess((v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
}, z.number().int().nullable());

const UpdateCardSchema = z.object({
    cardId: z.string().min(1),

    name: z.string().min(1, "Name is required").max(80, "Name is too long"),
    type: z.string().min(1, "Type is required").max(30, "Type is too long"),

    cost: intOrNull,
    attack: intOrNull,
    defense: intOrNull,

    rules_text: z.string().max(2000, "Rules text is too long").optional().default(""),
    image_url: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || v.startsWith("http://") || v.startsWith("https://"), {
            message: "Image URL must start with http:// or https://",
        })
        .default(""),
});

export type UpdateCardState =
    | { ok: false; message: string; fieldErrors?: Record<string, string> }
    | { ok: true };

export async function updateCardAction(
    _prev: UpdateCardState,
    formData: FormData
): Promise<UpdateCardState> {
    const parsed = UpdateCardSchema.safeParse({
        cardId: formData.get("cardId"),

        name: formData.get("name"),
        type: formData.get("type"),

        cost: formData.get("cost"),
        attack: formData.get("attack"),
        defense: formData.get("defense"),

        rules_text: formData.get("rules_text"),
        image_url: formData.get("image_url"),
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

    const { cardId, name, type, cost, attack, defense, rules_text, image_url } =
        parsed.data;

    // Only update editable columns
    const { data, error } = await supa
        .from("cards")
        .update({
            name,
            type,
            cost,
            attack,
            defense,
            rules_text: rules_text || null,
            image_url: image_url || null,
        })
        .eq("id", cardId)
        .select("id")
        .single();

    if (error || !data) {
        return {
            ok: false,
            message: "Could not update card (not found or no access).",
        };
    }

    // Revalidate list + detail route (studio path!)
    revalidatePath("/studio/cards");
    revalidatePath(`/studio/cards/${cardId}`);

    // Redirect to the correct detail route (studio path!)
    redirect(`/studio/cards/${cardId}?updated=1`);
}
