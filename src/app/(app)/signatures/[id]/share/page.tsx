import { Share2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function ShareSignaturePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Sharing</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sharing is not connected to the backend.
      </p>
      <Card className="mt-8"><CardHeader><h2 className="font-semibold">No sharing endpoint</h2><Share2 className="h-5 w-5 text-slate-400" /></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600">The API currently has no share-link, recipient, or permission contract. No share operation is simulated here.</p></CardContent></Card>
    </div>
  );
}
