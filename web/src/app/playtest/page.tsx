"use client";

import { useState } from "react";
import {
  createMatch,
  applyAction,
  MatchState,
  Phase,
  GameAction,
} from "@/lib/engine";

// Example decks for testing
const player1Deck = ["c1", "c1", "c1", "o1", "c1"];
const player2Deck = ["c1", "c1", "o1", "c1", "c1"];

export default function Playtest() {
  // Initialize match once
  const [match, setMatch] = useState<MatchState>(() =>
    createMatch(player1Deck, player2Deck, 12345)
  );
  const [log, setLog] = useState<string[]>([]);

  // Helper to dispatch action and update state
  function doAction(action: GameAction, description: string) {
    const newMatch = applyAction(match, action);
    setMatch(newMatch);
    setLog((prev) => [...prev, description]);

    if (newMatch.winner) {
      setLog((prev) => [...prev, `Winner: ${newMatch.winner}`]);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Playtest vs AI</h1>

      {/* Draw Card Button */}
      <button
        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2
                   text-white text-base font-medium shadow-sm
                   hover:bg-blue-700 disabled:opacity-50
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-amber-500
                   focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={() => doAction({ type: "DRAW_CARD" }, "Drew 1 card")}
      >
        Draw Card
      </button>

      {/* End Phase Button */}
      <button
        className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2
                   text-white text-base font-medium shadow-sm
                   hover:bg-green-700 disabled:opacity-50
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-amber-500
                   focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={() => doAction({ type: "END_PHASE" }, `Ended phase: ${match.phase}`)}
      >
        End Phase
      </button>

      <pre
        className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50
                   p-4 text-sm text-gray-800"
        aria-live="polite"
      >
        {log.length ? log.join("\n") : "No actions yet."}
      </pre>

      <pre
        className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50
                   p-4 text-sm text-gray-800"
      >
        {/* Debug: show match state */}
        {JSON.stringify(match, null, 2)}
      </pre>
    </main>
  );
}
