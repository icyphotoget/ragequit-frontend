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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${base}/games?limit=50`);

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Games fetch failed", res.status, res.statusText, text);
          setError(`Backend returned ${res.status} ${res.statusText}`);
          setGames([]);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected games payload", data);
          setError("Backend returned an unexpected response.");
          setGames([]);
          return;
        }

        setGames(data);
      } catch (err) {
        console.error("Failed to load games", err);
        setError("Failed to load games.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">RageQuit.io</h1>
          <p className="text-sm text-slate-400">
            Ranking games by how much they make players rage.
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            <a
              href="/compare"
              className="inline-flex text-fuchsia-400 hover:text-fuchsia-200 underline underline-offset-4"
            >
              Open rage duel →
            </a>
            <a
              href="/leaderboards"
              className="inline-flex text-sky-400 hover:text-sky-200 underline underline-offset-4"
            >
              View global rage leaderboards →
            </a>
          </div>
        </header>

        {loading && (
          <p className="text-sm text-slate-400">Loading games…</p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {!loading && !error && games.length === 0 && (
          <p className="text-sm text-slate-400">
            No games available yet.
          </p>
        )}

        {!loading && !error && games.length > 0 && (
          <section className="space-y-3">
            {games.map((game) => (
              <a
                key={game.id}
                href={`/game/${game.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 hover:border-slate-500 transition"
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {game.name}
                  </h2>
                  <p className="text-[11px] text-slate-500">/{game.slug}</p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    RageScore
                  </span>
                  <span className="text-lg font-bold">
                    {Math.round(game.rage_score)}
                  </span>
                </div>
              </a>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
