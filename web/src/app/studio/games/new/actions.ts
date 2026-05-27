"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateGameState = {
  message?: string;
  fieldErrors?: {
    title?: string;
    status?: string;
  };
};

export async function createGame(
  _prevState: CreateGameState,
  formData: FormData
): Promise<CreateGameState> {
  const supa = await createClient();

  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) {
    redirect("/signin?next=/studio/games/new");
  }

  const title = (formData.get("title")?.toString() ?? "").trim();
  const description = (formData.get("description")?.toString() ?? "").trim();
  const rawStatus = formData.get("status")?.toString() ?? "draft";

  const fieldErrors: CreateGameState["fieldErrors"] = {};

  if (!title) {
    fieldErrors.title = "Game title is required.";
  }

  if (rawStatus !== "draft" && rawStatus !== "published") {
    fieldErrors.status = "Choose a valid game status.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const status = rawStatus as "draft" | "published";

  const { error } = await supa.from("games").insert({
    owner_id: user.id,
    title,
    description,
    status,
  });

  if (error) {
    console.error("create game error:", error);

    return {
      message: "Game could not be created. Please try again.",
    };
  }

  revalidatePath("/studio/games");
  redirect("/studio/games");
}