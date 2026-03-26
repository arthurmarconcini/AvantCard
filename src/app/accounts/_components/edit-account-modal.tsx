"use client";

import { useState } from "react";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { accountSchema, type AccountInput } from "@/lib/validators/account";
import { updateAccount } from "@/actions/accounts";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Building2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface AccountData {
  id: string;
  name: string;
  type: string;
  institutionName: string | null;
  last4: string | null;
  creditLimit?: number;
  billingDay?: number | null;
  dueDay?: number | null;
  initialBalance?: number | null;
}

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountData;
}

export function EditAccountModal({ open, onOpenChange, account }: EditAccountModalProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema) as unknown as Resolver<AccountInput>,
    defaultValues: {
      name: account.name,
      type: account.type as AccountInput["type"],
      institutionName: account.institutionName || "",
      last4: account.last4 || "",
      creditLimit: account.creditLimit ? account.creditLimit.toString() : "",
      billingDay: account.billingDay ?? undefined,
      dueDay: account.dueDay ?? undefined,
      initialBalance: account.initialBalance ? account.initialBalance.toString() : "",
    },
  });

  const accountType = useWatch({ control, name: "type" });
  const isCreditCard = accountType === "CREDIT_CARD";

  async function onSubmit(data: AccountInput) {
    setServerError("");

    try {
      await updateAccount(account.id, data);
      toast.success("Conta atualizada com sucesso");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar conta.";
      setServerError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary to-primary/10" />

        <div className="p-6">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-extrabold text-white">Editar Conta</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Altere os dados da sua conta ou cartão.
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
                  placeholder="Ex: Nubank Principal"
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-zinc-300 font-medium">Tipo de Conta</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-zinc-600">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                        <SelectItem value="BANK_ACCOUNT" className="focus:bg-zinc-800 focus:text-white cursor-pointer"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-zinc-400" />Conta Bancária</div></SelectItem>
                        <SelectItem value="CREDIT_CARD" className="focus:bg-zinc-800 focus:text-white cursor-pointer"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#00FFFF]" />Cartão de Crédito</div></SelectItem>
                        <SelectItem value="WALLET" className="focus:bg-zinc-800 focus:text-white cursor-pointer"><div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" />Carteira (Dinheiro)</div></SelectItem>
                        <SelectItem value="OTHER" className="focus:bg-zinc-800 focus:text-white cursor-pointer">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
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

            {isCreditCard && (
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
            )}

            {!isCreditCard && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label className="text-zinc-300 font-medium">Saldo Inicial</Label>
                  <Controller
                    control={control}
                    name="initialBalance"
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
                  <p className="text-[11px] text-zinc-500">Quanto você já possui nesta conta hoje.</p>
                  {errors.initialBalance && <p className="text-red-500 text-xs">{errors.initialBalance.message}</p>}
                </div>
              </div>
            )}

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
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
