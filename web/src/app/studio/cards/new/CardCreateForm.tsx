"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCard, type CreateCardState } from "./actions";

type Game = {
  id: string;
  title: string | null;
};

const initialState: CreateCardState = {};

export default function CardCreateForm({
  games,
  defaultGameId,
  invalidRequestedGame,
}: {
  games: Game[];
  defaultGameId: string;
  invalidRequestedGame: boolean;
}) {
  const [state, formAction] = useActionState(createCard, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">Game</span>
        <select
          name="game_id"
          required
          className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
          defaultValue={defaultGameId}
          aria-invalid={!!state.fieldErrors?.game_id}
        >
          <option value="" disabled>
            Choose a game…
          </option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title ?? g.id}
            </option>
          ))}
        </select>

        {state.fieldErrors?.game_id && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.game_id}
          </p>
        )}

        {invalidRequestedGame && (
          <p className="mt-1 text-sm text-red-600">
            That game is not available to your account or no longer exists.
          </p>
        )}
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            required
            aria-invalid={!!state.fieldErrors?.name}
            className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.name}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            name="type"
            className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
            defaultValue="unit"
            aria-invalid={!!state.fieldErrors?.type}
          >
            <option value="unit">Unit</option>
            <option value="spell">Spell</option>
            <option value="item">Item</option>
          </select>
          {state.fieldErrors?.type && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.type}
            </p>
          )}
        </label>

        <NumberField
          name="cost"
          label="Cost"
          error={state.fieldErrors?.cost}
        />

        <NumberField
          name="attack"
          label="Attack"
          error={state.fieldErrors?.attack}
        />

        <NumberField
          name="defense"
          label="Defense"
          error={state.fieldErrors?.defense}
        />
      </div>

      <label className="block">
        <span className="text-sm font-medium">Rules / Description</span>
        <textarea
          name="rules_text"
          rows={4}
          className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
        />
      </label>

      <div className="block space-y-2">
        <span className="text-sm font-medium">Card Image</span>
        <input
          type="file"
          name="image"
          accept="image/*"
          aria-invalid={!!state.fieldErrors?.image}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        {state.fieldErrors?.image && (
          <p className="text-sm text-red-600">{state.fieldErrors.image}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

function NumberField({
  name,
  label,
  error,
}: {
  name: string;
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="number"
        name={name}
        min={0}
        defaultValue={0}
        aria-invalid={!!error}
        className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create"}
    </button>
  );
}