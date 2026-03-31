import { prisma } from "@/lib/prisma";
import { computeCurrentInvoices } from "@/lib/billing";

export async function getDashboardMetrics(userId: string) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    accounts,
    openLoans,
    creditCards,
    monthlyTransactions,
  ] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { userId, status: "OPEN" },
      include: {
        person: true,
        originAccount: { select: { type: true } },
        schedules: { where: { status: "PENDING" }, orderBy: { dueDate: "asc" } },
      },
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

  const totalCreditLimit = creditAccounts.reduce((acc, curr) => acc + Number(curr.creditLimit || 0), 0);
  
  // Utilizando o novo currentBalance do Prisma
  const totalAvailableCredit = creditAccounts.reduce((acc, curr) => {
    const bal = curr.currentBalance !== null ? Number(curr.currentBalance) : Number(curr.creditLimit || 0);
    return acc + bal;
  }, 0);
  const totalUsedCredit = totalCreditLimit - totalAvailableCredit;

  const cashAndBankBalance = cashAccounts.reduce((acc, accnt) => {
    const bal = accnt.currentBalance !== null ? Number(accnt.currentBalance) : Number(accnt.initialBalance || 0);
    return acc + bal;
  }, 0);

  const cardInvoices = computeCurrentInvoices(creditCards);
  const totalInvoicesAmount = cardInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  
  const totalLoanedAmount = openLoans.reduce((acc, curr) => acc + Number(curr.principalAmount), 0);
  const loanedFromCards = openLoans
    .filter((l) => l.originAccount.type === "CREDIT_CARD")
    .reduce((acc, curr) => acc + Number(curr.principalAmount), 0);
  
  const userUsedCredit = totalUsedCredit - loanedFromCards;

  // Gráfico de fluxo de caixa (Revenue vs Expenses)
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
      if (t.direction === "CREDIT") entry.revenue += Number(t.amount);
      else entry.expenses += Number(t.amount);
    }
  }

  const monthlyData = Array.from(monthlyMap.entries()).map(([key, data]) => {
    const [, month] = key.split("-").map(Number);
    return { month: monthNames[month], revenue: data.revenue, expenses: data.expenses };
  });

  const accountsDisplay = accounts.map((account) => {
    const bal = account.currentBalance !== null ? Number(account.currentBalance) : Number(account.initialBalance || 0);
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: bal,
    };
  });

  const safeAccounts = accounts.map((a) => ({
    ...a,
    initialBalance: a.initialBalance ? Number(a.initialBalance) : null,
    creditLimit: a.creditLimit ? Number(a.creditLimit) : null,
    currentBalance: a.currentBalance !== null ? Number(a.currentBalance) : null,
  }));

  const safeLoans = openLoans.map((l) => ({
    ...l,
    principalAmount: Number(l.principalAmount),
    schedules: l.schedules.map((s) => ({
      ...s,
      totalDue: Number(s.totalDue),
    })),
  }));

  return {
    totalCreditLimit,
    availableCreditLimit: totalAvailableCredit,
    totalUsedCredit,
    userUsedCredit,
    loanedFromCards,
    cashAndBankBalance,
    totalInvoicesAmount,
    totalLoanedAmount,
    creditAccountsCount: creditAccounts.length,
    cashAccountsCount: cashAccounts.length,
    openBillsCount: cardInvoices.length,
    openLoansCount: openLoans.length,
    monthlyData,
    cardInvoices,
    openLoans: safeLoans.slice(0, 5),
    accountsDisplay,
    accounts: safeAccounts
  };
}
