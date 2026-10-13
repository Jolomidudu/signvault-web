"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/src/components/auth/auth-provider";
import { ApiError, safeReturnTo } from "@/src/lib/api-client";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().email().max(320),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8),
    accepted: z.boolean().refine(Boolean),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginForm({ logoutFailed = false }: { logoutFailed?: boolean }) {
  const router = useRouter();
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (auth.status === "authenticated") {
      router.replace(
        safeReturnTo(
          new URLSearchParams(window.location.search).get("returnTo"),
        ),
      );
    }
  }, [auth.status, router]);

  const submit = async (values: LoginValues) => {
    setMessage("");
    try {
      await auth.login(values.email, values.password);
      router.replace(
        safeReturnTo(
          new URLSearchParams(window.location.search).get("returnTo"),
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Sign in is temporarily unavailable. Try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <Field label="Email">
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password")}
        />
      </Field>
      <div className="flex justify-end text-sm">
        <a href="/forgot-password" className="font-medium text-blue-700">
          Forgot password?
        </a>
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={isSubmitting || auth.status === "initializing"}
      >
        Sign In
      </Button>
      {logoutFailed && <p role="status" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">You are signed out locally, but the server could not confirm cookie revocation. Your browser may restore the session after reload.</p>}
      {message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message}
        </p>
      )}
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      accepted: false,
    },
  });
  const [message, setMessage] = useState("");
  const submit = async (values: RegisterValues) => {
    setMessage("");
    try {
      await auth.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      router.replace("/onboarding");
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : "Registration is temporarily unavailable. Try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name">
          <Input autoComplete="given-name" {...register("firstName")} />
        </Field>
        <Field label="Last name">
          <Input autoComplete="family-name" {...register("lastName")} />
        </Field>
      </div>
      <Field label="Email">
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Password">
          <Input
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
        <Field label="Confirm password">
          <Input
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.confirmPassword.message}
            </span>
          )}
        </Field>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
        <input
          type="checkbox"
          {...register("accepted")}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />{" "}
        I agree to the Terms and Privacy Policy.
      </label>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={isSubmitting || auth.status === "initializing"}
      >
        Create Account
      </Button>
      {message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message}
        </p>
      )}
    </form>
  );
}
