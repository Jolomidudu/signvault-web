"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Field, Input, Select } from "@/src/components/ui/form-controls";
import { ApiError } from "@/src/lib/api-client";
import { createSignature, type SignatureCategory } from "@/src/lib/signatures";

export default function NewSignaturePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SignatureCategory>("PROFESSIONAL");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const signature = await createSignature({
        name: name.trim(),
        category,
        ...(expiresAt ? { expiresAt: new Date(`${expiresAt}T23:59:59`).toISOString() } : {}),
      });
      router.push(`/signatures/${signature.id}/design`);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The signature profile could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/vault"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" /> Back to vault
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">
        Create a signature
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Create the signature profile first. The designer will save its first version separately.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <Field label="Signature name">
            <Input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Professional" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <Select value={category} onChange={(event) => setCategory(event.target.value as SignatureCategory)}>
                <option value="PROFESSIONAL">Professional</option>
                <option value="PERSONAL">Personal</option>
                <option value="BUSINESS">Business</option>
                <option value="INITIALS">Initials</option>
                <option value="CUSTOM">Custom</option>
              </Select>
            </Field>
            <Field label="Expiration (optional)">
              <Input type="date" value={expiresAt} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setExpiresAt(event.target.value)} />
            </Field>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link href="/vault"><Button type="button" variant="ghost">Cancel</Button></Link>
            <Button type="submit" loading={saving}>
              <Check className="h-4 w-4" /> Create Signature
            </Button>
          </div>
        </form>
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold">Next: create a version</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Signature profiles and designer versions are separate backend records. After this profile is created, you’ll configure its first structured design and generate the canonical render.</p>
        </section>
      </div>
    </div>
  );
}
