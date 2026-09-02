"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import type { PermissionUser } from "@/lib/permissions";

const ALL_COMPANIES_ID = "all";

export type SessionAppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyIds: string[];
};

export type AppCompany = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  colorHex: string;
};

type AppStateContextValue = {
  currentUser: SessionAppUser;
  permissionUser: PermissionUser;
  activeCompanyId: string; // "all" o un Company["id"]
  setActiveCompanyId: (id: string) => void;
  visibleCompanies: AppCompany[];
  allCompanies: AppCompany[];
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export { ALL_COMPANIES_ID };

export function AppStateProvider({
  user,
  companies,
  children,
}: {
  user: SessionAppUser;
  companies: AppCompany[];
  children: ReactNode;
}) {
  const [activeCompanyId, setActiveCompanyId] = useState<string>(ALL_COMPANIES_ID);

  const visibleCompanies = useMemo(() => {
    if (user.role === "ADMIN" || user.role === "RRHH") return companies;
    return companies.filter((c) => user.companyIds.includes(c.id));
  }, [user, companies]);

  const permissionUser: PermissionUser = useMemo(
    () => ({ id: user.id, role: user.role, companyIds: user.companyIds }),
    [user]
  );

  const value: AppStateContextValue = {
    currentUser: user,
    permissionUser,
    activeCompanyId,
    setActiveCompanyId,
    visibleCompanies,
    allCompanies: companies,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState debe usarse dentro de AppStateProvider");
  return ctx;
}
