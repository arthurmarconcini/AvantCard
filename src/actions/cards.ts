"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCardsAndTransactions() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const cards = await prisma.account.findMany({
    where: {
      userId,
      type: "CREDIT_CARD",
    },
    include: {
      transactions: {
        include: {
          person: true,
          category: true,
        },
        orderBy: {
          transactionDate: "desc",
        },
      },
    },
  });

  return cards.map(card => ({
    ...card,
    creditLimit: card.creditLimit ? Number(card.creditLimit) : null,
    transactions: card.transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    }))
  }));
}

export async function getPersonsAndCategories() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const [persons, categories] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { userId, type: "EXPENSE" },
      orderBy: { name: "asc" },
    }),
  ]);

  return { persons, categories };
}

export async function createPurchase(data: {
  accountId: string;
  description: string;
  amount: number; // Em centavos inteiros
  transactionDate: Date;
  categoryId?: string | null;
  personId?: string | null;
  installmentNumber?: number | null;
  installmentTotal?: number | null;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const account = await prisma.account.findUnique({
    where: {
      id: data.accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Cartão não encontrado ou não pertence a este usuário.");
  }

  const groupedTransactions = await prisma.transaction.groupBy({
    by: ['direction'],
    where: { accountId: data.accountId },
    _sum: { amount: true },
  });

  let totalSpent = 0;
  for (const group of groupedTransactions) {
    if (group.direction === "DEBIT") {
      totalSpent += Number(group._sum.amount || 0);
    } else if (group.direction === "CREDIT") {
      totalSpent -= Number(group._sum.amount || 0);
    }
  }

  const creditLimit = Number(account.creditLimit || 0);
  const availableLimit = Math.max(0, creditLimit - totalSpent);

  if (data.amount > availableLimit) {
    throw new Error(`O valor excede o limite disponível no cartão.`);
  }

  const totalInstallments = data.installmentTotal && data.installmentTotal > 1 ? data.installmentTotal : 1;
  const tDate = new Date(data.transactionDate);
  const closingDay = account.billingDay || (account.dueDay ? account.dueDay - 7 : 1);
  const dueDay = account.dueDay || 1;
  
  let baseMonthOffset = 0;
  if (tDate.getDate() >= closingDay) {
    baseMonthOffset = 1;
  }
  if (dueDay < closingDay) {
    baseMonthOffset += 1;
  }

  const baseAmount = data.amount;
  const installmentAmount = Math.floor(baseAmount / totalInstallments);
  const remainder = baseAmount - (installmentAmount * totalInstallments);

  const transactionsData = [];

  for (let i = 1; i <= totalInstallments; i++) {
    const currentAmount = i === 1 ? installmentAmount + remainder : installmentAmount;
    const postingDate = new Date(tDate.getFullYear(), tDate.getMonth() + baseMonthOffset + (i - 1), dueDay, 12, 0, 0);

    transactionsData.push({
      userId,
      accountId: data.accountId,
      type: "PURCHASE" as const,
      direction: "DEBIT" as const,
      amount: currentAmount,
      description: data.description,
      transactionDate: i === 1 ? tDate : postingDate,
      postingDate: postingDate,
      categoryId: data.categoryId || null,
      personId: data.personId || null,
      installmentNumber: totalInstallments > 1 ? i : null,
      installmentTotal: totalInstallments > 1 ? totalInstallments : null,
    });
  }

  let savedTransactions;
  if (transactionsData.length === 1) {
    const t = await prisma.transaction.create({ data: transactionsData[0] });
    savedTransactions = [t];
  } else {
    const creates = transactionsData.map(tData => prisma.transaction.create({ data: tData }));
    savedTransactions = await prisma.$transaction(creates);
  }

  revalidatePath("/cards");

  return { 
    success: true, 
    transaction: {
      ...savedTransactions[0],
      amount: Number(savedTransactions[0].amount)
    } 
  };
}

export async function payCardBill(data: {
  accountId: string;
  amount: number; // Em centavos inteiros
  transactionDate: Date;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const account = await prisma.account.findUnique({
    where: {
      id: data.accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Cartão não encontrado ou não pertence a este usuário.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      accountId: data.accountId,
      type: "BILL_PAYMENT",
      direction: "CREDIT",
      amount: data.amount,
      description: "Pagamento de Fatura",
      transactionDate: data.transactionDate,
      postingDate: data.transactionDate,
    },
  });

  revalidatePath("/cards");

  return { 
    success: true, 
    transaction: {
      ...transaction,
      amount: Number(transaction.amount)
    } 
  };
}
