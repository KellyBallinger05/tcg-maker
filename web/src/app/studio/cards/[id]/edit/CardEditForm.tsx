"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import type { UpdateCardState } from "./actions";
import { updateCardAction } from "./actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
        >
            {pending ? "Saving..." : "Confirm changes"}
        </button>
    );
}

export function CardEditForm({
    card,
}: {
    card: {
        id: string;
        name: string | null;
        type: string | null;
        cost: number | null;
        attack: number | null;
        defense: number | null;
        rules_text: string | null;
        image_url: string | null;
    };
}) {
    const initialState: UpdateCardState = { ok: false, message: "" };

    const [state, formAction] = React.useActionState(updateCardAction, initialState);

    const fieldErr = (name: string) =>
        state.ok ? undefined : state.fieldErrors?.[name];

    return (
        <form action={formAction} className="space-y-4 max-w-xl">
            <input type="hidden" name="cardId" value={card.id} />

            {!state.ok && state.message ? (
                <div className="rounded border p-3 text-sm">{state.message}</div>
            ) : null}

            <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <input
                    name="name"
                    defaultValue={card.name ?? ""}
                    className="w-full rounded border px-3 py-2 text-sm"
                />
                {fieldErr("name") ? (
                    <p className="text-xs text-red-600">{fieldErr("name")}</p>
                ) : null}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Type</label>
                <input
                    name="type"
                    defaultValue={card.type ?? ""}
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="unit / spell / item"
                />
                {fieldErr("type") ? (
                    <p className="text-xs text-red-600">{fieldErr("type")}</p>
                ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Cost</label>
                    <input
                        name="cost"
                        type="number"
                        inputMode="numeric"
                        defaultValue={card.cost ?? ""}
                        className="w-full rounded border px-3 py-2 text-sm"
                    />
                    {fieldErr("cost") ? (
                        <p className="text-xs text-red-600">{fieldErr("cost")}</p>
                    ) : null}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Attack</label>
                    <input
                        name="attack"
                        type="number"
                        inputMode="numeric"
                        defaultValue={card.attack ?? ""}
                        className="w-full rounded border px-3 py-2 text-sm"
                    />
                    {fieldErr("attack") ? (
                        <p className="text-xs text-red-600">{fieldErr("attack")}</p>
                    ) : null}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Defense</label>
                    <input
                        name="defense"
                        type="number"
                        inputMode="numeric"
                        defaultValue={card.defense ?? ""}
                        className="w-full rounded border px-3 py-2 text-sm"
                    />
                    {fieldErr("defense") ? (
                        <p className="text-xs text-red-600">{fieldErr("defense")}</p>
                    ) : null}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Rules text</label>
                <textarea
                    name="rules_text"
                    defaultValue={card.rules_text ?? ""}
                    rows={6}
                    className="w-full rounded border px-3 py-2 text-sm"
                />
                {fieldErr("rules_text") ? (
                    <p className="text-xs text-red-600">{fieldErr("rules_text")}</p>
                ) : null}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Image URL</label>
                <input
                    name="image_url"
                    defaultValue={card.image_url ?? ""}
                    className="w-full rounded border px-3 py-2 text-sm"
                />
                {fieldErr("image_url") ? (
                    <p className="text-xs text-red-600">{fieldErr("image_url")}</p>
                ) : null}
            </div>

            <div className="flex items-center gap-3">
                <SubmitButton />
                <a className="text-sm underline" href={`/studio/cards/${card.id}`}>
                    Cancel
                </a>
            </div>
        </form>
    );
}
