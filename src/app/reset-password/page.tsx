"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validators/auth";
import { validatePasswordStrength } from "@/lib/password";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthBar } from "@/components/ui/password-strength-bar";
import { AuthErrorBanner } from "@/components/ui/auth-error-banner";
import {
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  KeyRound,
} from "lucide-react";

type PageState = "form" | "success" | "invalid-token";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>(
    token ? "form" : "invalid-token"
  );
  const [serverError, setServerError] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "" },
  });

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const result = validatePasswordStrength(value);
    setPasswordScore(value.length === 0 ? 0 : result.score);
  }

  async function onSubmit(data: ResetPasswordInput) {
    setServerError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.token, password: data.password }),
    });

    if (!res.ok) {
      const body = await res.json();

      if (body.details && Array.isArray(body.details)) {
        setServerError(body.details.join(" "));
        return;
      }

      setServerError(body.error || "Erro ao redefinir a senha.");
      return;
    }

    setPageState("success");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 rounded-3xl bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl border border-white/5">
        <Link
          href="/forgot-password"
          className="absolute left-6 top-8 text-zinc-400 hover:text-white transition-colors"
          aria-label="Voltar para recuperação de senha"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* ── Estado: Token inválido / ausente ── */}
        {pageState === "invalid-token" && (
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Link Inválido
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Este link de redefinição é inválido ou está ausente. Solicite um
                novo link para redefinir sua senha.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Solicitar novo link
            </Link>
          </div>
        )}

        {/* ── Estado: Sucesso ── */}
        {pageState === "success" && (
          <div className="flex flex-col items-center gap-5 py-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Senha Redefinida!
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Sua senha foi alterada com sucesso. Agora você pode fazer login
                com a nova senha.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Ir para o login
            </Link>
          </div>
        )}

        {/* ── Estado: Formulário ── */}
        {pageState === "form" && (
          <>
            <div className="text-center pt-2">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                Nova Senha
              </h2>
              <p className="text-sm text-muted-foreground">
                Crie uma senha forte para proteger sua conta.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <input type="hidden" {...register("token")} />

              <AuthErrorBanner message={serverError} />

              <div className="space-y-5">
                {/* Nova Senha */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-zinc-300 font-medium ml-1"
                  >
                    Nova senha
                  </Label>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl pl-4"
                    placeholder="••••••••"
                    {...register("password", {
                      onChange: handlePasswordChange,
                    })}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                  <PasswordStrengthBar score={passwordScore} showHint />
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-zinc-300 font-medium ml-1"
                  >
                    Confirmar senha
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl pl-4"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500 ml-1 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-primary text-zinc-950 hover:bg-primary/90 font-bold tracking-wide h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
