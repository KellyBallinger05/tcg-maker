import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** SERVER ACTION */
export async function createCard(formData: FormData) {
    "use server";

    const supa = await createClient();

    const { data: auth } = await supa.auth.getUser();
    const userId = auth.user?.id;

    const game_id = String(formData.get("game_id") || "");
    if (!userId) {
        redirect(`/signin?next=/studio/cards/new${game_id ? `?gameId=${encodeURIComponent(game_id)}` : ""}`);
    }

    const name = String(formData.get("name") || "").trim();
    const type = String(formData.get("type") || "").trim() || "unit";
    const cost = Number(formData.get("cost") || 0) || 0;
    const attack = Number(formData.get("attack") || 0) || 0;
    const defense = Number(formData.get("defense") || 0) || 0;
    const rules_text = String(formData.get("rules_text") || "").trim() || null;

    if (!game_id || !name) {
        throw new Error("Game and Name are required.");
    }

    // image upload (supabase storage)
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

        if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

        const { data: pub } = supa.storage.from("card-images").getPublicUrl(key);
        image_url = pub?.publicUrl ?? null;
    }

    // IMPORTANT: created_by must be set for cards RLS
    const { error: dbErr } = await supa.from("cards").insert({
        game_id,
        created_by: userId,
        name,
        type,
        cost,
        attack,
        defense,
        rules_text,
        image_url,
    });

    if (dbErr) throw new Error(`DB insert failed: ${dbErr.message}`);

    // refresh relevant pages + go back to the game's cards list
    revalidatePath(`/studio/games/${game_id}/cards`);
    revalidatePath("/studio/games");
    redirect(`/studio/games/${game_id}/cards`);
}

/** server comp */
export default async function NewCardPage({
    searchParams,
}: {
    searchParams: Promise<{ gameId?: string }>;
}) {
    const { gameId } = await searchParams;

    const supa = await createClient();
    const {
        data: { user },
    } = await supa.auth.getUser();

    if (!user) {
        redirect(`/signin?next=/studio/cards/new${gameId ? `?gameId=${encodeURIComponent(gameId)}` : ""}`);
    }

    // load games for dropdown (RLS will scope to owner)
    const { data: games, error } = await supa
        .from("games")
        .select("id,title")
        .order("title", { ascending: true });

    if (error) {
        return <main className="p-6">Failed to load games.</main>;
    }

    const safeGames = games ?? [];
    const defaultGameId =
        gameId && safeGames.some((g) => g.id === gameId) ? gameId : "";

    return (
        <main className="mx-auto max-w-xl p-6 space-y-6">
            <h1 className="text-2xl font-semibold">New Card</h1>

            <form action={createCard} className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium">Game</span>
                    <select
                        name="game_id"
                        required
                        className="mt-1 w-full rounded border p-2"
                        defaultValue={defaultGameId}
                    >
                        <option value="" disabled>
                            Choose a game…
                        </option>
                        {safeGames.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.title ?? g.id}
                            </option>
                        ))}
                    </select>
                    {gameId && !defaultGameId && (
                        <p className="mt-1 text-sm text-red-600">
                            That gameId isn’t available to your account (or doesn’t exist).
                        </p>
                    )}
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-sm font-medium">Name</span>
                        <input name="name" required className="mt-1 w-full rounded border p-2" />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium">Type</span>
                        <select name="type" className="mt-1 w-full rounded border p-2" defaultValue="unit">
                            <option value="unit">Unit</option>
                            <option value="spell">Spell</option>
                            <option value="item">Item</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium">Cost</span>
                        <input type="number" name="cost" min={0} defaultValue={0} className="mt-1 w-full rounded border p-2" />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium">Attack</span>
                        <input type="number" name="attack" min={0} defaultValue={0} className="mt-1 w-full rounded border p-2" />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium">Defense</span>
                        <input type="number" name="defense" min={0} defaultValue={0} className="mt-1 w-full rounded border p-2" />
                    </label>
                </div>

                <label className="block">
                    <span className="text-sm font-medium">Rules / Description</span>
                    <textarea name="rules_text" rows={4} className="mt-1 w-full rounded border p-2" />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Card Image</span>
                    <input type="file" name="image" accept="image/*" className="mt-1" />
                </label>

                <button className="rounded bg-blue-600 px-4 py-2 text-white">Create</button>
            </form>
        </main>
    );
}
