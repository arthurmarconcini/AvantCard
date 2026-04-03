import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPeopleDashboard } from "@/actions/people";
import { PeopleClientPage } from "@/app/people/_components/people-client-page";

interface PeoplePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const data = await getPeopleDashboard(page);

  return (
    <PeopleClientPage
      initialPeople={data.people}
      currentPage={data.page}
      totalPages={data.totalPages}
      totalCount={data.totalCount}
      totalLoanedLimit={data.totalLoanedLimit}
      totalLoanedMoney={data.totalLoanedMoney}
    />
  );
}

