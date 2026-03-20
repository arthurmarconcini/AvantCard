import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddAccountModal } from "@/components/add-account-modal";
import { AccountsSummary } from "./_components/accounts-summary";
import { CreditCardsList } from "./_components/credit-cards-list";
import { BankAccountsList } from "./_components/bank-accounts-list";
import { Wallet } from "lucide-react";

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

  const creditCards = accounts.filter((a) => a.type === "CREDIT_CARD");
  const bankAccounts = accounts.filter((a) => a.type === "BANK_ACCOUNT" || a.type === "WALLET");

  const totalCreditLimit = creditCards.reduce((acc, card) => acc + Number(card.creditLimit || 0), 0);
  
  const mappedCreditCards = creditCards.map(card => {
    const limit = Number(card.creditLimit || 0);
    const spent = card.transactions.reduce((acc, t) => acc + (t.direction === "DEBIT" ? Number(t.amount) : -Number(t.amount)), 0);
    const availableLimit = Math.max(0, limit - spent);
    
    return {
      id: card.id,
      name: card.name,
      institutionName: card.institutionName,
      last4: card.last4,
      dueDay: card.dueDay,
      billingDay: card.billingDay,
      creditLimit: limit,
      spent,
      availableLimit
    };
  });

  const totalCreditUsed = mappedCreditCards.reduce((acc, card) => acc + card.spent, 0);

  const mappedBankAccounts = bankAccounts.map(account => {
    const balance = account.transactions.reduce((acc, t) => acc + (t.direction === "CREDIT" ? Number(t.amount) : -Number(t.amount)), 0);
    
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      institutionName: account.institutionName,
      balance
    };
  });

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

      <AccountsSummary 
        totalCreditLimit={totalCreditLimit}
        totalCreditUsed={totalCreditUsed}
        creditCardsCount={creditCards.length}
        bankAccountsCount={bankAccounts.length}
      />

      {accounts.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10 mt-8">
           <Wallet className="h-12 w-12 text-zinc-600 mb-4" />
           <h3 className="text-lg font-bold text-white mb-2">Sua carteira está vazia</h3>
           <p className="text-sm text-zinc-400 max-w-sm text-center">Nenhuma conta ou cartão encontrado. Comece a se organizar adicionando a sua primeira conta.</p>
        </div>
      ) : (
        <>
          <CreditCardsList cards={mappedCreditCards} />
          <BankAccountsList accounts={mappedBankAccounts} />
        </>
      )}
    </div>
  );
}
