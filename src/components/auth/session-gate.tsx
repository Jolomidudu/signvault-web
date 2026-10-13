"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/components/auth/auth-provider";
import { safeReturnTo } from "@/src/lib/api-client";

export function SessionGate({ children }: { children: ReactNode }) {
  const { status, error, retryBootstrap } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const destination = safeReturnTo(`${pathname}${window.location.search}${window.location.hash}`);
    router.replace(`/login?returnTo=${encodeURIComponent(destination)}`);
  }, [pathname, router, status]);

  if (status === "authenticated") return children;

  if (status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <section className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-slate-950">Could not restore your session</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error || "Check your connection and try again."}</p>
          <button
            type="button"
            onClick={() => void retryBootstrap()}
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50" aria-label="Restoring session">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
    </main>
  );
}