import Link from "next/link";
import { ArrowRight, Check, Copy, Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Logo } from "@/src/components/ui/logo";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { SignaturePreview } from "@/src/components/ui/signature-preview";

const features = [
  { icon: KeyRound, title: "Multiple signatures", text: "Create distinct profiles for personal, business, and professional needs." },
  { icon: Sparkles, title: "Customize every detail", text: "Refine text, style, size, spacing, and appearance in your own vault." },
  { icon: LockKeyhole, title: "Secure storage", text: "Keep your signature assets private with status, expiration, and access controls." },
  { icon: Copy, title: "Copy and export", text: "Copy signatures into supported workflows or export a safe visual representation." },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex" aria-label="Main navigation">
          <a href="#features" className="hover:text-slate-950">Features</a><a href="#security" className="hover:text-slate-950">Security</a><a href="#how-it-works" className="hover:text-slate-950">How it works</a><a href="#faq" className="hover:text-slate-950">FAQ</a>
        </nav>
        <div className="flex items-center gap-2"><Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-slate-700 sm:inline">Sign In</Link><Link href="/register"><Button size="sm" className="w-full sm:w-auto">Create Account</Button></Link></div>
      </header>
      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"><ShieldCheck className="h-3.5 w-3.5" /> Your signature. Your control.</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">Your Signature.<br /><span className="text-slate-400">Your Control.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Create, securely store, manage, and use your digital signatures from one private vault—built for the way you work.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register"><Button size="lg" className="w-full sm:w-auto">Create Your Signature <ArrowRight className="h-4 w-4" /></Button></Link><a href="#features"><Button variant="secondary" size="lg" className="w-full sm:w-auto">Explore SignVault</Button></a></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Private by design</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Signature versions</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Future verification</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-10 rounded-full bg-blue-100/60 blur-3xl" />
            <div className="animate-float relative rounded-[28px] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/50">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 sm:p-7">
                <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Signature vault</p><p className="mt-1 font-semibold">Your active profiles</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">3 active</span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Professional</p><SignaturePreview signature="Paul Ogini" compact /><p className="mt-3 text-xs font-medium text-emerald-700">Active · Ready</p></div><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Personal</p><SignaturePreview signature="Jolomi Dudu" compact /><p className="mt-3 text-xs font-medium text-emerald-700">Active · Ready</p></div></div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">Security status</span><span className="text-xs font-semibold text-emerald-600">Protected</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full bg-slate-950" /></div></div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="border-y border-slate-100 bg-slate-50 py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionHeading eyebrow="Built for control" title="One secure place for every signature." description="SignVault keeps your signature assets organized, protected, and ready to use—without mixing them with document management." align="center" /><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <Card key={title} interactive className="p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Icon className="h-5 w-5" /></span><h3 className="mt-6 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div></div></section>
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><SectionHeading eyebrow="Simple workflow" title="From blank page to signed with confidence." /><div className="mt-14 grid gap-5 md:grid-cols-4">{["Create your signature", "Securely store it", "Use it anywhere", "Verify signed content"].map((title, index) => <div key={title} className="relative"><span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">{index + 1}</span><h3 className="mt-6 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{index === 0 ? "Choose a signature style and enter the text or draw your own." : index === 1 ? "Store each profile with its status, version, and usage rules." : index === 2 ? "Copy, export, or share your signature for supported workflows." : "Future cryptographic verification will help identify altered content."}</p></div>)}</div></section>
        <section id="security" className="bg-slate-950 py-24 text-white"><div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Security first</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">Designed around clear, secure signature handling.</h2><p className="mt-5 leading-7 text-slate-300">SignVault is intentionally focused on signature storage and management. Future cryptographic capabilities will separate visual signatures from verified cryptographic signatures.</p></div><div className="grid gap-3">{["Access and usage controls", "Expiration and revocation states", "Version history", "Future verification records"].map(item => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><Fingerprint className="h-5 w-5 text-blue-300" /><span className="font-medium">{item}</span></div>)}</div></div></section>
        <section id="faq" className="mx-auto max-w-4xl px-5 py-24 lg:px-8"><SectionHeading eyebrow="Questions" title="What is SignVault?" description="SignVault is a secure digital signature vault for creating, managing, copying, exporting, and sharing signature profiles." align="center" /><div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600"><p><strong className="text-slate-950">Visual signatures and cryptographic signatures are different.</strong> A visual signature image is a representation you can copy or export. A cryptographic signature is a future capability that may verify a file or content using a digital key and record.</p></div></section>
        <section className="px-5 pb-24 lg:px-8"><div className="mx-auto max-w-7xl rounded-3xl bg-blue-950 px-6 py-16 text-center text-white sm:px-12"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Take control of your digital signature.</h2><p className="mx-auto mt-4 max-w-xl text-blue-100">Create your first signature profile and keep it ready wherever you need it.</p><Link href="/register" className="mt-8 inline-flex"><Button variant="secondary" size="lg" className="bg-white text-slate-950 hover:bg-blue-50">Create your SignVault</Button></Link></div></section>
      </main>
      <footer className="border-t border-slate-200 px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><Logo /><p>© 2026 SignVault. Your Signature. Your Control.</p></div></footer>
    </div>
  );
}
