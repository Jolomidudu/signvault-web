"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
        Password reset instructions have been sent. Check your email inbox.
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field label="Email">
        <Input type="email" autoComplete="email" placeholder="you@example.com" required />
      </Field>
      <Button type="submit" size="lg" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
