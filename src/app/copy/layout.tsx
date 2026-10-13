import { SessionGate } from "@/src/components/auth/session-gate";

export default function CopyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SessionGate>{children}</SessionGate>;
}