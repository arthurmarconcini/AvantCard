"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const PEOPLE_PAGE_SIZE = 20;
const PERSON_TRANSACTIONS_PAGE_SIZE = 15;

// Calcula loanedLimit e loanedMoney por pessoa via aggregation
async function getPersonLoanedAmounts(userId: string) {
  const results = await prisma.$queryRaw<
    { person_id: string; account_type: string; direction: string; total: number }[]
  >(Prisma.sql`
    SELECT
      t.person_id,
      a.type AS account_type,
      t.direction,
      COALESCE(SUM(t.amount), 0)::float AS total
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    WHERE t.user_id = ${userId}
      AND t.person_id IS NOT NULL
      AND t.type != 'INTEREST'
    GROUP BY t.person_id, a.type, t.direction
  `);

  const map = new Map<string, { loanedLimit: number; loanedMoney: number }>();

  for (const row of results) {
    if (!map.has(row.person_id)) {
      map.set(row.person_id, { loanedLimit: 0, loanedMoney: 0 });
    }
    const entry = map.get(row.person_id)!;
    const amount = Number(row.total);

    if (row.account_type === "CREDIT_CARD") {
      if (row.direction === "DEBIT") entry.loanedLimit += amount;
      else entry.loanedLimit -= amount;
    } else {
      if (row.direction === "DEBIT") entry.loanedMoney += amount;
      else entry.loanedMoney -= amount;
    }
  }

  return map;
}

export async function getPeopleDashboard(page: number = 1, pageSize: number = PEOPLE_PAGE_SIZE) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const userId = session.user.id;
  const skip = (page - 1) * pageSize;

  const [people, totalCount, loanedAmounts] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      include: {
        _count: { select: { transactions: true, loans: true } },
        loans: {
          where: { status: "OPEN" },
          include: { schedules: true },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.person.count({ where: { userId } }),
    getPersonLoanedAmounts(userId),
  ]);

  const mappedPeople = people.map((person) => {
    const amounts = loanedAmounts.get(person.id) || { loanedLimit: 0, loanedMoney: 0 };

    return {
      id: person.id,
      name: person.name,
      relationshipType: person.relationshipType,
      phone: person.phone,
      email: person.email,
      notes: person.notes,
      loanedLimit: amounts.loanedLimit,
      loanedMoney: amounts.loanedMoney,
      transactionCount: person._count.transactions,
      loanCount: person._count.loans,
      loans: person.loans.map((l) => ({
        id: l.id,
        principalAmount: Number(l.principalAmount),
        startDate: l.startDate,
        status: l.status,
        schedules: l.schedules.map((s) => ({
          id: s.id,
          dueDate: s.dueDate,
          totalDue: Number(s.totalDue),
          status: s.status,
        })),
      })),
    };
  });

  let totalLoanedLimit = 0;
  let totalLoanedMoney = 0;
  for (const entry of loanedAmounts.values()) {
    totalLoanedLimit += entry.loanedLimit;
    totalLoanedMoney += entry.loanedMoney;
  }

  return {
    people: mappedPeople,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    totalLoanedLimit,
    totalLoanedMoney,
  };
}



export async function getPersonTransactions(
  personId: string,
  cursor?: string,
  take: number = PERSON_TRANSACTIONS_PAGE_SIZE

) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  // Busca take+1 para saber se há próxima página
  const transactions = await prisma.transaction.findMany({
    where: { personId, userId: session.user.id },
    include: {
      account: { select: { type: true, name: true } },
      category: { select: { name: true, color: true } },
    },
    orderBy: { transactionDate: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = transactions.length > take;
  const items = (hasMore ? transactions.slice(0, take) : transactions).map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    description: t.description,
    transactionDate: t.transactionDate,
    type: t.type,
    direction: t.direction,
    account: { type: t.account.type, name: t.account.name },
    category: t.category ? { name: t.category.name, color: t.category.color } : null,
  }));

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
  };
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
