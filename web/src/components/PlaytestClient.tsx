"use client";

import { useMemo, useState } from "react";

export type PlaytestCard = {
  id: string;
  name: string;
  type?: string | null;
  cost?: number | null;
  attack?: number | null;
  defense?: number | null;
  instanceId: string;
};

type GameState = {
  deck: PlaytestCard[];
  hand: PlaytestCard[];
  battlefield: PlaytestCard[];
  discard: PlaytestCard[];
  turn: number;
  log: string[];
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PlaytestClient({
  initialDeck,
  deckName,
}: {
  initialDeck: PlaytestCard[];
  deckName: string;
}) {
  const initial = useMemo<GameState>(() => {
    const deck = shuffle(initialDeck);
    const openingHand = deck.slice(0, 5);
    const rest = deck.slice(5);

    return {
      deck: rest,
      hand: openingHand,
      battlefield: [],
      discard: [],
      turn: 1,
      log: [`Game started with "${deckName}". Drew opening hand (${openingHand.length}).`],
    };
  }, [initialDeck, deckName]);

  const [state, setState] = useState<GameState>(initial);

  const draw = () => {
    setState((s) => {
      if (s.deck.length === 0) {
        return { ...s, log: [...s.log, "Tried to draw, but deck is empty."] };
      }

      const card = s.deck[0];

      return {
        ...s,
        deck: s.deck.slice(1),
        hand: [...s.hand, card],
        log: [...s.log, `Drew: ${card.name}`],
      };
    });
  };

  const playFromHand = (instanceId: string) => {
    setState((s) => {
      const idx = s.hand.findIndex((c) => c.instanceId === instanceId);
      if (idx === -1) return s;

      const card = s.hand[idx];
      const newHand = [...s.hand.slice(0, idx), ...s.hand.slice(idx + 1)];

      return {
        ...s,
        hand: newHand,
        battlefield: [...s.battlefield, card],
        log: [...s.log, `Played to battlefield: ${card.name}`],
      };
    });
  };

  const discardFromBattlefield = (instanceId: string) => {
    setState((s) => {
      const idx = s.battlefield.findIndex((c) => c.instanceId === instanceId);
      if (idx === -1) return s;

      const card = s.battlefield[idx];
      const newField = [...s.battlefield.slice(0, idx), ...s.battlefield.slice(idx + 1)];

      return {
        ...s,
        battlefield: newField,
        discard: [...s.discard, card],
        log: [...s.log, `Moved to discard: ${card.name}`],
      };
    });
  };

  const endTurn = () => {
    setState((s) => ({
      ...s,
      turn: s.turn + 1,
      log: [...s.log, `Ended turn ${s.turn}. Now turn ${s.turn + 1}.`],
    }));
  };

  const reset = () => setState(initial);

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1 className="game-title">Playtest ({deckName})</h1>

      <div className="game-controls">
        <button className="game-button" onClick={draw}>
          Draw
        </button>
        <button className="game-button" onClick={endTurn}>
          End Turn
        </button>
        <button className="game-button" onClick={reset}>
          Reset
        </button>
      </div>

      <p>
        <b>Turn:</b> {state.turn}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Zone title={`Deck (${state.deck.length})`}>
          <small>(top card hidden)</small>
        </Zone>

        <Zone title={`Discard (${state.discard.length})`}>
          {state.discard.map((c) => (
            <CardRow key={c.instanceId} card={c} />
          ))}
        </Zone>

        <Zone title={`Hand (${state.hand.length})`}>
          {state.hand.map((c) => (
            <CardRow
              key={c.instanceId}
              card={c}
              onClick={() => playFromHand(c.instanceId)}
              actionLabel="Play"
            />
          ))}
        </Zone>

        <Zone title={`Battlefield (${state.battlefield.length})`}>
          {state.battlefield.map((c) => (
            <CardRow
              key={c.instanceId}
              card={c}
              onClick={() => discardFromBattlefield(c.instanceId)}
              actionLabel="Discard"
            />
          ))}
        </Zone>
      </div>

      <Zone title="Action Log" style={{ marginTop: 16 }}>
        <div style={{ maxHeight: 220, overflow: "auto" }}>
          {state.log
            .slice()
            .reverse()
            .map((line, i) => (
              <div key={i} style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 6 }}>
                {line}
              </div>
            ))}
        </div>
      </Zone>
    </div>
  );
}

function Zone({
  title,
  children,
  style,
}: {
  title: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="game-zone" style={style}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function CardRow({
  card,
  onClick,
  actionLabel,
}: {
  card: PlaytestCard;
  onClick?: () => void;
  actionLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 10px",
        border: "1px solid #eee",
        borderRadius: 8,
        marginBottom: 8,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
      title={onClick ? "Click to act" : undefined}
    >
      <div>
        <div>
          <b>{card.name}</b>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {card.type ?? "Card"}
          {card.cost != null ? ` • Cost ${card.cost}` : ""}
        </div>
      </div>
      {actionLabel ? (
        <div className={`card-action ${actionLabel === "Play" ? "play" : "discard"}`}>
          {actionLabel}
        </div>
      ) : null}
    </div>
  );
}