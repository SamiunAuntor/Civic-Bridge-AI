"use client";

import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { PublicSiteShell } from "@/components/landing/public-site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { notify } from "@/lib/feedback";

export default function ForgotPasswordPage() {
  const { sendPasswordReset, authLoading, isFirebaseReady } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await sendPasswordReset(email);
      setSubmitted(true);
      notify.success("Password reset instructions have been sent to your email.");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "We couldn't send the reset email right now.";
      setError(message);
      notify.error(message);
    }
  }

  return (
    <PublicSiteShell mainClassName="min-h-[calc(100vh-86px-153px)]">
      <AuthSplitShell
        title="Reset Password"
        subtitle="Enter your email and we will send a secure reset link so you can get back into your workspace."
        primaryAction={
          <Button
            type="submit"
            form="forgot-password-form"
            className="h-[54px] w-full rounded-[10px] bg-[#2f4f87] text-[15px] font-semibold text-white hover:bg-[#294779]"
            disabled={authLoading || submitted}
          >
            {authLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {submitted ? "Reset Link Sent" : "Send Reset Link"}
          </Button>
        }
        socialAction={
          <Link
            href="/login"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[10px] border border-[#d4dbe8] bg-white text-[15px] font-medium text-[#173b72] hover:bg-[#f6f8fc]"
          >
            Back to Sign In
          </Link>
        }
        footerPrompt="Remembered your password?"
        footerLink="/login"
        footerLabel="Sign In"
      >
        <form
          id="forgot-password-form"
          className="space-y-5"
          onSubmit={handleSubmit}
        >
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

          {submitted ? (
            <div className="rounded-[12px] border border-[#d7ede4] bg-[#f1fbf6] px-4 py-3 text-sm text-[#2c7d5b]">
              Check your inbox for the password reset link. It may take a minute to arrive.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[12px] border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {!isFirebaseReady ? (
            <div className="rounded-[12px] border border-secondary/20 bg-surface px-4 py-3 text-sm text-muted-foreground">
              Password reset is temporarily unavailable. Please try again shortly.
            </div>
          ) : null}
        </form>
      </AuthSplitShell>
    </PublicSiteShell>
  );
}
