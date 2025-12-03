"use client";

import { useEffect, useState } from "react";

type GameSummary = {
  id: number;
  name: string;
  slug: string;
  rage_score: number;
};

export default function HomePage() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/games?limit=50`
        );
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error("Failed to load games", err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              RageQuit.io
            </h1>
            <p className="text-sm text-slate-400">
              Ranking games by how much they make players rage.
            </p>
            <a
  href="/compare"
  className="mt-2 inline-flex text-xs text-fuchsia-400 hover:text-fuchsia-200 underline underline-offset-4"
>
  Open rage duel →
</a>

<a
  href="/leaderboards"
  className="mt-2 inline-flex text-xs text-sky-400 hover:text-sky-200 underline underline-offset-4"
>
  View global rage leaderboards →
</a>
          </div>
        </header>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading games...</p>
        ) : (
          <div className="space-y-3">
            {games.map((g) => (
              <a
                key={g.id}
                href={`/game/${g.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 hover:border-slate-400 hover:bg-slate-900 transition"
              >
                <div>
                  <div className="text-sm font-semibold">{g.name}</div>
                  <div className="text-xs text-slate-400">/{g.slug}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase text-slate-400">
                    RageScore
                  </div>
                  <div className="text-xl font-bold">
                    {Math.round(g.rage_score)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
