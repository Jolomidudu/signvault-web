import { FileCheck2 } from "lucide-react";

interface SignaturePreviewProps {
  signature: string;
  className?: string;
  compact?: boolean;
  showShield?: boolean;
}

export function SignaturePreview({ signature, className = "", compact = false, showShield = true }: SignaturePreviewProps) {
  return (
    <div className={`relative flex min-h-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-5 ${className}`}>
      <span className="select-none font-serif text-2xl font-medium tracking-tight text-slate-800 sm:text-3xl" style={{ fontFamily: "Georgia, serif", transform: "rotate(-2deg)" }}>{signature}</span>
      {showShield && <FileCheck2 className="absolute bottom-2 right-2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
      {!compact && <span className="absolute left-3 top-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Visual preview</span>}
    </div>
  );
}
