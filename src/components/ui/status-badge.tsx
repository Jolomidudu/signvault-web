import type { SignatureStatus } from "@/src/lib/types";
import { Badge } from "@/src/components/ui/badge";

const statusStyles: Record<SignatureStatus, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  expiring: "warning",
  revoked: "danger",
};

const statusLabels: Record<SignatureStatus, string> = {
  active: "Active",
  expiring: "Expiring",
  revoked: "Revoked",
};

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  return <Badge variant={statusStyles[status]}>{statusLabels[status]}</Badge>;
}
