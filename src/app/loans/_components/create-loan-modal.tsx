"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createLoan } from "@/actions/loans";

const formSchema = z.object({
  personId: z.string().min(1, "Selecione a pessoa"),
  originAccountId: z.string().min(1, "Selecione a conta de origem"),
  principalAmount: z.string().min(1, "Informe o valor."),
  interestRate: z.coerce.number().min(0, "A taxa não pode ser negativa").optional(),
  installments: z.coerce.number().min(1, "Mínimo de 1 parcela").max(72, "Máximo de 72 parcelas"),
  startDate: z.string().min(10, "Data inválida"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: { id: string; name: string }[];
  accounts: { id: string; name: string; currency: string }[];
  preSelectedPersonId?: string | null;
}

export function CreateLoanModal({ open, onOpenChange, people, accounts, preSelectedPersonId }: CreateLoanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personId: preSelectedPersonId || "",
      originAccountId: "",
      principalAmount: "",
      interestRate: 0,
      installments: 1,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  useState(() => {
    if (preSelectedPersonId) {
      setValue("personId", preSelectedPersonId);
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const rawAmount = data.principalAmount.replace(/\./g, "").replace(",", ".");
      const amountParsed = parseFloat(rawAmount);

      if (isNaN(amountParsed) || amountParsed <= 0) {
        toast.error("Valor inválido", { className: "bg-red-950 border-red-900 text-red-200" });
        setIsSubmitting(false);
        return;
      }

      await createLoan({
        personId: data.personId,
        originAccountId: data.originAccountId,
        principalAmount: amountParsed, 
        interestRate: data.interestRate || 0,
        installments: data.installments,
        startDate: new Date(data.startDate + "T12:00:00Z"),
      });

      toast.success("Empréstimo registrado", {
        description: "Contrato e parcelas gerados com sucesso.",
        className: "bg-zinc-900 border-zinc-800 text-zinc-100",
      });
      onOpenChange(false);
      reset();
    } catch (e) {
      const err = e as Error;
      toast.error("Erro", {
        description: err.message || "Ocorreu um erro ao salvar o empréstimo.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v) reset();
    }}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary to-primary/10" />
        
        <div className="p-6">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-extrabold text-white">Criar Empréstimo</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Forneça dinheiro ou limite para um conhecido. Isso descontará do saldo da sua conta imediatamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="personId" className="text-zinc-300 font-medium">Pessoa (Amigo/Família)</Label>
              <Controller
                control={control}
                name="personId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={people.length === 0}
                  >
                    <SelectTrigger className="w-full h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-zinc-600">
                      <SelectValue placeholder={people.length === 0 ? "Cadastre uma pessoa primeiro" : "Selecione a pessoa"} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.personId && <p className="text-red-500 text-xs">{errors.personId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="originAccountId" className="text-zinc-300 font-medium">Conta de Origem (Saída do Dinheiro)</Label>
              <Controller
                control={control}
                name="originAccountId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={accounts.length === 0}
                  >
                    <SelectTrigger className="w-full h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-zinc-600">
                      <SelectValue placeholder={accounts.length === 0 ? "Cadastre uma conta" : "Selecione a conta"} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.originAccountId && <p className="text-red-500 text-xs">{errors.originAccountId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalAmount" className="text-zinc-300 font-medium">Valor (R$)</Label>
                <Controller
                  control={control}
                  name="principalAmount"
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
                        id="principalAmount"
                        placeholder="0,00"
                        className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                        value={field.value}
                        onChange={handleAmountChange}
                      />
                    );
                  }}
                />
                {errors.principalAmount && <p className="text-red-500 text-xs">{errors.principalAmount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="installments" className="text-zinc-300 font-medium">Parcelas</Label>
                <Input 
                  id="installments" 
                  type="number" 
                  placeholder="1" 
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  {...register("installments")} 
                />
                {errors.installments && <p className="text-red-500 text-xs">{errors.installments.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="text-zinc-300 font-medium">Juros Simples (% a.m)</Label>
                <Input 
                  id="interestRate" 
                  type="number"
                  step="0.01"
                  placeholder="0.00" 
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  {...register("interestRate")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-zinc-300 font-medium">Data de Início</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl scheme-dark" 
                  {...register("startDate")} 
                />
                {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate.message}</p>}
              </div>
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
                className="h-11 bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl px-6 font-bold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : "Confirmar Empréstimo"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
