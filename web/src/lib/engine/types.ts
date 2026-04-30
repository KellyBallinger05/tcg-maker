export enum Phase {
  DRAW = "DRAW",
  ACTION = "ACTION",
  COMBAT = "COMBAT",
  END = "END",
}

export enum CardType {
  CREATURE = "CREATURE",
  OBJECT = "OBJECT",
}

export interface CardDefinition {
  id: string;
  type: CardType;
  cost: number;     // 0-10
  attack?: number;  // 1-5, creatures only
  health?: number;  // 1-10, creatures only
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  type: CardType;
  currentHealth?: number; // creatures only
  hasAttacked?: boolean;  // creatures only
}

export interface PlayerState {
  id: string;
  deck: string[];          // card definition IDs, ordered
  hand: string[];          // card definition IDs
  battlefield: (string | null)[]; // length 5, holds instanceIds
  discard: string[];       // card definition IDs
  resources: {
    current: number;
    max: number;
  };
}

export interface MatchState {
  version: "Alpha_Fixed_v0.1";
  seed: number;
  turn: number;
  activePlayer: string;
  phase: Phase;
  players: Record<string, PlayerState>;
  cardInstances: Record<string, CardInstance>;
  cardDefinitions: Record<string, CardDefinition>; // lookup table
  instanceCounter: number; // deterministic ID generation
  winner: string | "DRAW" | null;
  log: string[]; // action log for UI / debugging
}

// Constants from the Alpha Ruleset
export const ALPHA_RULES = {
  DECK_SIZE: 30,
  MIN_CREATURES_PER_DECK: 10,
  STARTING_HAND_SIZE: 5,
  BATTLEFIELD_SLOTS: 5,
  STAT_RANGES: {
    HEALTH: { min: 1, max: 10 },
    ATTACK: { min: 1, max: 5 },
    COST: { min: 0, max: 10 },
  },
} as const;
