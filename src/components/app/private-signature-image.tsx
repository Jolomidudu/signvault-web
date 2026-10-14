"use client";

import { useEffect, useState } from "react";
import { getPrivateSvg } from "@/src/lib/signatures";

export function PrivateSignatureImage({ signatureId, versionId, alt }: {
  signatureId: string;
  versionId: string;
  alt: string;
}) {
  const [asset, setAsset] = useState<{ key: string; url?: string; error?: string } | null>(null);
  const key = `${signatureId}/${versionId}`;

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    void getPrivateSvg(signatureId, versionId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setAsset({ key, url: objectUrl });
      })
      .catch(() => {
        if (active) setAsset({ key, error: "Canonical preview is not available yet." });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [signatureId, versionId, key]);

  if (asset?.key === key && asset.error) return <p role="status" className="text-sm text-slate-500">{asset.error}</p>;
  if (asset?.key !== key || !asset.url) return <div className="grid min-h-36 place-items-center text-sm text-slate-400">Loading private preview…</div>;
  const handleImageError = () => {
    URL.revokeObjectURL(asset.url!);
    setAsset({ key, error: "Canonical preview could not be displayed." });
  };
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset.url} alt={alt} onError={handleImageError} className="mx-auto max-h-56 max-w-full object-contain" />;
}