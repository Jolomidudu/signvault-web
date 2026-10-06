import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
};

export function Badge({ children, variant = "neutral", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`} {...props}>{children}</span>;
}
