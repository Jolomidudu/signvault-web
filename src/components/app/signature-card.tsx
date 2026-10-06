import Link from "next/link";
import { Copy, Download, Eye, MoreHorizontal, Share2 } from "lucide-react";
import type { Signature } from "@/src/lib/types";
import { SignaturePreview } from "@/src/components/ui/signature-preview";
import { SignatureStatusBadge } from "@/src/components/ui/status-badge";

export function SignatureCard({ signature }: { signature: Signature }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="p-4"><SignaturePreview signature={signature.signature} compact /><div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-950">{signature.name}</h3><p className="mt-1 text-xs text-slate-500">{signature.category} · {signature.owner}</p></div><SignatureStatusBadge status={signature.status} /></div></div>
      <div className="border-t border-slate-100 px-4 py-3"><div className="flex items-center justify-between gap-2"><p className="text-xs text-slate-500">{signature.lastModified}</p><div className="flex items-center gap-1"><Link href={`/signatures/${signature.id}`} aria-label={`View ${signature.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Eye className="h-4 w-4" /></Link><button aria-label={`Copy ${signature.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Copy className="h-4 w-4" /></button><button aria-label={`Share ${signature.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Share2 className="h-4 w-4" /></button><button aria-label={`Export ${signature.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Download className="h-4 w-4" /></button><button aria-label={`More actions for ${signature.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"><MoreHorizontal className="h-4 w-4" /></button></div></div></div>
    </article>
  );
}
