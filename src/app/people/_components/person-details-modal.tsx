"use client";

import { useState, useMemo } from "react";
import { format, subDays, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CreditCard, Banknote } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  transactionDate: Date;
  type: string;
  direction: string;
  account: {
    type: string;
    name: string;
  };
  category: {
    name: string;
    color: string | null;
  } | null;
}

interface PersonDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: {
    id: string;
    name: string;
    loanedLimit: number;
    loanedMoney: number;
    transactions: Transaction[];
  } | null;
}

export function PersonDetailsModal({ open, onOpenChange, person }: PersonDetailsModalProps) {
  const [filterPeriod, setFilterPeriod] = useState<"7" | "30" | "All">("30");

  const filteredTransactions = useMemo(() => {
    if (!person) return [];
    
    let filtered = person.transactions;
    const now = new Date();

    if (filterPeriod === "7") {
      const sevenDaysAgo = subDays(now, 7);
      filtered = filtered.filter(t => isAfter(new Date(t.transactionDate), sevenDaysAgo));
    } else if (filterPeriod === "30") {
      const thirtyDaysAgo = subDays(now, 30);
      filtered = filtered.filter(t => isAfter(new Date(t.transactionDate), thirtyDaysAgo));
    }

    return filtered.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [person, filterPeriod]);

  if (!person) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col bg-zinc-950 border-zinc-800/50 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-white/5">
          <DialogTitle className="text-xl font-bold text-white mb-4">
            Detalhes: {person.name}
          </DialogTitle>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col">
              <span className="text-zinc-400 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Limite Emprestado
              </span>
              <span className="text-xl font-bold text-primary mt-1">
                {formatCurrency(person.loanedLimit)}
              </span>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col">
              <span className="text-zinc-400 text-sm flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                Dinheiro Emprestado
              </span>
              <span className="text-xl font-bold text-blue-500 mt-1">
                {formatCurrency(person.loanedMoney)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <h3 className="font-semibold tracking-tight text-white">Transações</h3>
            <Select value={filterPeriod} onValueChange={(val: "7" | "30" | "All") => setFilterPeriod(val)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-zinc-900 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs">
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="All">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 custom-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 text-sm">
              Nenhuma transação encontrada neste período.
            </div>
          ) : (
            filteredTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                    ${t.direction === "DEBIT" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 truncate">{t.description || "Transação"}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 truncate mt-0.5">
                      <span>{format(new Date(t.transactionDate), "dd MMM, HH:mm", { locale: ptBR })}</span>
                      <span>•</span>
                      <span>{t.account.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <span className={`text-sm font-bold flex items-center gap-1 ${t.direction === "DEBIT" ? "text-zinc-200" : "text-emerald-500"}`}>
                    {t.direction === "DEBIT" ? "-" : "+"} {formatCurrency(Math.abs(t.amount))}
                  </span>
                  {t.category && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-800 text-zinc-400 font-normal">
                      {t.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
