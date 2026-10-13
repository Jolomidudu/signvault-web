import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

const securityRows = [
  {
    title: "Change PIN",
    detail: "Manage your vault PIN",
    icon: KeyRound,
  },
  {
    title: "Biometric Unlock",
    detail: "Use device authentication when supported",
    icon: Fingerprint,
  },
  {
    title: "Auto-lock",
    detail: "Control vault session timeout",
    icon: LockKeyhole,
  },
];

export default function SecurityPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Vault control</p>
          <h1 className="mt-1 text-3xl font-semibold">Security</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review available authentication controls.
          </p>
        </div>
        <ShieldCheck className="h-5 w-5 text-slate-400" />
      </div>
      <Card className="mt-8">
        <CardHeader>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Available
            </p>
            <h2 className="mt-1 text-lg font-semibold">Backend authentication</h2>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {securityRows.map(({ title, detail, icon: Icon }) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
                <span className="text-xs font-medium text-slate-400">Not available</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-5">
        <CardHeader>
          <h2 className="font-semibold">Privacy-aware controls</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            SignVault uses the backend’s short-lived access token and HttpOnly refresh-cookie session. The API does not support PINs, biometrics, session listing, or configurable auto-lock; these controls are not active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
