import type { HTMLAttributes } from "react";

export function Avatar({ initials, className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { initials: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 ${className}`} {...props}>{initials}</span>;
}
