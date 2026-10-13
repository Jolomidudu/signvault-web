"use client";

import Link from "next/link";
import {
  Fingerprint,
  KeyRound,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";

const links = [
  {
    label: "Profile",
    detail: "Manage your personal information",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Security",
    detail: "Account session and available controls",
    href: "/settings/security",
    icon: LockKeyhole,
  },
  {
    label: "Privacy",
    detail: "Informational privacy controls",
    href: "/settings/privacy",
    icon: Fingerprint,
  },
  {
    label: "Auto-lock",
    detail: "Choose a session timeout",
    href: "/settings/security/auto-lock",
    icon: KeyRound,
  },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage your account and vault preferences.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {links.map(({ label, detail, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Card className="mt-6 border-amber-200 bg-amber-50/50"><CardContent><h2 className="font-semibold">Some controls are not available yet</h2><p className="mt-2 text-sm leading-6 text-slate-600">The API does not currently support account deletion, PINs, biometrics, privacy controls, or automatic lock preferences. Those settings are not represented as active security enforcement.</p></CardContent></Card>
    </div>
  );
}
