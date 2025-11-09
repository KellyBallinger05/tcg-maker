"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServerMutable } from "@/lib/supabase/server";

export async function createCard(formData: FormData) {
    const supa = await supabaseServerMutable();

    const { data: { user } } = await supa.auth.getUser();
    if (!user) throw new Error("Not signed in");

    // fields from the form (names must match your inputs)
    const name = String(formData.get("name") || "");
    const rules_text = String(formData.get("rules_text") || "");
    const game_id = Number(formData.get("game_id"));
    const file = formData.get("image") as File | null;

    // upload (card images bucket on supabase, single convention)
    let image_path: string | null = null;
    if (file && file.size > 0) {
        const key = `cards/${user.id}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadErr } = await supa.storage
            .from("card-images")
            .upload(key, file, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false,
            });
        if (uploadErr) throw uploadErr;
        image_path = key;
    }

    // DB insert
    const { error } = await supa.from("cards").insert({
        game_id,
        name,
        rules_text,
        image_path,
    });
    if (error) throw error;

    // refresh lists and bounce user
    revalidatePath("/studio/cards");
    revalidatePath(`/studio/games/${game_id}`);
    redirect(`/studio/games/${game_id}`);
}
