"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, LoaderCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, authLoading, isFirebaseReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in with those credentials.",
      );
    }
  }

  async function handleGoogleSignIn() {
    setError(null);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Google sign-in did not complete.",
      );
    }
  }

  return (
    <main className="min-h-screen md:grid md:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <Image
                src={logo}
                alt="CivicBridge AI logo"
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold text-primary">
                Welcome back
              </h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to continue your support plan and access your dashboard.
              </p>
            </div>
          </div>

          <Card className="border-border/70 bg-panel/95 p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              ) : null}

              {!isFirebaseReady ? (
                <div className="rounded-2xl border border-secondary/20 bg-surface px-4 py-3 text-sm text-muted-foreground">
                  Add the public Firebase values from `.env.example` before
                  using login or registration.
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Sign In
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={authLoading || !isFirebaseReady}
                onClick={handleGoogleSignIn}
              >
                Continue With Google
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-primary">
              Create one here
            </Link>
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-primary md:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDwmJzd6vfqF4eUtkAhDhBs_hA0-nr6fFy32BQCH2kZ9-ANzBPBJ7x_9Wxi7nQigbu3SzYLFpVkUZaF5oBtm5DymFHZVOFTmTkaA-7_r9G6mpIXQbLa_v-fPnZU05hmSM3BP6qg4O7RuJLU5EpWwUnYPauD3YDCC5_1Ia-qBE4xtr0_RLb6H-NXEbX-HrxsLus5Fn6wG2B0z_PR6ofJ9Ic6jsD1_tn_zmXb_kHWOEDyfX2FHWgf8WOQBFxxlQ0cCi6SdlgpeGqRtc')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07172d] via-primary/70 to-primary/20" />
        <div className="relative flex h-full items-end p-12 text-primary-foreground">
          <div className="max-w-md space-y-5">
            <div className="flex gap-2">
              <span className="h-1 w-14 rounded-full bg-white" />
              <span className="h-1 w-14 rounded-full bg-white/35" />
              <span className="h-1 w-14 rounded-full bg-white/35" />
            </div>
            <h2 className="font-heading text-5xl font-bold leading-tight">
              Your journey to stability starts here.
            </h2>
            <p className="text-lg leading-8 text-white/85">
              CivicBridge AI helps translate crisis into clarity with a secure,
              structured, and compassionate workflow.
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
