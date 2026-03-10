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
  cost: number;
  attack?: number;
  health?: number;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  currentHealth?: number;
  hasAttacked?: boolean;
  type: CardType
}

export interface PlayerState {
  id: string;
  deck: string[];
  hand: string[];
  battlefield: (string | null)[];
  discard: string[];
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
  winner: string | "DRAW" | null;
}
