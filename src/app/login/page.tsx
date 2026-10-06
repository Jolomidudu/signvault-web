import Link from "next/link";
import { AuthShell } from "@/src/components/ui/auth-shell";
import { LoginForm } from "@/src/components/ui/auth-form";

export default function LoginPage() {
  return <AuthShell title="Welcome Back" description="Sign in to access your private signature vault."><div className="mb-6"><LoginForm /></div><p className="mt-6 text-center text-sm text-slate-600">Don&apos;t have an account? <Link href="/register" className="font-semibold text-blue-700">Create account</Link></p></AuthShell>;
}
