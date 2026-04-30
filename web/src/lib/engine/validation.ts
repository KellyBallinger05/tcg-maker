import {
  MatchState,
  Phase,
  CardType,
  CardDefinition,
  ALPHA_RULES,
} from "./types";
import { GameAction } from "./reducer";

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Single validation gate for all game actions.
 * Every action — user OR AI — must pass through this function before reaching the reducer.
 *
 * Returns { ok: true } if the action is legal in the current state.
 * Returns { ok: false, reason } if rejected, with a human-readable reason for the UI/log.
 */
export function validateAction(
  state: MatchState,
  action: GameAction,
  actorId: string
): ValidationResult {
  // 1. Terminal state check — no actions allowed once a match has ended.
  if (state.winner !== null) {
    return { ok: false, reason: "Match has ended." };
  }

  // 2. Turn ownership — only the active player may act.
  if (actorId !== state.activePlayer) {
    return { ok: false, reason: "Not your turn." };
  }

  const activePlayer = state.players[state.activePlayer];
  if (!activePlayer) {
    return { ok: false, reason: "Active player not found in state." };
  }

  switch (action.type) {
    case "DRAW_CARD": {
      if (state.phase !== Phase.DRAW) {
        return { ok: false, reason: "Can only draw during the Draw Phase." };
      }
      if (activePlayer.deck.length === 0) {
        return { ok: false, reason: "Deck is empty." };
      }
      return { ok: true };
    }

    case "PLAY_CREATURE": {
      if (state.phase !== Phase.ACTION) {
        return { ok: false, reason: "Can only play cards during the Action Phase." };
      }
      if (!activePlayer.hand.includes(action.cardId)) {
        return { ok: false, reason: "Card is not in your hand." };
      }
      const def = state.cardDefinitions[action.cardId];
      if (!def) {
        return { ok: false, reason: "Unknown card definition." };
      }
      if (def.type !== CardType.CREATURE) {
        return { ok: false, reason: "Card is not a Creature." };
      }
      if (
        action.slotIndex < 0 ||
        action.slotIndex >= ALPHA_RULES.BATTLEFIELD_SLOTS ||
        !Number.isInteger(action.slotIndex)
      ) {
        return { ok: false, reason: "Invalid slot index." };
      }
      if (activePlayer.battlefield[action.slotIndex] !== null) {
        return { ok: false, reason: "Slot is already occupied." };
      }
      if (activePlayer.resources.current < def.cost) {
        return { ok: false, reason: "Not enough resources." };
      }
      return { ok: true };
    }

    case "PLAY_OBJECT": {
      if (state.phase !== Phase.ACTION) {
        return { ok: false, reason: "Can only play cards during the Action Phase." };
      }
      if (!activePlayer.hand.includes(action.cardId)) {
        return { ok: false, reason: "Card is not in your hand." };
      }
      const def = state.cardDefinitions[action.cardId];
      if (!def) {
        return { ok: false, reason: "Unknown card definition." };
      }
      if (def.type !== CardType.OBJECT) {
        return { ok: false, reason: "Card is not an Object." };
      }
      if (activePlayer.resources.current < def.cost) {
        return { ok: false, reason: "Not enough resources." };
      }
      return { ok: true };
    }

    case "DECLARE_ATTACK": {
      if (state.phase !== Phase.COMBAT) {
        return { ok: false, reason: "Can only attack during the Combat Phase." };
      }
      const slots = ALPHA_RULES.BATTLEFIELD_SLOTS;
      if (
        action.attackerSlot < 0 ||
        action.attackerSlot >= slots ||
        !Number.isInteger(action.attackerSlot)
      ) {
        return { ok: false, reason: "Invalid attacker slot." };
      }
      if (
        action.targetSlot < 0 ||
        action.targetSlot >= slots ||
        !Number.isInteger(action.targetSlot)
      ) {
        return { ok: false, reason: "Invalid target slot." };
      }
      const attackerInstanceId = activePlayer.battlefield[action.attackerSlot];
      if (!attackerInstanceId) {
        return { ok: false, reason: "No creature in attacker slot." };
      }
      const attacker = state.cardInstances[attackerInstanceId];
      if (!attacker) {
        return { ok: false, reason: "Attacker instance not found." };
      }
      if (attacker.type !== CardType.CREATURE) {
        return { ok: false, reason: "Only creatures can attack." };
      }
      if (attacker.hasAttacked) {
        return { ok: false, reason: "Creature has already attacked this turn." };
      }
      // Note: attacking an empty opposing slot is legal (direct pressure per ruleset 8.3).
      return { ok: true };
    }

    case "END_PHASE": {
      // Always legal for the active player; phase transitions are unconditional.
      return { ok: true };
    }

    default: {
      // Exhaustiveness check — if a new action type is added, TS will flag this.
      const _exhaustive: never = action;
      return { ok: false, reason: "Unknown action type." };
    }
  }
}

/**
 * Deck validation per ruleset section 11.
 */
export function validateDeck(
  deckCardIds: string[],
  cardDefinitions: Record<string, CardDefinition>
): ValidationResult {
  if (deckCardIds.length !== ALPHA_RULES.DECK_SIZE) {
    return {
      ok: false,
      reason: `Deck must contain exactly ${ALPHA_RULES.DECK_SIZE} cards (has ${deckCardIds.length}).`,
    };
  }

  let creatureCount = 0;
  for (const cardId of deckCardIds) {
    const def = cardDefinitions[cardId];
    if (!def) {
      return { ok: false, reason: `Unknown card in deck: ${cardId}` };
    }
    const cardCheck = validateCardDefinition(def);
    if (!cardCheck.ok) {
      return { ok: false, reason: `Card ${cardId}: ${cardCheck.reason}` };
    }
    if (def.type === CardType.CREATURE) creatureCount++;
  }

  if (creatureCount < ALPHA_RULES.MIN_CREATURES_PER_DECK) {
    return {
      ok: false,
      reason: `Deck must contain at least ${ALPHA_RULES.MIN_CREATURES_PER_DECK} Creature cards (has ${creatureCount}).`,
    };
  }

  return { ok: true };
}

/**
 * Card definition validation per ruleset section 11.
 * Ensures stats fall within defined ranges.
 */
export function validateCardDefinition(def: CardDefinition): ValidationResult {
  const { COST, HEALTH, ATTACK } = ALPHA_RULES.STAT_RANGES;

  if (!def.id) return { ok: false, reason: "Missing card id." };
  if (def.cost < COST.min || def.cost > COST.max) {
    return { ok: false, reason: `Cost out of range (${COST.min}-${COST.max}).` };
  }

  if (def.type === CardType.CREATURE) {
    if (def.health === undefined) {
      return { ok: false, reason: "Creature missing health." };
    }
    if (def.attack === undefined) {
      return { ok: false, reason: "Creature missing attack." };
    }
    if (def.health < HEALTH.min || def.health > HEALTH.max) {
      return { ok: false, reason: `Health out of range (${HEALTH.min}-${HEALTH.max}).` };
    }
    if (def.attack < ATTACK.min || def.attack > ATTACK.max) {
      return { ok: false, reason: `Attack out of range (${ATTACK.min}-${ATTACK.max}).` };
    }
  }

  return { ok: true };
}
