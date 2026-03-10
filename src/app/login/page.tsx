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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-xl border border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Bem-vindo ao <span className="text-[#39FF14]">ThinkCard</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Acesse sua conta para gerenciar seus cartões e saldos.
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
              <Label htmlFor="email" className="text-zinc-300">
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
              <div className="flex items-center justify-between mt-4">
                <Label htmlFor="password" className="text-zinc-300">
                  Senha
                </Label>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#00FFFF] hover:text-[#00CCCC] transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#39FF14]"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-[#39FF14] text-zinc-950 hover:bg-[#32E612] font-semibold tracking-wide"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-zinc-400">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-medium text-[#00FFFF] hover:text-[#00CCCC] transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
