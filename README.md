# tcg-maker
A webapp based trading card game maker for CS461

---

### Stock Game Prototype

A sample JSON file demonstrating two turns of a stock game used to prototype match flow and card logic.

**Path:** `web/public/gameflow.json`

This file outlines:
- Basic card types (creature and object)
- Turn sequence (draw → play → combat → end turn)
- Example card attributes (HP, range, element, activation cost)
- Example moves and effects

This serves as the foundation for the “default” game users can later modify in the TCG Maker platform.

---

### Environment (Supabase)

Create web/.env.local from the template below (do not commit .env.local).
you’ll find the values in supabase → settings → api.

web/.env.example

- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- (optional) SUPABASE_SERVICE_ROLE_KEY=  (server-only if we ever need it)

steps: 

- copy the template: cp web/.env.example web/.env.local
- paste the Project URL into NEXT_PUBLIC_SUPABASE_URL
- Paste the anon public key into NEXT_PUBLIC_SUPABASE_ANON_KEY