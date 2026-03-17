import { Wallet, Building2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddAccountModal } from "@/components/add-account-modal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

// Formata valores inteiros (centavos) para Real Brasileiro (BRL)
function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const accounts = await prisma.account.findMany({
    where: { userId },
    include: {
      transactions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalBalance = accounts.reduce(
    (acc, account) => acc + (account.creditLimit ? Number(account.creditLimit) : 0),
    0
  );

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-8 overflow-hidden max-w-7xl mx-auto">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Minhas <span className="text-primary">Contas</span></h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gerencie seus saldos, cartões de crédito e contas bancárias.
          </p>
        </div>
        <AddAccountModal />
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border/40 rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex flex-row items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Limite / Saldo Total</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-white tracking-tight">
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-2 mt-4">
               <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
                 {accounts.length} ativas
               </Badge>
            </div>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
         <div className="relative z-10 flex flex-col items-center justify-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10 mt-8">
            <Wallet className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Sua carteira está vazia</h3>
            <p className="text-sm text-zinc-400 max-w-sm text-center">Nenhuma conta ou cartão encontrado. Comece a se organizar adicionando a sua primeira conta.</p>
         </div>
      ) : (
        <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
          {accounts.map((account) => {
            const limit = account.creditLimit ? Number(account.creditLimit) : 0;
            let spent = 0;
            let balance = 0;

            if (account.type === "CREDIT_CARD") {
              spent = account.transactions.reduce((acc, t) => acc + (t.direction === "DEBIT" ? Number(t.amount) : -Number(t.amount)), 0);
            } else {
              balance = account.transactions.reduce((acc, t) => acc + (t.direction === "CREDIT" ? Number(t.amount) : -Number(t.amount)), 0);
            }

            const availableLimit = Math.max(0, limit - spent);
            const isCreditCard = account.type === "CREDIT_CARD";

            return (
              <div 
                key={account.id} 
                className="relative p-6 rounded-3xl overflow-hidden transition-all duration-300 border backdrop-blur-xl bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60 group flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-8 relative z-10 gap-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCreditCard ? 'bg-primary/10 text-primary' : 'bg-white/5 text-zinc-400'}`}>
                      {isCreditCard ? (
                        <CreditCard className="w-5 h-5" />
                      ) : account.type === "WALLET" ? (
                        <Wallet className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate" title={account.name}>{account.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono tracking-widest truncate">
                        {account.institutionName || account.type.replace('_', ' ')} {account.last4 ? `• ${account.last4}` : ''}
                      </p>
                    </div>
                  </div>
                  {isCreditCard && (
                    <Badge variant="outline" className="shrink-0 border-white/10 text-zinc-400 group-hover:border-primary/30 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      Dia {account.dueDay || "--"}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 relative z-10">
                  {isCreditCard ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Fatura Atual</span>
                        <span className="font-bold">{formatCurrency(spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 text-xs">Limite Disp.</span>
                        <span className="text-zinc-400 text-xs">{formatCurrency(availableLimit)}</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
                         <div 
                           className="h-full rounded-full bg-zinc-600 group-hover:bg-primary transition-all duration-500"
                           style={{ width: `${Math.min(100, limit > 0 ? (spent / limit) * 100 : 0)}%` }}
                         />
                      </div>
                    </>
                  ) : (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Saldo Disponível
                      </span>
                      <div className="text-3xl font-bold tracking-tight text-white mt-1">
                        {formatCurrency(balance)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                  <span className="text-xs text-zinc-500 font-medium">Conta</span>
                  <Link 
                    href={isCreditCard ? "/cards" : "#"} 
                    className="text-sm font-semibold text-[#00FFFF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-white"
                  >
                      Detalhes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
