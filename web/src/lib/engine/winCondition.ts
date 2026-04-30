import { MatchState, PlayerState, CardType, CardInstance, Phase } from "./types";

/**
 * Per ruleset section 3, win conditions are only evaluated:
 *   - After the Combat Phase
 *   - At the End Phase
 * This helper lets the reducer skip evaluation during DRAW / ACTION phases
 * for correctness and minor perf.
 */
export function shouldEvaluateWin(phase: Phase): boolean {
  return phase === Phase.COMBAT || phase === Phase.END;
}

function hasCreatures(
  player: PlayerState,
  cardInstances: Record<string, CardInstance>,
  cardDefinitions: Record<string, { type: CardType }>
): boolean {
  // Battlefield holds instanceIds; check the instance type.
  const battlefieldHasCreature = player.battlefield.some(
    (id) => id !== null && cardInstances[id]?.type === CardType.CREATURE
  );
  if (battlefieldHasCreature) return true;

  // Hand and deck hold definitionIds; look up via cardDefinitions.
  const isCreatureDef = (defId: string) =>
    cardDefinitions[defId]?.type === CardType.CREATURE;

  return player.hand.some(isCreatureDef) || player.deck.some(isCreatureDef);
}

/**
 * Creature Exhaustion (ruleset section 3):
 *   A player loses when they have no Creature cards remaining in
 *   deck, hand, or battlefield. Simultaneous loss = DRAW.
 */
export function evaluateWinner(state: MatchState): string | "DRAW" | null {
  const p1 = state.players["P1"];
  const p2 = state.players["P2"];
  const p1HasCreatures = hasCreatures(p1, state.cardInstances, state.cardDefinitions);
  const p2HasCreatures = hasCreatures(p2, state.cardInstances, state.cardDefinitions);

  if (!p1HasCreatures && !p2HasCreatures) return "DRAW";
  if (!p1HasCreatures) return "P2";
  if (!p2HasCreatures) return "P1";
  return null;
}
