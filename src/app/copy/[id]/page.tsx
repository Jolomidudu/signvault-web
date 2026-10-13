"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api-client";
import { copyPng, getSignature, type SignatureRecord } from "@/src/lib/signatures";
import { Button } from "@/src/components/ui/button";

export default function CopySignaturePage() {
  const params = useParams<{ id: string }>();
  const [signature, setSignature] = useState<SignatureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getSignature(params.id)
      .then((record) => { if (active) setSignature(record); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : "Signature could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  async function copyImage() {
    if (!signature?.currentVersion) return;
    setBusy(true);
    setError("");
    try {
      const result = await copyPng(signature.id, signature.currentVersion.id);
      setMessage(result === "copied" ? "Canonical PNG copied to the clipboard." : "Clipboard image support is unavailable; the canonical PNG was downloaded.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The canonical PNG could not be retrieved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-semibold">Copy signature image</h1>{loading ? <p role="status" className="mt-3 text-sm text-slate-500">Loading signature…</p> : <><p className="mt-2 text-sm leading-6 text-slate-600">{signature?.name ?? "Signature"} · backend-generated PNG. This is a visual signature, not a cryptographic signature.</p>{!signature?.currentVersion && <p className="mt-4 text-sm text-slate-500">This signature has no current version to copy.</p>}<Button className="mt-5" disabled={!signature?.currentVersion || busy} loading={busy} onClick={() => void copyImage()}>Copy PNG</Button></>}{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}</main>
  );
}
