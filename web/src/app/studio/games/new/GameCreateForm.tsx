"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createGame, type CreateGameState } from "./actions";

const initialState: CreateGameState = {};

export default function GameCreateForm() {
  const [state, formAction] = useActionState(createGame, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.message && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">Title</span>
        <input
          name="title"
          required
          aria-invalid={!!state.fieldErrors?.title}
          className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
        />
        {state.fieldErrors?.title && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.title}
          </p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Status</span>
        <select
          name="status"
          className="mt-1 w-full rounded border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 p-2 transition"
          defaultValue="draft"
          aria-invalid={!!state.fieldErrors?.status}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        {state.fieldErrors?.status && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.status}
          </p>
        )}
      </label>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Game"}
    </button>
  );
}