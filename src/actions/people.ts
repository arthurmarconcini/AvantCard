"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPeopleDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const people = await prisma.person.findMany({
    where: { userId },
    include: {
      transactions: {
        include: {
          account: true,
          category: true,
        },
        orderBy: { transactionDate: "desc" }
      },
      loans: {
        include: {
          schedules: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return people.map(person => {
    let loanedLimit = 0;
    let loanedMoney = 0;

    person.transactions.forEach(t => {
      if (t.type === "INTEREST") return;

      const amount = Number(t.amount);
      if (t.account.type === "CREDIT_CARD") {
        if (t.direction === "DEBIT") loanedLimit += amount;
        else loanedLimit -= amount;
      } else {
        if (t.direction === "DEBIT") loanedMoney += amount;
        else loanedMoney -= amount;
      }
    });

    return {
      ...person,
      loanedLimit,
      loanedMoney,
      transactions: person.transactions.map(t => ({
        ...t,
        amount: Number(t.amount),
        account: {
          ...t.account,
          creditLimit: t.account.creditLimit ? Number(t.account.creditLimit) : null,
          initialBalance: t.account.initialBalance ? Number(t.account.initialBalance) : null,
        }
      })),
      loans: person.loans.map(l => ({
        ...l,
        principalAmount: Number(l.principalAmount),
        interestRate: l.interestRate ? Number(l.interestRate) : 0,
        schedules: l.schedules.map(s => ({
          ...s,
          principalDue: Number(s.principalDue),
          interestDue: Number(s.interestDue),
          totalDue: Number(s.totalDue),
        }))
      }))
    };
  });
}

export async function createPerson(data: {
  name: string;
  relationshipType: "FAMILY" | "FRIEND" | "OTHER";
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const person = await prisma.person.create({
    data: {
      ...data,
      userId: session.user.id,
    }
  });

  revalidatePath("/people");
  return person;
}

export async function updatePerson(id: string, data: {
  name: string;
  relationshipType: "FAMILY" | "FRIEND" | "OTHER";
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const person = await prisma.person.update({
    where: { id, userId: session.user.id },
    data,
  });

  revalidatePath("/people");
  return person;
}

export async function deletePerson(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const person = await prisma.person.findUnique({
    where: { id, userId: session.user.id },
    include: {
      _count: {
        select: { transactions: true, loans: true }
      }
    }
  });

  if (!person) throw new Error("Pessoa não encontrada");

  if (person._count.transactions > 0 || person._count.loans > 0) {
    return { 
      success: false, 
      error: "Não é possível excluir uma pessoa que possui transações financeiras ou empréstimos associados." 
    };
  }

  await prisma.person.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/people");
  return { success: true };
}
