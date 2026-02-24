"use client";

import { useTurnLogDemoStore } from "@/lib/turnLogDemo/store";

export function TurnControls() {
    const turn = useTurnLogDemoStore((s) => s.turn);
    const activePlayer = useTurnLogDemoStore((s) => s.activePlayer);

    const endTurn = useTurnLogDemoStore((s) => s.endTurn);
    const reset = useTurnLogDemoStore((s) => s.reset);
    const demoDrawCard = useTurnLogDemoStore((s) => s.demoDrawCard);
    const demoPlayCard = useTurnLogDemoStore((s) => s.demoPlayCard);

    return (
        <div className="rounded border p-3 flex items-center justify-between gap-4">
            <div className="text-sm">
                <div className="font-medium">Turn {turn}</div>
                <div className="text-xs text-muted-foreground">Active: {activePlayer}</div>
            </div>

            <div className="flex items-center gap-2">
                <button className="rounded border px-3 py-2 text-sm" onClick={demoDrawCard}>
                    Demo: Draw
                </button>
                <button className="rounded border px-3 py-2 text-sm" onClick={demoPlayCard}>
                    Demo: Play
                </button>
                <button className="rounded border px-3 py-2 text-sm" onClick={endTurn}>
                    End Turn
                </button>
                <button className="text-sm underline" onClick={reset}>
                    Reset
                </button>
            </div>
        </div>
    );
}
