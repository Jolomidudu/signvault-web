import { AuthShell } from "@/src/components/ui/auth-shell";
import { ResetPasswordForm } from "@/src/components/ui/reset-password-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Choose a new password"
      description="Create a secure password for your SignVault account."
    >
      <ResetPasswordForm initialToken={token ?? ""} />
    </AuthShell>
  );
}
