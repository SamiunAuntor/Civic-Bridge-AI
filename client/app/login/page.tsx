"use client";

import { Eye, Globe, LoaderCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { PublicSiteShell } from "@/components/landing/public-site-shell";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/feedback";

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
      notify.success("Welcome back. Your workspace is ready.");
      router.push("/dashboard");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "We couldn't sign you in with those details.";
      setError(message);
      notify.error(message);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);

    try {
      await signInWithGoogle();
      notify.success("Signed in successfully.");
      router.push("/dashboard");
    } catch (signInError) {
      const message =
        signInError instanceof Error
          ? signInError.message
          : "Google sign-in did not complete.";
      setError(message);
      notify.error(message);
    }
  }

  return (
    <PublicSiteShell mainClassName="min-h-[calc(100vh-86px-153px)]">
      <AuthSplitShell
        title="Welcome Back"
        subtitle="Sign in to continue your support plan and access your stable roadmap."
        primaryAction={
          <Button
            type="submit"
            form="login-form"
            className="h-[54px] w-full rounded-[10px] bg-[#2f4f87] text-[15px] font-semibold text-white hover:bg-[#294779]"
            disabled={authLoading}
          >
            {authLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            Sign In
          </Button>
        }
        socialAction={
          <Button
            type="button"
            variant="outline"
            className="h-[52px] w-full rounded-[10px] border border-[#d4dbe8] bg-white text-[15px] font-medium text-[#173b72] hover:bg-[#f6f8fc]"
            disabled={authLoading || !isFirebaseReady}
            onClick={handleGoogleSignIn}
          >
            <Globe className="h-4 w-4" />
            Sign in with Google
          </Button>
        }
        footerPrompt="Need an account?"
        footerLink="/register"
        footerLabel="Sign Up"
      >
        <form id="login-form" className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2.5 block text-[13px] font-semibold text-[#173b72]">
              Email Address
            </label>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className="h-[52px] rounded-[10px] border-[#cad4e3] bg-white px-4 text-[15px] text-[#173b72] placeholder:text-[#8a97ab]"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-[13px] font-semibold text-[#173b72]">
              Password
            </label>
            <div className="relative">
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-[52px] rounded-[10px] border-[#cad4e3] bg-white px-4 pr-11 text-[15px] text-[#173b72] placeholder:text-[#8a97ab]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-[#4d607f] hover:text-[#173b72]"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-[12px] border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {!isFirebaseReady ? (
            <div className="rounded-[12px] border border-secondary/20 bg-surface px-4 py-3 text-sm text-muted-foreground">
              Sign-in is temporarily unavailable. Please try again shortly.
            </div>
          ) : null}
        </form>
      </AuthSplitShell>
    </PublicSiteShell>
  );
}
