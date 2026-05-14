import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GameCreateForm from "./GameCreateForm";

export default async function NewGame() {
  const supa = await createClient();

  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) {
    redirect("/signin?next=/studio/games/new");
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create Game</h1>
      <GameCreateForm />
    </main>
  );
}