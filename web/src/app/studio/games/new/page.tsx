import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createGame(formData: FormData) {
    "use server";

    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect("/signin?next=/studio/games/new");

    const title = (formData.get("title")?.toString() ?? "").trim();
    const description = (formData.get("description")?.toString() ?? "").trim();
    const status = (formData.get("status")?.toString() ?? "draft") as "draft" | "published";

    // schema requires owner_id to satisfy RLS
    const { error } = await supa.from("games").insert({
        owner_id: user.id,
        title,
        description,
        status,
    });

    if (error) throw error;

    revalidatePath("/studio/games");
    redirect("/studio/games");
}

export default async function NewGame() {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect("/signin?next=/studio/games/new");

    return (
        <main className="mx-auto max-w-xl p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Create Game</h1>

            <form action={createGame} className="space-y-3">
                <label className="block">
                    <span className="text-sm font-medium">Title</span>
                    <input name="title" required className="mt-1 w-full rounded border p-2" />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Description</span>
                    <textarea name="description" rows={3} className="mt-1 w-full rounded border p-2" />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Status</span>
                    <select name="status" className="mt-1 w-full rounded border p-2" defaultValue="draft">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </label>

                <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Create Game
                </button>
            </form>
        </main>
    );
}
