import Link from "next/link";
import { AuthShell } from "@/src/components/ui/auth-shell";
import { RegisterForm } from "@/src/components/ui/auth-form";

export default function RegisterPage() {
  return <AuthShell title="Create your SignVault account" description="Set up a private vault for your signature profiles."><RegisterForm /><p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-blue-700">Sign in</Link></p></AuthShell>;
}
