import { z } from "zod";

export const accountSchema = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
    type: z.enum(["CREDIT_CARD", "BANK_ACCOUNT", "CASH", "WALLET", "OTHER"]),
    institutionName: z.string().optional(),
    last4: z
      .string()
      .max(4, "No máximo 4 dígitos.")
      .regex(/^\d*$/, "Apenas números.")
      .optional()
      .or(z.literal("")),
    // For credit cards
    creditLimit: z
      .string()
      .regex(/^\d+$/, "Deve ser um valor numérico.")
      .optional()
      .or(z.literal("")),
    billingDay: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
      .pipe(z.number().int().min(1).max(31).optional()),
    dueDay: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
      .pipe(z.number().int().min(1).max(31).optional()),
  })
  .superRefine((data, ctx) => {
    if (data.type === "CREDIT_CARD") {
      if (!data.creditLimit || data.creditLimit === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O limite de crédito é obrigatório para cartões.",
          path: ["creditLimit"],
        });
      }
      if (!data.billingDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A informação de dias para o fechamento é obrigatória.",
          path: ["billingDay"],
        });
      }
      if (!data.dueDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O dia de vencimento é obrigatório.",
          path: ["dueDay"],
        });
      }
    }
  });

export type AccountInput = z.infer<typeof accountSchema>;
