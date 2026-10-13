"use client";

import { BadgeCheck, CalendarDays, ShieldCheck, Signature } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/components/auth/auth-provider";
import { getSignatureSummary, type VaultSummary } from "@/src/lib/signatures";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function ProfilePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<VaultSummary | null>(null);

  useEffect(() => {
    let active = true;
    void getSignatureSummary()
      .then((value) => { if (active) setSummary(value); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const initials = user?.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() ?? "SV";
  const values = [
    { label: "Signatures", value: summary?.total, icon: Signature },
    { label: "Active", value: summary?.active, icon: ShieldCheck },
    { label: "Remaining capacity", value: summary?.remaining, icon: CalendarDays },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-slate-600">Your account and signature vault details.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <Card className="text-center"><CardContent className="p-8"><span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-200 text-2xl font-semibold">{initials}</span><h2 className="mt-5 text-xl font-semibold">{user?.displayName}</h2><p className="mt-1 text-sm text-slate-500">{user?.email}</p><span className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><BadgeCheck className="h-4 w-4" />{user?.emailVerified ? "Email verified" : "Email not verified"}</span></CardContent></Card>
        <Card><CardHeader><h2 className="font-semibold">Account statistics</h2></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2">{values.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border border-slate-200 p-4"><Icon className="h-5 w-5 text-slate-500" /><p className="mt-4 text-2xl font-semibold">{value ?? "—"}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">Profile editing is not currently supported by the API.</p></CardContent></Card>
      </div>
    </div>
  );
}
