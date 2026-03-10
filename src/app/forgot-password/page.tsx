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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-xl border border-zinc-800 relative">
        <Link
          href="/login"
          className="absolute left-8 top-8 text-zinc-400 hover:text-white transition-colors"
          aria-label="Voltar para o login"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="text-center pt-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Recuperar Senha
          </h2>
          <p className="text-sm text-zinc-400">
            Digite seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="h-12 w-12 text-[#39FF14]" />
            <p className="text-center text-sm text-zinc-300">
              Se o email estiver cadastrado, você receberá um link de redefinição
              em breve. Verifique sua caixa de entrada e spam.
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-[#00FFFF] hover:text-[#00CCCC] transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {serverError && (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <div className="rounded-md shadow-sm">
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
                  <p className="mt-1 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-[#39FF14] text-zinc-950 hover:bg-[#32E612] font-semibold tracking-wide"
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
