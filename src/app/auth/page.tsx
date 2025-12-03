"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setMessage("Logged in! Redirecting…");
        // give a moment to show message, then go home
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 700);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        setMessage("Signup successful! Check your email to confirm your account.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
        {/* Back link */}
        <a
          href="/"
          className="mb-8 inline-flex items-center text-xs text-slate-400 hover:text-slate-200"
        >
          ← Back to games
        </a>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "login" ? "Log in" : "Create account"}
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Use one account to track your personal rage logs, favorite games, and clips.
          </p>
        </div>

        <div className="mb-4 inline-flex rounded-full bg-slate-900 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-3 py-1 transition ${
              mode === "login"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-3 py-1 transition ${
              mode === "signup"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-xs">
            <label className="block text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading
              ? mode === "login"
                ? "Logging in…"
                : "Creating account…"
              : mode === "login"
              ? "Log in"
              : "Sign up"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-xs text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-3 text-xs text-emerald-400">
            {message}
          </p>
        )}

        <p className="mt-8 text-[10px] leading-relaxed text-slate-500">
          By using RageQuit.io you agree that we might anonymously aggregate your rage
          stats (rage score, rage events, etc) to improve the global rankings. No
          personal data is shown publicly.
        </p>
      </div>
    </main>
  );
}
