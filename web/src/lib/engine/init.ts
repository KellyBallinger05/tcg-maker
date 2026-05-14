import { MatchState, PlayerState, Phase, CardDefinition } from "./types";

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
  cardDefinitions: Record<string, CardDefinition>,
  seed: number
): MatchState {
  const rand = seededRandom(seed);
  const p1Deck = shuffle(player1Deck, rand);
  const p2Deck = shuffle(player2Deck, rand);
  const startingPlayer = rand() < 0.5 ? "P1" : "P2";

  const basePlayer = (id: string, deck: string[], isStarting: boolean): PlayerState => {
    const openingHand = deck.slice(0, 5);
    const remainingDeck = deck.slice(5);
    return {
      id,
      deck: remainingDeck,
      hand: openingHand,
      battlefield: [null, null, null, null, null],
      discard: [],
      // Starting player begins turn 1 with 1 resource; non-starter gets theirs
      // when the turn passes to them via END_PHASE (ruleset section 7).
      resources: isStarting ? { current: 1, max: 1 } : { current: 0, max: 0 },
    };
  };

  return {
    version: "Alpha_Fixed_v0.1",
    seed,
    turn: 1,
    activePlayer: startingPlayer,
    phase: Phase.DRAW,
    players: {
      P1: basePlayer("P1", p1Deck, startingPlayer === "P1"),
      P2: basePlayer("P2", p2Deck, startingPlayer === "P2"),
    },
    cardInstances: {},
    cardDefinitions,
    instanceCounter: 0,
    winner: null,
    log: [`Match started. ${startingPlayer} goes first.`],
  };
}
