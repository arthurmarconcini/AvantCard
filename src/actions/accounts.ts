"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  // Verifica se a conta existe e pertence ao usuário autenticado
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Conta não encontrada ou não pertence a este usuário.");
  }

  // Deleta a conta.
  // O Prisma Schema deve ter onDelete: Cascade para transações vinculadas.
  await prisma.account.delete({
    where: {
      id: accountId,
    },
  });

  revalidatePath("/accounts");
  revalidatePath("/"); // Update dashboard metrics too

  return { success: true };
}
