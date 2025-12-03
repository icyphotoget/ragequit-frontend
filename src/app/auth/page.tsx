"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Logged in! You can close this tab or go back.");
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage("Logged out.");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <h1 className="text-xl font-bold text-center">RageQuit.io account</h1>

        <div className="flex gap-2 text-xs">
          <button
            className={`flex-1 rounded-full py-1 ${
              mode === "login"
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-800 text-slate-300"
            }`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={`flex-1 rounded-full py-1 ${
              mode === "signup"
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-800 text-slate-300"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-sky-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-sky-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sky-500 py-1.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading
              ? "Working..."
              : mode === "signup"
              ? "Create account"
              : "Log in"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-xs text-slate-400 hover:text-slate-200"
        >
          Log out
        </button>

        {message && (
          <p className="text-xs text-center text-slate-300">{message}</p>
        )}

        <a
          href="/"
          className="block text-center text-xs text-slate-500 hover:text-slate-200"
        >
          ← Back to RageQuit.io
        </a>
      </div>
    </main>
  );
}
