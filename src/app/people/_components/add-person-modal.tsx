"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createPerson, updatePerson } from "@/actions/people";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  relationshipType: z.enum(["FAMILY", "FRIEND", "OTHER"]),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personToEdit?: {
    id: string;
    name: string;
    relationshipType: "FAMILY" | "FRIEND" | "OTHER";
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  };
}

export function AddPersonModal({ open, onOpenChange, personToEdit }: AddPersonModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: personToEdit?.name || "",
      relationshipType: personToEdit?.relationshipType || "OTHER",
      phone: personToEdit?.phone || "",
      email: personToEdit?.email || "",
      notes: personToEdit?.notes || "",
    },
  });

  // Re-sync se personToEdit mudar
  useState(() => {
    if (personToEdit) {
      reset({
        name: personToEdit.name,
        relationshipType: personToEdit.relationshipType,
        phone: personToEdit.phone || "",
        email: personToEdit.email || "",
        notes: personToEdit.notes || "",
      });
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      if (personToEdit) {
        await updatePerson(personToEdit.id, data);
        toast.success("Pessoa atualizada", {
          description: "Os dados foram atualizados com sucesso.",
          className: "bg-zinc-900 border-zinc-800 text-zinc-100",
        });
      } else {
        await createPerson(data);
        toast.success("Pessoa cadastrada", {
          description: "Nova pessoa adicionada com sucesso.",
          className: "bg-zinc-900 border-zinc-800 text-zinc-100",
        });
      }
      onOpenChange(false);
      if (!personToEdit) reset();
    } catch {
      toast.error("Erro", {
        description: "Ocorreu um erro ao salvar os dados.",
        className: "bg-red-950 border-red-900 text-red-200",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v && !personToEdit) reset();
    }}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {personToEdit ? "Editar Pessoa" : "Nova Pessoa"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {personToEdit ? "Altere os dados desta pessoa." : "Cadastre uma nova pessoa para controle de empréstimos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Nome</Label>
            <Input 
              id="name" 
              placeholder="João da Silva" 
              className="bg-zinc-900 border-zinc-800 text-white" 
              {...register("name")} 
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipType" className="text-zinc-300">Relação</Label>
            <Select 
              value={watch("relationshipType")} 
              onValueChange={(val: "FAMILY" | "FRIEND" | "OTHER") => setValue("relationshipType", val)}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Selecione o tipo de relação" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="FAMILY">Família</SelectItem>
                <SelectItem value="FRIEND">Amigo(a)</SelectItem>
                <SelectItem value="OTHER">Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.relationshipType && <p className="text-sm text-red-500">{errors.relationshipType.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Telefone</Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                className="bg-zinc-900 border-zinc-800 text-white" 
                {...register("phone")} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@exemplo.com" 
                className="bg-zinc-900 border-zinc-800 text-white" 
                {...register("email")} 
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-zinc-300">Observações (Opcional)</Label>
            <Input 
              id="notes" 
              placeholder="Informações adicionais..." 
              className="bg-zinc-900 border-zinc-800 text-white" 
              {...register("notes")} 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-zinc-950 font-bold hover:bg-primary/90 mt-4" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
