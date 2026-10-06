"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="h-5 w-5" style={{ color: "var(--gold)" }} />
          <span className="font-serif font-semibold text-2xl tracking-wide text-stone-900">
            KO<span style={{ color: "var(--gold)" }}>KI</span>
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="font-serif text-xl font-semibold text-stone-900 mb-1">Admin sign in</h1>
          <p className="text-sm text-stone-500 mb-6">Manage products, stock and orders.</p>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>

            {state.error && (
              <p className="text-sm text-red-600" role="alert">{state.error}</p>
            )}

            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
