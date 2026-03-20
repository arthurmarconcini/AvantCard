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

  const [accounts, openLoans, creditUsedByAccount, creditCards] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
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

  const cardInvoices = computeCurrentInvoices(creditCards);

  const totalInvoicesAmount = cardInvoices.reduce(
    (acc, inv) => acc + inv.totalAmount,
    0,
  );

  const totalLoanedAmount = openLoans.reduce(
    (acc, curr) => acc + Number(curr.principalAmount),
    0,
  );

  const isChartEmpty =
    cardInvoices.length === 0 && totalLoanedAmount === 0 && accounts.length === 0;

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
        cashAndBankBalance={0}
        totalOpenBillsAmount={totalInvoicesAmount}
        totalLoanedAmount={totalLoanedAmount}
        creditAccountsCount={creditAccounts.length}
        cashAccountsCount={cashAccounts.length}
        openBillsCount={cardInvoices.length}
        openLoansCount={openLoans.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <CashFlowChart isEmpty={isChartEmpty} />
          <PendingBillsList invoices={cardInvoices} />
        </div>

        <div className="xl:col-span-1 space-y-8">
          <UpcomingPayments loans={openLoans} />
          <RegisteredAccounts accounts={accounts} />
          {accounts.length > 0 && <FinancialTip />}
        </div>
      </div>
    </div>
  );
}
