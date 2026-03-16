"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { createPurchase } from "@/actions/cards";

const purchaseSchema = z.object({
  accountId: z.string().min(1, "O cartão é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.string().min(1, "Informe o valor."),
  transactionDate: z.string().min(1, "A data é obrigatória."),
  categoryId: z.string().optional(),
  personId: z.string().optional(),
  installmentNumber: z.string().optional(),
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
    },
  });

  const onSubmit = (data: PurchaseFormValues) => {
    startTransition(async () => {
      try {
        // Conversão do valor string '150,50' ou '150.50' p/ centavos
        const rawAmount = data.amount.replace(/\./g, "").replace(",", ".");
        const amountInCents = Math.round(parseFloat(rawAmount) * 100);

        if (isNaN(amountInCents) || amountInCents <= 0) {
          form.setError("amount", { message: "Valor inválido" });
          return;
        }

        // Validação de Limite Dispnível
        const selectedCard = cards.find(c => c.id === data.accountId);
        if (selectedCard && selectedCard.availableLimit > 0 && amountInCents > selectedCard.availableLimit) {
          form.setError("amount", { message: "O valor ultrapassa o limite disponível no cartão." });
          return;
        }

        // Fix de timezone: Adicionando meio-dia para evitar deslocamento pro dia anterior no JS (UTC-3)
        const localDate = new Date(`${data.transactionDate}T12:00:00`);

        await createPurchase({
          accountId: data.accountId,
          description: data.description,
          amount: amountInCents,
          transactionDate: localDate,
          categoryId: data.categoryId === "none" ? null : data.categoryId,
          personId: data.personId === "none" ? null : data.personId,
          installmentNumber: data.installmentNumber ? parseInt(data.installmentNumber, 10) : null,
          installmentTotal: data.installmentTotal ? parseInt(data.installmentTotal, 10) : null,
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
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/5 text-foreground backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Adicionar Compra</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Registe um novo gasto no seu cartão.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="accountId" className="text-zinc-300">Cartão de Crédito</Label>
            <Controller
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 focus-visible:ring-[#39FF14]">
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {cards.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="hover:bg-zinc-800 focus:bg-zinc-800 transition-colors">
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
            <Label htmlFor="description" className="text-zinc-300">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Mercado Livre"
              className="bg-zinc-950/50 border-white/10 focus-visible:ring-[#39FF14]"
              {...form.register("description")}
            />
            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-300">Valor</Label>
              <Input
                id="amount"
                placeholder="0,00"
                className="bg-zinc-950/50 border-white/10 focus-visible:ring-[#39FF14]"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && <p className="text-red-500 text-xs">{form.formState.errors.amount.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transactionDate" className="text-zinc-300">Data</Label>
              <Input
                id="transactionDate"
                type="date"
                className="bg-zinc-950/50 border-white/10 focus-visible:ring-[#39FF14]"
                {...form.register("transactionDate")}
              />
              {form.formState.errors.transactionDate && <p className="text-red-500 text-xs">{form.formState.errors.transactionDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-zinc-300">Categoria</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="bg-zinc-950/50 border-white/10 focus-visible:ring-[#39FF14]">
                      <SelectValue placeholder="Categoria (Opcional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="none" className="hover:bg-zinc-800 focus:bg-zinc-800">Sem Categoria</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="hover:bg-zinc-800 focus:bg-zinc-800">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personId" className="text-primary">Atribuir a Gasto P2P</Label>
              <Controller
                control={form.control}
                name="personId"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="bg-[#39FF14]/5 border-[#39FF14]/20 focus-visible:ring-[#39FF14] text-[#39FF14]">
                      <SelectValue placeholder="Eu Mesmo (Pessoal)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="none" className="hover:bg-zinc-800 focus:bg-zinc-800">Eu Mesmo (Pessoal)</SelectItem>
                      {persons.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="hover:bg-zinc-800 focus:bg-zinc-800">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* PARCELAMENTO OCULTO POR PADRÃO, CASO DESEJE PODE ADICIONAR UM CHECKBOX AQUI */}

          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/5 text-zinc-300 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#39FF14] text-zinc-950 hover:bg-[#39FF14]/90 font-semibold"
            >
              {isPending ? "A salvar..." : "Adicionar Compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
