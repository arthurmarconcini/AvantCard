"use client";

import { useState } from "react";
import { User, Shield, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUserProfile, updateUserPassword } from "@/actions/user";

interface ProfileClientPageProps {
  user: {
     name: string;
     email: string;
     memberSince: string;
     totalAccounts: number;
  };
}

export function ProfileClientPage({ user }: ProfileClientPageProps) {
  // Estado: Dados Pessoais
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Estado: Segurança / Senha
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await updateUserProfile({ name, email });
      if (res.success) {
        toast.success("Perfil atualizado com sucesso!", {
          description: "No seu próximo login as alterações globais estarão aplicadas.",
          className: "bg-zinc-950 border-primary/20",
          descriptionClassName: "text-zinc-400"
        });
      }
    } catch (err) {
       toast.error(err instanceof Error ? err.message : "Erro desconhecido ao atualizar dados.", {
         className: "bg-zinc-950 border-red-500/20"
       });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirmPass) {
       toast.error("A nova senha e a confirmação não coincidem.");
       return;
    }
    
    setIsSavingPassword(true);

    try {
      const res = await updateUserPassword({ currentPass, newPass });
      if (res.success) {
        toast.success("Senha alterada com segurança!", {
          icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          className: "bg-zinc-950 border-primary/20",
        });
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      }
    } catch (err) {
       toast.error(err instanceof Error ? err.message : "Falha ao atualizar senha.", {
         icon: <AlertCircle className="w-5 h-5 text-red-500" />,
         className: "bg-zinc-950 border-red-500/20"
       });
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Meu Perfil
          </h1>
          <p className="text-zinc-400 mt-2 font-medium">
            Gerencie suas informações pessoais e de segurança. Mantenha seus dados sempre atualizados.
          </p>
        </div>

        {/* Estatísticas Topbar */}
        <div className="flex gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 shadow-2xl backdrop-blur-md self-start shrink-0">
          <div className="flex flex-col items-center px-4 border-r border-white/10">
             <span className="text-lg font-bold text-primary">{user.totalAccounts}</span>
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Contas</span>
          </div>
          <div className="flex flex-col items-center px-4">
             <span className="text-lg font-bold text-zinc-200">
               {new Date(user.memberSince).getFullYear()}
             </span>
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Membro Desde</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
       {/* Coluna 1: Informações Pessoais */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-3xl p-6 md:p-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
             <h2 className="text-xl font-bold text-white">Informações Pessoais</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Nome Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail principal"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary/50 transition-all rounded-xl"
                required
              />
            </div>

            <div className="pt-4 border-t border-white/5 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-xs text-zinc-500 max-w-[200px]">
                  Ao atualizar nome e e-mail, as alterações completas só refletirão no seu próximo acesso.
               </p>
               <Button
                  type="submit"
                  disabled={isSavingProfile || (name === user.name && email === user.email)}
                  className="h-12 bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] w-full md:w-auto"
               >
                 <Save className="w-4 h-4 mr-2" />
                 {isSavingProfile ? "Salvando..." : "Salvar Dados"}
               </Button>
            </div>
          </form>
        </div>


        {/* Coluna 2: Segurança */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-3xl p-6 md:p-8 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Shield className="w-5 h-5 text-cyan-500" />
            </div>
             <h2 className="text-xl font-bold text-white">Segurança</h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Senha Atual</Label>
              <Input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Sua senha atual"
                className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500 focus-visible:border-cyan-500/50 transition-all rounded-xl"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2 md:col-span-1">
                 <Label className="text-zinc-300 font-medium">Nova Senha</Label>
                 <Input
                   type="password"
                   value={newPass}
                   onChange={(e) => setNewPass(e.target.value)}
                   placeholder="Mín. 8 caracteres"
                   className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500 focus-visible:border-cyan-500/50 transition-all rounded-xl"
                   required
                 />
               </div>
               
               <div className="space-y-2 col-span-2 md:col-span-1">
                 <Label className="text-zinc-300 font-medium">Confirmar Senha</Label>
                 <Input
                   type="password"
                   value={confirmPass}
                   onChange={(e) => setConfirmPass(e.target.value)}
                   placeholder="Confirme a nova"
                   className="h-12 bg-black/20 border-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500 focus-visible:border-cyan-500/50 transition-all rounded-xl"
                   required
                 />
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 mt-6 flex justify-end">
               <Button
                  type="submit"
                  disabled={isSavingPassword || !currentPass || !newPass || !confirmPass}
                  className="h-12 bg-cyan-500 text-zinc-950 hover:bg-cyan-400 rounded-xl px-8 font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] w-full md:w-auto"
               >
                 <Shield className="w-4 h-4 mr-2" />
                 {isSavingPassword ? "Verificando..." : "Redefinir Senha"}
               </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
