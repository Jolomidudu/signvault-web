import { AuthShell } from "@/src/components/ui/auth-shell";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

export default function ResetPasswordPage() {
  return <AuthShell title="Choose a new password" description="Create a secure password for your SignVault account."><form className="space-y-5" onSubmit={(event) => event.preventDefault()}><Field label="New password"><Input type="password" autoComplete="new-password" /></Field><Field label="Confirm new password"><Input type="password" autoComplete="new-password" /></Field><Button size="lg" className="w-full">Update password</Button></form></AuthShell>;
}
