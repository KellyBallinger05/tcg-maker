export type DeckValidationIssue = {
    code: string;
    message: string;
};

export type DeckValidationResult = {
    valid: boolean;
    issues: DeckValidationIssue[];
};

export function validateDeckForPlaytest(params: {
    deckCards: {
        card_id: string;
        qty: number;
    }[];
    cards: {
        id: string;
        name: string | null;
        type?: string | null;
        cost?: number | null;
        attack?: number | null;
        defense?: number | null;
    }[];
    minDeckSize?: number;
    maxDeckSize?: number;
}): DeckValidationResult {
    const issues: DeckValidationIssue[] = [];

    const { deckCards, cards, minDeckSize = 1, maxDeckSize = 60 } = params;

    if (!deckCards || deckCards.length === 0) {
        issues.push({
            code: "EMPTY_DECK",
            message: "This deck has no cards. Add cards before starting playtest.",
        });
    }

    const totalCards = deckCards.reduce((sum, row) => sum + row.qty, 0);

    if (totalCards < minDeckSize) {
        issues.push({
            code: "BELOW_MIN_SIZE",
            message: `This deck has ${totalCards} card(s), but it needs at least ${minDeckSize}.`,
        });
    }

    if (totalCards > maxDeckSize) {
        issues.push({
            code: "ABOVE_MAX_SIZE",
            message: `This deck has ${totalCards} card(s), but the maximum allowed is ${maxDeckSize}.`,
        });
    }

    const cardIds = new Set(cards.map((card) => card.id));

    for (const deckCard of deckCards) {
        if (!Number.isInteger(deckCard.qty) || deckCard.qty <= 0) {
            issues.push({
                code: "INVALID_QUANTITY",
                message: "One or more cards has an invalid quantity.",
            });
        }

        if (!cardIds.has(deckCard.card_id)) {
            issues.push({
                code: "MISSING_CARD_REFERENCE",
                message: "This deck references a card that no longer exists.",
            });
        }
    }

    for (const card of cards) {
        if (!card.name || card.name.trim() === "") {
            issues.push({
                code: "MISSING_CARD_NAME",
                message: "One or more cards is missing a name.",
            });
        }

        if (card.cost != null && card.cost < 0) {
            issues.push({
                code: "INVALID_COST",
                message: "One or more cards has an invalid cost value.",
            });
        }

        if (card.attack != null && card.attack < 0) {
            issues.push({
                code: "INVALID_ATTACK",
                message: "One or more cards has an invalid attack value.",
            });
        }

        if (card.defense != null && card.defense < 0) {
            issues.push({
                code: "INVALID_DEFENSE",
                message: "One or more cards has an invalid defense value.",
            });
        }
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}