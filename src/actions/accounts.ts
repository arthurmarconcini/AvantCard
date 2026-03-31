"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncAccountBalance } from "@/lib/balances";
import { accountSchema } from "@/lib/validators/account";

export async function deleteAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const account = await prisma.account.findUnique({
    where: { id: accountId, userId },
    include: { transactions: { select: { id: true } }, loansOriginated: { select: { id: true } } },
  });

  if (!account) {
    throw new Error("Conta não encontrada ou não pertence a este usuário.");
  }

  // Transações usam onDelete: Restrict, então precisamos removê-las manualmente
  await prisma.$transaction(async (tx) => {
    if (account.transactions.length > 0) {
      await tx.transaction.deleteMany({ where: { accountId } });
    }
    if (account.loansOriginated.length > 0) {
      for (const loan of account.loansOriginated) {
        await tx.loanSchedule.deleteMany({ where: { loanId: loan.id } });
      }
      await tx.loan.deleteMany({ where: { originAccountId: accountId } });
    }
    await tx.account.delete({ where: { id: accountId } });
  });

  revalidatePath("/accounts");
  revalidatePath("/cards");
  revalidatePath("/");

  return { success: true };
}

export async function updateAccount(accountId: string, rawData: unknown) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const account = await prisma.account.findUnique({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new Error("Conta não encontrada ou não pertence a este usuário.");
  }

  const parsed = accountSchema.parse(rawData);

  const isCreditCard = parsed.type === "CREDIT_CARD";

  await prisma.account.update({
    where: { id: accountId },
    data: {
      name: parsed.name,
      type: parsed.type,
      institutionName: parsed.institutionName || null,
      last4: parsed.last4 || null,
      creditLimit: isCreditCard && parsed.creditLimit ? Number(parsed.creditLimit) : null,
      billingDay: isCreditCard ? parsed.billingDay : null,
      dueDay: isCreditCard ? parsed.dueDay : null,
      initialBalance: !isCreditCard && parsed.initialBalance ? Number(parsed.initialBalance) : null,
    },
  });

  await syncAccountBalance(accountId);

  revalidatePath("/accounts");
  revalidatePath("/cards");
  revalidatePath("/");

  return { success: true };
}

export async function depositToAccount(data: {
  accountId: string;
  amount: number;
  description?: string;
  date?: Date;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const account = await prisma.account.findUnique({
    where: { id: data.accountId, userId: session.user.id },
  });

  if (!account) throw new Error("Conta não encontrada.");
  if (account.type === "CREDIT_CARD") throw new Error("Depósitos não se aplicam a cartões de crédito.");

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      accountId: data.accountId,
      type: "DEPOSIT",
      direction: "CREDIT",
      amount: Math.round(data.amount * 100),
      description: data.description || "Depósito manual",
      transactionDate: data.date ?? new Date(),
    },
  });

  await syncAccountBalance(data.accountId);

  revalidatePath("/accounts");
  revalidatePath("/");

  return { success: true };
}

export async function withdrawFromAccount(data: {
  accountId: string;
  amount: number;
  description?: string;
  date?: Date;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const account = await prisma.account.findUnique({
    where: { id: data.accountId, userId: session.user.id },
    include: { transactions: { select: { amount: true, direction: true } } },
  });

  if (!account) throw new Error("Conta não encontrada.");
  if (account.type === "CREDIT_CARD") throw new Error("Saques não se aplicam a cartões de crédito.");

  const initial = Number(account.initialBalance || 0);
  const transactionBalance = account.transactions.reduce(
    (acc, t) => acc + (t.direction === "CREDIT" ? Number(t.amount) : -Number(t.amount)),
    0,
  );
  const currentBalance = initial + transactionBalance;
  const withdrawalCents = Math.round(data.amount * 100);

  if (withdrawalCents > currentBalance) {
    return {
      success: false,
      error: `Saldo insuficiente. Disponível: R$ ${(currentBalance / 100).toFixed(2).replace(".", ",")}`,
    };
  }

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      accountId: data.accountId,
      type: "WITHDRAWAL",
      direction: "DEBIT",
      amount: Math.round(data.amount * 100),
      description: data.description || "Saque manual",
      transactionDate: data.date ?? new Date(),
    },
  });

  await syncAccountBalance(data.accountId);

  revalidatePath("/accounts");
  revalidatePath("/");

  return { success: true };
}
