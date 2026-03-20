import { Lightbulb } from "lucide-react";

export function FinancialTip() {
  return (
    <div className="bg-[#122213] border border-primary/20 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/40 transition-colors cursor-default">
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors" />
      <div className="flex items-center gap-2 mb-3 text-primary">
        <Lightbulb className="w-4 h-4" />
        <p className="text-xs font-bold uppercase tracking-wider">Dica Financeira</p>
      </div>
      <p className="text-sm text-primary/90 leading-relaxed font-medium relative z-10">
        Lembrete: Mantenha sempre 30% do seu limite livre para imprevistos. A consistência no registro é a chave da organização!
      </p>
    </div>
  );
}
