import DeckBuilderClient from '../../../components/DeckBuilderClient';
import { createClient } from '@/lib/supabase/server';

export default async function DecksPage() {
  const supa = await createClient();

  const { data: gamesData } = await supa.from('games').select('id,title').order('title', { ascending: true });
  const games = (gamesData ?? []).map((g: any) => ({ id: g.id, title: g.title }));

  const firstGameId = games[0]?.id ?? null;
  let initialCards: any[] = [];
  if (firstGameId) {
    const { data: cards } = await supa
      .from('cards')
      .select('id,name,type,cost,attack,defense')
      .eq('game_id', firstGameId)
      .order('created_at', { ascending: false });
    initialCards = (cards ?? []).map((c: any) => ({ id: c.id, name: c.name, type: c.type, cost: c.cost ?? 0, attack: c.attack ?? 0, defense: c.defense ?? 0 }));
  }

  return (
    <main className="p-6">
      <DeckBuilderClient title="Deck Builder" games={games} initialGameId={firstGameId} initialCards={initialCards} />
    </main>
  );
}
