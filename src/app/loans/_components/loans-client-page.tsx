"use client";

import { useState } from "react";
import { Plus, Search, HelpCircle, Layers, CheckCircle2, AlertCircle, CalendarDays, Coins, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { CreateLoanModal } from "./create-loan-modal";
import { LoanDetailsModal } from "./loan-details-modal";
import { useSearchParams } from "next/navigation";

// Extracted from actions/loans
interface LoanSchedule {
  id: string;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  transactionId: string | null;
}

interface Loan {
  id: string;
  personId: string;
  startDate: Date;
  status: "OPEN" | "CLOSED" | "IN_DEFAULT";
  principalAmount: number;
  interestRate: number;
  totalExpected: number;
  totalReceived: number;
  progress: number;
  person: { id: string; name: string };
  originAccount: { id: string; name: string; currency: string };
  schedules: LoanSchedule[];
}

interface Metrics {
  totalPrincipal: number;
  totalInterestExpected: number;
  totalReceived: number;
  totalOverdue: number;
}

interface LoansClientPageProps {
  initialMetrics: Metrics;
  initialLoans: Loan[];
  people: { id: string; name: string }[];
  accounts: { id: string; name: string; currency: string }[];
}

export function LoansClientPage({ initialMetrics, initialLoans, people, accounts }: LoansClientPageProps) {
  const searchParams = useSearchParams();
  const preSelectedPersonId = searchParams.get("newLoanPersonId");

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!preSelectedPersonId);
  const [loanIdToView, setLoanIdToView] = useState<string | null>(null);

  const loanToView = initialLoans.find(l => l.id === loanIdToView) || null;

  const filteredLoans = initialLoans.filter(l => 
    l.person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-8 overflow-hidden max-w-7xl mx-auto">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Central de <span className="text-primary">Empréstimos</span></h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg">
            Tenha controle total do dinheiro que você emprestou, receba pagamentos e gerencie parcelas e juros.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold px-6 h-11 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Empréstimo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Total Emprestado</p>
          </div>
          <h2 className="text-2xl font-bold text-white pl-11">{formatCurrency(initialMetrics.totalPrincipal)}</h2>
        </div>
        
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Juros Estimados</p>
          </div>
          <h2 className="text-2xl font-bold text-emerald-400 pl-11">+{formatCurrency(initialMetrics.totalInterestExpected)}</h2>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Já Recebido</p>
          </div>
          <h2 className="text-2xl font-bold text-white pl-11">{formatCurrency(initialMetrics.totalReceived)}</h2>
        </div>

        <div className="bg-zinc-900/40 border border-red-500/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm font-medium text-red-400">Atrasado</p>
          </div>
          <h2 className="text-2xl font-bold text-white pl-11">{formatCurrency(initialMetrics.totalOverdue)}</h2>
        </div>
      </div>

      {/* Control Bar */}
      <div className="relative z-10 flex items-center gap-3 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por pessoa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-white/5 focus-visible:ring-primary/20 text-white placeholder:text-zinc-600 h-10 w-full"
          />
        </div>
      </div>

      {/* Loans Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLoans.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10">
             <HelpCircle className="h-12 w-12 text-zinc-600 mb-4" />
             <h3 className="text-lg font-bold text-white mb-2">Nenhum empréstimo encontrado</h3>
             <p className="text-sm text-zinc-400 max-w-sm text-center">
               Não há resultados para a sua busca ou você ainda não emprestou para ninguém.
             </p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const paidSchedules = loan.schedules.filter(s => s.status === 'PAID').length;
            const totalSchedules = loan.schedules.length;

            return (
              <div 
                key={loan.id} 
                onClick={() => setLoanIdToView(loan.id)}
                className="group relative bg-zinc-900/40 border border-white/5 hover:border-white/20 rounded-2xl p-5 backdrop-blur-sm transition-all flex flex-col cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary transition-colors">{loan.person.name}</h3>
                    <Badge variant="secondary" className={`bg-white/5 text-xs font-medium border-0 ${loan.status === 'CLOSED' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {loan.status === 'CLOSED' ? 'Quitado' : 'Aberto'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-1">Total a Receber</p>
                    <p className="font-bold text-white">{formatCurrency(loan.totalExpected)}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-1 bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Progresso</span>
                    <span className="font-semibold text-white">{paidSchedules} de {totalSchedules} parcelas</span>
                  </div>
                  <Progress value={loan.progress} className="h-2 bg-zinc-800" />
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-0 text-zinc-400 hover:text-white hover:bg-transparent group-hover:text-primary transition-colors"
                >
                  Ver Parcelas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      <CreateLoanModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        people={people}
        accounts={accounts}
        preSelectedPersonId={preSelectedPersonId}
      />

      <LoanDetailsModal
        open={!!loanToView}
        onOpenChange={(isOpen: boolean) => !isOpen && setLoanIdToView(null)}
        loan={loanToView}
        accounts={accounts} // para poder selecionar em qual conta recebeu a parcela
      />
    </div>
  );
}
