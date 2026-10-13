"use client";

import { useState } from "react";
import { ApiError, publicApiPost } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await publicApiPost("auth/forgot-password", { email });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "The request could not be submitted. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800"
      >
        If an account exists, the request was recorded. Email delivery is not configured in this environment, so no reset message has been sent.
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field label="Email">
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Send reset link
      </Button>
    </form>
  );
}
