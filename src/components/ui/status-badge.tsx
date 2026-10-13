import type { SignatureStatus } from "@/src/lib/signatures";
import { Badge } from "@/src/components/ui/badge";

const statusStyles: Record<SignatureStatus, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  EXPIRED: "warning",
  REVOKED: "danger",
  ARCHIVED: "neutral",
};

const statusLabels: Record<SignatureStatus, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
  ARCHIVED: "Archived",
};

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  return <Badge variant={statusStyles[status]}>{statusLabels[status]}</Badge>;
}
