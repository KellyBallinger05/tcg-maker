"use client";
import { useState } from "react";
import { simulateTurn } from "@/lib/engine";

export default function Playtest() {
    const [log, setLog] = useState<string[]>([]);
    return (
        <main className="mx-auto max-w-4xl p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Playtest vs AI (Hello World)</h1>

            <button
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2
                   text-white text-base font-medium shadow-sm
                   hover:bg-blue-700 disabled:opacity-50
                   focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-amber-500
                   focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => setLog((prev) => [...prev, simulateTurn()])}
            >
                Simulate Turn
            </button>

            <pre
                className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50
                   p-4 text-sm text-gray-800"
                aria-live="polite"
            >
                {log.length ? log.join("\n") : "No actions yet."}
            </pre>
        </main>
    );
}