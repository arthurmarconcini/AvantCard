import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getLoansDashboard } from "@/actions/loans";
import { prisma } from "@/lib/prisma";
import { LoansClientPage } from "./_components/loans-client-page";

export default async function LoansPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [dashboardData, people, accounts] = await Promise.all([
    getLoansDashboard(),
    prisma.person.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.account.findMany({ where: { userId, type: { not: "CREDIT_CARD" } }, orderBy: { name: "asc" } }),
  ]);

  const serializedAccounts = accounts.map(a => ({
    ...a,
    initialBalance: a.initialBalance ? Number(a.initialBalance) : null,
    creditLimit: a.creditLimit ? Number(a.creditLimit) : null,
    currentBalance: a.currentBalance !== null ? Number(a.currentBalance) : null,
  }));

  return (
    <LoansClientPage 
      initialMetrics={dashboardData.metrics}
      initialLoans={dashboardData.loans}
      people={people}
      accounts={serializedAccounts}
    />
  );
}
