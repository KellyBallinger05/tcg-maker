"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateCardState = {
  message?: string;
  fieldErrors?: {
    game_id?: string;
    name?: string;
    type?: string;
    cost?: string;
    attack?: string;
    defense?: string;
    image?: string;
  };
};

const allowedTypes = ["unit", "spell", "item"] as const;

function parseNonNegativeNumber(value: FormDataEntryValue | null) {
  const raw = value?.toString() ?? "0";
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export async function createCard(
  _prevState: CreateCardState,
  formData: FormData
): Promise<CreateCardState> {
  const supa = await createClient();

  const {
    data: { user },
  } = await supa.auth.getUser();

  const game_id = String(formData.get("game_id") || "");

  if (!user) {
    redirect(
      `/signin?next=/studio/cards/new${
        game_id ? `?gameId=${encodeURIComponent(game_id)}` : ""
      }`
    );
  }

  const userId = user.id;

  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "").trim() || "unit";
  const rules_text = String(formData.get("rules_text") || "").trim() || null;

  const cost = parseNonNegativeNumber(formData.get("cost"));
  const attack = parseNonNegativeNumber(formData.get("attack"));
  const defense = parseNonNegativeNumber(formData.get("defense"));

  const fieldErrors: CreateCardState["fieldErrors"] = {};

  if (!game_id) {
    fieldErrors.game_id = "Select a game before creating a card.";
  }

  if (!name) {
    fieldErrors.name = "Card name is required.";
  }

  if (!allowedTypes.includes(type as (typeof allowedTypes)[number])) {
    fieldErrors.type = "Choose a valid card type.";
  }

  if (cost === null) {
    fieldErrors.cost = "Cost must be 0 or greater.";
  }

  if (attack === null) {
    fieldErrors.attack = "Attack must be 0 or greater.";
  }

  if (defense === null) {
    fieldErrors.defense = "Defense must be 0 or greater.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  let image_url: string | null = null;
  const maybeFile = formData.get("image");
  const file = maybeFile instanceof File ? maybeFile : null;

  if (file && file.size > 0) {
    const key = `cards/${userId}/${crypto.randomUUID()}-${file.name}`;

    const { error: upErr } = await supa.storage
      .from("card-images")
      .upload(key, file, {
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (upErr) {
      console.error("card image upload error:", upErr);

      return {
        message: "Card image could not be uploaded. Please try a different image.",
        fieldErrors: {
          image: "Image upload failed.",
        },
      };
    }

    const { data: pub } = supa.storage.from("card-images").getPublicUrl(key);
    image_url = pub?.publicUrl ?? null;
  }

  const { error: dbErr } = await supa.from("cards").insert({
    game_id,
    created_by: userId,
    name,
    type,
    cost: cost ?? 0,
    attack: attack ?? 0,
    defense: defense ?? 0,
    rules_text,
    image_url,
  });

  if (dbErr) {
    console.error("card create error:", dbErr);

    return {
      message: "Card could not be created. Please check the fields and try again.",
    };
  }

  revalidatePath(`/studio/games/${game_id}/cards`);
  revalidatePath("/studio/games");
  redirect(`/studio/games/${game_id}/cards`);
}