import Link from "next/link";
import { Wallet, CreditCard, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";

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
  const creditCards = accounts.filter((a) => a.type === "CREDIT_CARD");
  const bankAccounts = accounts.filter((a) => a.type !== "CREDIT_CARD");

  const topCreditCards = creditCards.slice(0, 4);
  const topBankAccounts = bankAccounts.slice(0, 4);

  return (
    <>
      <div className="bg-card border border-border/40 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">Contas Bancárias</h3>
        </div>

        {bankAccounts.length === 0 ? (
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
            {topBankAccounts.map((account) => {
              const isPositive = account.balance >= 0;
              return (
                <div key={account.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <Wallet className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{account.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {account.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${isPositive ? "text-primary" : "text-red-500"}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              );
            })}
            
            {bankAccounts.length > 4 && (
              <div className="pt-4 border-t border-border/40 mt-2">
                <Link href="/accounts" className="w-full">
                  <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors group">
                    Ver todas ({bankAccounts.length})
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border border-border/40 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">Cartões de Crédito</h3>
        </div>

        {creditCards.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-zinc-500 mb-4">Você ainda não tem cartões cadastrados.</p>
            <Link
              href="/cards"
              className="inline-flex items-center justify-center w-full h-10 rounded-xl border border-dashed border-border/60 text-muted-foreground text-sm font-medium hover:text-white hover:border-white/20 transition-colors"
            >
              Adicionar Cartão
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {topCreditCards.map((account) => {
              const isPositive = account.balance >= 0;
              return (
                <div key={account.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{account.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        CARTÃO
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${isPositive ? "text-primary" : "text-red-500"}`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              );
            })}

            {creditCards.length > 4 && (
              <div className="pt-4 border-t border-border/40 mt-2">
                <Link href="/cards" className="w-full">
                  <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10 transition-colors group">
                    Ver todos ({creditCards.length})
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
