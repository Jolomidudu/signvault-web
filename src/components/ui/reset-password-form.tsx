"use client";

import { useState } from "react";
import { ApiError, publicApiPost } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

export function ResetPasswordForm({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await publicApiPost<{ message: string }>("auth/reset-password", { token, password });
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Password reset could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5"><Field label="Reset token"><Input required autoComplete="one-time-code" value={token} onChange={(event) => setToken(event.target.value)} /></Field><Field label="New password"><Input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field><Field label="Confirm new password"><Input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}<Button type="submit" size="lg" className="w-full" loading={loading}>Update password</Button></form>;
}