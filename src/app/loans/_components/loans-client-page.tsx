"use client";

import { useState } from "react";
import { Plus, Search, HelpCircle, Layers, CheckCircle2, AlertCircle, CalendarDays, Coins, ArrowRight, MoreVertical, Archive, ArchiveRestore } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { CreateLoanModal } from "./create-loan-modal";
import { LoanDetailsModal } from "./loan-details-modal";
import { useSearchParams } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { toggleArchiveLoan } from "@/actions/loans";

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
  isArchived: boolean;
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
  const [filterTab, setFilterTab] = useState<"ALL" | "OPEN" | "CLOSED" | "ARCHIVED">("OPEN");
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!preSelectedPersonId);
  const [loanIdToView, setLoanIdToView] = useState<string | null>(null);

  const loanToView = initialLoans.find(l => l.id === loanIdToView) || null;

  async function handleToggleArchive(e: React.MouseEvent, loanId: string) {
    e.stopPropagation();
    try {
      const res = await toggleArchiveLoan(loanId);
      toast.success(res.isArchived ? "Empréstimo arquivado." : "Empréstimo desarquivado.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao atualizar empréstimo.";
      toast.error(message);
    }
  }

  const filteredLoans = initialLoans.filter(l => {
    const matchesName = l.person.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = 
      filterTab === "ALL" ? !l.isArchived :
      filterTab === "OPEN" ? !l.isArchived && l.status !== "CLOSED" :
      filterTab === "CLOSED" ? !l.isArchived && l.status === "CLOSED" :
      filterTab === "ARCHIVED" ? l.isArchived : true;
    return matchesName && matchesTab;
  });

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
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-between">
        <div className="flex bg-zinc-900/60 border border-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar gap-1">
          {(["OPEN", "CLOSED", "ALL", "ARCHIVED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filterTab === tab ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {tab === "OPEN" && "Ativos"}
              {tab === "CLOSED" && "Quitados"}
              {tab === "ALL" && "Todos"}
              {tab === "ARCHIVED" && "Arquivados"}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por pessoa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-white/5 focus-visible:ring-primary/20 text-white placeholder:text-zinc-600 h-10 w-full rounded-xl"
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
            const isOverdue = loan.schedules.some(s => s.status === "OVERDUE" || (s.status === "PENDING" && new Date(s.dueDate) < new Date()));

            return (
              <div 
                key={loan.id} 
                className={`group relative bg-zinc-900/40 border hover:border-white/20 rounded-2xl p-5 backdrop-blur-sm transition-all flex flex-col ${
                  isOverdue && !loan.isArchived ? "border-red-500/40 shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]" : "border-white/5"
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 overflow-hidden" onClick={() => setLoanIdToView(loan.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors cursor-pointer truncate">
                        {loan.person.name}
                      </h3>
                      {isOverdue && !loan.isArchived && <Badge variant="destructive" className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] uppercase font-bold py-0 h-5 shrink-0">Atrasado</Badge>}
                    </div>
                    <Badge variant="secondary" className={`bg-white/5 text-xs font-medium border-0 ${loan.status === 'CLOSED' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {loan.status === 'CLOSED' ? 'Quitado' : 'Aberto'}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-1">
                    <div onClick={() => setLoanIdToView(loan.id)} className="cursor-pointer text-right min-w-[100px]">
                      <p className="text-xs text-zinc-500 mb-0.5">Total a Receber</p>
                      <p className="font-bold text-white leading-tight">{formatCurrency(loan.totalExpected)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white -mr-2 bg-transparent hover:bg-white/5">
                           <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300 w-40">
                        <DropdownMenuItem className="cursor-pointer focus:bg-white/5" onClick={() => setLoanIdToView(loan.id)}>
                          <Layers className="w-4 h-4 mr-2" /> Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer focus:bg-white/5" onClick={(e) => handleToggleArchive(e, loan.id)}>
                          {loan.isArchived ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2 text-amber-500" />}
                          {loan.isArchived ? "Desarquivar" : <span className="text-amber-500">Arquivar</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-1 bg-black/20 rounded-xl p-4 border border-white/5 cursor-pointer" onClick={() => setLoanIdToView(loan.id)}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Progresso</span>
                    <span className="font-semibold text-white">{paidSchedules} de {totalSchedules} parcelas</span>
                  </div>
                  <Progress value={loan.progress} className={`h-2 bg-zinc-800 ${isOverdue && !loan.isArchived ? "[&>div]:bg-red-500" : ""}`} />
                </div>

                <Button 
                  onClick={() => setLoanIdToView(loan.id)}
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
