"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setServerError("Email ou senha inválidos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 rounded-3xl bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl border border-white/5">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Bem-vindo ao <span className="text-primary">ThinkCard</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Acesse sua conta para gerenciar seus cartões e saldos.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {serverError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {serverError}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 font-medium ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl pl-4"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-zinc-300 font-medium">
                  Senha
                </Label>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#00FFFF] hover:text-white transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl pl-4"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary text-zinc-950 hover:bg-primary/90 font-bold tracking-wide h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>

        <p className="pt-6 text-center text-sm text-zinc-400">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#00FFFF] hover:text-white transition-colors ml-1"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
