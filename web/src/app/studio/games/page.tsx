"use client"; // needed for React hooks & modals
import Link from "next/link";
import { createClient, updateGame } from "@/lib/supabase/server"; // import updateGame helper
import { redirect } from "next/navigation";
import { useState } from "react";

function formatDate(iso: string) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(d);
}

export default async function GamesList() {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect("/signin?next=/studio/games");

    // RLS filters to owner_id automatically; no need for .eq("owner_id", user.id)
    const { data: games, error } = await supa
        .from("games")
        .select("id,title,status,description,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <main className="mx-auto max-w-2xl p-6">
                <h1 className="text-2xl font-semibold">My Games</h1>
                <p className="mt-4">Error loading games.</p>
            </main>
        );
    }

    const list = games ?? [];

    // --- Client-side state for modals ---
    const [editGame, setEditGame] = useState<any>(null);
    const [archiveGame, setArchiveGame] = useState<any>(null);
    const [gameList, setGameList] = useState(list);

    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="flex items-baseline justify-between">
                <h1 className="text-2xl font-semibold">My Games</h1>
                <Link
                    href="/studio/games/new"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    + New Game
                </Link>
            </div>

            {gameList.length === 0 ? (
                <div className="mt-6 rounded border p-5">
                    <div className="font-medium">No games yet.</div>
                    <div className="mt-1 text-sm opacity-80">
                        Create your first game to start adding cards.
                    </div>
                    <Link
                        className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        href="/studio/games/new"
                    >
                        Create Game
                    </Link>
                </div>
            ) : (
                <ul className="mt-4 space-y-2">
                    {gameList.map((g) => (
                        <li key={g.id} className="rounded border border-gray-300 p-3 shadow-sm" style={{ boxShadow: '0 2px 8px 0 rgba(120,120,130,0.10), 0 1px 2px 0 rgba(120,120,130,0.08)' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="font-medium">{g.title}</div>
                                    <div className="mt-1 text-sm opacity-80">
                                        {g.status} · Created {formatDate(g.created_at)}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        className="rounded border border-gray-300 shadow-sm px-3 py-1 text-sm hover:bg-gray-50 transition"
                                        href={`/studio/games/${g.id}/cards`}
                                    >
                                        Open
                                    </Link>

                                    {/* Edit Button */}
                                    <button
                                        className="rounded border border-gray-300 shadow-sm px-3 py-1 text-sm hover:bg-gray-50 transition"
                                        onClick={() => setEditGame(g)}
                                    >
                                        Edit
                                    </button>

                                    {/* Archive Button */}
                                    <button
                                        className="rounded border border-gray-300 shadow-sm px-3 py-1 text-sm hover:bg-red-50 hover:text-red-700 transition"
                                        onClick={() => setArchiveGame(g)}
                                    >
                                        Archive
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* --- Edit Game Modal --- */}
            {editGame && (
                <EditGameModal
                    game={editGame}
                    onClose={() => setEditGame(null)}
                    onSave={async ({ title, description }) => {
                        await updateGame(editGame.id, { title, description });
                        setGameList(prev => prev.map(g => g.id === editGame.id ? { ...g, title, description } : g));
                        setEditGame(null);
                    }}
                />
            )}

            {/* --- Archive Game Modal --- */}
            {archiveGame && (
                <ArchiveConfirmModal
                    game={archiveGame}
                    onClose={() => setArchiveGame(null)}
                    onConfirm={async () => {
                        await updateGame(archiveGame.id, { status: "archived" });
                        setGameList(prev => prev.filter(g => g.id !== archiveGame.id));
                        setArchiveGame(null);
                    }}
                />
            )}
        </main>
    );
}

// --- Modal Components ---
function EditGameModal({ game, onClose, onSave }: any) {
    const [title, setTitle] = useState(game.title);
    const [description, setDescription] = useState(game.description || "");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-lg font-semibold">Edit Game</h2>
                <label className="block mt-4">
                    Title
                    <input
                        className="w-full border p-1 mt-1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>
                <label className="block mt-2">
                    Description
                    <textarea
                        className="w-full border p-1 mt-1"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-3 py-1 rounded border" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => onSave({ title, description })}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

function ArchiveConfirmModal({ game, onClose, onConfirm }: any) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-semibold">Archive Game?</h2>
                <p className="mt-2">
                    Are you sure you want to archive <strong>{game.title}</strong>? This keeps cards intact.
                </p>
                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-3 py-1 rounded border" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Archive
                    </button>
                </div>
            </div>
        </div>
    );
}
