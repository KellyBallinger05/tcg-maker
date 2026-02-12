import Link from "next/link";

export interface CardData {
  id: string;
  name: string;
  type: string;
  cost: number;
  attack: number;
  defense: number;
  image_url?: string | null;
  rules_text?: string | null;
  game_id?: string;
}

interface CardProps {
  card: CardData;
  detailsHref?: string;
}

export default function Card({ card, detailsHref }: CardProps) {
  return (
    <article
      className="group overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md"
    >
      <div className="w-full bg-gray-100 overflow-hidden relative card-image-wrapper card-image-ratio max-h-44">
        {card.image_url ? (
          <>
            {/* blurred full-bleed background to fill extra space */}
            <div
              className="absolute inset-0 filter blur-sm scale-105"
              style={{
                backgroundImage: `url(${card.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* foreground image centered, fills the card image area */}
            <img
              src={card.image_url}
              alt={card.name}
              className="relative mx-auto h-full w-full object-contain z-20"
              loading="lazy"
            />
            {/* stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-30">
              <div className="flex justify-between items-end text-white">
                <div className="flex gap-3">
                  {/* cost */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs stat-label">Cost</span>
                    <span className="text-lg font-bold stat-outline">{card.cost || 0}</span>
                  </div>
                  {/* attack */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs stat-label">ATK</span>
                    <span className="text-lg font-bold stat-outline">{card.attack || 0}</span>
                  </div>
                  {/* defense */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs stat-label">DEF</span>
                    <span className="text-lg font-bold stat-outline">{card.defense || 0}</span>
                  </div>
                </div>
                {/* type badge */}
                {(() => {
                  const t = (card.type || 'unit').toString().toLowerCase();
                  const badgeClass =
                    t === 'unit'
                      ? 'bg-green-600 text-white'
                      : t === 'spell'
                      ? 'bg-purple-600 text-white'
                      : t === 'equipment'
                      ? 'bg-yellow-600 text-black'
                      : 'bg-white/20 text-black dark:text-white';
                  return (
                    <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${badgeClass}`}>
                      {t}
                    </span>
                  );
                })()}
              </div>
            </div>
          </>
        ) : (
          <div className="grid h-full w-full place-items-center card-no-image relative z-20">
            No image
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{card.name}</h2>
          {detailsHref && (
            <Link
              href={detailsHref}
              className="text-sm underline opacity-80 transition group-hover:opacity-100"
            >
              Details
            </Link>
          )}
        </div>

        {card.rules_text ? (
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">
            {card.rules_text}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-gray-500">
            No rules/description provided.
          </p>
        )}

        {card.game_id && (
          <div className="mt-3 text-xs text-gray-500">
            Game:{" "}
            <Link className="underline" href={`/studio/games/${card.game_id}`}>
              {card.game_id}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
