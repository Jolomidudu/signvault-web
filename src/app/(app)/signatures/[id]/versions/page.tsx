"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Archive, Copy, History, RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PrivateSignatureImage } from "@/src/components/app/private-signature-image";
import { ApiError } from "@/src/lib/api-client";
import { archiveVersion, duplicateVersion, getSignature, listVersions, renderVersion, selectCurrentVersion, type Paginated, type SignatureRecord, type SignatureVersion } from "@/src/lib/signatures";

export default function VersionsPage() {
  const params = useParams<{ id: string }>();
  const signatureId = params.id;
  const [signature, setSignature] = useState<SignatureRecord | null>(null);
  const [history, setHistory] = useState<Paginated<SignatureVersion> | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [renderRetryId, setRenderRetryId] = useState("");
  const [busy, setBusy] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setError("");
    void Promise.all([getSignature(signatureId), listVersions(signatureId)])
      .then(([record, versions]) => {
        if (!active) return;
        setSignature(record);
        setHistory(versions);
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : "Version history could not be loaded."); });
    return () => { active = false; };
  }, [signatureId, retry]);

  async function runAction(versionId: string, action: "current" | "duplicate" | "archive") {
    setBusy(versionId);
    setError("");
    setNotice("");
    try {
      if (action === "current") {
        await selectCurrentVersion(signatureId, versionId);
        setNotice("Current version updated.");
      } else if (action === "archive") {
        await archiveVersion(signatureId, versionId);
        setNotice("Version archived.");
      } else {
        const created = await duplicateVersion(signatureId, versionId);
        try {
          await renderVersion(signatureId, created.id);
          setRenderRetryId("");
          setNotice(`Version ${created.versionNumber} duplicated and rendered.`);
        } catch {
          setRenderRetryId(created.id);
          setNotice(`Version ${created.versionNumber} exists, but its render failed. Retry rendering this version without duplicating again.`);
        }
      }
      setRetry((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The version could not be updated.");
    } finally {
      setBusy("");
    }
  }

  if (error && !history) return <section role="alert" className="rounded-xl border border-red-200 bg-white p-6"><p className="text-sm text-red-800">{error}</p><Button className="mt-3" variant="secondary" onClick={() => setRetry((value) => value + 1)}>Retry</Button></section>;
  if (!signature || !history) return <p role="status" className="text-sm text-slate-500">Loading version history…</p>;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Saved versions</h1>
      <p className="mt-2 text-sm text-slate-600">
        {signature.name} · {history.total} versions saved
      </p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <div role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><p>{notice}</p>{renderRetryId && <Button variant="secondary" size="sm" className="mt-3" loading={busy === renderRetryId} onClick={async () => { setBusy(renderRetryId); try { await renderVersion(signatureId, renderRetryId); setRenderRetryId(""); setNotice("Canonical render completed."); } catch { setNotice("Rendering is still unavailable; the saved duplicate remains available."); } finally { setBusy(""); } }}>Retry render</Button>}</div>}
      {history.items.length === 0 && <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold">No versions yet</p><p className="mt-2 text-sm text-slate-600">Create the first structured design in the designer.</p></section>}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {history.items.map((version) => (
          <article
            key={version.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Version {version.versionNumber}{version.isCurrent ? " · Current" : ""}
                </p>
                <h2 className="mt-1 font-semibold">{version.displayText}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {version.style.toLowerCase()}
              </span>
            </div>
            <div className="mt-5 min-h-24 rounded-lg bg-slate-50 p-4">{version.archivedAt ? <p className="text-sm text-slate-500">Archived version</p> : <PrivateSignatureImage signatureId={signatureId} versionId={version.id} alt={version.displayText} />}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!version.isCurrent && !version.archivedAt && <Button variant="secondary" size="sm" loading={busy === version.id} onClick={() => void runAction(version.id, "current")}><RotateCcw className="h-4 w-4" /> Use version</Button>}
              {!version.archivedAt && <Button variant="secondary" size="sm" loading={busy === version.id} onClick={() => void runAction(version.id, "duplicate")}><Copy className="h-4 w-4" /> Duplicate</Button>}
              {!version.archivedAt && <Button variant="ghost" size="sm" loading={busy === version.id} onClick={() => void runAction(version.id, "archive")}><Archive className="h-4 w-4" /> Archive</Button>}
              <a href={`/signatures/${signatureId}`} className="inline-flex h-9 items-center gap-2 px-3 text-sm text-slate-600"><History className="h-4 w-4" /> Details</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
