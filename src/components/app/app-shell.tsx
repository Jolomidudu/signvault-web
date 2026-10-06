"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, KeyRound, LayoutDashboard, LockKeyhole, Menu, Settings2, ShieldCheck, Signature, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/src/components/ui/logo";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Signatures", href: "/vault", icon: Signature },
  { label: "Create Signature", href: "/signatures/new", icon: ShieldCheck },
  { label: "Saved Versions", href: "/signatures/professional-01/versions", icon: KeyRound },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Security", href: "/settings/security", icon: LockKeyhole },
  { label: "Settings", href: "/settings", icon: Settings2 },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5">
      <div className="px-2"><Logo /></div>
      <nav className="mt-8 space-y-1" aria-label="Primary navigation">
        {navigation.map((item) => {
          const Icon = item.icon ?? LayoutDashboard;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-slate-950">Vault protected</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">Your signatures are kept private and access-controlled.</p>
        <Link href="/settings/security" className="mt-3 inline-flex text-xs font-semibold text-blue-700">Review security →</Link>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">JD</span>
        <div className="min-w-0"><p className="truncate text-sm font-medium">Jolomi Dudu</p><p className="truncate text-xs text-slate-500">Personal account</p></div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button aria-label="Open navigation" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100"><Menu className="h-5 w-5" /></button>
        <Logo compact />
        <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-semibold">JD</span>
      </header>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" aria-label="Close navigation" onClick={() => setOpen(false)} /><div className="relative h-full w-72 shadow-2xl">{sidebar}</div></div>}
      <div className="flex min-h-screen pt-16 lg:pt-0">
        <div className="hidden lg:block">{sidebar}</div>
        <main className="min-w-0 flex-1 lg:ml-0">
          <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">{children}</div>
        </main>
      </div>
    </div>
  );
}
