"use client";

import { useEffect, useState } from "react";

type RageBreakdown = {
  rage_score: number;
  difficulty_rage: number;
  technical_rage: number;
  social_toxicity_rage: number;
  ui_design_rage: number;
};

type GameSummary = {
  id: number;
  name: string;
  slug: string;
  rage_score: number;
};

type GameDetail = {
  id: number;
  name: string;
  slug: string;
  rage: RageBreakdown;
};

export default function ComparePage() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [leftGame, setLeftGame] = useState<GameDetail | null>(null);
  const [rightGame, setRightGame] = useState<GameDetail | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/games?limit=100`
        );
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error("Failed to load games", err);
      }
    };
    loadGames();
  }, []);

  useEffect(() => {
    const load = async (id: string, setter: (g: GameDetail | null) => void) => {
      if (!id) {
        setter(null);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/games/${id}`
        );
        if (!res.ok) {
          setter(null);
          return;
        }
        const data = await res.json();
        setter(data);
      } catch (err) {
        console.error("Failed to load game", err);
        setter(null);
      }
    };

    load(leftId, setLeftGame);
    load(rightId, setRightGame);
  }, [leftId, rightId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Rage Duel
            </h1>
            <p className="text-xs text-slate-400">
              Put two games in the arena and compare their rage profile.
            </p>
          </div>
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4"
          >
            ← Back to games
          </a>
        </header>

        {/* pickers */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Select contenders
            </span>
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs"
            >
              <option value="">Left side...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 px-1">vs</span>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs"
            >
              <option value="">Right side...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* side-by-side */}
        <section className="grid gap-4 md:grid-cols-2">
          <ComparePanel game={leftGame} side="left" />
          <ComparePanel game={rightGame} side="right" />
        </section>

        {/* summary bar */}
        {leftGame && rightGame && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Rage Faceoff
            </h2>
            <div className="flex flex-col gap-2">
              <DuelRow
                label="RageScore"
                left={leftGame.rage.rage_score}
                right={rightGame.rage.rage_score}
              />
              <DuelRow
                label="Difficulty"
                left={leftGame.rage.difficulty_rage}
                right={rightGame.rage.difficulty_rage}
              />
              <DuelRow
                label="Technical"
                left={leftGame.rage.technical_rage}
                right={rightGame.rage.technical_rage}
              />
              <DuelRow
                label="Toxicity"
                left={leftGame.rage.social_toxicity_rage}
                right={rightGame.rage.social_toxicity_rage}
              />
              <DuelRow
                label="UI / Design"
                left={leftGame.rage.ui_design_rage}
                right={rightGame.rage.ui_design_rage}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ComparePanel({ game, side }: { game: GameDetail | null; side: "left" | "right" }) {
  if (!game) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 text-xs text-slate-500">
        Choose a game on the {side} side.
      </div>
    );
  }

  const r = game.rage;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-50">{game.name}</h2>
          <p className="text-[10px] text-slate-500">/{game.slug}</p>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
            RageScore
          </div>
          <div className="text-xl font-extrabold">{Math.round(r.rage_score)}</div>
        </div>
      </header>
      <CompareBar label="Difficulty" value={r.difficulty_rage} />
      <CompareBar label="Technical" value={r.technical_rage} />
      <CompareBar label="Toxicity" value={r.social_toxicity_rage} />
      <CompareBar label="UI / Design" value={r.ui_design_rage} />
    </article>
  );
}

function CompareBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between text-[10px] text-slate-300">
        <span>{label}</span>
        <span className="font-mono">{Math.round(clamped)}</span>
      </div>
      <div className="mt-0.5 h-1.5 rounded-full bg-slate-800">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-fuchsia-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function DuelRow({
  label,
  left,
  right,
}: {
  label: string;
  left: number;
  right: number;
}) {
  const total = left + right || 1;
  const leftShare = (left / total) * 100;
  const rightShare = (right / total) * 100;

  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-slate-300">
        <span>{label}</span>
        <span className="font-mono">
          {Math.round(left)} vs {Math.round(right)}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-800 text-[9px]">
        <div
          className="flex items-center justify-end bg-gradient-to-r from-sky-500 to-emerald-400 px-1"
          style={{ width: `${leftShare}%` }}
        >
          {leftShare > 12 && <span>L</span>}
        </div>
        <div
          className="flex items-center justify-start bg-gradient-to-r from-fuchsia-500 to-red-500 px-1"
          style={{ width: `${rightShare}%` }}
        >
          {rightShare > 12 && <span>R</span>}
        </div>
      </div>
    </div>
  );
}
