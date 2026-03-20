"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/accounts";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName: string;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  accountId,
  accountName,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleting(true);

    try {
      await deleteAccount(accountId);
      toast.success("Conta removida com sucesso");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover conta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-950 border-red-500/20 max-w-md rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.08)]">
        <AlertDialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 ring-4 ring-red-500/5 animate-pulse">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-extrabold text-white">
            Remover &quot;{accountName}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-zinc-400 leading-relaxed mt-2">
            Esta ação é <strong className="text-red-400">permanente e irreversível</strong>.
          </AlertDialogDescription>
          <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-zinc-500 leading-relaxed text-center">
            Todos os <strong className="text-zinc-300">registros de transações, faturas, limites, pagamentos</strong> e histórico vinculados a esta conta serão apagados permanentemente.
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <AlertDialogCancel className="mt-0 flex-1 bg-zinc-900 border-white/5 hover:bg-zinc-800 text-white rounded-xl h-11 font-medium">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent rounded-xl h-11 font-bold shadow-lg shadow-red-500/20"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sim, Excluir Tudo"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
