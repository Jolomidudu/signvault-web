export type SignatureStatus = "active" | "revoked" | "expiring";
export type SignatureStyle = "classic" | "elegant" | "modern" | "minimal";

export interface SignatureVersion {
  id: string;
  name: string;
  number: number;
  createdAt: string;
  style: SignatureStyle;
  signature: string;
  status: SignatureStatus;
}

export interface Signature {
  id: string;
  name: string;
  category: string;
  owner: string;
  signature: string;
  status: SignatureStatus;
  lastModified: string;
  expiresAt: string;
  createdAt: string;
  style: SignatureStyle;
  versions: SignatureVersion[];
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  type: "created" | "copied" | "shared" | "verified" | "revoked";
}

export interface NavItem {
  label: string;
  href: string;
  icon?: "shield" | "signature" | "activity" | "settings";
}
