"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/auth";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-pink-50"><Loader2 className="animate-spin h-8 w-8 text-pink-500" /></div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const [authError, setAuthError] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setAuthError("");
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      router.push(redirectPath);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError("An account with this email already exists.");
      } else {
        setAuthError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-pink-50 text-zinc-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/50 p-8 shadow-[0_0_15px_rgba(219,39,119,0.1)] backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create Account</h1>
            <p className="text-zinc-9000">Join Lucky Balls today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 text-center">
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
                className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 outline-none text-zinc-900 transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                {...register("email")}
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-400">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 outline-none text-zinc-900 transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                {...register("password")}
              />
              {errors.password ? <p className="mt-2 text-sm text-rose-400">{errors.password.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 outline-none text-zinc-900 transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? <p className="mt-2 text-sm text-rose-400">{errors.confirmPassword.message}</p> : null}
            </div>

            <Button type="submit" className="w-full bg-pink-600-white mt-4 py-6" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-9000">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="font-semibold text-pink-600 hover:text-pink-600">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
