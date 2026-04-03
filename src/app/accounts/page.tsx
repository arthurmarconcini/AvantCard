import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getAccountHistory } from "@/actions/accounts";
import { AddAccountModal } from "./_components/add-account-modal";
import { AccountsSummary } from "./_components/accounts-summary";
import { BankAccountsList } from "./_components/bank-accounts-list";
import { AccountHistory } from "./_components/account-history";
import { Wallet } from "lucide-react";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [accounts, openLoans, initialHistory] = await Promise.all([
    prisma.account.findMany({
      where: { userId, type: { in: ["BANK_ACCOUNT", "WALLET", "CASH", "OTHER"] } },
      select: {
        id: true,
        name: true,
        type: true,
        institutionName: true,
        initialBalance: true,
        currentBalance: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { userId, status: "OPEN" },
      select: { principalAmount: true },
    }),
    getAccountHistory(),
  ]);

  const mappedBankAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    institutionName: account.institutionName,
    balance: Number(account.currentBalance || 0),
    initialBalance: Number(account.initialBalance || 0),
  }));

  const totalBalance = mappedBankAccounts.reduce((acc, a) => acc + a.balance, 0);
  const loanedBalance = openLoans.reduce((acc, l) => acc + Number(l.principalAmount), 0);
  const netWorth = totalBalance - loanedBalance;


  const accountOptions = accounts.map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-8 overflow-hidden max-w-7xl mx-auto">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Minhas <span className="text-primary">Contas</span></h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gerencie seus saldos, contas bancárias e carteiras.
          </p>
        </div>
        <AddAccountModal />
      </div>

      <AccountsSummary
        totalBalance={totalBalance}
        loanedBalance={loanedBalance}
        accountsCount={accounts.length}
        netWorth={netWorth}
      />

      {accounts.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10 mt-8">
           <Wallet className="h-12 w-12 text-zinc-600 mb-4" />
           <h3 className="text-lg font-bold text-white mb-2">Sua carteira está vazia</h3>
           <p className="text-sm text-zinc-400 max-w-sm text-center">Nenhuma conta encontrada. Comece a se organizar adicionando a sua primeira conta.</p>
        </div>
      ) : (
        <>
          <BankAccountsList accounts={mappedBankAccounts} />
          <AccountHistory
            initialTransactions={initialHistory.items}
            initialNextCursor={initialHistory.nextCursor}
            accounts={accountOptions}
          />
        </>
      )}
    </div>
  );
}
