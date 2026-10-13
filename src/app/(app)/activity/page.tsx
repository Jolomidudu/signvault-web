import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function ActivityPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Activity</h1>
      <p className="mt-2 text-sm text-slate-600">
        Activity history is not connected yet.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              History
            </p>
            <h2 className="mt-1 text-lg font-semibold">Unavailable</h2>
          </div>
          <Activity className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">The API records audit events internally but does not expose an authenticated activity feed. No events are fabricated here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
