import { AppShell } from "@/src/components/app/app-shell";

export default function AuthenticatedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
