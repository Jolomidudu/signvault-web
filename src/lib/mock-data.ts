import type { ActivityItem, Signature } from "@/src/lib/types";

export const mockSignatures: Signature[] = [
  {
    id: "professional-01",
    name: "Professional",
    category: "Business",
    owner: "Paul Ogini",
    signature: "Paul Ogini",
    status: "active",
    lastModified: "Today, 10:42 AM",
    expiresAt: "No expiration",
    createdAt: "Jun 18, 2026",
    style: "elegant",
    versions: [
      { id: "v1", name: "Professional", number: 1, createdAt: "Jun 18, 2026", style: "elegant", signature: "Paul Ogini", status: "active" },
      { id: "v2", name: "Professional", number: 2, createdAt: "Jul 02, 2026", style: "classic", signature: "P. Ogini", status: "active" },
    ],
  },
  {
    id: "personal-01",
    name: "Personal",
    category: "Personal",
    owner: "Jolomi Dudu",
    signature: "Jolomi Dudu",
    status: "active",
    lastModified: "Yesterday",
    expiresAt: "Sep 30, 2026",
    createdAt: "Apr 24, 2026",
    style: "modern",
    versions: [
      { id: "v1", name: "Personal", number: 1, createdAt: "Apr 24, 2026", style: "modern", signature: "Jolomi Dudu", status: "active" },
    ],
  },
  {
    id: "initials-01",
    name: "Initials",
    category: "Professional",
    owner: "JD",
    signature: "JD",
    status: "expiring",
    lastModified: "Aug 28, 2026",
    expiresAt: "Sep 15, 2026",
    createdAt: "Mar 10, 2026",
    style: "minimal",
    versions: [
      { id: "v1", name: "Initials", number: 1, createdAt: "Mar 10, 2026", style: "minimal", signature: "JD", status: "expiring" },
    ],
  },
];

export const mockActivity: ActivityItem[] = [
  { id: "a1", title: "Signature copied", detail: "Professional · Paul Ogini", createdAt: "10:42 AM", type: "copied" },
  { id: "a2", title: "Signature shared", detail: "Personal · Jolomi Dudu", createdAt: "Yesterday", type: "shared" },
  { id: "a3", title: "Version created", detail: "Professional · Version 2", createdAt: "Jul 02", type: "created" },
  { id: "a4", title: "Verification completed", detail: "Document test · Valid", createdAt: "Jun 28", type: "verified" },
];

export const mockFeatures = [
  { title: "Multiple signature profiles", description: "Create distinct signatures for business, personal, and professional needs." },
  { title: "Signature versions", description: "Preserve every version and return to the one you need." },
  { title: "Secure by design", description: "Protect signatures with access controls, revocation, and expiration rules." },
  { title: "Use anywhere", description: "Copy, export, and share your signature for supported workflows." },
];
