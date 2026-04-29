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
    current_image_url: z.string().optional().default(""),
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
        current_image_url: formData.get("current_image_url"),
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

    const { cardId, name, type, cost, attack, defense, rules_text, current_image_url } =
        parsed.data;

    let image_url: string | null = current_image_url || null;

    const imageFile = formData.get("image_file");
    if (imageFile instanceof File && imageFile.size > 0) {
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${auth.user.id}/${cardId}.${ext}`;
        const { error: uploadError } = await supa.storage
            .from("card-images")
            .upload(path, imageFile, { contentType: imageFile.type, upsert: true });
        if (uploadError) {
            return { ok: false, message: `Image upload failed: ${uploadError.message}` };
        }
        const { data: urlData } = supa.storage.from("card-images").getPublicUrl(path);
        image_url = urlData.publicUrl;
    }

    const { data, error } = await supa
        .from("cards")
        .update({
            name,
            type,
            cost,
            attack,
            defense,
            rules_text: rules_text || null,
            image_url,
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

    revalidatePath("/studio/cards");
    revalidatePath(`/studio/cards/${cardId}`);
    redirect(`/studio/cards/${cardId}?updated=1`);
}
