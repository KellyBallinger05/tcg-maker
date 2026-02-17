import { MatchState, PlayerState, CardType, CardInstance } from "./types";

/**
 * Check if a single player has any Creature cards left
 */
function hasCreatures(player: PlayerState, cardInstances: Record<string, CardInstance>): boolean {
  // Check battlefield for creatures
  const battlefieldHasCreature = player.battlefield.some(
    (id) => id !== null && cardInstances[id].definitionId && cardInstances[id]
  );

  // Check hand for creature cards
  const handHasCreature = player.hand.some((id) => {
    const card = cardInstances[id] || { definitionId: id, type: CardType.CREATURE }; // placeholder
    return card.type === CardType.CREATURE;
  });

  // Check deck for creature cards
  const deckHasCreature = player.deck.some((id) => {
    const card = cardInstances[id] || { definitionId: id, type: CardType.CREATURE }; // placeholder
    return card.type === CardType.CREATURE;
  });

  return battlefieldHasCreature || handHasCreature || deckHasCreature;
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
