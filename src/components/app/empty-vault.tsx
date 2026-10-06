import Link from "next/link";
import { Plus, Signature } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function EmptyVault() {
  return <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Signature className="h-7 w-7" /></span><h2 className="mt-5 text-2xl font-semibold">Your vault is empty</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Add your first signature to get started. You can create a personal, professional, or business signature profile.</p><Link href="/signatures/new" className="mt-6"><Button><Plus className="h-4 w-4" /> Add Signature</Button></Link></div>;
}
