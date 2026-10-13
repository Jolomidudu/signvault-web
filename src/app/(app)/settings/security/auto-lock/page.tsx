import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function AutoLockPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Auto-lock</h1>
      <p className="mt-2 text-sm text-slate-600">
        Automatic locking is not currently supported by the API.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Session protection
            </p>
            <h2 className="mt-1 font-semibold">No server-enforced preference</h2>
          </div>
          <Clock3 className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">The access token expires quickly and the refresh session is managed by the backend HttpOnly cookie. The frontend does not claim to enforce inactivity lock preferences.</p>
        </CardContent>
      </Card>
    </div>
  );
}
