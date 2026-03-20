import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
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

  const params = await searchParams;

  const [cards, { persons, categories }] = await Promise.all([
    getCardsAndTransactions(),
    getPersonsAndCategories(),
  ]);

  return (
    <CardsClientPage
      cards={cards}
      persons={persons}
      categories={categories}
      initialCardId={params.cardId}
    />
  );
}
