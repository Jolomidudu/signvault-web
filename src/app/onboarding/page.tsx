"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Fingerprint, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

const steps = [
  { eyebrow: "Your vault", title: "Your Signature. Your Control.", description: "SignVault keeps every signature profile private, organized, and ready for the workflows you choose.", icon: ShieldCheck },
  { eyebrow: "Make it yours", title: "Make Every Signature Yours.", description: "Create profiles for professional, personal, or business use and customize their visual style.", icon: Sparkles },
  { eyebrow: "Ready to use", title: "Create. Copy. Sign.", description: "Store a signature once, keep versions, and use the right profile where you need it.", icon: Layers3 },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  return <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-8"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col"><div className="flex items-center justify-between"><span className="text-sm font-semibold">SignVault</span><Link href="/register" className="text-sm text-slate-400 hover:text-white">Skip</Link></div><section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-2"><div><div className="flex gap-2">{steps.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-white" : "bg-white/15"}`} />)}</div><p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">{current.eyebrow}</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{current.title}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">{current.description}</p><div className="mt-9 flex gap-3">{step > 0 && <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4" /> Back</Button>}{step < steps.length - 1 ? <Button className="bg-white text-slate-950 hover:bg-blue-50" onClick={() => setStep(step + 1)}>Next <ArrowRight className="h-4 w-4" /></Button> : <Link href="/register"><Button className="bg-white text-slate-950">Get Started <Check className="h-4 w-4" /></Button></Link>}</div></div><div className="relative rounded-[32px] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl sm:p-9"><div className="flex items-center justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white"><Icon className="h-6 w-6" /></span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Secure profile</span></div><div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6"><p className="text-xs text-slate-500">Signature preview</p><div className="mt-5 flex min-h-36 items-center justify-center rounded-xl border border-slate-200 bg-white"><span className="font-serif text-4xl tracking-tight">Jolomi Dudu</span></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-slate-200 p-4"><Fingerprint className="h-5 w-5 text-blue-600" /><p className="mt-3 text-sm font-semibold">Private</p><p className="mt-1 text-xs text-slate-500">Stored securely</p></div><div className="rounded-2xl border border-slate-200 p-4"><Layers3 className="h-5 w-5 text-blue-600" /><p className="mt-3 text-sm font-semibold">Versioned</p><p className="mt-1 text-xs text-slate-500">Easy to revisit</p></div></div></div></section></div></main>;
}
