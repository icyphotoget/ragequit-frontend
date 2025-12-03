"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserInfo = {
  email: string | null;
};

export function UserButton() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({ email: user.email ?? null });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? null });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <span className="text-[10px] text-slate-500">
        Checking session…
      </span>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push("/auth")}
        className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-100 hover:border-sky-500 hover:text-sky-300"
      >
        Log in / Sign up
      </button>
    );
  }

  const displayName = user.email ?? "Player";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px]">
      <span className="max-w-[150px] truncate text-slate-200">
        {displayName}
      </span>
      <button
        onClick={handleLogout}
        className="text-[10px] font-semibold text-orange-300 hover:text-orange-200"
      >
        Logout
      </button>
    </div>
  );
}
