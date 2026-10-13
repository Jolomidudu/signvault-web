import Link from "next/link";
import { AuthShell } from "@/src/components/ui/auth-shell";
import { LoginForm } from "@/src/components/ui/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ logout?: string }> }) {
  const { logout } = await searchParams;
  return <AuthShell title="Welcome Back" description="Sign in to access your private signature vault."><div className="mb-6"><LoginForm logoutFailed={logout === "failed"} /></div><p className="mt-6 text-center text-sm text-slate-600">Don&apos;t have an account? <Link href="/register" className="font-semibold text-blue-700">Create account</Link></p></AuthShell>;
}
