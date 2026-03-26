import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCardsAndTransactions, getPersonsAndCategories } from "@/actions/cards";
import { CardsClientPage } from "./client-page";

interface CardsPageProps {
  searchParams: Promise<{ cardId?: string }>;
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const params = await searchParams;

  const [cards, { persons, categories }, creditUsedByAccount, loanedFromCards] = await Promise.all([
    getCardsAndTransactions(),
    getPersonsAndCategories(),
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: {
        userId,
        account: { type: "CREDIT_CARD" },
      },
      _sum: { amount: true },
    }),
    prisma.loan.aggregate({
      where: {
        userId,
        status: "OPEN",
        originAccount: { type: "CREDIT_CARD" },
      },
      _sum: { principalAmount: true },
    }),
  ]);

  const totalCreditLimit = cards.reduce((acc, c) => acc + (c.creditLimit || 0), 0);

  const usedMap = new Map(
    creditUsedByAccount.map((g) => [g.accountId, Number(g._sum.amount ?? 0)]),
  );
  const totalCreditUsed = cards.reduce((acc, c) => acc + (usedMap.get(c.id) ?? 0), 0);

  const loanedAmount = Number(loanedFromCards._sum.principalAmount ?? 0);

  return (
    <CardsClientPage
      cards={cards}
      persons={persons}
      categories={categories}
      initialCardId={params.cardId}
      summaryData={{
        totalCreditLimit,
        totalCreditUsed,
        loanedFromCards: loanedAmount,
        cardsCount: cards.length,
      }}
    />
  );
}
