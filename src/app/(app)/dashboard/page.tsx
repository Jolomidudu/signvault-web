"use client";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Copy,
  Plus,
  ShieldCheck,
  Signature,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth/auth-provider";
import { ApiError } from "@/src/lib/api-client";
import { getSignatureSummary, listSignatures, type Paginated, type SignatureRecord, type VaultSummary } from "@/src/lib/signatures";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { SignatureCard } from "@/src/components/app/signature-card";

const stats = [
  {
    label: "Signature count",
    key: "total" as const,
    icon: Signature,
    tone: "bg-slate-950 text-white",
  },
  {
    label: "Active signatures",
    key: "active" as const,
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Revoked signatures",
    key: "archived" as const,
    icon: ShieldCheck,
    tone: "bg-red-50 text-red-600",
  },
  {
    label: "Expiring soon",
    key: "expired" as const,
    icon: Timer,
    tone: "bg-amber-50 text-amber-700",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [recent, setRecent] = useState<Paginated<SignatureRecord> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getSignatureSummary(),
      listSignatures({ limit: 2, sort: "updatedAt", order: "desc" }),
    ])
      .then(([nextSummary, nextRecent]) => {
        if (!active) return;
        setError("");
        setSummary(nextSummary);
        setRecent(nextRecent);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof ApiError ? cause.message : "Dashboard data could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [retry]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date())}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back, {user?.firstName ?? "there"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Here is the current state of your signature vault.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/vault"><Button variant="secondary"><Copy className="h-4 w-4" /> Open vault</Button></Link>
          <Button>
            <Plus className="h-4 w-4" /> Create Signature
          </Button>
        </div>
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, key, icon: Icon, tone }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{loading ? "…" : summary?.[key] ?? "—"}</p>
                <p className="mt-1 text-xs text-slate-400">{key === "total" && summary ? `${summary.remaining} of ${summary.limit} remaining` : "from your vault"}</p>
              </div>
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent signatures
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Your latest profiles
              </h2>
            </div>
            <Link href="/vault" className="text-sm font-semibold text-blue-700">
              View vault
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {loading && <p className="text-sm text-slate-500">Loading signatures…</p>}
              {error && <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><Button variant="secondary" size="sm" className="mt-3" onClick={() => { setLoading(true); setError(""); setRetry((value) => value + 1); }}>Retry</Button></div>}
              {!loading && !error && recent?.items.length === 0 && <p className="text-sm text-slate-500">Your vault is empty. Create a signature profile to get started.</p>}
              {recent?.items.map((signature) => <SignatureCard key={signature.id} signature={signature} />)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent activity
              </p>
              <h2 className="mt-1 text-lg font-semibold">Latest events</h2>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-600">Activity history is not available yet. The API does not currently expose an authenticated activity feed.</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Plus,
            title: "Create Signature",
            text: "Start a new signature profile.",
            href: "/signatures/new",
          },
          {
            icon: Copy,
            title: "Review versions",
            text: "Explore a signature’s saved designs.",
            href: recent?.items[0] ? `/signatures/${recent.items[0].id}/versions` : "/vault",
          },
          {
            icon: ShieldCheck,
            title: "Verify Signature",
            text: "Review future verification options.",
            href: "/settings/security",
          },
        ].map(({ icon: Icon, title, text, href }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-950 group-hover:text-white">
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
