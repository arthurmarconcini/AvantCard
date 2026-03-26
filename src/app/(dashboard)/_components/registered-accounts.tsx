import Link from "next/link";
import { Wallet, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface AccountDisplay {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface RegisteredAccountsProps {
  accounts: AccountDisplay[];
}

export function RegisteredAccounts({ accounts }: RegisteredAccountsProps) {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-base">Contas Registradas</h3>
        {accounts.length > 0 && (
          <Link href="/accounts" className="text-xs text-primary font-medium hover:underline transition-colors">
            Ver Todas
          </Link>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500 mb-4">Você ainda não tem contas cadastradas.</p>
          <Link
            href="/accounts"
            className="inline-flex items-center justify-center w-full h-10 rounded-xl border border-dashed border-border/60 text-muted-foreground text-sm font-medium hover:text-white hover:border-white/20 transition-colors"
          >
            Vincular Conta
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const isCreditCard = account.type === "CREDIT_CARD";
            const Icon = isCreditCard ? CreditCard : Wallet;
            const isPositive = account.balance >= 0;

            return (
              <div key={account.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                    <Icon className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{account.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {isCreditCard ? "CARTÃO" : account.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${isPositive ? "text-primary" : "text-red-500"}`}>
                  {formatCurrency(account.balance)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
