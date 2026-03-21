"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deletePerson } from "@/actions/people";

interface DeletePersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: { id: string; name: string } | null;
}

export function DeletePersonModal({ open, onOpenChange, person }: DeletePersonModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!person) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePerson(person.id);
      
      toast.success("Pessoa excluída", {
        description: `${person.name} foi removido(a) com sucesso.`,
        className: "bg-zinc-900 border-zinc-800 text-zinc-100",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao excluir", {
        description: "Não foi possível excluir os dados. Tente novamente.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800/50">
        <DialogHeader className="flex flex-col items-center pt-8 pb-4">
          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Excluir {person.name}?
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400 mt-2">
            Esta ação não pode ser desfeita. A pessoa será permanentemente removida do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Excluindo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Sim, excluir pessoa
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white h-12"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
