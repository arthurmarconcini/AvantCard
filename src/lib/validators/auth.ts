import { z } from "zod";

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório.")
    .email("Informe um email válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter no mínimo 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  email: z
    .string()
    .min(1, "O email é obrigatório.")
    .email("Informe um email válido."),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula.")
    .regex(/[0-9]/, "A senha deve conter pelo menos 1 número.")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/,
      "A senha deve conter pelo menos 1 caractere especial."
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório.")
    .email("Informe um email válido."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ---------------------------------------------------------------------------
// Reset Password
// ---------------------------------------------------------------------------
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token é obrigatório."),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos 1 número.")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/,
        "A senha deve conter pelo menos 1 caractere especial."
      ),
    confirmPassword: z.string().min(1, "Confirme sua nova senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
