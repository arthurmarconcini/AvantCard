"use client";

import { useTransition } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createPurchase } from "@/actions/cards";

const formatCurrency = (valueInCents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
};

const purchaseSchema = z.object({
  accountId: z.string().min(1, "O cartão é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.string().min(1, "Informe o valor."),
  transactionDate: z.string().min(1, "A data é obrigatória."),
  categoryId: z.string().optional(),
  personId: z.string().optional(),
  isInstallment: z.boolean(),
  installmentTotal: z.string().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface AddPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: { id: string; name: string; availableLimit: number }[];
  categories: { id: string; name: string }[];
  persons: { id: string; name: string }[];
  defaultAccountId?: string;
}

export function AddPurchaseModal({
  open,
  onOpenChange,
  cards,
  categories,
  persons,
  defaultAccountId,
}: AddPurchaseModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      accountId: defaultAccountId || (cards.length > 0 ? cards[0].id : ""),
      description: "",
      amount: "",
      transactionDate: new Date().toISOString().split("T")[0],
      categoryId: "none",
      personId: "none",
      isInstallment: false,
      installmentTotal: "1",
    },
  });

  const isInstallment = useWatch({
    control: form.control,
    name: "isInstallment",
    defaultValue: false
  });

  const amountWatch = useWatch({
    control: form.control,
    name: "amount",
    defaultValue: ""
  });

  const onSubmit = (data: PurchaseFormValues) => {
    startTransition(async () => {
      try {
        const rawAmount = data.amount.replace(/\./g, "").replace(",", ".");
        const amountInCents = Math.round(parseFloat(rawAmount) * 100);

        if (isNaN(amountInCents) || amountInCents <= 0) {
          form.setError("amount", { message: "Valor inválido" });
          return;
        }

        const selectedCard = cards.find(c => c.id === data.accountId);
        if (selectedCard && amountInCents > selectedCard.availableLimit) {
          form.setError("amount", { message: "O valor ultrapassa o limite disponível no cartão." });
          return;
        }

        const localDate = new Date(`${data.transactionDate}T12:00:00`);

        await createPurchase({
          accountId: data.accountId,
          description: data.description,
          amount: amountInCents,
          transactionDate: localDate,
          categoryId: data.categoryId === "none" ? null : data.categoryId,
          personId: data.personId === "none" ? null : data.personId,
          installmentTotal: data.installmentTotal && data.isInstallment ? parseInt(data.installmentTotal, 10) : null,
        });

        form.reset();
        onOpenChange(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/90 backdrop-blur-2xl border-white/5 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary to-primary/10" />
        
        <div className="p-6">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-2xl font-extrabold text-white">Adicionar Compra</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Registe um novo gasto no seu cartão.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-zinc-300 font-medium">Cartão de Crédito</Label>
            <Controller
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-zinc-600">
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                    {cards.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.accountId && <p className="text-red-500 text-xs">{form.formState.errors.accountId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-300 font-medium">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Mercado Livre"
              className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
              {...form.register("description")}
            />
            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-300 font-medium">Valor</Label>
              <Controller
                control={form.control}
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
              {form.formState.errors.amount && <p className="text-red-500 text-xs">{form.formState.errors.amount.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transactionDate" className="text-zinc-300 font-medium">Data</Label>
              <Input
                id="transactionDate"
                type="date"
                className="h-11 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl scheme-dark"
                {...form.register("transactionDate")}
              />
              {form.formState.errors.transactionDate && <p className="text-red-500 text-xs">{form.formState.errors.transactionDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-zinc-300 font-medium">Categoria</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-zinc-600">
                      <SelectValue placeholder="Categoria (Opcional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                      <SelectItem value="none" className="focus:bg-zinc-800 focus:text-white cursor-pointer">Sem Categoria</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personId" className="text-primary font-medium">Atribuir a Gasto P2P</Label>
              <Controller
                control={form.control}
                name="personId"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-primary/5 border-primary/20 text-primary focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-primary/70">
                      <SelectValue placeholder="Eu Mesmo (Pessoal)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                      <SelectItem value="none" className="focus:bg-zinc-800 focus:text-white cursor-pointer">Eu Mesmo (Pessoal)</SelectItem>
                      {persons.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-white/5">
            <Controller
              control={form.control}
              name="isInstallment"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isInstallment"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                  />
                  <Label htmlFor="isInstallment" className="text-zinc-300 cursor-pointer">
                    Compra parcelada?
                  </Label>
                </div>
              )}
            />

            {isInstallment && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="installmentTotal" className="text-zinc-300 font-medium">Número de Parcelas</Label>
                <Controller
                  control={form.control}
                  name="installmentTotal"
                  render={({ field }) => (
                    <Select value={field.value || "2"} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-11 bg-black/20 border-white/5 text-white focus:ring-primary focus:border-primary/50 transition-all rounded-xl relative px-3 py-2 flex justify-between items-center text-left data-placeholder:text-zinc-600">
                        <SelectValue placeholder="Selecione as parcelas" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                        {Array.from({ length: 23 }, (_, i) => i + 2).map((num) => {
                          const currentAmountValue = amountWatch ? amountWatch.replace(/\./g, "").replace(",", ".") : "0";
                          const baseAmountCents = Math.round(parseFloat(currentAmountValue) * 100) || 0;
                          const installmentValue = baseAmountCents / num;

                          return (
                            <SelectItem key={num} value={num.toString()} className="hover:bg-zinc-800 focus:bg-zinc-800">
                              {num}x de {formatCurrency(installmentValue)} sem juros
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
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
              disabled={isPending}
              className="h-11 bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl px-6 font-bold"
            >
              {isPending ? "Salvando..." : "Adicionar Compra"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
