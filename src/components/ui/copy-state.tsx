"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Toast } from "@/src/components/ui/toast";

export function CopyState({ title = "Signature copied", description = "It can now be pasted into a supported application." }: { title?: string; description?: string }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const handleCopy = async () => { await navigator.clipboard.writeText("Paul Ogini"); setCopied(true); };
  return <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 text-center"><span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-9 w-9" /></span><h1 className="mt-6 text-3xl font-semibold">{title}</h1><p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{description}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button variant="secondary" onClick={handleCopy}><Copy className="h-4 w-4" /> Copy Again</Button><Button onClick={() => router.push("/vault")}>Back to Vault</Button></div>{copied && <Toast message="Signature copied to clipboard" />}</div>;
}
