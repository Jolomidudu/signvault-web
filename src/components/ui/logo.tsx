import { ShieldCheck } from "lucide-react";

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="SignVault home">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? "bg-white text-slate-950" : "bg-slate-950 text-white"}`}>
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && <span className={`text-lg font-semibold tracking-tight ${light ? "text-white" : "text-slate-950"}`}>SignVault</span>}
    </div>
  );
}
