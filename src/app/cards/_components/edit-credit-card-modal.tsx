"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import { accountSchema, type AccountInput } from "@/lib/validators/account";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, CreditCard } from "lucide-react";
import { updateCreditCard } from "@/actions/cards";
import { toast } from "sonner";

interface EditCreditCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: {
    id: string;
    name: string;
    institutionName?: string | null;
    last4?: string | null;
    creditLimit?: number | null;
    billingDay?: number | null;
    dueDay?: number | null;
  };
}

export function EditCreditCardModal({ open, onOpenChange, card }: EditCreditCardModalProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema) as unknown as Resolver<AccountInput>,
    defaultValues: {
      name: card.name,
      type: "CREDIT_CARD",
      institutionName: card.institutionName || "",
      last4: card.last4 || "",
      creditLimit: card.creditLimit ? card.creditLimit.toString() : "",
      billingDay: card.billingDay || undefined,
      dueDay: card.dueDay || undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: card.name,
        type: "CREDIT_CARD",
        institutionName: card.institutionName || "",
        last4: card.last4 || "",
        creditLimit: card.creditLimit ? card.creditLimit.toString() : "",
        billingDay: card.billingDay || undefined,
        dueDay: card.dueDay || undefined,
      });
    }
  }, [open, card, reset]);

  async function onSubmit(data: AccountInput) {
    setServerError("");

    try {
      const result = await updateCreditCard(card.id, {
        name: data.name,
        institutionName: data.institutionName,
        last4: data.last4,
        creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
        billingDay: data.billingDay,
        dueDay: data.dueDay,
      });

      if (!result.success) {
        setServerError("Erro ao atualizar o cartão.");
        return;
      }

      toast.success("Cartão atualizado com sucesso!", {
        className: "bg-zinc-950 border-primary/20 text-white",
        descriptionClassName: "text-zinc-400",
      });
      onOpenChange(false);
    } catch (error) {
       setServerError(error instanceof Error ? error.message : "Erro desconhecido ao salvar o cartão.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary to-primary/10" />

        <div className="p-6">
          <DialogHeader className="mb-6 text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-extrabold text-white">Editar Cartão</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400">
              Atualize as informações do seu cartão de crédito.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300 font-medium">Nome de Identificação</Label>
                <Input
                  {...register("name")}
                  placeholder="Ex: Nubank Gold"
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

              <div className="col-span-1 space-y-2">
                <Label className="text-zinc-300 font-medium">Instituição</Label>
                <Input
                  {...register("institutionName")}
                  placeholder="Ex: Itaú"
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                />
                {errors.institutionName && <p className="text-red-500 text-xs">{errors.institutionName.message}</p>}
              </div>

              <div className="col-span-1 space-y-2">
                <Label className="text-zinc-300 font-medium">Final do Cartão</Label>
                <Input
                  {...register("last4")}
                  placeholder="Ex: 5678"
                  maxLength={4}
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                />
                {errors.last4 && <p className="text-red-500 text-xs">{errors.last4.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300 font-medium">Limite de Crédito</Label>
                <Controller
                  control={control}
                  name="creditLimit"
                  render={({ field }) => (
                    <NumericFormat
                      value={field.value ? Number(field.value) / 100 : ""}
                      onValueChange={(values) => {
                        if (values.floatValue !== undefined) {
                          field.onChange(Math.round(values.floatValue * 100).toString());
                        } else {
                          field.onChange("");
                        }
                      }}
                      prefix="R$ "
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      placeholder="R$ 0,00"
                      customInput={Input}
                      className="h-11 bg-black/40 border-primary/20 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                    />
                  )}
                />
                {errors.creditLimit && <p className="text-red-500 text-xs">{errors.creditLimit.message}</p>}
              </div>

              <div className="col-span-1 space-y-2">
                <Label className="text-zinc-300 font-medium">Dias p/ Fechamento</Label>
                <Input
                  {...register("billingDay")}
                  type="number"
                  inputMode="numeric"
                  placeholder="Ex: 7"
                  min={1} max={31}
                  className="h-11 bg-black/40 border-primary/20 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.billingDay && <p className="text-red-500 text-xs">{errors.billingDay.message}</p>}
              </div>

              <div className="col-span-1 space-y-2">
                <Label className="text-zinc-300 font-medium">Dia de Vencimento</Label>
                <Input
                  {...register("dueDay")}
                  type="number"
                  inputMode="numeric"
                  placeholder="Ex: 15"
                  min={1} max={31}
                  className="h-11 bg-black/40 border-primary/20 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.dueDay && <p className="text-red-500 text-xs">{errors.dueDay.message}</p>}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-11 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
