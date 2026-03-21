import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPeopleDashboard } from "@/actions/people";
import { PeopleClientPage } from "@/app/people/_components/people-client-page";

export default async function PeoplePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const peopleDashboard = await getPeopleDashboard();

  return <PeopleClientPage initialPeople={peopleDashboard} />;
}
