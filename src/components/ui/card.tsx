import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, interactive = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${interactive ? "transition hover:-translate-y-0.5 hover:shadow-md" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-start justify-between gap-4 p-5 sm:p-6 ${className}`} {...props}>{children}</div>;
}

export function CardContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pb-5 sm:px-6 sm:pb-6 ${className}`} {...props}>{children}</div>;
}
