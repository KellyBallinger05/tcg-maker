"use client";

import { create } from "zustand";

export type Player = "P1" | "P2";
export type LogKind = "TURN" | "SYSTEM" | "PLAY";

export type ActionLogEntry = {
    id: string;
    ts: number;
    turn: number;
    player: Player;
    kind: LogKind;
    message: string;
};

type TurnLogDemoState = {
    turn: number;
    activePlayer: Player;
    log: ActionLogEntry[];

    addLog: (entry: Omit<ActionLogEntry, "id" | "ts">) => void;
    clearLog: () => void;
    reset: () => void;

    endTurn: () => void;

    // optional demo actions
    demoDrawCard: () => void;
    demoPlayCard: () => void;
};

function uid() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const initialState = () => ({
    turn: 1 as number,
    activePlayer: "P1" as Player,
    log: [
        {
            id: uid(),
            ts: Date.now(),
            turn: 1,
            player: "P1" as Player,
            kind: "SYSTEM" as LogKind,
            message: "Turn Log Demo started.",
        },
    ] as ActionLogEntry[],
});

export const useTurnLogDemoStore = create<TurnLogDemoState>((set, get) => ({
    ...initialState(),

    addLog: (entry) =>
        set((s) => ({
            log: [
                ...s.log,
                {
                    id: uid(),
                    ts: Date.now(),
                    ...entry,
                },
            ],
        })),

    clearLog: () => set({ log: [] }),

    reset: () => set(initialState()),

    endTurn: () => {
        const { turn, activePlayer } = get();

        const nextPlayer: Player = activePlayer === "P1" ? "P2" : "P1";
        const nextTurn = activePlayer === "P2" ? turn + 1 : turn;

        // log: end current player's turn
        get().addLog({
            turn,
            player: activePlayer,
            kind: "TURN",
            message: `${activePlayer} ended their turn.`,
        });

        // log: start next player / next turn
        if (nextTurn !== turn) {
            get().addLog({
                turn: nextTurn,
                player: nextPlayer,
                kind: "TURN",
                message: `Turn ${nextTurn} started. ${nextPlayer} is now active.`,
            });
        } else {
            get().addLog({
                turn,
                player: nextPlayer,
                kind: "TURN",
                message: `${nextPlayer} is now active.`,
            });
        }

        set({ activePlayer: nextPlayer, turn: nextTurn });
    },

    demoDrawCard: () => {
        const { turn, activePlayer } = get();
        get().addLog({
            turn,
            player: activePlayer,
            kind: "PLAY",
            message: `${activePlayer} drew a card.`,
        });
    },

    demoPlayCard: () => {
        const { turn, activePlayer } = get();
        get().addLog({
            turn,
            player: activePlayer,
            kind: "PLAY",
            message: `${activePlayer} played a card (demo).`,
        });
    },
}));
