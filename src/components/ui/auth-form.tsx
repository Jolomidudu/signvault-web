"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Field, Input } from "@/src/components/ui/form-controls";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const registerSchema = z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(8), confirmPassword: z.string().min(8), accepted: z.boolean().refine(Boolean) });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const [message, setMessage] = useState("");
  const submit = async (values: LoginValues) => { setMessage("Mock authentication complete. Backend integration is ready."); await new Promise((resolve) => setTimeout(resolve, 150)); console.log(values); };
  return <form onSubmit={handleSubmit(submit)} className="space-y-5"><Field label="Email"><Input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} /></Field><Field label="Password"><Input type="password" autoComplete="current-password" placeholder="Enter your password" {...register("password")} /></Field><div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-600"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" /> Remember me</label><a href="/forgot-password" className="font-medium text-blue-700">Forgot password?</a></div><Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign In</Button><Button type="button" variant="secondary" size="lg" className="w-full">Use Biometrics</Button>{message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}</form>;
}

export function RegisterForm() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", accepted: false } });
  const [message, setMessage] = useState("");
  const submit = async (values: RegisterValues) => { setMessage("Account details validated. Mock registration complete."); await new Promise((resolve) => setTimeout(resolve, 150)); console.log(values); };
  return <form onSubmit={handleSubmit(submit)} className="space-y-5"><Field label="Full name"><Input autoComplete="name" placeholder="Your full name" {...register("fullName")} /></Field><Field label="Email"><Input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Password"><Input type="password" autoComplete="new-password" {...register("password")} /></Field><Field label="Confirm password"><Input type="password" autoComplete="new-password" {...register("confirmPassword")} /></Field></div><label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" {...register("accepted")} className="mt-1 h-4 w-4 rounded border-slate-300" /> I agree to the Terms and Privacy Policy.</label><Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create Account</Button>{message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}</form>;
}
