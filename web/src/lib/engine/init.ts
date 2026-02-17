import { MatchState, PlayerState, Phase } from "./types";

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffle<T>(array: T[], rand: () => number): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createMatch(
  player1Deck: string[],
  player2Deck: string[],
  seed: number
): MatchState {
  const rand = seededRandom(seed);

  const p1Deck = shuffle(player1Deck, rand);
  const p2Deck = shuffle(player2Deck, rand);

  const startingPlayer = rand() < 0.5 ? "P1" : "P2";

  const basePlayer = (id: string, deck: string[]): PlayerState => ({
    id,
    deck,
    hand: deck.slice(0, 5),
    battlefield: [null, null, null, null, null],
    discard: [],
    resources: { current: 0, max: 0 },
  });

  return {
    version: "Alpha_Fixed_v0.1",
    seed,
    turn: 1,
    activePlayer: startingPlayer,
    phase: Phase.DRAW,
    players: {
      P1: basePlayer("P1", p1Deck),
      P2: basePlayer("P2", p2Deck),
    },
    cardInstances: {},
    winner: null,
  };
}
