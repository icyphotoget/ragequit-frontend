"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FavoriteRow = {
  game_id: number;
  created_at: string;
};

type RageEventRow = {
  game_id: number;
  intensity: number;
  note?: string | null;
  created_at: string;
};

type GameBrief = {
  id: number;
  name: string;
  slug: string;
};

type GameMap = Record<number, GameBrief>;

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionMissing, setSessionMissing] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [rageEvents, setRageEvents] = useState<RageEventRow[]>([]);
  const [gameMap, setGameMap] = useState<GameMap>({});

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setSessionMissing(true);
        setLoading(false);
        return;
      }

      try {
        // 1) Load favorites
        const { data: favs, error: favError } = await supabase
          .from("favorite_games")
          .select("game_id, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (favError) throw favError;

        setFavorites(favs ?? []);

        // 2) Load rage events
        const { data: rageRows, error: rageError } = await supabase
          .from("rage_events")
          .select("game_id, intensity, note, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (rageError) throw rageError;

        setRageEvents(rageRows ?? []);

        // 3) Collect all game IDs and fetch details from backend
        const ids = Array.from(
          new Set([
            ...(favs ?? []).map((f) => f.game_id),
            ...(rageRows ?? []).map((r) => r.game_id),
          ]),
        );

        if (ids.length === 0) {
          setGameMap({});
          return;
        }

        const base = process.env.NEXT_PUBLIC_API_URL;
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await fetch(`${base}/games/${id}`);
              if (!res.ok) return null;
              const data = await res.json();
              return {
                id: data.id,
                name: data.name,
                slug: data.slug,
              } as GameBrief;
            } catch {
              return null;
            }
          }),
        );

        const map: GameMap = {};
        for (const g of results) {
          if (g) {
            map[g.id] = g;
          }
        }
        setGameMap(map);
      } catch (err: any) {
        console.error("Account load error", err);
        setError(err.message ?? "Failed to load account data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRageEvents = rageEvents.length;
  const distinctRageGames = useMemo(
    () => new Set(rageEvents.map((r) => r.game_id)).size,
    [rageEvents],
  );
  const maxIntensity = rageEvents.reduce(
    (max, r) => Math.max(max, r.intensity),
    0,
  );

  if (sessionMissing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← Back to games
          </a>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Your Rage Profile
          </h1>
          <p className="text-sm text-slate-400">
            You need to{" "}
            <button
              onClick={() => router.push("/auth")}
              className="text-emerald-300 underline underline-offset-4 hover:text-emerald-100"
            >
              log in
            </button>{" "}
            to view your rage stats, favorites, and history.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <a
          href="/"
          className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200"
        >
          ← Back to games
        </a>

        <header className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Your Rage Profile
          </h1>
          <p className="text-sm text-slate-400">
            Track your personal rage history, favorite games, and trophies.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-slate-400">
            Loading your data…
          </p>
        )}

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Trophies */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                Trophies
              </h2>
              <div className="grid gap-3 text-xs md:grid-cols-3">
                <TrophyCard
                  title="First Tilt"
                  description="Log at least one rage event."
                  unlocked={totalRageEvents >= 1}
                />
                <TrophyCard
                  title="Serial Rager"
                  description="Log 10 or more rage events."
                  unlocked={totalRageEvents >= 10}
                />
                <TrophyCard
                  title="Multi-Game Meltdown"
                  description="Rage in 3 or more different games."
                  unlocked={distinctRageGames >= 3}
                />
                <TrophyCard
                  title="Max Salt"
                  description="Record a rage with intensity 5."
                  unlocked={maxIntensity >= 5}
                />
                <TrophyCard
                  title="Game Hoarder"
                  description="Favorite 5 or more games."
                  unlocked={favorites.length >= 5}
                />
              </div>
            </section>

            {/* Favorites */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                Favorite Rage Games
              </h2>
              {favorites.length === 0 ? (
                <p className="text-xs text-slate-500">
                  You haven&apos;t favorited any games yet. Open a game page and hit
                  &quot;Add to favorites&quot; to start your shrine of suffering.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {favorites.map((fav, idx) => {
                    const g = gameMap[fav.game_id];
                    return (
                      <a
                        key={`${fav.game_id}-${idx}`}
                        href={g ? `/game/${g.id}` : "#"}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 hover:border-sky-500"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-slate-50">
                            {g?.name ?? `Game #${fav.game_id}`}
                          </p>
                          {g && (
                            <p className="text-[10px] text-slate-500">
                              /{g.slug}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          favorited on{" "}
                          {new Date(fav.created_at).toLocaleDateString()}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Rage history */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
                Recent Rage Events
              </h2>
              {rageEvents.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No rage recorded yet. Go play Elden Ring or Cuphead and come back.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {rageEvents.map((e, idx) => {
                    const g = gameMap[e.game_id];
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[13px] font-semibold text-slate-50">
                              {g?.name ?? `Game #${e.game_id}`}
                            </p>
                            {g && (
                              <p className="text-[10px] text-slate-500">
                                /{g.slug}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-[10px]">
                            <p className="font-semibold text-red-300">
                              Rage {e.intensity}/5
                            </p>
                            <p className="text-slate-500">
                              {new Date(e.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {e.note && (
                          <p className="mt-1 text-[11px] text-slate-200">
                            {e.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function TrophyCard(props: {
  title: string;
  description: string;
  unlocked: boolean;
}) {
  const { title, description, unlocked } = props;
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        unlocked
          ? "border-yellow-400 bg-yellow-500/10 text-slate-50"
          : "border-slate-800 bg-slate-950/60 text-slate-400"
      } text-xs`}
    >
      <p className="text-[11px] font-semibold">{title}</p>
      <p className="mt-1 text-[10px]">{description}</p>
      {!unlocked && (
        <p className="mt-1 text-[9px] text-slate-500">
          Locked
        </p>
      )}
      {unlocked && (
        <p className="mt-1 text-[9px] text-yellow-300">
          Unlocked
        </p>
      )}
    </div>
  );
}
