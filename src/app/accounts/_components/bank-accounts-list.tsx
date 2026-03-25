"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Building2, MoreVertical, Pencil, Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { EditAccountModal } from "./edit-account-modal";
import { AccountTransactionModal } from "./account-transaction-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BankAccount {
  id: string;
  name: string;
  type: string;
  institutionName: string | null;
  balance: number;
  initialBalance: number;
}

interface BankAccountsListProps {
  accounts: BankAccount[];
}

export function BankAccountsList({ accounts }: BankAccountsListProps) {
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [transactionAccount, setTransactionAccount] = useState<{ id: string; name: string } | null>(null);
  const [transactionMode, setTransactionMode] = useState<"deposit" | "withdraw">("deposit");

  if (accounts.length === 0) return null;

  return (
    <div className="space-y-6 mt-12 relative z-10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Contas de Recebimento</h2>
        <p className="text-sm text-muted-foreground">Saldos de bancos oficiais e carteiras</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = account.type === "WALLET" ? Wallet : Building2;

          return (
            <div
              key={account.id}
              className="relative p-6 rounded-3xl overflow-hidden transition-all duration-300 border backdrop-blur-xl bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60 group flex flex-col justify-between min-h-[180px]"
            >
              <div className="flex justify-between items-start mb-6 relative z-10 gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-zinc-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors truncate" title={account.name}>
                      {account.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono tracking-widest truncate">
                      {account.institutionName || (account.type === "WALLET" ? "Carteira Digital" : "Conta Bancária")}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-white/10">
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer focus:bg-white/5"
                      onClick={() => { setTransactionAccount({ id: account.id, name: account.name }); setTransactionMode("deposit"); }}
                    >
                      <ArrowDownCircle className="h-4 w-4 text-emerald-400" /> Depositar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer focus:bg-white/5"
                      onClick={() => { setTransactionAccount({ id: account.id, name: account.name }); setTransactionMode("withdraw"); }}
                    >
                      <ArrowUpCircle className="h-4 w-4 text-amber-400" /> Sacar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer focus:bg-white/5"
                      onClick={() => setEditingAccount(account)}
                    >
                      <Pencil className="h-4 w-4" /> Editar Conta
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                      onClick={() => setDeletingAccountId(account.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Remover Conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="pt-4 relative z-10">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Saldo Disponível
                </span>
                <div className="text-3xl font-bold tracking-tight text-white mt-1 whitespace-nowrap">
                  {formatCurrency(account.balance)}
                </div>
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
          accountName={accounts.find(a => a.id === deletingAccountId)?.name || "Conta"}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          account={{
            id: editingAccount.id,
            name: editingAccount.name,
            type: editingAccount.type,
            institutionName: editingAccount.institutionName,
            last4: null,
            initialBalance: editingAccount.initialBalance,
          }}
        />
      )}

      {transactionAccount && (
        <AccountTransactionModal
          open={!!transactionAccount}
          onOpenChange={(open) => !open && setTransactionAccount(null)}
          account={transactionAccount}
          initialMode={transactionMode}
        />
      )}
    </div>
  );
}
