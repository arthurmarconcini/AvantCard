"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { AuthErrorBanner } from "@/components/ui/auth-error-banner";

const COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Timer de cooldown para evitar spam
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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
    setCooldown(COOLDOWN_SECONDS);
  }

  function handleResend() {
    setSubmitted(false);
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
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Recuperar Senha
          </h2>
          <p className="text-sm text-muted-foreground">
            Digite seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-sm text-zinc-300 leading-relaxed max-w-xs">
              Se o email estiver cadastrado, você receberá um link de
              redefinição em breve. Verifique sua caixa de entrada e spam.
            </p>

            {/* Cooldown timer + reenvio */}
            <div className="flex flex-col items-center gap-2 mt-2">
              {cooldown > 0 ? (
                <p className="text-xs text-zinc-500">
                  Reenviar em{" "}
                  <span className="text-zinc-300 font-semibold tabular-nums">
                    {cooldown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00FFFF] hover:text-white transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Enviar novamente
                </button>
              )}
            </div>

            <Link
              href="/login"
              className="mt-1 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <AuthErrorBanner message={serverError} />

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-zinc-300 font-medium ml-1"
              >
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
                disabled={isSubmitting || cooldown > 0}
              >
                {isSubmitting
                  ? "Enviando..."
                  : cooldown > 0
                    ? `Aguarde ${cooldown}s`
                    : "Enviar link de recuperação"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
