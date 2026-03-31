import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  TrendingDown,
  User,
  Landmark,
  Clock,
  Banknote,
  Hash,
  Wallet,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

interface SummaryCardsProps {
  totalCreditLimit: number;
  availableCreditLimit: number;
  totalUsedCredit: number;
  userUsedCredit: number;
  loanedFromCards: number;
  cashAndBankBalance: number;
  totalOpenBillsAmount: number;
  creditAccountsCount: number;
  cashAccountsCount: number;
  openBillsCount: number;
  openLoansCount: number;
}

export function SummaryCards({
  totalCreditLimit,
  availableCreditLimit,
  totalUsedCredit,
  userUsedCredit,
  loanedFromCards,
  cashAndBankBalance,
  totalOpenBillsAmount,
  creditAccountsCount,
  cashAccountsCount,
  openBillsCount,
  openLoansCount,
}: SummaryCardsProps) {
  const totalAccountsAndCards = creditAccountsCount + cashAccountsCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Limite Total */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite de Cartão de Crédito</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-primary">
            {formatCurrency(totalCreditLimit)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
            <CreditCard className="w-3 h-3" />
            {creditAccountsCount} {creditAccountsCount === 1 ? "cartão" : "cartões"}
          </Badge>
          <span className="text-xs text-muted-foreground">somatório total</span>
        </div>
        <CreditCard className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </Link>

      {/* 2. Limite Disponível */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Disponível</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-primary">
            {formatCurrency(availableCreditLimit)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Liberado
          </Badge>
          <span className="text-xs text-muted-foreground">não utilizado</span>
        </div>
        <CheckCircle2 className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </Link>

      {/* 3. Limite Utilizado (Geral) */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Utilizado (Geral)</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(totalUsedCredit)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 px-2.5 py-0.5">
            <TrendingDown className="w-3 h-3" />
            Uso total
          </Badge>
          <span className="text-xs text-muted-foreground">compras ativas</span>
        </div>
        <TrendingDown className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </Link>

      {/* 4. Limite Utilizado pelo Usuário */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Utilizado pelo Usuário</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-amber-500">
            {formatCurrency(userUsedCredit)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 px-2.5 py-0.5">
            <User className="w-3 h-3" />
            Pessoal
          </Badge>
          <span className="text-xs text-muted-foreground">seus gastos</span>
        </div>
        <User className="absolute right-6 top-6 w-12 h-12 text-amber-500/10 group-hover:text-amber-500/20 transition-colors" />
      </Link>

      {/* 5. Limite Emprestado (Root/P2P) */}
      <Link href="/loans" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Emprestado</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(loanedFromCards)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 px-2.5 py-0.5">
            <Users className="w-3 h-3" />
            {openLoansCount} ativos
          </Badge>
          <span className="text-xs text-muted-foreground">p/ terceiros</span>
        </div>
        <Landmark className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </Link>

      {/* 6. Total Faturas Abertas */}
      <Link href="/cards" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Total Faturas Abertas</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(totalOpenBillsAmount)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          {openBillsCount > 0 ? (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 px-2.5 py-0.5">
              <Clock className="w-3 h-3" />
              {openBillsCount} cartões
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 gap-1 px-2.5 py-0.5">
              Tudo em dia
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">faturas não pagas</span>
        </div>
        <Wallet className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </Link>

      {/* 7. Dinheiro + Saldo em Conta */}
      <Link href="/accounts" className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Dinheiro + Saldo em Conta</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-primary">
            {formatCurrency(cashAndBankBalance)}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
            <Banknote className="w-3 h-3" />
            {cashAccountsCount} contas
          </Badge>
          <span className="text-xs text-muted-foreground">vinculadas</span>
        </div>
        <Banknote className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </Link>

      {/* 8. Sumário de Vínculos */}
      <div className="bg-card border border-border/40 hover:border-border/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all duration-300">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Vínculos Feitos</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-white">
            {totalAccountsAndCards}
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-300 border-zinc-500/20 gap-1 px-2.5 py-0.5">
            <Hash className="w-3 h-3" />
            Cadastros
          </Badge>
          <span className="text-xs text-muted-foreground">contas e cartões</span>
        </div>
        <Hash className="absolute right-6 top-6 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />
      </div>
    </div>
  );
}
