import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:bg-slate-50 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 ${className}`} {...props}>{children}</select>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint && <span className="block text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  );
}
