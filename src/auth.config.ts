import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * Config base de Auth.js, compatible con el Edge Runtime (sin Credentials
 * provider ni dependencias de Node como `crypto`). La usa `middleware.ts`
 * para chequear la sesión. La config completa (con el provider real) vive
 * en `auth.ts` y solo se usa en rutas/Server Actions Node.js.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
        token.companyIds = (user as { companyIds: string[] }).companyIds;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.companyIds = token.companyIds;
      return session;
    },
  },
} satisfies NextAuthConfig;
