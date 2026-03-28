"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { payCardBill } from "@/actions/cards";

interface PayBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  cardName: string;
  suggestedAmount: number; // Em centavos
  defaultDate?: Date;
}

export function PayBillModal({
  open,
  onOpenChange,
  cardId,
  cardName,
  suggestedAmount,
  defaultDate,
}: PayBillModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    if (open) {
      setAmountInput((suggestedAmount / 100).toFixed(2).replace(".", ","));
      
      let initialDateStr = new Date().toISOString().split("T")[0];
      if (defaultDate) {
        const y = defaultDate.getFullYear();
        const m = String(defaultDate.getMonth() + 1).padStart(2, "0");
        const d = String(defaultDate.getDate()).padStart(2, "0");
        initialDateStr = `${y}-${m}-${d}`;
      }
      setDateInput(initialDateStr);
    }
  }, [open, suggestedAmount, defaultDate]);

  // Aplica máscara de moeda BRL (ex: de "1234" para "12,34")
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    if (value.length > 0) {
      if (value.length === 1) {
        value = "0,0" + value;
      } else if (value.length === 2) {
        value = "0," + value;
      } else {
        value = value.replace(/^0+(?!$)/, "");
        if (value.length <= 2) {
          value = value.padStart(3, "0");
        }
        value = value.slice(0, -2) + "," + value.slice(-2);
        // Add thousand separators se desejar, mas para simplicidade no input mantemos "1234,56"
        const parts = value.split(",");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        value = parts.join(",");
      }
    }
    setAmountInput(value);
  };

  const parseAmountToCents = (formatted: string) => {
    const clean = formatted.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || parseAmountToCents(amountInput) <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }
    if (!dateInput) {
      toast.error("Informe a data de pagamento.");
      return;
    }

    setIsLoading(true);
    try {
      const amountInCents = parseAmountToCents(amountInput);
      const [year, month, day] = dateInput.split("-").map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0);

      await payCardBill({
        accountId: cardId,
        amount: amountInCents,
        transactionDate: localDate,
      });

      toast.success("Fatura paga com sucesso!", {
        className: "bg-zinc-950 border-primary/20 text-white",
        descriptionClassName: "text-zinc-400",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao pagar fatura.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/5 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col gap-1">
            <span>Pagar Fatura</span>
            <span className="text-sm font-normal text-zinc-400">Cartão {cardName}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount" className="text-zinc-400">
              Valor a Pagar (R$)
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <Input
                id="payment-amount"
                value={amountInput}
                onChange={handleAmountChange}
                className="pl-9 bg-zinc-900/50 border-white/10 text-white focus-visible:ring-primary/20 transition-all font-mono text-lg"
                placeholder="0,00"
                required
              />
            </div>
            {suggestedAmount > 0 && (
              <p className="text-xs text-zinc-500">
                A fatura atual do cartão está em torno de {(suggestedAmount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date" className="text-zinc-400">
              Data do Pagamento
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Calendar className="h-4 w-4" />
              </div>
              <Input
                id="payment-date"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="pl-9 bg-zinc-900/50 border-white/10 text-white focus-visible:ring-primary/20 transition-all scheme-dark"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold px-6 shadow-[0_0_15px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
