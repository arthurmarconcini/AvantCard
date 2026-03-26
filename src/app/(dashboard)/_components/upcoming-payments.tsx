import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";

interface LoanSchedule {
  dueDate: Date;
  totalDue: unknown;
}

interface Loan {
  id: string;
  principalAmount: unknown;
  description: string | null;
  person: { name: string };
  schedules: LoanSchedule[];
}

interface UpcomingPaymentsProps {
  loans: Loan[];
}

export function UpcomingPayments({ loans }: UpcomingPaymentsProps) {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <ArrowUpRight className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-lg">Próximos Recebimentos</h3>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-zinc-500">Nenhum empréstimo &quot;Na Rua&quot; ativo no momento.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => {
            const nextSchedule = loan.schedules[0];
            return (
              <div key={loan.id}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-border/50">
                      <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-bold">
                        {loan.person.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{loan.person.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {nextSchedule
                          ? `Vencimento: ${new Date(nextSchedule.dueDate).toLocaleDateString("pt-BR")}`
                          : loan.description || "Empréstimo P2P"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(Number(nextSchedule?.totalDue || loan.principalAmount))}
                  </span>
                </div>
                <Progress value={(loan.person.name.length * 10) % 60 + 20} className="h-1.5 bg-secondary" />
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/loans"
        className="flex items-center justify-center w-full mt-6 h-10 font-semibold bg-secondary/40 hover:bg-secondary/60 text-foreground border border-border/40 rounded-xl text-sm transition-colors"
      >
        Gerenciar Empréstimos P2P
      </Link>
    </div>
  );
}
