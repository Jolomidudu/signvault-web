import { Database, EyeOff, FileLock2, Globe2, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

const rows = [
  {
    title: "Local access",
    detail: "Protected signature endpoints require the in-memory access token.",
    icon: EyeOff,
  },
  {
    title: "Data retention",
    detail: "The API preserves archived signatures and versions; no user retention controls are exposed.",
    icon: Database,
  },
  {
    title: "Sharing controls",
    detail: "The API does not currently expose sharing operations.",
    icon: Share2,
  },
  {
    title: "Privacy policy",
    detail: "No privacy-policy document is configured in this app.",
    icon: Globe2,
  },
];

export default function PrivacyPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-2 text-sm text-slate-600">
        Review how your signature data is handled within SignVault.
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {rows.map(({ title, detail, icon: Icon }) => (
          <Card key={title}>
            <CardHeader>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <Icon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <CardHeader>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Data boundary
            </p>
            <h2 className="mt-1 font-semibold">Signature data boundary</h2>
          </div>
          <FileLock2 className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            Signature assets are retrieved through authenticated API routes. No direct object-storage URL is exposed to the browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
