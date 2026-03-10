"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error || "Erro ao enviar solicitação.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 rounded-3xl bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl border border-white/5">
        <Link
          href="/login"
          className="absolute left-6 top-8 text-zinc-400 hover:text-white transition-colors"
          aria-label="Voltar para o login"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="text-center pt-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Recuperar Senha
          </h2>
          <p className="text-sm text-muted-foreground">
            Digite seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="h-14 w-14 text-primary" />
            <p className="text-center text-sm text-zinc-300 leading-relaxed">
              Ocorreu tudo bem! Se o email estiver cadastrado, você receberá um link de redefinição em breve. Verifique sua caixa de entrada e spam.
            </p>
            <Link
              href="/login"
              className="mt-2 text-sm font-semibold text-[#00FFFF] hover:text-white transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {serverError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {serverError}
              </div>
            )}

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
                <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary text-zinc-950 hover:bg-primary/90 font-bold tracking-wide h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Enviando..."
                  : "Enviar link de recuperação"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
