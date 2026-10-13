"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RotateCcw, SlidersHorizontal, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError } from "@/src/lib/api-client";
import { createVersion, getSignature, renderVersion, type SignatureDesign, type SignatureFontFamily, type SignatureRecord, type SignatureStyle, type SignatureVersion } from "@/src/lib/signatures";
import { Button } from "@/src/components/ui/button";
import { SignaturePreview } from "@/src/components/ui/signature-preview";

const defaultDesign: SignatureDesign = {
  fontFamily: "script",
  fontSize: 36,
  fontWeight: 500,
  letterSpacing: 1,
  slant: -4,
  rotation: 0,
  strokeWidth: 1.2,
};

const styleFonts: Record<SignatureStyle, SignatureFontFamily> = {
  CLASSIC: "serif",
  ELEGANT: "script",
  MODERN: "modern-script",
  MINIMAL: "sans-serif",
};

export default function SignatureDesignerPage() {
  const params = useParams<{ id: string }>();
  const signatureId = params.id;
  const [signature, setSignature] = useState<SignatureRecord | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [style, setStyle] = useState<SignatureStyle>("ELEGANT");
  const [design, setDesign] = useState<SignatureDesign>(defaultDesign);
  const [savedVersion, setSavedVersion] = useState<SignatureVersion | null>(null);
  const [renderError, setRenderError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void getSignature(signatureId)
      .then((data) => {
        if (!active) return;
        setSignature(data);
        setDisplayText(data.currentVersion?.displayText ?? "");
        if (data.currentVersion) {
          setStyle(data.currentVersion.style);
          setDesign(data.currentVersion.design);
        }
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : "Signature could not be loaded."); });
    return () => { active = false; };
  }, [signatureId]);

  function updateDesign(key: keyof SignatureDesign, value: number | SignatureFontFamily) {
    setDesign((current) => ({ ...current, [key]: value }));
  }

  async function saveVersion() {
    if (!displayText.trim()) {
      setError("Enter the text to render in this version.");
      return;
    }
    setSaving(true);
    setError("");
    setRenderError("");
    try {
      const result = await createVersion(signatureId, { displayText: displayText.trim(), style, design });
      setSavedVersion(result.version);
      if (result.renderError) setRenderError("The version was saved, but its canonical render failed. Retry rendering this saved version; it will not create another version.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The version could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function retryRender() {
    if (!savedVersion) return;
    setSaving(true);
    try {
      await renderVersion(signatureId, savedVersion.id);
      setRenderError("");
    } catch {
      setRenderError("Rendering is still unavailable. The saved version is safe; retry when the service recovers.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !signature) return <p role="alert" className="text-sm text-red-700">{error}</p>;
  if (!signature) return <p role="status" className="text-sm text-slate-500">Loading designer…</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{signature.name} · {signature.currentVersion ? `Current version ${signature.currentVersion.versionNumber}` : "First version"}</p>
          <h1 className="mt-1 text-3xl font-semibold">Signature designer</h1>
          <p className="mt-2 text-sm text-slate-600">
            Save editable structured design data, then render its canonical private asset on the server.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/signatures/${signatureId}`}><Button variant="secondary"><RotateCcw className="h-4 w-4" /> Cancel</Button></Link>
        </div>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Live preview</p>
            <span className="text-xs text-slate-500">Editor approximation</span>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-8">
            <SignaturePreview signature={displayText || signature.name} className="min-h-48" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Signature text
              <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-600"
                value={displayText}
                onChange={(event) => setDisplayText(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Style
              <select value={style} onChange={(event) => {
                const nextStyle = event.target.value as SignatureStyle;
                setStyle(nextStyle);
                setDesign((current) => ({ ...current, fontFamily: styleFonts[nextStyle] }));
              }} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none">
                {(["CLASSIC", "ELEGANT", "MODERN", "MINIMAL"] as const).map((value) => <option key={value} value={value}>{value.toLowerCase()}</option>)}
              </select>
            </label>
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Appearance
          </div>
          <div className="mt-6 space-y-6">
            {[
              { label: "Font size", key: "fontSize" as const, value: design.fontSize, min: 8, max: 120 },
              {
                label: "Letter spacing",
                key: "letterSpacing" as const,
                value: design.letterSpacing,
                min: -10,
                max: 20,
              },
              {
                label: "Slant",
                key: "slant" as const,
                value: design.slant,
                min: -45,
                max: 45,
              },
              {
                label: "Rotation",
                key: "rotation" as const,
                value: design.rotation,
                min: -180,
                max: 180,
              },
              {
                label: "Stroke width",
                key: "strokeWidth" as const,
                value: design.strokeWidth,
                min: 0.1,
                max: 12,
              },
            ].map(({ label, key, value, min, max }) => (
              <label key={label} className="block text-sm font-medium">
                <span className="flex justify-between text-slate-700">
                  <span>{label}</span>
                  <span className="text-slate-400">{value}</span>
                </span>
                <input
                  aria-label={label}
                  type="range"
                  min={min}
                  max={max}
                  value={value}
                  step={key === "strokeWidth" || key === "letterSpacing" ? 0.1 : 1}
                  onChange={(event) => updateDesign(key, Number(event.target.value))}
                  className="mt-3 w-full accent-slate-950"
                />
              </label>
            ))}
          </div>
          <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              Changes create a new visual version. They do not create a
              cryptographic signature.
            </p>
            <label className="mt-5 block text-sm font-medium text-slate-700">Font family<select value={design.fontFamily} onChange={(event) => updateDesign("fontFamily", event.target.value as SignatureFontFamily)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3"><option value="serif">Serif</option><option value="script">Script</option><option value="modern-script">Modern script</option><option value="sans-serif">Sans serif</option></select></label>
            <label className="mt-4 block text-sm font-medium text-slate-700">Font weight<select value={design.fontWeight} onChange={(event) => updateDesign("fontWeight", Number(event.target.value) as SignatureDesign["fontWeight"])} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3">{[300, 400, 500, 600, 700].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            {renderError && <div role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><p>{renderError}</p><Button variant="secondary" size="sm" className="mt-3" loading={saving} onClick={() => void retryRender()}>Retry render</Button></div>}
            {savedVersion && !renderError && <div role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Version {savedVersion.versionNumber} saved and rendered.<div className="mt-2 flex gap-3"><Link href={`/signatures/${signatureId}`} className="font-semibold underline">View signature</Link><Link href={`/signatures/${signatureId}/versions`} className="font-semibold underline">Version history</Link></div></div>}
            <Button className="mt-5 w-full" loading={saving} onClick={() => void saveVersion()}>
              <Type className="h-4 w-4" /> Save Version
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
