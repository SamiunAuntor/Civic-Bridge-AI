"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, authLoading, isFirebaseReady } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await signUp(email, password, fullName);
      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create your account right now.",
      );
    }
  }

  async function handleGoogleSignUp() {
    setError(null);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (signUpError) {
      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "Google sign-up did not complete.",
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
                Begin your journey
              </h1>
              <p className="mt-2 text-muted-foreground">
                Create an account to access guided assessments and structured
                next-step planning.
              </p>
            </div>
          </div>

          <Card className="border-border/70 bg-panel/95 p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
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
                  using account creation.
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Create Account
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={authLoading || !isFirebaseReady}
                onClick={handleGoogleSignUp}
              >
                Sign Up With Google
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Sign in
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
        <div className="relative flex h-full items-start p-12 text-primary-foreground">
          <div className="mt-8 max-w-md rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-soft backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
              Current Status
            </p>
            <h2 className="mt-5 font-heading text-5xl font-bold leading-tight">
              Pathway active
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/85">
              Build a secure account foundation now so the higher-fidelity
              Stitch screens can plug into real auth and routing next.
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
