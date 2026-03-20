"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { EditAccountModal } from "./edit-account-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CreditCardAccount {
  id: string;
  name: string;
  institutionName: string | null;
  last4: string | null;
  dueDay: number | null;
  billingDay: number | null;
  creditLimit: number;
  spent: number;
  availableLimit: number;
}

interface CreditCardsListProps {
  cards: CreditCardAccount[];
}

export function CreditCardsList({ cards }: CreditCardsListProps) {
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCardAccount | null>(null);

  if (cards.length === 0) return null;

  return (
    <div className="space-y-6 mt-12 relative z-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Cartões de Crédito</h2>
        <p className="text-sm text-muted-foreground">Gerencie seus limites e faturas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const limitPercentage = Math.min(100, card.creditLimit > 0 ? (card.spent / card.creditLimit) * 100 : 0);
          // Melhor dia de compra = dia seguinte ao fechamento
          const bestPurchaseDay = card.billingDay ? (card.billingDay % 31) + 1 : null;

          return (
            <div
              key={card.id}
              className="relative p-6 rounded-3xl overflow-hidden transition-all duration-300 border backdrop-blur-xl bg-zinc-900/40 border-white/5 hover:bg-zinc-900 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] hover:ring-1 hover:ring-primary/20 group flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/0 group-hover:bg-primary/10 blur-[50px] rounded-full pointer-events-none transition-colors duration-500" />
              <div className="flex justify-between items-start mb-8 relative z-10 gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate" title={card.name}>
                      {card.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono tracking-widest truncate">
                      {card.institutionName || "Cartão de Crédito"} {card.last4 ? `• ${card.last4}` : "• 0000"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-white/10 text-zinc-400 shrink-0">
                    Dia {card.dueDay || "--"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white shrink-0 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-white/10">
                      <DropdownMenuItem asChild className="gap-2 cursor-pointer focus:bg-white/5">
                        <Link href={`/cards?cardId=${card.id}`}>
                          <ExternalLink className="h-4 w-4" /> Ver Detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer focus:bg-white/5"
                        onClick={() => setEditingCard(card)}
                      >
                        <Pencil className="h-4 w-4" /> Editar Cartão
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem 
                        className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                        onClick={() => setDeletingAccountId(card.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Remover Cartão
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Fatura Atual</span>
                  <span className="font-bold text-white">{formatCurrency(card.spent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 text-xs">Limite Disp.</span>
                  <span className="text-zinc-400 text-xs">{formatCurrency(card.availableLimit)}</span>
                </div>
                
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
                   <div 
                     className="h-full rounded-full transition-all duration-500 bg-zinc-600 group-hover:bg-primary"
                     style={{ width: `${limitPercentage}%` }}
                   />
                </div>

                {bestPurchaseDay && (
                  <p className="text-[10px] text-zinc-600 tracking-wide mt-1">
                    Melhor dia de compra: <span className="text-zinc-500 font-medium">dia {bestPurchaseDay}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deletingAccountId && (
        <DeleteAccountDialog
          open={!!deletingAccountId}
          onOpenChange={(open) => !open && setDeletingAccountId(null)}
          accountId={deletingAccountId}
          accountName={cards.find(c => c.id === deletingAccountId)?.name || "Conta"}
        />
      )}

      {editingCard && (
        <EditAccountModal
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
          account={{
            id: editingCard.id,
            name: editingCard.name,
            type: "CREDIT_CARD",
            institutionName: editingCard.institutionName,
            last4: editingCard.last4,
            creditLimit: editingCard.creditLimit,
            billingDay: editingCard.billingDay,
            dueDay: editingCard.dueDay,
          }}
        />
      )}
    </div>
  );
}
