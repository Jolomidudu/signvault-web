"use client";

import { useState } from "react";
import { ApiError, publicApiPost } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

export function VerifyEmailForm({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await publicApiPost<{ message: string }>("auth/verify-email", { token });
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Email verification could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return <div><p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">The backend accepts verification tokens, but outbound email delivery is not configured. A verification link has not been sent.</p><form onSubmit={submit} className="space-y-5"><Field label="Verification token"><Input required autoComplete="one-time-code" value={token} onChange={(event) => setToken(event.target.value)} /></Field>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}<Button type="submit" size="lg" className="w-full" loading={loading}>Verify email</Button></form></div>;
}