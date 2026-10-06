import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }: ButtonProps) {
  const styles = {
    primary: "bg-slate-950 text-white hover:bg-slate-800",
    secondary: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-sm", lg: "h-12 px-5 text-base" };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
