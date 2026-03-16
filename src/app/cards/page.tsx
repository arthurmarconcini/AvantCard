import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getCardsAndTransactions, getPersonsAndCategories } from "@/actions/cards";
import { CardsClientPage } from "./client-page";

export default async function CardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Busca os dados paralelamente na Server Action
  const [cards, { persons, categories }] = await Promise.all([
    getCardsAndTransactions(),
    getPersonsAndCategories(),
  ]);

  return (
    <CardsClientPage
      cards={cards}
      persons={persons}
      categories={categories}
    />
  );
}
