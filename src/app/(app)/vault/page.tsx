"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { SignatureCard } from "@/src/components/app/signature-card";
import { PageHeader } from "@/src/components/app/page-header";
import { ApiError } from "@/src/lib/api-client";
import { listSignatures, type Paginated, type SignatureCategory, type SignatureRecord, type SignatureStatus } from "@/src/lib/signatures";

export default function VaultPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SignatureStatus | "">("");
  const [category, setCategory] = useState<SignatureCategory | "">("");
  const [sort, setSort] = useState<"createdAt" | "updatedAt" | "name" | "category">("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<SignatureRecord> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void listSignatures({ search, status: status || undefined, category: category || undefined, sort, order, page, limit: 12 })
        .then((data) => { if (active) setResult(data); })
        .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : "Your signatures could not be loaded."); })
        .finally(() => { if (active) setLoading(false); });
    }, search ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [search, status, category, sort, order, page, retry]);

  return (
    <div>
      <PageHeader
        eyebrow="Signature library"
        title="Your Signature Vault"
        description={result ? `${result.total} signatures in your vault` : "Your private signature profiles"}
        action={
          <div className="flex gap-2">
            <Link href="/signatures/new"><Button><Plus className="h-4 w-4" /> Add Signature</Button></Link>
          </div>
        }
      />
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search signatures</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search signatures"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value as SignatureStatus | ""); setPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option><option value="EXPIRED">Expired</option><option value="REVOKED">Revoked</option></select>
          <select aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value as SignatureCategory | ""); setPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">All categories</option>{["PROFESSIONAL", "PERSONAL", "BUSINESS", "INITIALS", "CUSTOM"].map((value) => <option key={value} value={value}>{value.toLowerCase()}</option>)}</select>
          <select aria-label="Sort signatures" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="updatedAt">Recently updated</option><option value="createdAt">Date created</option><option value="name">Name</option><option value="category">Category</option></select>
          <button type="button" onClick={() => setOrder(order === "asc" ? "desc" : "asc")} aria-label={`Sort ${order === "asc" ? "descending" : "ascending"}`} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-sm">{order === "asc" ? "↑" : "↓"}</button>
        </div>
      </div>
      {loading && <p role="status" className="mt-8 text-sm text-slate-500">Loading your signatures…</p>}
      {error && <section role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5"><p className="text-sm text-red-800">{error}</p><Button variant="secondary" size="sm" className="mt-3" onClick={() => setRetry((value) => value + 1)}>Retry</Button></section>}
      {!loading && !error && result?.items.length === 0 && <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="font-semibold">No signatures found</h2><p className="mt-2 text-sm text-slate-600">{search || status || category ? "Adjust your server-side filters or search terms." : "Create your first profile to start your vault."}</p>{!search && !status && !category && <Link href="/signatures/new"><Button className="mt-4"><Plus className="h-4 w-4" /> Create signature</Button></Link>}</section>}
      {result?.items.length ? <><div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{result.items.map((signature) => <SignatureCard key={signature.id} signature={signature} />)}</div><div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4"><p className="text-sm text-slate-500">Page {result.page} of {result.totalPages} · {result.total} results</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" size="sm" disabled={page >= result.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></> : null}
    </div>
  );
}
