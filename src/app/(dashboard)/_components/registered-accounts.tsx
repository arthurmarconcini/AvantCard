import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

interface Account {
  id: string;
  name: string;
  type: string;
  creditLimit: unknown;
}

interface RegisteredAccountsProps {
  accounts: Account[];
}

export function RegisteredAccounts({ accounts }: RegisteredAccountsProps) {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6">
      <h3 className="font-semibold text-base mb-5">Contas Registradas</h3>

      {accounts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-zinc-500 mb-4">Você ainda não tem cartões cadastrados.</p>
          <Button variant="outline" className="w-full rounded-xl border-dashed border-border/60 text-muted-foreground">
            Vincular Conta
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/5 text-white flex items-center justify-center font-bold text-xs group-hover:bg-zinc-700 transition-colors">
                  {account.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{account.name}</p>
                  <p className="text-[10px] text-muted-foreground">{account.type.replace("_", " ")}</p>
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
  );
}
