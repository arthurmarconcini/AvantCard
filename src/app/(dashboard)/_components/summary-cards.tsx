import Link from "next/link";
import {
  Landmark,
  Wallet,
  Users,
  TrendingUp,
  Clock,
  Banknote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

interface SummaryCardsProps {
  availableCreditLimit: number;
  cashAndBankBalance: number;
  totalOpenBillsAmount: number;
  totalLoanedAmount: number;
  creditAccountsCount: number;
  cashAccountsCount: number;
  openBillsCount: number;
  openLoansCount: number;
}

export function SummaryCards({
  availableCreditLimit,
  cashAndBankBalance,
  totalOpenBillsAmount,
  totalLoanedAmount,
  creditAccountsCount,
  cashAccountsCount,
  openBillsCount,
  openLoansCount,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Limite Disponível (Crédito) */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground">Limite Disponível (Crédito)</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-primary">
            {creditAccountsCount > 0 ? formatCurrency(availableCreditLimit) : "R$ 0,00"}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
            <TrendingUp className="w-3 h-3" />
            {creditAccountsCount} {creditAccountsCount === 1 ? "cartão" : "cartões"}
          </Badge>
          <span className="text-xs text-muted-foreground">cadastrados</span>
        </div>
        <Landmark className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </Link>

      {/* Dinheiro + Saldo em Conta */}
      <Link href="/accounts" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground">Dinheiro + Saldo em Conta</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-primary">
            {cashAccountsCount > 0 ? formatCurrency(cashAndBankBalance) : "R$ 0,00"}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
            <Banknote className="w-3 h-3" />
            {cashAccountsCount} {cashAccountsCount === 1 ? "conta" : "contas"}
          </Badge>
          <span className="text-xs text-muted-foreground">vinculadas</span>
        </div>
        <Banknote className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </Link>

      {/* Faturas Abertas */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground">Faturas Abertas</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(totalOpenBillsAmount)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          {openBillsCount > 0 ? (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 px-2.5 py-0.5">
              <Clock className="w-3 h-3" />
              {openBillsCount} {openBillsCount === 1 ? "cartão" : "cartões"}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 gap-1 px-2.5 py-0.5">
              Tudo em dia
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">com fatura este mês</span>
        </div>
        <Wallet className="absolute right-6 top-6 w-12 h-12 text-muted-foreground/10 group-hover:text-muted-foreground/20 transition-colors" />
      </Link>

      {/* Limite Total Emprestado */}
      <Link href="/loans" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground">Limite Total Emprestado (&quot;Na Rua&quot;)</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(totalLoanedAmount)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
            <Users className="w-3 h-3" />
            {openLoansCount} ativos
          </Badge>
          <span className="text-xs text-muted-foreground">P2P</span>
        </div>
        <Users className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </Link>
    </div>
  );
}
