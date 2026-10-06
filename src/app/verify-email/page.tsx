import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/src/components/ui/auth-shell";
import { Button } from "@/src/components/ui/button";

export default function VerifyEmailPage() {
  return <AuthShell title="Verify your email" description="Your email verification is ready to complete."><div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><CheckCircle2 className="h-8 w-8 text-emerald-600" /><p className="mt-3 font-semibold text-emerald-900">Verification link received</p><p className="mt-1 text-sm leading-6 text-emerald-800">This mock screen confirms the email verification flow without connecting to a backend.</p></div><Button variant="secondary" size="lg" className="mt-5 w-full">Continue to SignVault</Button></AuthShell>;
}
