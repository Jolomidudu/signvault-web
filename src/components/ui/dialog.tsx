"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Dialog({ open, onOpenChange, title, description, children, footer }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onOpenChange(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="signvault-dialog-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="signvault-dialog-title" className="text-lg font-semibold">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}</div><button onClick={() => onOpenChange(false)} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">{footer}</div>}
      </section>
    </div>
  );
}
