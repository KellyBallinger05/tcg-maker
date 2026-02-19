import { MatchState, PlayerState, CardType, CardInstance } from "./types";

/**
 * Check if a single player has any Creature cards left
 */
function hasCreatures(
  player: PlayerState,
  cardInstances: Record<string, CardInstance>
): boolean {
  // Helper to check if a card instance is a creature
  const isCreature = (id: string) => {
    const card = cardInstances[id];
    return card && card.type === CardType.CREATURE;
  };

  // Check battlefield, hand, and deck for creatures
  return (
    player.battlefield.some((id) => id !== null && isCreature(id)) ||
    player.hand.some(isCreature) ||
    player.deck.some(isCreature)
  );
}

/**
 * Evaluate the winner based on Creature Exhaustion rule
 */
export function evaluateWinner(state: MatchState): string | "DRAW" | null {
  const p1 = state.players["P1"];
  const p2 = state.players["P2"];

  const p1HasCreatures = hasCreatures(p1, state.cardInstances);
  const p2HasCreatures = hasCreatures(p2, state.cardInstances);

  if (!p1HasCreatures && !p2HasCreatures) return "DRAW";
  if (!p1HasCreatures) return "P2";
  if (!p2HasCreatures) return "P1";

  return null; // No winner yet
}
