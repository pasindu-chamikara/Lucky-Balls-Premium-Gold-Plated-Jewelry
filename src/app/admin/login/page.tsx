"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/admin/dashboard");
    } catch (error: any) {
      setAuthError("Invalid credentials or authentication failed.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-zinc-900">Admin Login</h1>
        <p className="mt-3 text-zinc-600">
          Firebase authentication will power the secure admin access flow.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {authError && (
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
              {authError}
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-0 transition focus:border-rose-500"
              {...register("email")}
            />
            {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none ring-0 transition focus:border-rose-500"
              {...register("password")}
            />
            {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
