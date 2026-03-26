"use client";

import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Handshake,
  ArrowLeftRight,
  Filter,
  History,
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
  transactions: HistoryTransaction[];
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

export function AccountHistory({ transactions, accounts }: AccountHistoryProps) {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = transactions.filter((t) => {
    if (selectedAccount !== "all" && t.accountId !== selectedAccount) return false;
    if (selectedType !== "all" && t.type !== selectedType) return false;
    if (dateFrom && new Date(t.transactionDate) < new Date(dateFrom + "T00:00:00")) return false;
    if (dateTo && new Date(t.transactionDate) > new Date(dateTo + "T23:59:59")) return false;
    return true;
  });

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
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
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
            <Select value={selectedType} onValueChange={setSelectedType}>
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
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 bg-black/20 border-white/5 text-white text-xs rounded-lg w-[140px] scheme-dark"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-zinc-500 font-medium">Até</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 bg-black/20 border-white/5 text-white text-xs rounded-lg w-[140px] scheme-dark"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl text-center">
          <p className="text-zinc-500 text-sm">Nenhuma movimentação encontrada para os filtros aplicados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
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
        </div>
      )}
    </div>
  );
}
