"use client";

import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Handshake,
  ArrowLeftRight,
  Filter,
  History,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getAccountHistory } from "@/actions/accounts";

interface HistoryTransaction {
  id: string;
  type: string;
  direction: string;
  amount: number;
  description: string | null;
  transactionDate: string;
  accountId: string;
  accountName: string;
}

interface AccountOption {
  id: string;
  name: string;
}

interface AccountHistoryProps {
  initialTransactions: HistoryTransaction[];
  initialNextCursor: string | null;
  accounts: AccountOption[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof ArrowDownCircle; color: string; bg: string }> = {
  DEPOSIT: { label: "Depósito", icon: ArrowDownCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  WITHDRAWAL: { label: "Saque", icon: ArrowUpCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
  LOAN_DISBURSEMENT: { label: "Empréstimo Concedido", icon: Handshake, color: "text-blue-400", bg: "bg-blue-500/10" },
  LOAN_REPAYMENT: { label: "Recebimento de Empréstimo", icon: ArrowLeftRight, color: "text-violet-400", bg: "bg-violet-500/10" },
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

export function AccountHistory({ initialTransactions, initialNextCursor, accounts }: AccountHistoryProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function getCurrentFilters() {
    return {
      accountId: selectedAccount !== "all" ? selectedAccount : undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
  }

  async function applyFilters(newFilters: {
    accountId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    setIsFiltering(true);
    try {
      const result = await getAccountHistory(newFilters);
      setTransactions(result.items);
      setNextCursor(result.nextCursor);
    } catch {
      // Mantém estado atual em caso de erro
    } finally {
      setIsFiltering(false);
    }
  }

  async function handleFilterChange(
    key: "accountId" | "type" | "dateFrom" | "dateTo",
    value: string
  ) {
    const filters = getCurrentFilters();
    if (value === "all" || value === "") {
      delete filters[key];
    } else {
      filters[key] = value;
    }

    if (key === "accountId") setSelectedAccount(value);
    if (key === "type") setSelectedType(value);
    if (key === "dateFrom") setDateFrom(value);
    if (key === "dateTo") setDateTo(value);

    await applyFilters(filters);
  }

  async function loadMore() {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const result = await getAccountHistory(getCurrentFilters(), nextCursor);
      setTransactions((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
    } catch {
      // Silencioso
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6 mt-12 relative z-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Histórico de Movimentações
        </h2>
        <p className="text-sm text-muted-foreground">Depósitos, saques, empréstimos e recebimentos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold uppercase tracking-widest">
          <Filter className="w-3.5 h-3.5" />
          Filtros
        </div>

        <div className="flex flex-wrap gap-3 flex-1">
          <div className="space-y-1 min-w-[160px]">
            <Label className="text-[11px] text-zinc-500 font-medium">Conta</Label>
            <Select value={selectedAccount} onValueChange={(v) => handleFilterChange("accountId", v)}>
              <SelectTrigger className="h-9 bg-black/20 border-white/5 text-white text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                <SelectItem value="all" className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">Todas as contas</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 min-w-[160px]">
            <Label className="text-[11px] text-zinc-500 font-medium">Tipo</Label>
            <Select value={selectedType} onValueChange={(v) => handleFilterChange("type", v)}>
              <SelectTrigger className="h-9 bg-black/20 border-white/5 text-white text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                <SelectItem value="all" className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">Todos os tipos</SelectItem>
                <SelectItem value="DEPOSIT" className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">Depósitos</SelectItem>
                <SelectItem value="WITHDRAWAL" className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">Saques</SelectItem>
                <SelectItem value="LOAN_DISBURSEMENT" className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">Empréstimos Concedidos</SelectItem>
                <SelectItem value="LOAN_REPAYMENT" className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">Recebimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-zinc-500 font-medium">De</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="h-9 bg-black/20 border-white/5 text-white text-xs rounded-lg w-[140px] scheme-dark"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-zinc-500 font-medium">Até</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="h-9 bg-black/20 border-white/5 text-white text-xs rounded-lg w-[140px] scheme-dark"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {isFiltering ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
          <p className="text-sm text-zinc-500">Filtrando...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl text-center">
          <p className="text-zinc-500 text-sm">Nenhuma movimentação encontrada para os filtros aplicados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => {
            const config = TYPE_CONFIG[t.type] || {
              label: t.type,
              icon: ArrowLeftRight,
              color: "text-zinc-400",
              bg: "bg-zinc-500/10",
            };
            const Icon = config.icon;
            const isCredit = t.direction === "CREDIT";

            return (
              <div
                key={t.id}
                className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-950/30 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-sm text-white">
                      {t.description || config.label}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                      <span>{formatDate(t.transactionDate)}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span>{t.accountName}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span className={config.color}>{config.label}</span>
                    </div>
                  </div>
                </div>

                <span className={`font-bold text-sm ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                  {isCredit ? "+" : "−"} {formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}

          {/* Carregar mais */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60 text-zinc-400 hover:text-white text-xs transition-all duration-200"
                disabled={isLoadingMore}
                onClick={loadMore}
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
        </div>
      )}
    </div>
  );
}
