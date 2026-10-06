"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toast({ message, onClose }: { message: string; onClose?: () => void }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => { setVisible(false); onClose?.(); }, 3500); return () => window.clearTimeout(timer); }, [onClose]);
  if (!visible) return null;
  return <div role="status" className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><p className="text-sm font-semibold text-slate-900">{message}</p><p className="mt-1 text-xs text-slate-500">Your action was completed.</p></div><button onClick={() => setVisible(false)} aria-label="Dismiss notification" className="ml-2 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button></div>;
}
