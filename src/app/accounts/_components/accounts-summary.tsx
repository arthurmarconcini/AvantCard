import { Wallet, Landmark, Hash, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface AccountsSummaryProps {
  totalBalance: number;
  loanedBalance: number;
  accountsCount: number;
  netWorth: number;
}

export function AccountsSummary({
  totalBalance,
  loanedBalance,
  accountsCount,
  netWorth,
}: AccountsSummaryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Saldo Total</p>
          <h2 className="text-3xl font-bold text-primary tracking-tight whitespace-nowrap">
            {formatCurrency(totalBalance)}
          </h2>
        </div>
        <Wallet className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Saldo Emprestado</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(loanedBalance)}
          </h2>
        </div>
        <Landmark className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Contas Cadastradas</p>
          <h2 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">
            {accountsCount}
          </h2>
        </div>
        <Hash className="absolute right-6 top-6 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Patrimônio Líquido</p>
          <h2 className={`text-3xl font-bold tracking-tight whitespace-nowrap ${netWorth >= 0 ? "text-primary" : "text-red-500"}`}>
            {formatCurrency(netWorth)}
          </h2>
        </div>
        <TrendingUp className="absolute right-6 top-6 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />
      </div>
    </div>
  );
}
