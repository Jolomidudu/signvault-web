import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm"><Inbox className="h-5 w-5" /></span><h3 className="mt-4 font-semibold text-slate-900">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
