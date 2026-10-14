import { apiBlob, apiGet, apiPost, apiPut, apiPatch, apiDelete, createVersionAndRender } from "@/src/lib/api-client";
import { copyImageWithFallback } from "@/src/lib/clipboard";
import { validateCanonicalSvg } from "@/src/lib/svg-asset";

export type SignatureCategory = "PROFESSIONAL" | "PERSONAL" | "BUSINESS" | "INITIALS" | "CUSTOM";
export type SignatureStatus = "ACTIVE" | "REVOKED" | "EXPIRED" | "ARCHIVED";
export type SignatureStyle = "CLASSIC" | "ELEGANT" | "MODERN" | "MINIMAL";
export type SignatureFontFamily = "serif" | "script" | "modern-script" | "sans-serif";

export type SignatureDesign = {
  fontFamily: SignatureFontFamily;
  fontSize: number;
  fontWeight: 300 | 400 | 500 | 600 | 700;
  letterSpacing: number;
  slant: number;
  rotation: number;
  strokeWidth: number;
};

export type SignatureVersion = {
  id: string;
  signatureId: string;
  versionNumber: number;
  displayText: string;
  style: SignatureStyle;
  design: SignatureDesign;
  isCurrent: boolean;
  archivedAt: string | null;
  createdAt: string;
};

export type SignatureRecord = {
  id: string;
  name: string;
  category: SignatureCategory;
  status: SignatureStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentVersion?: Pick<SignatureVersion, "id" | "versionNumber" | "displayText" | "style" | "design" | "createdAt"> | null;
  versionCount?: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type VaultSummary = {
  total: number;
  active: number;
  archived: number;
  revoked: number;
  expired: number;
  limit: number;
  remaining: number;
};

export type SignatureQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: SignatureStatus;
  category?: SignatureCategory;
  sort?: "createdAt" | "updatedAt" | "name" | "category";
  order?: "asc" | "desc";
};

function queryString(query: object) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.size ? `?${search}` : "";
}

export const listSignatures = (query: SignatureQuery = {}) =>
  apiGet<Paginated<SignatureRecord>>(`signatures${queryString(query)}`);

export const getSignatureSummary = () => apiGet<VaultSummary>("signatures/summary");

export const getSignature = (id: string) => apiGet<SignatureRecord>(`signatures/${encodeURIComponent(id)}`);

export const createSignature = (input: { name: string; category: SignatureCategory; expiresAt?: string }) =>
  apiPost<SignatureRecord>("signatures", input);

export const updateSignature = (id: string, input: Partial<Pick<SignatureRecord, "name" | "category" | "expiresAt">>) =>
  apiPatch<SignatureRecord>(`signatures/${encodeURIComponent(id)}`, input);

export const archiveSignature = (id: string) => apiPost<SignatureRecord>(`signatures/${encodeURIComponent(id)}/archive`);

export const restoreSignature = (id: string) => apiPost<SignatureRecord>(`signatures/${encodeURIComponent(id)}/restore`);

export const deleteSignature = (id: string) => apiDelete<SignatureRecord>(`signatures/${encodeURIComponent(id)}`);

export const listVersions = (signatureId: string, page = 1, limit = 20) =>
  apiGet<Paginated<SignatureVersion>>(`signatures/${encodeURIComponent(signatureId)}/versions${queryString({ page, limit })}`);

export const createVersion = (signatureId: string, input: {
  displayText: string;
  style: SignatureStyle;
  design: SignatureDesign;
}) => createVersionAndRender<SignatureVersion>(encodeURIComponent(signatureId), input);

export const renderVersion = (signatureId: string, versionId: string) =>
  apiPost<{ versionId: string }>(`signatures/${encodeURIComponent(signatureId)}/versions/${encodeURIComponent(versionId)}/render`);

export const selectCurrentVersion = (signatureId: string, versionId: string) =>
  apiPut<SignatureVersion>(`signatures/${encodeURIComponent(signatureId)}/versions/${encodeURIComponent(versionId)}/current`);

export const duplicateVersion = (signatureId: string, versionId: string) =>
  apiPost<SignatureVersion>(`signatures/${encodeURIComponent(signatureId)}/versions/${encodeURIComponent(versionId)}/duplicate`);

export const archiveVersion = (signatureId: string, versionId: string) =>
  apiPost<SignatureVersion>(`signatures/${encodeURIComponent(signatureId)}/versions/${encodeURIComponent(versionId)}/archive`);

export async function getPrivateSvg(signatureId: string, versionId: string) {
  return validateCanonicalSvg(await apiBlob(
    `signatures/${encodeURIComponent(signatureId)}/versions/${encodeURIComponent(versionId)}/asset`,
  ));
}

export const getCanonicalExport = (signatureId: string, versionId: string, format: "svg" | "png", scale = 1) =>
  apiBlob(`signatures/${encodeURIComponent(signatureId)}/versions/${encodeURIComponent(versionId)}/export${queryString({ format, scale })}`);

export async function downloadExport(signatureId: string, versionId: string, format: "svg" | "png", scale = 1) {
  const blob = await getCanonicalExport(signatureId, versionId, format, scale);
  downloadBlob(blob, `signature.${format}`);
  return blob;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function copyPng(signatureId: string, versionId: string) {
  const blob = await getCanonicalExport(signatureId, versionId, "png");
  const clipboard = navigator.clipboard as unknown as { write?: (items: ClipboardItem[]) => Promise<void> } | undefined;
  const writeToClipboard = clipboard?.write && typeof ClipboardItem !== "undefined"
    ? () => clipboard.write!([new ClipboardItem({ "image/png": blob })])
    : null;
  return copyImageWithFallback(blob, writeToClipboard, () => downloadBlob(blob, "signature.png"));
}