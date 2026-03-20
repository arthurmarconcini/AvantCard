import { CreditCard, Building2, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface AccountsSummaryProps {
  totalCreditLimit: number;
  totalCreditUsed: number;
  creditCardsCount: number;
  bankAccountsCount: number;
}

export function AccountsSummary({
  totalCreditLimit,
  totalCreditUsed,
  creditCardsCount,
  bankAccountsCount,
}: AccountsSummaryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
      <div className="bg-card border border-border/40 hover:border-border/60 transition-colors rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Total (Crédito)</p>
          <h2 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">
            {formatCurrency(totalCreditLimit)}
          </h2>
        </div>
        <CreditCard className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-colors rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Utilizado</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(totalCreditUsed)}
          </h2>
        </div>
        <TrendingDown className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-colors rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Cartões Cadastrados</p>
          <h2 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">
            {creditCardsCount}
          </h2>
        </div>
        <CreditCard className="absolute right-6 top-6 w-12 h-12 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-colors rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Contas de Recebimento</p>
          <h2 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">
            {bankAccountsCount}
          </h2>
        </div>
        <Building2 className="absolute right-6 top-6 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />
      </div>
    </div>
  );
}
