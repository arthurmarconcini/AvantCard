"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CreditCard, Banknote, Loader2 } from "lucide-react";

import { getPersonTransactions } from "@/actions/people";

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  transactionDate: Date;
  type: string;
  direction: string;
  account: { type: string; name: string };
  category: { name: string; color: string | null } | null;
}

interface PersonDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: {
    id: string;
    name: string;
    loanedLimit: number;
    loanedMoney: number;
    loans: {
      id: string;
      principalAmount: number;
      startDate: Date;
      status: string;
      schedules: {
        id: string;
        dueDate: Date;
        totalDue: number;
        status: string;
      }[];
    }[];
  } | null;
}

export function PersonDetailsModal({ open, onOpenChange, person }: PersonDetailsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (person) {
      loadTransactions(person.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id]);

  async function loadTransactions(personId: string, cursor?: string) {
    const isInitial = !cursor;
    if (isInitial) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const result = await getPersonTransactions(personId, cursor);
      setTransactions((prev) => isInitial ? result.items : [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } catch {
      // Silencioso — o usuário verá a lista vazia
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

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
          
          {person.loans && person.loans.some(l => l.status === "OPEN") && (
            <div className="mb-4">
              <h3 className="font-semibold tracking-tight text-white mb-2">Empréstimos Ativos</h3>
              <div className="space-y-2">
                {person.loans.filter(l => l.status === "OPEN").map(loan => {
                  const paid = loan.schedules.filter(s => s.status === "PAID").length;
                  const total = loan.schedules.length;
                  const totalExpected = loan.schedules.reduce((acc, s) => acc + s.totalDue, 0);
                  return (
                    <div key={loan.id} className="bg-zinc-900/50 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-white">Principal: {formatCurrency(loan.principalAmount)}</p>
                        <p className="text-xs text-zinc-500">Total a receber: {formatCurrency(totalExpected)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/10">
                        {paid}/{total} Parcelas
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <h3 className="font-semibold tracking-tight text-white">Transações</h3>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
              <p className="text-sm text-zinc-500">Carregando transações...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 text-sm">
              Nenhuma transação encontrada para esta pessoa.
            </div>
          ) : (
            <>
              {transactions.map(t => (
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
              ))}

              {/* Carregar mais */}
              {nextCursor && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60 text-zinc-400 hover:text-white text-xs transition-all duration-200"
                    disabled={isLoadingMore}
                    onClick={() => loadTransactions(person.id, nextCursor)}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      "Carregar mais"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
