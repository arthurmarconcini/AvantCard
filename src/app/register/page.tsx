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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-xl border border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Criar Conta
          </h2>
          <p className="text-sm text-zinc-400">
            Junte-se ao <span className="text-[#39FF14]">ThinkCard</span> hoje mesmo.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {serverError && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="name" className="text-zinc-300">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                className="mt-1 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#39FF14]"
                placeholder="Seu nome"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email" className="text-zinc-300 mt-4 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#39FF14]"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-zinc-300 mt-4 block">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#39FF14]"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.
              </p>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-[#39FF14] text-zinc-950 hover:bg-[#32E612] font-semibold tracking-wide"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando conta..." : "Criar Conta"}
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-zinc-400">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-[#00FFFF] hover:text-[#00CCCC] transition-colors"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
