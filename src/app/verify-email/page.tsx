import { AuthShell } from "@/src/components/ui/auth-shell";
import { VerifyEmailForm } from "@/src/components/ui/verify-email-form";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Verify your email"
      description="Complete verification using a token from your delivery channel."
    >
      <VerifyEmailForm initialToken={token ?? ""} />
    </AuthShell>
  );
}
