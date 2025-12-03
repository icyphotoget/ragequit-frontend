"use client";

import { useEffect, useState } from "react";

type GameSummary = {
  id: number;
  name: string;
  slug: string;
  rage_score: number;
};

export default function LeaderboardsPage() {
  const [mostRage, setMostRage] = useState<GameSummary[]>([]);
  const [difficulty, setDifficulty] = useState<GameSummary[]>([]);
  const [technical, setTechnical] = useState<GameSummary[]>([]);
  const [toxicity, setToxicity] = useState<GameSummary[]>([]);
  const [cozy, setCozy] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;

        const [
          mostRes,
          diffRes,
          techRes,
          toxRes,
          cozyRes,
        ] = await Promise.all([
          fetch(`${base}/leaderboards/most-rage?limit=50`),
          fetch(`${base}/leaderboards/difficulty?limit=50`),
          fetch(`${base}/leaderboards/technical?limit=50`),
          fetch(`${base}/leaderboards/toxicity?limit=50`),
          fetch(`${base}/leaderboards/cozy?limit=50`),
        ]);

        const mostData = mostRes.ok ? await mostRes.json() : [];
        const diffData = diffRes.ok ? await diffRes.json() : [];
        const techData = techRes.ok ? await techRes.json() : [];
        const toxData = toxRes.ok ? await toxRes.json() : [];
        const cozyData = cozyRes.ok ? await cozyRes.json() : [];

        setMostRage(Array.isArray(mostData) ? mostData : []);
        setDifficulty(Array.isArray(diffData) ? diffData : []);
        setTechnical(Array.isArray(techData) ? techData : []);
        setToxicity(Array.isArray(toxData) ? toxData : []);
        setCozy(Array.isArray(cozyData) ? cozyData : []);
      } catch (err) {
        console.error("Failed to load leaderboards", err);
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Leaderboards
            </h1>
            <p className="text-xs text-slate-400">
              Who makes players uninstall, scream, and break controllers the most.
            </p>
          </div>
          <a
            href="/"
            className="text-xs text-slate-400 underline underline-offset-4 hover:text-slate-200"
          >
            ← Back to games
          </a>
        </header>

        {loading ? (
          <p className="text-sm text-slate-400">Loading leaderboards...</p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            <Board title="Most Rage-Inducing" caption="Overall RageScore" list={mostRage} />
            <Board title="Hardest Games" caption="Difficulty rage" list={difficulty} />
            <Board title="Most Broken (Technical)" caption="Lag, crashes, bugs" list={technical} />
            <Board title="Most Toxic Multiplayer" caption="Social / toxicity rage" list={toxicity} />
            <Board title="Least Rage (Cozy)" caption="Chill, comfy vibes" list={cozy} />
          </section>
        )}
      </div>
    </main>
  );
}

function Board({
  title,
  caption,
  list,
}: {
  title: string;
  caption: string;
  list: GameSummary[] | null | undefined;
}) {
  const games = Array.isArray(list) ? list : [];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        <p className="text-[11px] text-slate-500">{caption}</p>
      </header>
      {games.length === 0 ? (
        <p className="text-xs text-slate-500">No games in this board yet.</p>
      ) : (
        <ol className="space-y-1 text-xs">
          {games.map((game, index) => (
            <Row key={game.id} index={index} game={game} />
          ))}
        </ol>
      )}
    </section>
  );
}

function Row({ index, game }: { index: number; game: GameSummary }) {
  return (
    <li className="flex items-center justify-between rounded-lg bg-slate-950/70 px-3 py-1.5">
      <div className="flex items-center gap-2">
        <span className="w-5 text-[11px] text-slate-500">#{index + 1}</span>
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-50">
            {game.name}
          </span>
          <span className="text-[10px] text-slate-500">/{game.slug}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-500">
          RageScore
        </span>
        <span className="text-sm font-bold">{Math.round(game.rage_score)}</span>
      </div>
    </li>
  );
}
