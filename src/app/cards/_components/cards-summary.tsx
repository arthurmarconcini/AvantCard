import { CreditCard, TrendingDown, Landmark, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface CardsSummaryProps {
  totalCreditLimit: number;
  totalCreditUsed: number;
  loanedFromCards: number;
  cardsCount: number;
}

export function CardsSummary({
  totalCreditLimit,
  totalCreditUsed,
  loanedFromCards,
  cardsCount,
}: CardsSummaryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Total</p>
          <h2 className="text-3xl font-bold text-primary tracking-tight whitespace-nowrap">
            {formatCurrency(totalCreditLimit)}
          </h2>
        </div>
        <CreditCard className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Utilizado</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(totalCreditUsed)}
          </h2>
        </div>
        <TrendingDown className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Limite Emprestado</p>
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap text-red-500">
            {formatCurrency(loanedFromCards)}
          </h2>
        </div>
        <Landmark className="absolute right-6 top-6 w-12 h-12 text-red-500/10 group-hover:text-red-500/20 transition-colors" />
      </div>

      <div className="bg-card border border-border/40 hover:border-border/60 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-2 pr-16">
          <p className="text-sm font-medium text-muted-foreground truncate">Cartões Cadastrados</p>
          <h2 className="text-3xl font-bold text-white tracking-tight whitespace-nowrap">
            {cardsCount}
          </h2>
        </div>
        <Hash className="absolute right-6 top-6 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors" />
      </div>
    </div>
  );
}
