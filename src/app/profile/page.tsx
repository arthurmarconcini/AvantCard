import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClientPage } from "./client-page";

export const metadata = {
  title: "Perfil | ThinkCard",
  description: "Gerencie as configurações do seu perfil de usuário.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Busca dados essenciais do usuário e sumário das contas para uso visual extra
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      createdAt: true,
      accounts: { select: { id: true } },
    },
  });

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 fade-in-up">
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-4xl pt-24">
         <ProfileClientPage
            user={{
               name: user.name,
               email: user.email,
               memberSince: user.createdAt.toISOString(),
               totalAccounts: user.accounts.length,
            }}
         />
       </div>
    </main>
  );
}
