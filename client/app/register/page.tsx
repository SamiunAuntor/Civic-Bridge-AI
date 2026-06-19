"use client";

import Link from "next/link";
import { ArrowRight, Eye, Globe, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { PublicSiteShell } from "@/components/landing/public-site-shell";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/feedback";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, authLoading, isFirebaseReady } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await signUp(email, password, fullName);
      notify.success("Your account has been created.");
      router.push("/dashboard");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "We couldn't create your account right now.";
      setError(message);
      notify.error(message);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);

    try {
      await signInWithGoogle();
      notify.success("Your account is ready.");
      router.push("/dashboard");
    } catch (signUpError) {
      const message =
        signUpError instanceof Error
          ? signUpError.message
          : "Google sign-up did not complete.";
      setError(message);
      notify.error(message);
    }
  }

  return (
    <PublicSiteShell mainClassName="min-h-[calc(100vh-86px-153px)]">
      <AuthSplitShell
        title="Begin Your Journey"
        subtitle="Create an account to access crisis support expertise and stable roadmaps tailored for you."
        primaryAction={
          <Button
            type="submit"
            form="register-form"
            className="h-[54px] w-full rounded-[10px] bg-[#2f4f87] text-[15px] font-semibold text-white hover:bg-[#294779]"
            disabled={authLoading || !acceptedTerms}
          >
            {authLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Create Account
          </Button>
        }
        socialAction={
          <Button
            type="button"
            variant="outline"
            className="h-[52px] w-full rounded-[10px] border border-[#d4dbe8] bg-white text-[15px] font-medium text-[#173b72] hover:bg-[#f6f8fc]"
            disabled={authLoading || !isFirebaseReady}
            onClick={handleGoogleSignUp}
          >
            <Globe className="h-4 w-4" />
            Sign up with Google
          </Button>
        }
        footerPrompt="Already have an account?"
        footerLink="/login"
        footerLabel="Sign In"
        agreement={
          <label className="flex items-center gap-2.5 text-[12px] text-[#5f6f8a]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="h-4 w-4 rounded border border-[#cad4e3]"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="font-medium text-[#173b72]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-[#173b72]">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        }
      >
        <form id="register-form" className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2.5 block text-[13px] font-semibold text-[#173b72]">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              className="h-[52px] rounded-[10px] border-[#cad4e3] bg-white px-4 text-[15px] text-[#173b72] placeholder:text-[#8a97ab]"
            />
          </div>

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
                placeholder="Create a strong password"
                autoComplete="new-password"
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
              Account creation is temporarily unavailable. Please try again shortly.
            </div>
          ) : null}
        </form>
      </AuthSplitShell>
    </PublicSiteShell>
  );
}
