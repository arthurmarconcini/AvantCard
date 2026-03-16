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

  // Busca as contas do tipo cartão de crédito com suas transações (e as pessoas envolvidas)
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

  // Serializa os valores Decimal para Number puro
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

  // Validação extra p/ ter certeza de que o cartão pertence ao utilizador
  const account = await prisma.account.findUnique({
    where: {
      id: data.accountId,
      userId,
    },
  });

  if (!account) {
    throw new Error("Cartão não encontrado ou não pertence a este usuário.");
  }

  // Cria a transação (compra via cartão sempre entra como DEBIT e PURCHASE)
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      accountId: data.accountId,
      type: "PURCHASE",
      direction: "DEBIT",
      amount: data.amount, // Valor já validado como centavos na form
      description: data.description,
      transactionDate: data.transactionDate,
      categoryId: data.categoryId || null,
      personId: data.personId || null,
      installmentNumber: data.installmentNumber || null,
      installmentTotal: data.installmentTotal || null,
    },
  });

  revalidatePath("/cards");

  return { 
    success: true, 
    transaction: {
      ...transaction,
      amount: Number(transaction.amount) // Decimal para Number
    } 
  };
}
