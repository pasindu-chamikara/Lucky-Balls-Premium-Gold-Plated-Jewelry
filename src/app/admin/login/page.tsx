"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

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
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const adminDocRef = doc(db, "admins", userCredential.user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        router.push("/admin/dashboard");
      } else {
        await signOut(auth);
        setAuthError("Unauthorized access. Admins only.");
      }
    } catch (error: any) {
      setAuthError("Invalid credentials or authentication failed.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 lg:px-8 bg-[#FCFBF9]">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/50 p-8 shadow-[0_0_15px_rgba(219,39,119,0.1)] backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Login</h1>
        <p className="mt-2 text-zinc-500 text-sm">
          Sign in to access your secure admin workspace.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {authError && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              {authError}
            </div>
          )}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400"
              {...register("email")}
            />
            {errors.email ? <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-0 transition focus:border-zinc-400"
              {...register("password")}
            />
            {errors.password ? <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p> : null}
          </div>

          <Button type="submit" className="w-full rounded-md bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-medium tracking-wide h-10 mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </main>
  );
}
