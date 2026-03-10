import React from "react";
import {
  Landmark,
  Wallet,
  Users,
  CreditCard,
  Building2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Total */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
            <h2 className="text-3xl font-bold tracking-tight">R$ 42.850,00</h2>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
              <TrendingUp className="w-3 h-3" />
              2.4%
            </Badge>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
          <Landmark className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
        </div>

        {/* Faturas Abertas */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Faturas Abertas</p>
            <h2 className="text-3xl font-bold tracking-tight">R$ 1.240,50</h2>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1 px-2.5 py-0.5">
              <Clock className="w-3 h-3" />
              3 pendentes
            </Badge>
            <span className="text-xs text-muted-foreground">Itaú & Nubank</span>
          </div>
          <Wallet className="absolute right-6 top-6 w-12 h-12 text-muted-foreground/10 group-hover:text-muted-foreground/20 transition-colors" />
        </div>

        {/* Limite Emprestado (Na Rua) */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Limite Total Emprestado (&quot;Na Rua&quot;)</p>
            <h2 className="text-3xl font-bold tracking-tight">R$ 8.400,00</h2>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-2.5 py-0.5">
              <Users className="w-3 h-3" />
              João/Maria
            </Badge>
            <span className="text-xs text-muted-foreground">P2P Ativo</span>
          </div>
          <Users className="absolute right-6 top-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Charts & Faturas) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Fluxo de Caixa Chart (Mocked Container) */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 h-100 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Fluxo de Caixa Mensal</h3>
                <p className="text-sm text-muted-foreground">Incomes vs Expenses • Last 6 months</p>
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
            {/* Fake Chart bars for visual match */}
            <div className="flex-1 flex items-end justify-between px-4 pb-2 relative">
                {/* Y-axis lines */}
                <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-8 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-px bg-border/30" />
                  ))}
                </div>
                
                <div className="w-full flex justify-between items-end h-full z-10 px-6 pb-8">
                  {/* 6 months data mockup */}
                  {[
                    { r: 40, d: 25, month: 'Jan' },
                    { r: 50, d: 35, month: 'Feb' },
                    { r: 45, d: 45, month: 'Mar' },
                    { r: 70, d: 40, month: 'Apr' },
                    { r: 65, d: 55, month: 'May' },
                    { r: 85, d: 50, month: 'Jun' }
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
          <div className="bg-card border border-border/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Faturas Pendentes</h3>
              <button className="text-sm text-primary font-medium hover:underline">Ver Tudo</button>
            </div>
            <div className="space-y-4">
              
              {/* Item 1 */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/20 hover:border-border/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Nubank Credit Card</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">CONTA ITAÚ • VENCE EM 2 DIAS</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-sm">R$ 840,20</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-red-500 border-red-500/20 bg-red-500/10">CRÍTICO</Badge>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/20 hover:border-border/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Apartment Rent</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">BOLETO • VENCE EM 5 DIAS</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-sm">R$ 3.200,00</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground border-border bg-secondary/30">PENDENTE</Badge>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Widgets) */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Próximos Recebimentos */}
          <div className="bg-card border border-border/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-lg">Próximos Recebimentos</h3>
            </div>

            <div className="space-y-6">
              {/* Person 1 */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-border/50">
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024f" />
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">João Pedro</p>
                      <p className="text-[11px] text-muted-foreground">Parcela 04/10 • Empréstimo MacBook</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">R$ 450,00</span>
                </div>
                <Progress value={40} className="h-1.5 bg-secondary" />
              </div>

              {/* Person 2 */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-border/50">
                      <AvatarImage src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">Maria Silva</p>
                      <p className="text-[11px] text-muted-foreground">Parcela 01/02 • Empréstimo Emergencial</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">R$ 1.200,00</span>
                </div>
                <Progress value={50} className="h-1.5 bg-secondary" />
              </div>
            </div>

            <Button variant="secondary" className="w-full mt-6 font-semibold bg-secondary/50 hover:bg-secondary/80 text-foreground border border-border/40">
              Gerenciar Empréstimos P2P
            </Button>
          </div>

          {/* Contas Vinculadas */}
          <div className="bg-card border border-border/40 rounded-2xl p-6">
            <h3 className="font-semibold text-base mb-5">Contas Vinculadas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    Nu
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Nubank</p>
                    <p className="text-[10px] text-muted-foreground">Atualizado há 5 min</p>
                  </div>
                </div>
                <span className="font-bold text-sm">R$ 12.420,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                    It
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Itaú Unibanco</p>
                    <p className="text-[10px] text-muted-foreground">Atualizado há 1 h</p>
                  </div>
                </div>
                <span className="font-bold text-sm">R$ 30.430,00</span>
              </div>
            </div>
          </div>

          {/* Dica Financeira */}
          <div className="bg-[#122213] border border-primary/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 blur-xl rounded-full" />
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Lightbulb className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Dica Financeira</p>
            </div>
            <p className="text-sm text-primary/90 leading-relaxed font-medium">
              Você gastou 15% a mais em restaurantes este mês. Tente limitar o próximo pedido de empréstimo do João para manter seu fluxo de caixa saudável.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
