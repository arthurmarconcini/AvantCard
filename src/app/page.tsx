import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/dashboard-queries";

import { SummaryCards } from "./(dashboard)/_components/summary-cards";
import { CashFlowChart } from "./(dashboard)/_components/cash-flow-chart";
import { PendingBillsList } from "./(dashboard)/_components/pending-bills-list";
import { UpcomingPayments } from "./(dashboard)/_components/upcoming-payments";
import { RegisteredAccounts } from "./(dashboard)/_components/registered-accounts";
import { FinancialTip } from "./(dashboard)/_components/financial-tip";

export const revalidate = 0; // Previne cache estático em páginas transacionais
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const metrics = await getDashboardMetrics(userId);

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
        totalCreditLimit={metrics.totalCreditLimit}
        availableCreditLimit={metrics.availableCreditLimit}
        totalUsedCredit={metrics.totalUsedCredit}
        userUsedCredit={metrics.userUsedCredit}
        loanedFromCards={metrics.loanedFromCards}
        cashAndBankBalance={metrics.cashAndBankBalance}
        totalOpenBillsAmount={metrics.totalInvoicesAmount}
        creditAccountsCount={metrics.creditAccountsCount}
        cashAccountsCount={metrics.cashAccountsCount}
        openBillsCount={metrics.openBillsCount}
        openLoansCount={metrics.openLoansCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <CashFlowChart monthlyData={metrics.monthlyData} />
          <PendingBillsList invoices={metrics.cardInvoices} />
        </div>

        <div className="xl:col-span-1 space-y-8">
          <UpcomingPayments loans={metrics.openLoans} />
          <RegisteredAccounts accounts={metrics.accountsDisplay} />
          {metrics.accounts.length > 0 && <FinancialTip />}
        </div>
      </div>
    </div>
  );
}
