"use client";

import { useEffect, useState } from "react";
import { getPrivateSvg } from "@/src/lib/signatures";

export function PrivateSignatureImage({ signatureId, versionId, alt }: {
  signatureId: string;
  versionId: string;
  alt: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(null);
    void getPrivateSvg(signatureId, versionId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setError("Canonical preview is not available yet.");
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [signatureId, versionId]);

  if (error) return <p role="status" className="text-sm text-slate-500">{error}</p>;
  if (!url) return <div className="grid min-h-36 place-items-center text-sm text-slate-400">Loading private preview…</div>;
  return <img src={url} alt={alt} className="mx-auto max-h-56 max-w-full object-contain" />;
}