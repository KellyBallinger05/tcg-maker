import { MatchState, Phase, CardType, CardInstance, ALPHA_RULES } from "./types";
import { evaluateWinner, shouldEvaluateWin } from "./winCondition";
import { validateAction, ValidationResult } from "./validation";

export type GameAction =
  | { type: "DRAW_CARD" }
  | { type: "PLAY_CREATURE"; cardId: string; slotIndex: number }
  | { type: "PLAY_OBJECT"; cardId: string }
  | { type: "DECLARE_ATTACK"; attackerSlot: number; targetSlot: number }
  | { type: "END_PHASE" };

export interface DispatchResult {
  state: MatchState;
  validation: ValidationResult;
}

/**
 * Public entrypoint. ALL action dispatch — UI clicks, AI moves — must go through here.
 *
 * Pipeline:
 *   1. Validate via validation.ts (single gate).
 *   2. If invalid: return original state unchanged + reason.
 *   3. If valid: apply mutation, append log entry, evaluate win conditions.
 */
export function dispatch(
  state: MatchState,
  action: GameAction,
  actorId: string
): DispatchResult {
  const validation = validateAction(state, action, actorId);
  if (!validation.ok) {
    return { state, validation };
  }

  const next = applyValidatedAction(state, action);
  return { state: next, validation: { ok: true } };
}

/**
 * Internal: applies an action that has ALREADY been validated.
 * Pure function — does not mutate input.
 *
 * Do not export this directly. External callers should use `dispatch`.
 */
function applyValidatedAction(state: MatchState, action: GameAction): MatchState {
  const newState: MatchState = JSON.parse(JSON.stringify(state));
  const activePlayer = newState.players[newState.activePlayer];

  switch (action.type) {
    case "DRAW_CARD": {
      const cardId = activePlayer.deck.shift()!;
      activePlayer.hand.push(cardId);
      newState.log.push(`${activePlayer.id} drew a card.`);
      break;
    }

    case "PLAY_CREATURE": {
      const def = newState.cardDefinitions[action.cardId];
      const instanceId = `inst_${++newState.instanceCounter}`;
      const cardInstance: CardInstance = {
        instanceId,
        definitionId: action.cardId,
        type: CardType.CREATURE,
        currentHealth: def.health!,
        hasAttacked: false,
      };

      // Remove ONE copy from hand (handles duplicates correctly).
      const handIdx = activePlayer.hand.indexOf(action.cardId);
      activePlayer.hand.splice(handIdx, 1);

      activePlayer.battlefield[action.slotIndex] = instanceId;
      newState.cardInstances[instanceId] = cardInstance;
      activePlayer.resources.current -= def.cost;

      newState.log.push(
        `${activePlayer.id} played ${action.cardId} to slot ${action.slotIndex}.`
      );
      break;
    }

    case "PLAY_OBJECT": {
      const def = newState.cardDefinitions[action.cardId];

      // Remove ONE copy from hand.
      const handIdx = activePlayer.hand.indexOf(action.cardId);
      activePlayer.hand.splice(handIdx, 1);

      // Object resolves immediately and goes to discard. No instance is created
      // (Alpha objects have no on-board presence — ruleset section 6).
      activePlayer.discard.push(action.cardId);
      activePlayer.resources.current -= def.cost;

      // Alpha effects are limited to "deal damage" / "destroy target creature"
      // (ruleset section 9). Specific effect resolution would go here once per-card
      // effects are wired in. For now, objects play and discard with no effect —
      // matching the current Alpha implementation scope.

      newState.log.push(`${activePlayer.id} played object ${action.cardId}.`);
      break;
    }

    case "DECLARE_ATTACK": {
      const opponentId = newState.activePlayer === "P1" ? "P2" : "P1";
      const opponent = newState.players[opponentId];

      const attackerInstanceId = activePlayer.battlefield[action.attackerSlot]!;
      const attacker = newState.cardInstances[attackerInstanceId];
      const attackerDef = newState.cardDefinitions[attacker.definitionId];

      attacker.hasAttacked = true;

      const defenderInstanceId = opponent.battlefield[action.targetSlot];
      if (defenderInstanceId) {
        // Creature vs Creature — simultaneous damage (ruleset section 8).
        const defender = newState.cardInstances[defenderInstanceId];
        const defenderDef = newState.cardDefinitions[defender.definitionId];

        defender.currentHealth! -= attackerDef.attack!;
        attacker.currentHealth! -= defenderDef.attack!;

        newState.log.push(
          `${activePlayer.id}'s ${attacker.definitionId} attacked ${defender.definitionId}.`
        );

        if (defender.currentHealth! <= 0) {
          opponent.battlefield[action.targetSlot] = null;
          opponent.discard.push(defender.definitionId);
          delete newState.cardInstances[defenderInstanceId];
          newState.log.push(`${defender.definitionId} was destroyed.`);
        }
        if (attacker.currentHealth! <= 0) {
          activePlayer.battlefield[action.attackerSlot] = null;
          activePlayer.discard.push(attacker.definitionId);
          delete newState.cardInstances[attackerInstanceId];
          newState.log.push(`${attacker.definitionId} was destroyed.`);
        }
      } else {
        // Direct pressure — empty slot. Alpha doesn't define direct damage to a
        // player health total (creature exhaustion is the only loss condition),
        // so this is a no-op except for marking hasAttacked. Logged for clarity.
        newState.log.push(
          `${activePlayer.id}'s ${attacker.definitionId} attacked an empty slot.`
        );
      }
      break;
    }

    case "END_PHASE": {
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
        case Phase.END: {
          // Pass turn.
          newState.activePlayer = newState.activePlayer === "P1" ? "P2" : "P1";
          newState.turn += 1;
          newState.phase = Phase.DRAW;

          const ap = newState.players[newState.activePlayer];
          // Resource gain per ruleset section 7.
          ap.resources.max += 1;
          ap.resources.current = ap.resources.max;
          // Refresh attack flags.
          ap.battlefield.forEach((id) => {
            if (id) newState.cardInstances[id].hasAttacked = false;
          });
          newState.log.push(`Turn ${newState.turn}: ${newState.activePlayer}'s turn.`);
          break;
        }
      }
      break;
    }
  }

  // Win evaluation per ruleset section 3: only after Combat or at End phase.
  if (shouldEvaluateWin(newState.phase)) {
    const winner = evaluateWinner(newState);
    if (winner !== null) {
      newState.winner = winner;
      newState.log.push(
        winner === "DRAW" ? `Match ended in a draw.` : `${winner} wins!`
      );
    }
  }

  return newState;
}

// Backwards-compatible export for any code still calling applyAction directly.
// New code should use `dispatch` instead.
export function applyAction(state: MatchState, action: GameAction): MatchState {
  return dispatch(state, action, state.activePlayer).state;
}
