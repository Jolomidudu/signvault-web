import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/src/components/ui/card";

const available = ["Version history", "Private API-backed assets", "Canonical SVG and PNG exports"];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <span className="text-lg font-semibold">SignVault</span>
        <Link href="/login" className="text-sm font-medium text-slate-600">
          Sign in
        </Link>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Pricing
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Simple plans for signature control.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">The backend currently supports up to 25 signature profiles per account. Subscription tiers and payment processing are not connected.</p>
        <Card className="mx-auto mt-12 max-w-xl p-8 text-left">
          <p className="text-sm font-semibold">Current backend allowance</p>
          <p className="mt-5 text-4xl font-semibold">25 <span className="text-base font-normal text-slate-500">signature profiles</span></p>
          <ul className="mt-7 space-y-4">{available.map((feature) => <li key={feature} className="flex items-center gap-3 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-700" />{feature}</li>)}</ul>
          <p className="mt-7 border-t border-slate-100 pt-5 text-sm text-slate-500">Sharing, paid plans, and payment processing are not available.</p>
        </Card>
      </section>
    </main>
  );
}
