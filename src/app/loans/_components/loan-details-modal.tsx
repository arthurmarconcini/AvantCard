"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { payInstallment, deleteLoan, revertInstallment } from "@/actions/loans";
import { Check, Clock, AlertCircle, Trash2, Undo2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface LoanSchedule {
  id: string;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  status: "PENDING" | "PAID" | "OVERDUE";
}

interface Loan {
  id: string;
  person: { name: string };
  principalAmount: number;
  schedules: LoanSchedule[];
  status: "OPEN" | "CLOSED" | "IN_DEFAULT";
}

interface LoanDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan | null;
  accounts: { id: string; name: string }[];
}

export function LoanDetailsModal({ open, onOpenChange, loan, accounts }: LoanDetailsModalProps) {
  const [receivingAccountId, setReceivingAccountId] = useState<string>("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!loan) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLoan(loan.id);
      toast.success("Empréstimo excluído", {
        description: "O histórico financeiro foi revertido com sucesso.",
        className: "bg-zinc-900 border-zinc-800 text-zinc-100",
      });
      onOpenChange(false);
    } catch (e) {
      const err = e as Error;
      toast.error("Erro", {
        description: err.message || "Erro ao excluir o empréstimo.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRevert = async (scheduleId: string) => {
    try {
      setRevertingId(scheduleId);
      await revertInstallment(scheduleId);
      toast.success("Pagamento Estornado", {
        description: "A parcela voltou a ficar pendente e o valor foi debitado da conta.",
        className: "bg-zinc-900 border-zinc-800 text-zinc-100",
      });
    } catch (e) {
      const err = e as Error;
      toast.error("Erro", {
        description: err.message || "Erro ao estornar o pagamento.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setRevertingId(null);
    }
  };

  const handlePay = async (scheduleId: string) => {
    if (!receivingAccountId) {
      toast.error("Atenção", {
        description: "Selecione a conta que recebeu o dinheiro antes de confirmar o pagamento.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
      return;
    }

    try {
      setPayingId(scheduleId);
      const isLastInstallment = loan.schedules.filter(s => s.status === 'PENDING').length === 1;
      await payInstallment(scheduleId, receivingAccountId);
      
      if (isLastInstallment) {
        toast.success("🎉 Empréstimo Quitado!", {
          description: "O valor final foi recebido e o contrato foi fechado com sucesso.",
          className: "bg-emerald-950 border-emerald-900 text-emerald-200",
        });
        onOpenChange(false);
      } else {
        toast.success("Parcela Recebida", {
          description: "O valor foi creditado na conta selecionada.",
          className: "bg-zinc-900 border-zinc-800 text-zinc-100",
        });
      }
    } catch (e) {
      const err = e as Error;
      toast.error("Erro", {
        description: err.message || "Erro ao registrar o pagamento.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800/50 max-h-[90vh] overflow-y-auto w-11/12 max-w-lg">
        <DialogHeader>
          <div className="flex flex-col items-start pr-8">
            <DialogTitle className="text-xl font-bold text-white flex items-center flex-wrap gap-3">
              Contrato: {loan.person.name}
              <Badge variant="secondary" className={`bg-white/5 border-0 ${loan.status === 'CLOSED' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {loan.status === 'CLOSED' ? 'Quitado' : 'Em Aberto'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Principal Emprestado: {formatCurrency(loan.principalAmount)}
            </DialogDescription>
          </div>
        </DialogHeader>

        {loan.status !== 'CLOSED' && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mt-4 space-y-3">
            <p className="text-sm font-medium text-blue-400">Registrar Recebimento</p>
            <Select value={receivingAccountId} onValueChange={setReceivingAccountId}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Onde o dinheiro entrou?" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-zinc-300">Cronograma de Pagamento</h4>
          <div className="space-y-3">
            {loan.schedules.map((schedule, i) => {
              const overdue = schedule.status === 'PENDING' && new Date(schedule.dueDate) < new Date();
              return (
                <div key={schedule.id} className="flex justify-between items-center p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                 <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${schedule.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : overdue ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                     {schedule.status === 'PAID' ? <Check className="w-4 h-4" /> : overdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-white">{i + 1}ª Parcela: {formatCurrency(schedule.totalDue)}</p>
                     <p className="text-xs text-zinc-500">
                       Vencimento: {new Date(schedule.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                     </p>
                   </div>
                 </div>
                 
                 {schedule.status === 'PENDING' && (
                   <Button
                     size="sm"
                     variant="outline"
                     className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-zinc-950 font-semibold"
                     onClick={() => handlePay(schedule.id)}
                     disabled={payingId === schedule.id || revertingId === schedule.id}
                   >
                     {payingId === schedule.id ? "Aguarde..." : "Pagar"}
                   </Button>
                 )}
                 {schedule.status === 'PAID' && (
                   <Button
                     size="sm"
                     variant="ghost"
                     className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                     onClick={() => handleRevert(schedule.id)}
                     disabled={revertingId === schedule.id}
                     title="Estornar pagamento"
                   >
                     {revertingId === schedule.id ? <Clock className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                   </Button>
                 )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm font-medium text-zinc-500">
            Ações de Contrato
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-red-900/50 bg-red-500/5 hover:bg-red-500/10 hover:text-red-400 text-red-500 font-semibold w-full sm:w-auto transition-colors" 
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Empréstimo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-zinc-800/50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Excluir empréstimo?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Ao confirmar, todos os pagamentos e o valor original de saída serão completamente revertidos nas suas contas e o empréstimo sumirá do sistema permanentemente. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-zinc-800 text-white hover:bg-zinc-900 hover:text-white">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">Sim, excluir histórico</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
