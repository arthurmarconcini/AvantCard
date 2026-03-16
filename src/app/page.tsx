
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Landmark,
  Wallet,
  Users,
  Building2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";

import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Buscar Todas as Entidades Independentes em Paralelo com Promise.all
  const [accounts, openBills, openLoans] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.bill.findMany({
      where: { userId, status: "OPEN" },
      orderBy: { dueDate: "asc" },
      include: { category: true },
      take: 5,
    }),
    prisma.loan.findMany({
      where: { userId, status: "OPEN" },
      include: { person: true, schedules: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" } } },
      take: 5,
    })
  ]);

  // Saldo base mockado + soma de limites de crédito para visualização inicial
  const totalCreditLimit = accounts.reduce(
    (acc, curr) => acc + (curr.creditLimit ? Number(curr.creditLimit) : 0),
    0
  );

  const totalOpenBillsAmount = openBills.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  const totalLoanedAmount = openLoans.reduce(
    (acc, curr) => acc + Number(curr.principalAmount),
    0
  );

  // Formatadores de Moeda e Data
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const getDaysUntilDue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* HEADER DE BOAS-VINDAS */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo de volta, <span className="text-primary">{session.user.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aqui está o resumo financeiro das suas contas e empréstimos.
          </p>
        </div>
      </div>

      {/* CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Total */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Limite Disponível (Contas)</p>
            <h2 className="text-3xl font-bold tracking-tight">
              {accounts.length > 0 ? formatCurrency(totalCreditLimit) : "R$ 0,00"}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
              <TrendingUp className="w-3 h-3" />
              {accounts.length} contas
            </Badge>
            <span className="text-xs text-muted-foreground">cadastradas</span>
          </div>
          <Landmark className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
        </div>

        {/* Faturas Abertas */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Faturas Abertas</p>
            <h2 className="text-3xl font-bold tracking-tight">
              {formatCurrency(totalOpenBillsAmount)}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-6">
            {openBills.length > 0 ? (
               <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1 px-2.5 py-0.5">
                <Clock className="w-3 h-3" />
                {openBills.length} pendentes
              </Badge>
            ) : (
               <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 gap-1 px-2.5 py-0.5">
                 Tudo em dia
               </Badge>
            )}
            <span className="text-xs text-muted-foreground">neste ciclo</span>
          </div>
          <Wallet className="absolute right-6 top-6 w-12 h-12 text-muted-foreground/10 group-hover:text-muted-foreground/20 transition-colors" />
        </div>

        {/* Limite Emprestado (Na Rua) */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Limite Total Emprestado (&quot;Na Rua&quot;)</p>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              {formatCurrency(totalLoanedAmount)}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
              <Users className="w-3 h-3" />
              {openLoans.length} ativos
            </Badge>
            <span className="text-xs text-muted-foreground">P2P</span>
          </div>
          <Users className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Charts & Faturas) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Fluxo de Caixa Chart (Mocked Container) */}
          <div className="bg-card border border-border/40 rounded-3xl p-6 h-100 flex flex-col relative overflow-hidden">
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <h3 className="font-semibold text-lg">Fluxo de Caixa Mensal</h3>
                <p className="text-sm text-muted-foreground">Receitas vs Despesas • Últimos 6 meses (Demonstração)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Receitas
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary-foreground/20" /> Despesas
                </div>
              </div>
            </div>

            {totalOpenBillsAmount === 0 && totalLoanedAmount === 0 && accounts.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                  <div className="text-center max-w-sm">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-bold mb-2">Comece a Mapear suas Finanças</h4>
                    <p className="text-sm text-muted-foreground mb-6">Cadastre suas contas e faturas para visualizar gráficos de previsão precisos aqui.</p>
                    <Button className="bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl font-semibold">Configurar Agora</Button>
                  </div>
               </div>
            ) : null}

            {/* Fake Chart bars for visual match */}
            <div className={`flex-1 flex items-end justify-between px-4 pb-2 relative ${totalOpenBillsAmount === 0 && accounts.length === 0 ? 'opacity-20' : ''}`}>
                {/* Y-axis lines */}
                <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-8 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-px bg-border/40" />
                  ))}
                </div>
                
                <div className="w-full flex justify-between items-end h-full z-10 px-6 pb-8">
                  {/* 6 months data mockup */}
                  {[
                    { r: 40, d: 25, month: 'Out' },
                    { r: 50, d: 35, month: 'Nov' },
                    { r: 45, d: 45, month: 'Dez' },
                    { r: 70, d: 40, month: 'Jan' },
                    { r: 65, d: 55, month: 'Fev' },
                    { r: 85, d: 50, month: 'Mar' }
                  ].map((data, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-12 group">
                        <div className="w-full h-48 flex items-end justify-center gap-1.5 relative">
                          <div className="w-3 bg-secondary-foreground/20 rounded-t-sm transition-all duration-300 group-hover:bg-secondary-foreground/30" style={{ height: `${data.d}%` }} />
                          <div className="w-3 bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary/80" style={{ height: `${data.r}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* Faturas Pendentes List */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Faturas Pendentes</h3>
              {openBills.length > 0 && <button className="text-sm text-primary font-medium hover:underline transition-colors focus-visible:ring-primary focus-visible:outline-none rounded">Ver Tudo</button>}
            </div>
            
            {openBills.length === 0 ? (
               <div className="flex items-center justify-center p-8 rounded-2xl bg-background/30 border border-dashed border-border/50">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Nenhuma fatura em aberto.</p>
                    <Button variant="outline" className="rounded-xl border-dashed border-border/60 text-muted-foreground hover:text-white transition-colors">
                       Adicionar Fatura
                    </Button>
                  </div>
               </div>
            ) : (
                <div className="space-y-4">
                  {openBills.map(bill => {
                    const days = getDaysUntilDue(bill.dueDate);
                    const isCritical = days <= 3;
                    const isOverdue = days < 0;

                    return (
                      <div key={bill.id} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/20 hover:border-border/60 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCritical || isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{bill.payeeName}</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                              {bill.categoryId ? 'CATEGORIZADA' : 'SEM CATEGORIA'} • {isOverdue ? `VENCEU HÁ ${Math.abs(days)} DIAS` : `VENCE EM ${days} DIAS`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-sm">{formatCurrency(Number(bill.amount))}</span>
                          {isOverdue || isCritical ? (
                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-red-500 border-red-500/20 bg-red-500/10">
                               {isOverdue ? "ATRASADA" : "CRÍTICO"}
                             </Badge>
                          ) : (
                             <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground border-border bg-secondary/30">
                               PENDENTE
                             </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
            )}
            
          </div>

        </div>

        {/* RIGHT COLUMN (Widgets) */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Próximos Recebimentos */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-lg">Próximos Recebimentos</h3>
            </div>

            {openLoans.length === 0 ? (
               <div className="text-center py-6">
                 <p className="text-sm text-zinc-500">Nenhum empréstimo &quot;Na Rua&quot; ativo no momento.</p>
               </div>
            ) : (
                <div className="space-y-6">
                  {openLoans.map(loan => {
                      // Simulação de parcerla pela Data/Nome apenas para UX inicial
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
                                  {nextSchedule ? `Vencimento: ${new Date(nextSchedule.dueDate).toLocaleDateString('pt-BR')}` : loan.description || 'Empréstimo P2P'}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-primary">
                               {formatCurrency(Number(nextSchedule?.totalDue || loan.principalAmount))}
                            </span>
                          </div>
                          {/* Progresso Genérico apenas visual por enquanto */}
                          <Progress value={(loan.person.name.length * 10) % 60 + 20} className="h-1.5 bg-secondary" />
                        </div>
                      )
                  })}
                </div>
            )}

            <Button variant="secondary" className="w-full mt-6 font-semibold bg-secondary/40 hover:bg-secondary/60 text-foreground border border-border/40 rounded-xl">
              Gerenciar Empréstimos P2P
            </Button>
          </div>

          {/* Contas Vinculadas */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <h3 className="font-semibold text-base mb-5">Contas Registradas</h3>
            
            {accounts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-500 mb-4">Você ainda não tem cartões cadastrados.</p>
                  <Button variant="outline" className="w-full rounded-xl border-dashed border-border/60 text-muted-foreground ">
                     Vincular Conta
                  </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {accounts.map(account => (
                        <div key={account.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 text-white flex items-center justify-center font-bold text-xs group-hover:bg-zinc-700 transition-colors">
                              {account.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{account.name}</p>
                              <p className="text-[10px] text-muted-foreground">{account.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <span className="font-bold text-sm">
                              {account.creditLimit ? formatCurrency(Number(account.creditLimit)) : "R$ --"}
                          </span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Dica Financeira */}
          {accounts.length > 0 && (
            <div className="bg-[#122213] border border-primary/20 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/40 transition-colors cursor-default">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors" />
              <div className="flex items-center gap-2 mb-3 text-primary">
                <Lightbulb className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Dica Financeira</p>
              </div>
              <p className="text-sm text-primary/90 leading-relaxed font-medium relative z-10">
                Lembrete: Mantenha sempre 30% do seu limite livre para imprevistos. A consistência no registro é a chave da organização!
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
