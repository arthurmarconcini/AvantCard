"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json();

    if (!res.ok) {
      setServerError(body.error || "Erro ao criar conta.");
      return;
    }

    // Login automático após cadastro
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (signInResult?.error) {
      // Conta criada mas falhou o auto-login — redirecionar para login
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 rounded-3xl bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl border border-white/5">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Criar Conta
          </h2>
          <p className="text-sm text-muted-foreground">
            Junte-se ao <span className="text-primary font-medium">ThinkCard</span> hoje mesmo.
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
              <Label htmlFor="name" className="text-zinc-300 font-medium ml-1">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl pl-4"
                placeholder="Seu nome"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 font-medium ml-1 block">
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
              <Label htmlFor="password" className="text-zinc-300 font-medium ml-1 block">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl pl-4"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                 <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>
              )}
              <p className="text-[11px] text-zinc-500 mt-2 ml-1 leading-relaxed">
                Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 especial.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary text-zinc-950 hover:bg-primary/90 font-bold tracking-wide h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar Conta"}
            </Button>
          </div>
        </form>

        <p className="pt-6 text-center text-sm text-zinc-400">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#00FFFF] hover:text-white transition-colors ml-1"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
