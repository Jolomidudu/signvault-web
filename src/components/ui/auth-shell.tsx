import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/src/components/ui/logo";

export function AuthShell({ children, backTo, title, description }: { children: ReactNode; backTo?: string; title: string; description: string }) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-14 text-white lg:flex lg:flex-col">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" /><div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full border border-blue-400/20" />
        <Logo light />
        <div className="relative my-auto max-w-lg"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><ShieldCheck className="h-6 w-6 text-blue-300" /></span><h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">Your signature. Your control.</h1><p className="mt-5 text-lg leading-8 text-slate-300">Create, manage, and use your digital signatures in one secure personal vault.</p><div className="mt-10 space-y-4 text-sm text-slate-300"><p className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Private signature storage</p><p className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-blue-300" /> Version and access control</p><p className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-amber-300" /> Clear expiration rules</p></div></div>
        <p className="relative text-xs text-slate-500">© 2026 SignVault</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Logo /></div>
          {backTo && <Link href={backTo} className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back</Link>}
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
