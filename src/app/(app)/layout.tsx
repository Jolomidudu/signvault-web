import { AppShell } from "@/src/components/app/app-shell";
import { SessionGate } from "@/src/components/auth/session-gate";

export default function AuthenticatedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SessionGate><AppShell>{children}</AppShell></SessionGate>;
}
