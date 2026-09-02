"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = undefined;

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-neutral-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Building2 className="size-7" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">CRM Empleados</h1>
            <p className="text-sm text-neutral-500">
              Sabrina Spa · Kiosco La Bota · Mercadito La Bota
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@empresa.com"
              className="h-12 rounded-xl text-base"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-12 rounded-xl text-base"
              required
            />
          </div>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-2 h-12 rounded-xl text-base">
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Acceso interno. Si olvidaste tu contraseña, contactá al administrador.
        </p>
      </div>
    </div>
  );
}
