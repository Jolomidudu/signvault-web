import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { SignatureCard } from "@/src/components/app/signature-card";
import { PageHeader } from "@/src/components/app/page-header";
import { mockSignatures } from "@/src/lib/mock-data";

export default function VaultPage() {
  return <div><PageHeader eyebrow="Signature library" title="Your Signature Vault" description="3 of 25 signatures saved" action={<div className="flex gap-2"><Button variant="secondary"><SlidersHorizontal className="h-4 w-4" /> Filter</Button><Button><Plus className="h-4 w-4" /> Add Signature</Button></div>} /><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block w-full sm:max-w-sm"><span className="sr-only">Search signatures</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input placeholder="Search signatures" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" /></label><p className="text-xs text-slate-500">Showing all signatures</p></div><Card className="mt-5 p-0"><CardContent className="p-0"><div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">{mockSignatures.map(signature => <SignatureCard key={signature.id} signature={signature} />)}</div></CardContent></Card></div>;
}
