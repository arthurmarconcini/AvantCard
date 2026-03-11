"use client";

import { useState } from "react";
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { accountSchema, type AccountInput } from "@/lib/validators/account";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Wallet, Building2, CreditCard } from "lucide-react";

export function AddAccountModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
      name: "",
      type: "BANK_ACCOUNT",
      institutionName: "",
      last4: "",
      creditLimit: "",
      billingDay: undefined,
      dueDay: undefined,
    },
  });

  const accountType = useWatch({ control, name: "type" });
  const isCreditCard = accountType === "CREDIT_CARD";

  async function onSubmit(data: AccountInput) {
    setServerError("");

    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error || "Erro ao criar conta.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold h-11 rounded-xl px-6 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-5 w-5" /> Nova Conta
        </Button>
      </DialogTrigger>
      
      {/* Modal Content with Premium Dark Glassmorphism */}
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary to-primary/10" />
        
        <div className="p-6">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-extrabold text-white">Adicionar Conta</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Registre um novo cartão, conta bancária ou carteira.
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
                      <SelectTrigger className="h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl">
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
                  <Label className="text-zinc-300 font-medium text-xs">Dias antes do venc. (Fechamento)</Label>
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
                  <Label className="text-zinc-300 font-medium text-xs">Dia do Vencimento</Label>
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

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5 mt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="h-11 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl font-medium"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-11 bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl px-6 font-bold"
              >
                {isSubmitting ? "Salvando..." : "Salvar Conta"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
