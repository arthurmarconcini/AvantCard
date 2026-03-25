"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { depositToAccount, withdrawFromAccount } from "@/actions/accounts";

const formSchema = z.object({
  amount: z.string().min(1, "Informe o valor."),
  description: z.string().optional(),
  date: z.string().min(10, "Data inválida"),
});

type FormValues = z.infer<typeof formSchema>;

type TransactionMode = "deposit" | "withdraw";

interface AccountTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: { id: string; name: string };
  initialMode: TransactionMode;
}

export function AccountTransactionModal({ open, onOpenChange, account, initialMode }: AccountTransactionModalProps) {
  const [mode, setMode] = useState<TransactionMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, formState: { errors }, reset, control, register } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const isDeposit = mode === "deposit";

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      const rawAmount = data.amount.replace(/\./g, "").replace(",", ".");
      const amountParsed = parseFloat(rawAmount);

      if (isNaN(amountParsed) || amountParsed <= 0) {
        toast.error("Valor inválido", { className: "bg-red-950 border-red-900 text-red-200" });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        accountId: account.id,
        amount: amountParsed,
        description: data.description || undefined,
        date: new Date(data.date + "T12:00:00Z"),
      };

      if (isDeposit) {
        await depositToAccount(payload);
      } else {
        const res = await withdrawFromAccount(payload);
        if (res && !res.success && "error" in res) {
          toast.error("Saldo Insuficiente", {
            description: res.error,
            className: "bg-red-950 border-red-900 text-red-200",
          });
          return;
        }
      }

      toast.success(isDeposit ? "Depósito realizado" : "Saque realizado", {
        description: `${isDeposit ? "Entrada" : "Saída"} registrada em ${account.name}.`,
        className: "bg-zinc-900 border-zinc-800 text-zinc-100",
      });

      onOpenChange(false);
      reset();
    } catch (e) {
      const err = e as Error;
      toast.error("Erro", {
        description: err.message || "Ocorreu um erro ao processar a operação.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300 ${isDeposit ? "bg-emerald-500" : "bg-amber-500"}`} />

        <div className="p-6">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-extrabold text-white">Movimentação</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {account.name}
            </DialogDescription>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode("deposit")}
              className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                isDeposit
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-black/20 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:border-white/10"
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Depositar
            </button>
            <button
              type="button"
              onClick={() => setMode("withdraw")}
              className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                !isDeposit
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "bg-black/20 text-zinc-500 border border-white/5 hover:text-zinc-300 hover:border-white/10"
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Sacar
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-300 font-medium">Valor (R$)</Label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => {
                  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (!value) {
                      field.onChange("");
                      return;
                    }
                    const numericValue = parseInt(value, 10);
                    const formatted = new Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                    }).format(numericValue / 100);
                    field.onChange(formatted);
                  };

                  return (
                    <Input
                      id="amount"
                      placeholder="0,00"
                      className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                      value={field.value}
                      onChange={handleAmountChange}
                    />
                  );
                }}
              />
              {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300 font-medium">
                Descrição <span className="text-zinc-500 font-normal">(opcional)</span>
              </Label>
              <Input
                id="description"
                placeholder={isDeposit ? "Ex: Salário, Transferência recebida..." : "Ex: Pagamento PIX, Saque ATM..."}
                className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-300 font-medium">Data</Label>
              <Input
                id="date"
                type="date"
                className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl scheme-dark"
                {...register("date")}
              />
              {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-11 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`h-11 text-zinc-950 rounded-xl px-6 font-bold transition-all ${
                  isDeposit
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-amber-500 hover:bg-amber-400"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : isDeposit ? "Confirmar Depósito" : "Confirmar Saque"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
