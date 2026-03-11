import { Plus, Wallet, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Formata valores inteiros (centavos) para Real Brasileiro (BRL)
function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const mockAccounts = [
  {
    id: "1",
    name: "Conta Corrente Principal",
    institution: "Nubank",
    type: "CORRENTE",
    balance: 1250000, // R$ 12.500,00
    isDefault: true,
  },
  {
    id: "2",
    name: "Reserva de Emergência",
    institution: "Itaú",
    type: "POUPANCA",
    balance: 5000000, // R$ 50.000,00
    isDefault: false,
  },
  {
    id: "3",
    name: "Cartão de Crédito",
    institution: "C6 Bank",
    type: "CREDITO",
    balance: -145050, // - R$ 1.450,50
    isDefault: false,
  },
];

export default function AccountsPage() {
  const totalBalance = mockAccounts.reduce((acc, account) => acc + account.balance, 0);

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
        <Button className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold h-11 rounded-xl px-6 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-5 w-5" /> Nova Conta
        </Button>
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border/40 rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex flex-row items-center justify-between pb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Saldo Total Consolidado</h3>
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
                 {mockAccounts.length} ativas
               </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
        {mockAccounts.map((account) => (
          <div key={account.id} className="bg-zinc-900/50 backdrop-blur-md border border-white/5 hover:border-primary/30 hover:bg-zinc-900/80 rounded-3xl p-6 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 ${account.type === 'CREDITO' ? 'bg-blue-500/10 text-[#00FFFF]' : 'bg-zinc-800 text-zinc-300'}`}>
                    {account.type === "CREDITO" ? (
                      <CreditCard className="h-6 w-6" />
                    ) : (
                      <Building2 className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors">{account.name}</h3>
                    <p className="text-xs text-muted-foreground">{account.institution}</p>
                  </div>
                </div>
                {account.isDefault && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                    Principal
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 mb-6">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {account.type === 'CREDITO' ? 'Fatura/Limite' : 'Saldo Disponível'}
                </span>
                <div
                  className={`text-3xl font-bold tracking-tight ${
                    account.balance < 0 ? "text-red-400" : "text-white"
                  }`}
                >
                  {formatCurrency(account.balance)}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
               <span className="text-xs text-zinc-500 font-medium">{account.type.replace('_', ' ')}</span>
               <button className="text-sm font-semibold text-[#00FFFF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-white">
                  Detalhes
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
