import { MatchState, Phase, PlayerState, CardType, CardInstance } from "./types";
import { evaluateWinner } from "./winCondition";

/**
 * Apply an action to the match state and return a new updated state.
 * This is a pure function: does NOT mutate input state.
 */
export type GameAction =
  | { type: "DRAW_CARD" }
  | { type: "PLAY_CREATURE"; cardId: string; slotIndex: number }
  | { type: "PLAY_OBJECT"; cardId: string }
  | { type: "DECLARE_ATTACK"; attackerSlot: number; targetSlot: number }
  | { type: "END_PHASE" };

export function applyAction(state: MatchState, action: GameAction): MatchState {
  const newState: MatchState = JSON.parse(JSON.stringify(state)); // deep copy
  const activePlayer = newState.players[newState.activePlayer];
  const opponent = newState.players[newState.activePlayer === "P1" ? "P2" : "P1"];

  switch (action.type) {
    case "DRAW_CARD":
      if (activePlayer.deck.length > 0) {
        const cardId = activePlayer.deck.shift()!;
        activePlayer.hand.push(cardId);
      }
      break;

    case "PLAY_CREATURE":
      if (activePlayer.hand.includes(action.cardId)) {
        const cardInstance: CardInstance = {
          instanceId: `${action.cardId}_${Date.now()}`,
          definitionId: action.cardId,
          currentHealth: 1, // Placeholder: you can pull actual health from card definition
          hasAttacked: false,
        };
        if (!activePlayer.battlefield[action.slotIndex]) {
          activePlayer.hand = activePlayer.hand.filter((id) => id !== action.cardId);
          activePlayer.battlefield[action.slotIndex] = cardInstance.instanceId;
          newState.cardInstances[cardInstance.instanceId] = cardInstance;
          // Deduct resource here if needed (simplified)
        }
      }
      break;

    case "PLAY_OBJECT":
      if (activePlayer.hand.includes(action.cardId)) {
        activePlayer.hand = activePlayer.hand.filter((id) => id !== action.cardId);
        activePlayer.discard.push(action.cardId);
        // Implement object effect here if needed
      }
      break;

    case "DECLARE_ATTACK":
      const attackerId = activePlayer.battlefield[action.attackerSlot];
      if (!attackerId) break;
      const attacker = newState.cardInstances[attackerId];
      if (attacker.hasAttacked) break;

      const defenderId = opponent.battlefield[action.targetSlot];
      if (defenderId) {
        const defender = newState.cardInstances[defenderId];
        // Deal damage simultaneously (both creatures)
        defender.currentHealth! -= 1; // Placeholder: use attacker.attack from definition
        attacker.currentHealth! -= 1; // Placeholder: use defender.attack from definition

        if (defender.currentHealth! <= 0) {
          opponent.battlefield[action.targetSlot] = null;
          opponent.discard.push(defender.definitionId);
          delete newState.cardInstances[defenderId];
        }
        if (attacker.currentHealth! <= 0) {
          activePlayer.battlefield[action.attackerSlot] = null;
          activePlayer.discard.push(attacker.definitionId);
          delete newState.cardInstances[attackerId];
        }
      } else {
        // Attack empty slot → could implement direct pressure or ignored
      }
      attacker.hasAttacked = true;
      break;

    case "END_PHASE":
      switch (newState.phase) {
        case Phase.DRAW:
          newState.phase = Phase.ACTION;
          break;
        case Phase.ACTION:
          newState.phase = Phase.COMBAT;
          break;
        case Phase.COMBAT:
          newState.phase = Phase.END;
          break;
        case Phase.END:
          // Pass turn to opponent
          newState.activePlayer = newState.activePlayer === "P1" ? "P2" : "P1";
          newState.turn += 1;
          newState.phase = Phase.DRAW;

          // Gain 1 resource and refresh to max
          const ap = newState.players[newState.activePlayer];
          ap.resources.max += 1;
          ap.resources.current = ap.resources.max;

          // Reset all creatures' attack flags
          ap.battlefield.forEach((id) => {
            if (id) newState.cardInstances[id].hasAttacked = false;
          });
          break;
      }
      break;
  }

  // Evaluate win condition after each action
  const winner = evaluateWinner(newState);
  newState.winner = winner;

  return newState;
}
