"use server";

import { prisma } from "@/lib/prisma";

export async function syncAccountBalance(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      transactions: {
        select: { amount: true, direction: true }
      }
    }
  });

  if (!account) return;

  const initial = Number(account.initialBalance || 0);
  const creditLimit = Number(account.creditLimit || 0);
  
  const txSum = account.transactions.reduce((acc, t) => {
    return acc + (t.direction === "CREDIT" ? Number(t.amount) : -Number(t.amount));
  }, 0);

  const currentBalance = account.type === "CREDIT_CARD" 
    ? creditLimit + txSum 
    : initial + txSum;

  await prisma.account.update({
    where: { id: accountId },
    data: { currentBalance: Math.round(currentBalance) }
  });
}
