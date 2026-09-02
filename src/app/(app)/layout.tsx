import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });

  return (
    <AppShell user={session.user} companies={companies}>
      {children}
    </AppShell>
  );
}
