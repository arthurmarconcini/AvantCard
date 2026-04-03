"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncAccountBalance } from "@/lib/balances";
import { Prisma } from "@prisma/client";
import { accountSchema } from "@/lib/validators/account";

const HISTORY_PAGE_SIZE = 20;

interface HistoryFilters {
  accountId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAccountHistory(
  filters: HistoryFilters = {},
  cursor?: string,
  take: number = HISTORY_PAGE_SIZE
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const where: Prisma.TransactionWhereInput = {
    userId: session.user.id,
    type: { in: ["DEPOSIT", "WITHDRAWAL", "LOAN_DISBURSEMENT", "LOAN_REPAYMENT"] },
    account: { type: { in: ["BANK_ACCOUNT", "WALLET", "CASH", "OTHER"] } },
  };

  if (filters.accountId) {
    where.accountId = filters.accountId;
  }
  if (filters.type) {
    where.type = filters.type as Prisma.EnumTransactionTypeFilter;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.transactionDate = {};
    if (filters.dateFrom) {
      (where.transactionDate as Prisma.DateTimeFilter).gte = new Date(filters.dateFrom + "T00:00:00");
    }
    if (filters.dateTo) {
      (where.transactionDate as Prisma.DateTimeFilter).lte = new Date(filters.dateTo + "T23:59:59");
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { account: { select: { name: true } } },
    orderBy: { transactionDate: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = transactions.length > take;
  const items = (hasMore ? transactions.slice(0, take) : transactions).map((t) => ({
    id: t.id,
    type: t.type,
    direction: t.direction,
    amount: Number(t.amount),
    description: t.description,
    transactionDate: t.transactionDate.toISOString(),
    accountId: t.accountId,
    accountName: t.account.name,
  }));

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
  };
}


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
  });

  if (!account) throw new Error("Conta não encontrada.");
  if (account.type === "CREDIT_CARD") throw new Error("Saques não se aplicam a cartões de crédito.");

  const currentBalance = Number(account.currentBalance || 0);
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
