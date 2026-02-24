// DEVELOPER DECK
export type Card = {
  id: string
  name: string
  cost?: number
  type?: string
}

export const sampleDevDeck: Card[] = [
  { id: "c1", name: "Goblin Scout", cost: 1, type: "Unit" },
  { id: "c2", name: "Iron Pike", cost: 2, type: "Item" },
  { id: "c3", name: "Flame Bolt", cost: 1, type: "Spell" },
  { id: "c4", name: "Forest Guardian", cost: 4, type: "Unit" },
  { id: "c5", name: "Healing Herb", cost: 1, type: "Spell" },

  // duplicate to simulate a real deck size
  { id: "c1b", name: "Goblin Scout", cost: 1, type: "Unit" },
  { id: "c2b", name: "Iron Pike", cost: 2, type: "Item" },
  { id: "c3b", name: "Flame Bolt", cost: 1, type: "Spell" },
  { id: "c4b", name: "Forest Guardian", cost: 4, type: "Unit" },
  { id: "c5b", name: "Healing Herb", cost: 1, type: "Spell" },
]
