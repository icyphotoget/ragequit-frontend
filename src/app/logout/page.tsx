"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    };

    doLogout();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-md px-4 py-10 text-sm text-slate-400">
        Logging you out…
      </div>
    </main>
  );
}
