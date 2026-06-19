"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { profile, firebaseUser, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const name = profile?.name || firebaseUser?.displayName || "Signed-in user";
  const email = profile?.email || firebaseUser?.email || "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-xl border border-[#d9deea] bg-white px-3 py-2 text-left text-sm text-[#102a55]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ff] text-[#173b72]">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="hidden max-w-[160px] md:block">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-xs text-[#7c879e]">{email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-[#7c879e]" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-64 rounded-2xl border border-[#d9deea] bg-white p-2 shadow-[0_12px_34px_-18px_rgba(23,59,114,0.35)]">
          <div className="rounded-xl px-3 py-3">
            <p className="font-semibold text-[#102a55]">{name}</p>
            <p className="mt-1 text-sm text-[#7c879e]">{email}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOutUser();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#173b72] hover:bg-[#eef4ff]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
