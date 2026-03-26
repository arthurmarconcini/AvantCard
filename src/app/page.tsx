import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCurrentInvoices } from "@/lib/billing";

import { SummaryCards } from "./(dashboard)/_components/summary-cards";
import { CashFlowChart } from "./(dashboard)/_components/cash-flow-chart";
import { PendingBillsList } from "./(dashboard)/_components/pending-bills-list";
import { UpcomingPayments } from "./(dashboard)/_components/upcoming-payments";
import { RegisteredAccounts } from "./(dashboard)/_components/registered-accounts";
import { FinancialTip } from "./(dashboard)/_components/financial-tip";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    accounts,
    openLoans,
    creditUsedByAccount,
    creditCards,
    cashTransactionsGrouped,
    monthlyTransactions,
  ] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      include: { transactions: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { userId, status: "OPEN" },
      include: {
        person: true,
        schedules: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" } },
      },
      take: 5,
    }),
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: {
        userId,
        direction: "DEBIT",
        account: { type: "CREDIT_CARD" },
      },
      _sum: { amount: true },
    }),
    prisma.account.findMany({
      where: { userId, type: "CREDIT_CARD" },
      include: {
        transactions: {
          select: {
            amount: true,
            direction: true,
            transactionDate: true,
            postingDate: true,
          },
        },
      },
    }),
    prisma.transaction.groupBy({
      by: ["direction"],
      where: {
        userId,
        account: { type: { in: ["BANK_ACCOUNT", "CASH", "WALLET"] } },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        direction: true,
        transactionDate: true,
      },
    }),
  ]);

  const creditAccounts = accounts.filter((a) => a.type === "CREDIT_CARD");
  const cashAccounts = accounts.filter((a) =>
    a.type === "BANK_ACCOUNT" || a.type === "CASH" || a.type === "WALLET"
  );

  const totalCreditLimit = creditAccounts.reduce(
    (acc, curr) => acc + (curr.creditLimit ? Number(curr.creditLimit) : 0),
    0,
  );

  const usedMap = new Map(
    creditUsedByAccount.map((g) => [g.accountId, Number(g._sum.amount ?? 0)]),
  );

  const totalUsedCredit = creditAccounts.reduce(
    (acc, curr) => acc + (usedMap.get(curr.id) ?? 0),
    0,
  );

  const availableCreditLimit = totalCreditLimit - totalUsedCredit;

  const totalInitialBalance = cashAccounts.reduce(
    (acc, accnt) => acc + (accnt.initialBalance ? Number(accnt.initialBalance) : 0),
    0
  );

  const cashCredits = cashTransactionsGrouped.find(g => g.direction === "CREDIT")?._sum?.amount || 0;
  const cashDebits = cashTransactionsGrouped.find(g => g.direction === "DEBIT")?._sum?.amount || 0;

  const cashAndBankBalance = totalInitialBalance + Number(cashCredits) - Number(cashDebits);

  const cardInvoices = computeCurrentInvoices(creditCards);

  const totalInvoicesAmount = cardInvoices.reduce(
    (acc, inv) => acc + inv.totalAmount,
    0,
  );

  const totalLoanedAmount = openLoans.reduce(
    (acc, curr) => acc + Number(curr.principalAmount),
    0,
  );

  // Gráfico de fluxo de caixa — agrupar transações por mês
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap.set(key, { revenue: 0, expenses: 0 });
  }

  for (const t of monthlyTransactions) {
    const d = new Date(t.transactionDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = monthlyMap.get(key);
    if (entry) {
      if (t.direction === "CREDIT") {
        entry.revenue += Number(t.amount);
      } else {
        entry.expenses += Number(t.amount);
      }
    }
  }

  const monthlyData = Array.from(monthlyMap.entries()).map(([key, data]) => {
    const [, month] = key.split("-").map(Number);
    return {
      month: monthNames[month],
      revenue: data.revenue,
      expenses: data.expenses,
    };
  });

  // Contas registradas — com saldo real
  const accountsDisplay = accounts.map((account) => {
    const txBalance = account.transactions.reduce(
      (acc, t) => acc + (t.direction === "CREDIT" ? Number(t.amount) : -Number(t.amount)),
      0,
    );
    const initial = Number(account.initialBalance || 0);
    const creditLimit = account.creditLimit ? Number(account.creditLimit) : 0;

    const balance = account.type === "CREDIT_CARD"
      ? creditLimit - txBalance
      : initial + txBalance;

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo de volta, <span className="text-primary">{session.user.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aqui está o resumo financeiro das suas contas e empréstimos.
          </p>
        </div>
      </div>

      <SummaryCards
        availableCreditLimit={availableCreditLimit}
        cashAndBankBalance={cashAndBankBalance}
        totalOpenBillsAmount={totalInvoicesAmount}
        totalLoanedAmount={totalLoanedAmount}
        creditAccountsCount={creditAccounts.length}
        cashAccountsCount={cashAccounts.length}
        openBillsCount={cardInvoices.length}
        openLoansCount={openLoans.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <CashFlowChart monthlyData={monthlyData} />
          <PendingBillsList invoices={cardInvoices} />
        </div>

        <div className="xl:col-span-1 space-y-8">
          <UpcomingPayments loans={openLoans} />
          <RegisteredAccounts accounts={accountsDisplay} />
          {accounts.length > 0 && <FinancialTip />}
        </div>
      </div>
    </div>
  );
}
