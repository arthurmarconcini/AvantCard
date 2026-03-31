import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function syncAll() {
  const accounts = await prisma.account.findMany();
  console.log(`Encontradas ${accounts.length} contas para sincronizar...`);

  let count = 0;
  for (const account of accounts) {
    const accountWithTx = await prisma.account.findUnique({
      where: { id: account.id },
      include: {
        transactions: {
          select: { amount: true, direction: true }
        }
      }
    });

    if (!accountWithTx) continue;

    const initial = Number(accountWithTx.initialBalance || 0);
    const creditLimit = Number(accountWithTx.creditLimit || 0);
    
    const txSum = accountWithTx.transactions.reduce((acc, t) => {
      return acc + (t.direction === "CREDIT" ? Number(t.amount) : -Number(t.amount));
    }, 0);

    const currentBalance = accountWithTx.type === "CREDIT_CARD" 
      ? creditLimit + txSum 
      : initial + txSum;

    await prisma.account.update({
      where: { id: account.id },
      data: { currentBalance: Math.round(currentBalance) }
    });
    console.log(`Sincronizada conta ${account.name} -> Saldo: ${currentBalance}`);
    count++;
  }

  console.log(`Finalizado! ${count} contas sincronizadas.`);
}

syncAll().catch(console.error).finally(() => prisma.$disconnect());
