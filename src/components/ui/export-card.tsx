import { Copy, Download, Info, Share2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export function ExportCard() {
  return <Card><CardHeader><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Image export</p><h2 className="mt-1 text-lg font-semibold">Export signature</h2></div><Info className="h-5 w-5 text-blue-600" /></CardHeader><CardContent className="space-y-3"><p className="text-sm leading-6 text-slate-600">A visual image is not a cryptographic signature and should not be treated as proof that a document has not changed.</p><div className="grid gap-3 sm:grid-cols-3"><Button variant="secondary"><Copy className="h-4 w-4" /> Copy to Clipboard</Button><Button variant="secondary"><Download className="h-4 w-4" /> Save as Image</Button><Button variant="secondary"><Share2 className="h-4 w-4" /> Share Signature</Button></div></CardContent></Card>;
}
