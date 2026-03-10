"use client";

import { useSession } from "next-auth/react";

/**
 * Hook de sessão que expõe dados do usuário autenticado.
 * Wrapa o useSession do NextAuth com uma API mais limpa.
 * TanStack Query é usado no provider-level para cache; aqui
 * apenas expomos a sessão do NextAuth de forma ergonômica.
 */
export function useAuthSession() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
