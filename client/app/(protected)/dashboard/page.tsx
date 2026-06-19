"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  FolderClock,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/hooks/use-auth";

const overviewCards = [
  {
    title: "Protected Session",
    description:
      "Firebase authentication is wired into the App Router shell and route protection.",
    icon: ShieldCheck,
  },
  {
    title: "Backend Bootstrap",
    description:
      "The dashboard attempts `/api/users/me` on sign-in and stores the synced profile.",
    icon: BrainCircuit,
  },
  {
    title: "Assessment Flow Ready",
    description:
      "The first form scaffold is in place, while gracefully handling the current backend blocker.",
    icon: FolderClock,
  },
];

export default function DashboardPage() {
  const { profile, profileLoading, profileError } = useAuth();

  if (profileLoading) {
    return <LoadingState title="Loading your dashboard" />;
  }

  if (profileError) {
    return (
      <ErrorState
        title="Unable to load your CivicBridge profile"
        message={profileError}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[28px] border border-border/60 bg-panel p-6 shadow-soft md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            Overview
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary">
            Welcome{profile?.name ? `, ${profile.name}` : ""}.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The frontend foundation is live: authentication, theming, typed API
            access, and protected navigation are all connected.
          </p>
        </div>
        <Link
          href="/assessments/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-soft hover:bg-primary-strong"
        >
          New Assessment
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {profile ? (
        <section className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <Card className="p-6 md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-strong text-primary">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  Authenticated User
                </h2>
                <p className="text-sm text-muted-foreground">
                  Bootstrapped from `/api/users/me`
                </p>
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="mt-2 font-semibold text-foreground">
                  {profile.name || "Not provided"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="mt-2 font-semibold text-foreground">
                  {profile.email || "Not provided"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <dt className="text-sm text-muted-foreground">Database User ID</dt>
                <dd className="mt-2 break-all font-semibold text-foreground">
                  {profile.id}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <dt className="text-sm text-muted-foreground">Firebase UID</dt>
                <dd className="mt-2 break-all font-semibold text-foreground">
                  {profile.firebase_uid}
                </dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-5">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.35 }}
                >
                  <Card className="h-full p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {card.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No synced backend profile yet"
          message="Once Firebase sign-in and `/api/users/me` both succeed, your user details will appear here."
          action={
            <Link
              href="/assessments/new"
              className="inline-flex rounded-2xl border border-primary/20 px-4 py-2 font-semibold text-primary"
            >
              Go to assessment form
            </Link>
          }
        />
      )}
    </div>
  );
}
