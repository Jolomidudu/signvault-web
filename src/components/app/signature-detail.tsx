"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, CalendarDays, Copy, Download, Edit3, FileCheck2, History, RotateCcw, Share2 } from "lucide-react";
import { PrivateSignatureImage } from "@/src/components/app/private-signature-image";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { SignatureStatusBadge } from "@/src/components/ui/status-badge";
import { ApiError } from "@/src/lib/api-client";
import { archiveSignature, copyPng, downloadExport, getSignature, restoreSignature, type SignatureRecord } from "@/src/lib/signatures";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "No expiration";
}

export function SignatureDetail({ signatureId }: { signatureId: string }) {
  const [signature, setSignature] = useState<SignatureRecord | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getSignature(signatureId)
      .then((data) => { if (active) { setError(""); setSignature(data); } })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : "Signature details could not be loaded."); });
    return () => { active = false; };
  }, [signatureId, retry]);

  async function updateArchive(restore: boolean) {
    setBusy(true);
    setError("");
    try {
      const updated = restore ? await restoreSignature(signatureId) : await archiveSignature(signatureId);
      setSignature((current) => current ? { ...current, ...updated } : updated);
      setMessage(restore ? "Signature restored." : "Signature archived.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The signature status could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function copySignature() {
    if (!signature?.currentVersion) return;
    setBusy(true);
    try {
      const result = await copyPng(signature.id, signature.currentVersion.id);
      setMessage(result === "copied" ? "Canonical PNG copied." : "Clipboard is unavailable; canonical PNG downloaded instead.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The signature image could not be copied.");
    } finally {
      setBusy(false);
    }
  }

  async function exportSignature(format: "svg" | "png") {
    if (!signature?.currentVersion) return;
    setBusy(true);
    try {
      await downloadExport(signature.id, signature.currentVersion.id, format);
      setMessage(`Canonical ${format.toUpperCase()} downloaded.`);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The canonical export could not be downloaded.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !signature) return <section role="alert" className="rounded-xl border border-red-200 bg-white p-6"><p className="text-sm text-red-800">{error}</p><Button className="mt-3" variant="secondary" onClick={() => { setError(""); setRetry((value) => value + 1); }}>Retry</Button></section>;
  if (!signature) return <p role="status" className="text-sm text-slate-500">Loading signature…</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-slate-500">Signature profile</p><h1 className="mt-1 text-3xl font-semibold">{signature.name}</h1></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={!signature.currentVersion || busy} onClick={() => void copySignature()}><Copy className="h-4 w-4" /> Copy PNG</Button>
          <Link href={`/signatures/${signature.id}/design`}><Button variant="secondary"><Edit3 className="h-4 w-4" /> Customize</Button></Link>
          <Button variant="secondary" disabled={!signature.currentVersion || busy} onClick={() => void exportSignature("svg")}><Download className="h-4 w-4" /> SVG</Button>
          <Button variant="secondary" disabled={!signature.currentVersion || busy} onClick={() => void exportSignature("png")}><Download className="h-4 w-4" /> PNG</Button>
          <Link href={`/signatures/${signature.id}/share`}><Button variant="secondary"><Share2 className="h-4 w-4" /> Sharing status</Button></Link>
          {signature.status === "ARCHIVED" ? <Button variant="secondary" loading={busy} onClick={() => void updateArchive(true)}><RotateCcw className="h-4 w-4" /> Restore</Button> : <Button variant="danger" loading={busy} onClick={() => void updateArchive(false)}><Archive className="h-4 w-4" /> Archive</Button>}
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_.75fr]">
        <Card><CardHeader><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signature preview</p><h2 className="mt-1 text-lg font-semibold">Canonical private asset</h2></div><SignatureStatusBadge status={signature.status} /></CardHeader><CardContent>{signature.currentVersion ? <PrivateSignatureImage signatureId={signature.id} versionId={signature.currentVersion.id} alt={signature.currentVersion.displayText} /> : <p className="py-12 text-center text-sm text-slate-500">No saved version yet. Open the designer to create the first one.</p>}</CardContent></Card>
        <Card><CardHeader><h2 className="font-semibold">Details</h2></CardHeader><CardContent className="space-y-5">{[{ label: "Category", value: signature.category.toLowerCase() }, { label: "Created", value: formatDate(signature.createdAt) }, { label: "Last modified", value: formatDate(signature.updatedAt) }, { label: "Current version", value: signature.currentVersion ? `Version ${signature.currentVersion.versionNumber}` : "None" }, { label: "Expiration", value: formatDate(signature.expiresAt) }, { label: "Saved versions", value: String(signature.versionCount ?? 0) }].map((item) => <div key={item.label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"><span className="text-sm text-slate-500">{item.label}</span><span className="text-right text-sm font-medium">{item.value}</span></div>)}<Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700" href={`/signatures/${signature.id}/versions`}><History className="h-4 w-4" /> Version history</Link></CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Record lifecycle</p><h2 className="mt-1 text-lg font-semibold">Profile and design remain separate</h2></div><CalendarDays className="h-5 w-5 text-slate-400" /></CardHeader><CardContent className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-5 w-5 text-emerald-600" /><p className="text-sm leading-6 text-slate-600">The signature profile is the vault record. Each saved visual design is a separate immutable version with its own canonical server render.</p></CardContent></Card>
    </div>
  );
}