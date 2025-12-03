"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

//
// Types
//

type RageBreakdown = {
  rage_score: number;
  difficulty_rage: number;
  technical_rage: number;
  social_toxicity_rage: number;
  ui_design_rage: number;
  max_achievement_drop?: number | null;
  max_drop_from?: number | null;
  max_drop_to?: number | null;
  max_drop_achievement?: string | null;
};

type GameDetail = {
  id: number;
  name: string;
  slug: string;
  rage: RageBreakdown;
};

type SteamReview = {
  is_positive: boolean;
  language?: string | null;
  review_text: string;
  created_at_steam?: string | null;
};

type RedditPost = {
  title: string;
  body: string;
  upvotes?: number | null;
  num_comments?: number | null;
  created_utc?: string | null;
};

type RageWord = {
  word: string;
  score: number;
};

type RagePoint = {
  date: string;
  rage_score: number;
  positive: number;
  negative: number;
  total: number;
};

type RageClip = {
  id: number;
  source?: string | null;
  url: string;
  title?: string | null;
  thumbnail_url?: string | null;
};

//
// Page component
//

export default function GamePage() {
  const params = useParams();
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId)
    ? (rawId[0] as string | undefined)
    : (rawId as string | undefined);

  const [game, setGame] = useState<GameDetail | null>(null);
  const [steamReviews, setSteamReviews] = useState<SteamReview[]>([]);
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [rageWords, setRageWords] = useState<RageWord[]>([]);
  const [rageTimeline, setRageTimeline] = useState<RagePoint[]>([]);
  const [rageClips, setRageClips] = useState<RageClip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      if (!id) {
        console.error("No game id in route params");
        setLoading(false);
        return;
      }

      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        const gameUrl = `${base}/games/${id}`;
        const reviewsUrl = `${base}/games/${id}/reviews?limit=15`;
        const redditUrl = `${base}/games/${id}/reddit?limit=15`;
        const wordsUrl = `${base}/games/${id}/rage-words?limit=40`;
        const timelineUrl = `${base}/games/${id}/rage-timeline`;
        const clipsUrl = `${base}/games/${id}/clips`;

        console.log("Fetching:", gameUrl, reviewsUrl, redditUrl, wordsUrl, timelineUrl, clipsUrl);

        const [
          gameRes,
          reviewsRes,
          redditRes,
          wordsRes,
          timelineRes,
          clipsRes,
        ] = await Promise.all([
          fetch(gameUrl),
          fetch(reviewsUrl),
          fetch(redditUrl),
          fetch(wordsUrl),
          fetch(timelineUrl),
          fetch(clipsUrl),
        ]);

        if (!gameRes.ok) {
          console.error("Game fetch failed:", gameRes.status, gameRes.statusText);
          setGame(null);
          return;
        }

        const gameData = await gameRes.json();
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];
        const redditData = redditRes.ok ? await redditRes.json() : [];
        const wordsData = wordsRes.ok ? await wordsRes.json() : [];
        const timelineData = timelineRes.ok ? await timelineRes.json() : [];
        const clipsData = clipsRes.ok ? await clipsRes.json() : [];

        setGame(gameData);
        setSteamReviews(reviewsData);
        setRedditPosts(redditData);
        setRageWords(wordsData);
        setRageTimeline(timelineData);
        setRageClips(clipsData);
      } catch (err) {
        console.error("Failed to load game + rage data", err);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-400">
          Loading rage profile...
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← Back to games
          </a>
          <p className="text-sm">
            Game not found. (URL id: <code>{String(id ?? "undefined")}</code>)
          </p>
        </div>
      </main>
    );
  }

  const r = game.rage;
  const angle = Math.min(360, Math.max(0, (r.rage_score / 100) * 360));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        <a
          href="/"
          className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200"
        >
          ← Back to games
        </a>

        {/* Header + gauge */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {game.name}
            </h1>
            <p className="text-xs text-slate-400">/{game.slug}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-28 w-28">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#f97316 0deg, #f97316 ${angle}deg, #0f172a ${angle}deg 360deg)`,
                }}
              />
              <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-slate-950 text-center">
                <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400">
                  RageScore
                </span>
                <span className="text-3xl font-black">
                  {Math.round(r.rage_score)}
                </span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
            </div>
          </div>
        </header>

        {/* Breakdown + choke */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-200">
              Rage Breakdown
            </h2>

            <RageBar label="Difficulty" value={r.difficulty_rage} />
            <RageBar label="Technical" value={r.technical_rage} />
            <RageBar label="Social / Toxicity" value={r.social_toxicity_rage} />
            <RageBar label="UI / Design" value={r.ui_design_rage} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-200">
              Biggest Rage Choke (Achievements)
            </h2>
            {r.max_achievement_drop ? (
              <div className="space-y-2 text-xs">
                <p>
                  The largest drop in players is{" "}
                  <span className="font-semibold">
                    {r.max_achievement_drop.toFixed(1)}%
                  </span>{" "}
                  at:
                </p>
                <p className="text-sm font-semibold text-slate-100">
                  {r.max_drop_achievement ?? "Unknown achievement"}
                </p>
                <p className="text-slate-400">
                  Completion falls from{" "}
                  <span className="font-semibold">
                    {r.max_drop_from?.toFixed(1)}%
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {r.max_drop_to?.toFixed(1)}%
                  </span>
                  , which is a strong indicator of a rage / difficulty spike.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Not enough achievement data yet to determine a choke point.
              </p>
            )}
          </div>
        </section>

        {/* Rage spike timeline */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Rage Spike Timeline (Steam Reviews)
          </h2>
          {rageTimeline.length === 0 ? (
            <p className="text-xs text-slate-500">
              Not enough review history to show a timeline.
            </p>
          ) : (
            <RageTimelineChart points={rageTimeline} />
          )}
        </section>

        {/* Rage Feed */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Steam reviews */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              Steam Rage Feed
            </h2>
            {steamReviews.length === 0 ? (
              <p className="text-xs text-slate-500">
                No rage detected yet from Steam reviews.
              </p>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {steamReviews.map((rev, idx) => (
                  <SteamReviewCard key={idx} review={rev} />
                ))}
              </div>
            )}
          </div>

          {/* Reddit posts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              Reddit Salt Stream
            </h2>
            {redditPosts.length === 0 ? (
              <p className="text-xs text-slate-500">
                No Reddit posts fetched yet for this game.
              </p>
            ) : (
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                {redditPosts.map((post, idx) => (
                  <RedditPostCard key={idx} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Rage Word Cloud */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Rage Word Cloud
          </h2>
          {rageWords.length === 0 ? (
            <p className="text-xs text-slate-500">
              Not enough rage text yet to build a cloud.
            </p>
          ) : (
            <RageWordCloud words={rageWords} />
          )}
        </section>

        {/* Rage Clips */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
            Rage Clips
          </h2>
          {rageClips.length === 0 ? (
            <p className="text-xs text-slate-500">
              No clips added yet for this game.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rageClips.map((clip) => (
                <RageClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

//
// Helper components
//

function RageBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-[11px] text-slate-300">
        <span>{label}</span>
        <span className="font-mono">{Math.round(clamped)}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-orange-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function SteamReviewCard({ review }: { review: SteamReview }) {
  const tone = review.is_positive ? "Positive" : "Negative";
  const toneColor = review.is_positive ? "text-emerald-300" : "text-red-300";

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
      <header className="mb-1 flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold ${toneColor}`}>
          {tone} review
        </span>
        <span className="text-[10px] text-slate-500">
          {formatDate(review.created_at_steam)}
        </span>
      </header>
      <p className="whitespace-pre-wrap text-[11px] text-slate-200">
        {review.review_text}
      </p>
      {review.language && (
        <div className="mt-1 text-[9px] text-slate-500">
          Language: {review.language}
        </div>
      )}
    </article>
  );
}

function RedditPostCard({ post }: { post: RedditPost }) {
  const meta: string[] = [];
  if (typeof post.upvotes === "number") meta.push(`${post.upvotes} upvotes`);
  if (typeof post.num_comments === "number")
    meta.push(`${post.num_comments} comments`);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
      <header className="mb-1 flex items-center justify-between gap-2">
        <span className="line-clamp-1 text-[11px] font-semibold text-slate-50">
          {post.title}
        </span>
        <span className="text-[10px] text-slate-500">
          {formatDate(post.created_utc)}
        </span>
      </header>
      {post.body && (
        <p className="line-clamp-5 whitespace-pre-wrap text-[11px] text-slate-200">
          {post.body}
        </p>
      )}
      {meta.length > 0 && (
        <div className="mt-1 text-[9px] text-slate-500">
          {meta.join(" • ")}
        </div>
      )}
    </article>
  );
}

function RageWordCloud({ words }: { words: RageWord[] }) {
  if (!words.length) return null;

  const max = Math.max(...words.map((w) => w.score));
  const min = Math.min(...words.map((w) => w.score));

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {words.map((w, idx) => {
        const norm = max === min ? 0.5 : (w.score - min) / (max - min); // 0–1
        const size = 0.8 + norm * 1.6; // rem
        const opacity = 0.4 + norm * 0.6;

        return (
          <span
            key={`${w.word}-${idx}`}
            className="select-none rounded-md px-1.5 py-0.5"
            style={{
              fontSize: `${size}rem`,
              opacity,
              background:
                "radial-gradient(circle at top, rgba(56,189,248,0.25), transparent)",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
}

function RageTimelineChart({ points }: { points: RagePoint[] }) {
  if (!points.length) return null;
  const maxRage = Math.max(...points.map((p) => p.rage_score));

  return (
    <div className="space-y-2">
      <div className="flex h-24 items-end gap-[2px]">
        {points.map((p, idx) => {
          const h = maxRage > 0 ? (p.rage_score / maxRage) * 100 : 0;
          return (
            <div
              key={idx}
              className="group relative flex-1 overflow-hidden rounded-t-sm bg-slate-800"
            >
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-500 via-orange-400 to-amber-300"
                style={{ height: `${h}%` }}
              />
              <div className="absolute inset-0 flex flex-col justify-center bg-slate-950/90 px-1 opacity-0 transition group-hover:opacity-100">
                <span className="text-[9px] font-semibold text-slate-100">
                  {p.rage_score.toFixed(0)}% rage
                </span>
                <span className="text-[9px] text-slate-400">
                  {p.negative} neg / {p.total} reviews
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-slate-500">
        <span>{new Date(points[0].date).toLocaleDateString()}</span>
        <span>
          {new Date(points[points.length - 1].date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function RageClipCard({ clip }: { clip: RageClip }) {
  const isYouTube =
    clip.url.includes("youtube.com") || clip.url.includes("youtu.be");

  let embedUrl = clip.url;
  if (isYouTube) {
    const match = clip.url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    const vid = match?.[1];
    if (vid) {
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    }
  }

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="line-clamp-1 text-[11px] font-semibold text-slate-50">
          {clip.title ?? "Rage clip"}
        </span>
        <span className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
          {clip.source ?? "clip"}
        </span>
      </div>
      {isYouTube ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800">
          <iframe
            src={embedUrl}
            title={clip.title ?? "Rage clip"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={clip.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-[11px] text-sky-400 underline underline-offset-4 hover:text-sky-200"
        >
          Open clip →
        </a>
      )}
    </article>
  );
}
