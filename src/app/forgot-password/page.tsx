"use client";

import Link from "next/link";
import { AuthShell } from "@/src/components/ui/auth-shell";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

export default function ForgotPasswordPage() {
  return <AuthShell title="Reset your password" description="Enter your email and we’ll provide the next step."><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); }}><Field label="Email"><Input type="email" placeholder="you@example.com" /></Field><Button type="submit" size="lg" className="w-full">Send reset link</Button></form><p className="mt-6 text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-blue-700">Return to sign in</Link></p></AuthShell>;
}
