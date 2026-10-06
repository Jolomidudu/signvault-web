import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, description, action, align = "left" }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>}
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
