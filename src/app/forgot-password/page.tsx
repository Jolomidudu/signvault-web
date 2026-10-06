import Link from "next/link";
import { AuthShell } from "@/src/components/ui/auth-shell";
import { ForgotPasswordForm } from "@/src/components/ui/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" description="Enter your email and we’ll provide the next step.">
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-blue-700">Return to sign in</Link>
      </p>
    </AuthShell>
  );
}
