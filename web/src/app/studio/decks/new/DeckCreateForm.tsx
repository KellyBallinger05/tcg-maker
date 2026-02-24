"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import type { CreateDeckState } from "./actions";
import { createDeckAction } from "./actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
        >
            {pending ? "Creating..." : "Create deck"}
        </button>
    );
}

export function DeckCreateForm({
    games,
}: {
    games: Array<{ id: string; title: string }>;
}) {
    const initialState: CreateDeckState = { ok: false, message: "" };
    const [state, formAction] = React.useActionState(createDeckAction, initialState);

    const fieldErr = (name: string) => (state.ok ? undefined : state.fieldErrors?.[name]);

    const defaultGameId = games[0]?.id ?? "";

    return (
        <form action={formAction} className="space-y-4 max-w-xl">
            {!state.ok && state.message ? (
                <div className="rounded border p-3 text-sm">{state.message}</div>
            ) : null}

            <div className="space-y-1">
                <label className="text-sm font-medium">Game</label>
                <select
                    name="gameId"
                    className="w-full rounded border px-3 py-2 text-sm"
                    defaultValue={defaultGameId}
                >
                    {games.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.title}
                        </option>
                    ))}
                </select>
                {fieldErr("gameId") ? (
                    <p className="text-xs text-red-600">{fieldErr("gameId")}</p>
                ) : null}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Deck name</label>
                <input
                    name="name"
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="My new deck"
                />
                {fieldErr("name") ? (
                    <p className="text-xs text-red-600">{fieldErr("name")}</p>
                ) : null}
            </div>

            <SubmitButton />
        </form>
    );
}
