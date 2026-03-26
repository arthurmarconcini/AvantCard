import { TrendingUp } from "lucide-react";

interface MonthData {
  month: string;
  revenue: number;
  expenses: number;
}

interface CashFlowChartProps {
  monthlyData: MonthData[];
}

export function CashFlowChart({ monthlyData }: CashFlowChartProps) {
  const isEmpty = monthlyData.length === 0 || monthlyData.every((m) => m.revenue === 0 && m.expenses === 0);

  const maxValue = Math.max(
    ...monthlyData.map((m) => Math.max(m.revenue, m.expenses)),
    1,
  );

  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6 h-100 flex flex-col relative overflow-hidden">
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h3 className="font-semibold text-lg">Fluxo de Caixa Mensal</h3>
          <p className="text-sm text-muted-foreground">
            Receitas vs Despesas • Últimos 6 meses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Receitas
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Despesas
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
          <div className="text-center max-w-sm">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-bold mb-2">Sem Dados Ainda</h4>
            <p className="text-sm text-muted-foreground">
              Registre depósitos, saques e compras para visualizar seu fluxo de caixa aqui.
            </p>
          </div>
        </div>
      )}

      <div className={`flex-1 flex items-end justify-between px-4 pb-2 relative ${isEmpty ? "opacity-20" : ""}`}>
        <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-8 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full h-px bg-border/40" />
          ))}
        </div>

        <div className="w-full flex justify-between items-end h-full z-10 px-6 pb-8">
          {monthlyData.map((data, i) => {
            const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;
            const expenseHeight = maxValue > 0 ? (data.expenses / maxValue) * 100 : 0;

            return (
              <div key={i} className="flex flex-col items-center gap-3 w-12 group">
                <div className="w-full h-48 flex items-end justify-center gap-1.5 relative">
                  <div
                    className="w-3 bg-red-500/60 rounded-t-sm transition-all duration-300 group-hover:bg-red-500/80"
                    style={{ height: `${expenseHeight}%`, minHeight: expenseHeight > 0 ? "4px" : "0" }}
                  />
                  <div
                    className="w-3 bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary/80"
                    style={{ height: `${revenueHeight}%`, minHeight: revenueHeight > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
