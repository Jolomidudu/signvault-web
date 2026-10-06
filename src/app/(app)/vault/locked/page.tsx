import { Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function VaultLockedPage() {
  return <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 text-center"><span className="grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-700"><LockKeyhole className="h-9 w-9" /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Session locked</p><h1 className="mt-2 text-3xl font-semibold">Vault Locked</h1><p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Unlock your private signing vault with your PIN or supported biometric authentication.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button><LockKeyhole className="h-4 w-4" /> Unlock with PIN</Button><Button variant="secondary"><Fingerprint className="h-4 w-4" /> Use Biometrics</Button></div><p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4" /> Your signature data remains protected</p></div>;
}
