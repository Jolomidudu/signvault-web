import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm text-slate-600">{description}</p></div>{action}</div>;
}
