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
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 transition"
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
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const fieldErr = (name: string) =>
        state.ok ? undefined : state.fieldErrors?.[name];

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    }

    const displayImage = previewUrl ?? card.image_url;

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="cardId" value={card.id} />
            <input type="hidden" name="current_image_url" value={card.image_url ?? ""} />

            {!state.ok && state.message ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {state.message}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">Name</span>
                    <input
                        name="name"
                        defaultValue={card.name ?? ""}
                        className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
                    />
                    {fieldErr("name") ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErr("name")}</p>
                    ) : null}
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Type</span>
                    <select
                        name="type"
                        defaultValue={card.type ?? "unit"}
                        className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
                    >
                        <option value="unit">Unit</option>
                        <option value="spell">Spell</option>
                        <option value="item">Item</option>
                    </select>
                    {fieldErr("type") ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErr("type")}</p>
                    ) : null}
                </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block">
                    <span className="text-sm font-medium">Cost</span>
                    <input
                        name="cost"
                        type="number"
                        inputMode="numeric"
                        defaultValue={card.cost ?? ""}
                        className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
                    />
                    {fieldErr("cost") ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErr("cost")}</p>
                    ) : null}
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Attack</span>
                    <input
                        name="attack"
                        type="number"
                        inputMode="numeric"
                        defaultValue={card.attack ?? ""}
                        className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
                    />
                    {fieldErr("attack") ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErr("attack")}</p>
                    ) : null}
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Defense</span>
                    <input
                        name="defense"
                        type="number"
                        inputMode="numeric"
                        defaultValue={card.defense ?? ""}
                        className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
                    />
                    {fieldErr("defense") ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErr("defense")}</p>
                    ) : null}
                </label>
            </div>

            <label className="block">
                <span className="text-sm font-medium">Rules text</span>
                <textarea
                    name="rules_text"
                    defaultValue={card.rules_text ?? ""}
                    rows={6}
                    className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
                />
                {fieldErr("rules_text") ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErr("rules_text")}</p>
                ) : null}
            </label>

            <div className="block space-y-2">
                <span className="text-sm font-medium">Image</span>
                {displayImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={displayImage}
                        alt="Card image preview"
                        className="max-w-xs rounded border"
                    />
                )}
                <input
                    name="image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                {fieldErr("image_file") ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErr("image_file")}</p>
                ) : null}
            </div>

            <div className="flex items-center gap-3">
                <SubmitButton />
                <a className="text-sm underline text-blue-600" href={`/studio/cards/${card.id}`}>
                    Cancel
                </a>
            </div>
        </form>
    );
}
