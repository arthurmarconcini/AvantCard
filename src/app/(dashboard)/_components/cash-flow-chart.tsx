import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CashFlowChartProps {
  isEmpty: boolean;
}

export function CashFlowChart({ isEmpty }: CashFlowChartProps) {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6 h-100 flex flex-col relative overflow-hidden">
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h3 className="font-semibold text-lg">Fluxo de Caixa Mensal</h3>
          <p className="text-sm text-muted-foreground">Receitas vs Despesas • Últimos 6 meses (Demonstração)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Receitas
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary-foreground/20" /> Despesas
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
          <div className="text-center max-w-sm">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-bold mb-2">Comece a Mapear suas Finanças</h4>
            <p className="text-sm text-muted-foreground mb-6">Cadastre suas contas e faturas para visualizar gráficos de previsão precisos aqui.</p>
            <Button className="bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl font-semibold">Configurar Agora</Button>
          </div>
        </div>
      )}

      <ChartBars dimmed={isEmpty} />
    </div>
  );
}

const MOCK_MONTHS = [
  { r: 40, d: 25, month: "Out" },
  { r: 50, d: 35, month: "Nov" },
  { r: 45, d: 45, month: "Dez" },
  { r: 70, d: 40, month: "Jan" },
  { r: 65, d: 55, month: "Fev" },
  { r: 85, d: 50, month: "Mar" },
] as const;

function ChartBars({ dimmed }: { dimmed: boolean }) {
  return (
    <div className={`flex-1 flex items-end justify-between px-4 pb-2 relative ${dimmed ? "opacity-20" : ""}`}>
      <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-8 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full h-px bg-border/40" />
        ))}
      </div>

      <div className="w-full flex justify-between items-end h-full z-10 px-6 pb-8">
        {MOCK_MONTHS.map((data, i) => (
          <div key={i} className="flex flex-col items-center gap-3 w-12 group">
            <div className="w-full h-48 flex items-end justify-center gap-1.5 relative">
              <div
                className="w-3 bg-secondary-foreground/20 rounded-t-sm transition-all duration-300 group-hover:bg-secondary-foreground/30"
                style={{ height: `${data.d}%` }}
              />
              <div
                className="w-3 bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary/80"
                style={{ height: `${data.r}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
