"use client";

import { useState } from "react";
import { AppStateProvider, type SessionAppUser, type AppCompany } from "@/lib/app-state";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MoreSheet } from "@/components/layout/MoreSheet";

export function AppShell({
  user,
  companies,
  children,
}: {
  user: SessionAppUser;
  companies: AppCompany[];
  children: React.ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <AppStateProvider user={user} companies={companies}>
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 pb-24">{children}</main>
      <BottomNav onMoreClick={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </AppStateProvider>
  );
}
