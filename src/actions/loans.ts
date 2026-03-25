"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLoansDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const userId = session.user.id;

  const loans = await prisma.loan.findMany({
    where: { userId },
    include: {
      person: true,
      originAccount: true,
      schedules: {
        orderBy: { dueDate: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  let totalPrincipal = 0;
  let totalInterestExpected = 0;
  let totalReceived = 0;
  let totalOverdue = 0;

  const mappedLoans = loans.map(loan => {
    const principal = Number(loan.principalAmount);
    // Para simplificar, consideramos o juros como taxa fixa mensal aplicada sobre o principal,
    // ou simplesmente o sumário das parcelas geradas. Como as parcelas já têm interestDue e principalDue:
    
    let loanTotalReceived = 0;
    let loanTotalExpected = 0;
    
    loan.schedules.forEach(schedule => {
      const scheduleTotal = Number(schedule.totalDue);
      loanTotalExpected += scheduleTotal;
      
      if (schedule.status === "PAID") {
        loanTotalReceived += scheduleTotal;
        totalReceived += scheduleTotal;
      }
      if (schedule.status === "OVERDUE" || (schedule.status === "PENDING" && new Date(schedule.dueDate) < new Date())) {
        totalOverdue += scheduleTotal;
      }
    });

    if (loan.status === "OPEN") {
      totalPrincipal += principal;
      // Subtracting principal from expected gives interest
      totalInterestExpected += (loanTotalExpected - principal);
    }

    return {
      ...loan,
      principalAmount: principal,
      interestRate: loan.interestRate ? Number(loan.interestRate) * 100 : 0,
      totalExpected: loanTotalExpected,
      totalReceived: loanTotalReceived,
      progress: loanTotalExpected > 0 ? (loanTotalReceived / loanTotalExpected) * 100 : 0,
      originAccount: {
        id: loan.originAccount.id,
        name: loan.originAccount.name,
        currency: loan.originAccount.currency,
      },
      schedules: loan.schedules.map(s => ({
        ...s,
        principalDue: Number(s.principalDue),
        interestDue: Number(s.interestDue),
        totalDue: Number(s.totalDue),
      }))
    };
  });

  return {
    metrics: {
      totalPrincipal,
      totalInterestExpected,
      totalReceived,
      totalOverdue
    },
    loans: mappedLoans
  };
}

export async function createLoan(data: {
  personId: string;
  originAccountId: string;
  principalAmount: number;
  interestRate?: number;
  installments: number;
  startDate: Date;
  paymentDay?: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");
  const userId = session.user.id;

  const { personId, originAccountId, interestRate = 0, installments, startDate, paymentDay } = data;
  const principalAmount = Math.round(data.principalAmount * 100);

  // 1. Criar a transação de saída (LOAN_DISBURSEMENT)
  await prisma.transaction.create({
    data: {
      userId,
      accountId: originAccountId,
      personId,
      type: "LOAN_DISBURSEMENT",
      direction: "DEBIT",
      amount: principalAmount,
      description: `Empréstimo concedido (${installments}x)`,
      transactionDate: startDate,
    }
  });

  // 2. Calcular parcelas (Juros Simples ao mês sobre o saldo inicial)
  const totalInterest = Math.round(principalAmount * (interestRate / 100) * installments);
  
  const installmentPrincipal = Math.floor(principalAmount / installments);
  const installmentInterest = Math.floor(totalInterest / installments);

  const schedulesData = [];
  const start = new Date(startDate);
  const day = paymentDay ?? start.getDate();

  for (let i = 1; i <= installments; i++) {
    const dueDate = new Date(start.getFullYear(), start.getMonth() + i, day);
    
    // Ajuste da última parcela para compensar arredondamentos
    const isLast = i === installments;
    const pDue = isLast ? principalAmount - (installmentPrincipal * (installments - 1)) : installmentPrincipal;
    const iDue = isLast ? totalInterest - (installmentInterest * (installments - 1)) : installmentInterest;
    
    schedulesData.push({
      dueDate,
      principalDue: pDue,
      interestDue: iDue,
      totalDue: pDue + iDue,
      status: "PENDING" as const,
    });
  }

  // 3. Criar o Loan e Schedules
  const loan = await prisma.loan.create({
    data: {
      userId,
      personId,
      originAccountId,
      principalAmount,
      interestRate: interestRate / 100, // Ajusta para encaixar no Decimal(5, 4) do schema
      startDate: new Date(startDate),
      expectedEndDate: schedulesData[schedulesData.length - 1].dueDate,
      status: "OPEN",
      schedules: {
        create: schedulesData
      }
    }
  });

  revalidatePath("/loans");
  revalidatePath("/people");
  revalidatePath("/");
  
  return {
    ...loan,
    principalAmount: Number(loan.principalAmount),
    interestRate: loan.interestRate ? Number(loan.interestRate) * 100 : 0,
  };
}

export async function payInstallment(scheduleId: string, receivingAccountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");
  const userId = session.user.id;

  const schedule = await prisma.loanSchedule.findUnique({
    where: { id: scheduleId, loan: { userId } },
    include: { loan: true }
  });

  if (!schedule) throw new Error("Parcela não encontrada");
  if (schedule.status === "PAID") throw new Error("Parcela já paga");

  // 1. Criar a transação de recebimento (Principal)
  const principalTx = await prisma.transaction.create({
    data: {
      userId,
      accountId: receivingAccountId,
      personId: schedule.loan.personId,
      type: "LOAN_REPAYMENT",
      direction: "CREDIT",
      amount: Number(schedule.principalDue),
      description: `Recebimento de Empréstimo (Principal)`,
      transactionDate: new Date(),
    }
  });

  // 1.b Criar a transação de recebimento (Juros) se houver
  if (Number(schedule.interestDue) > 0) {
    await prisma.transaction.create({
      data: {
        userId,
        accountId: receivingAccountId,
        personId: schedule.loan.personId,
        type: "INTEREST",
        direction: "CREDIT",
        amount: Number(schedule.interestDue),
        description: `Recebimento de Empréstimo (Juros)`,
        transactionDate: new Date(),
        parentTransactionId: principalTx.id,
      }
    });
  }

  // 2. Atualizar Parcela
  await prisma.loanSchedule.update({
    where: { id: scheduleId },
    data: {
      status: "PAID",
      transactionId: principalTx.id,
    }
  });

  // 3. Verificar se o Empréstimo inteiro foi pago
  const allSchedules = await prisma.loanSchedule.findMany({
    where: { loanId: schedule.loanId }
  });
  
  const allPaid = allSchedules.every(s => s.status === "PAID" || s.id === scheduleId);
  if (allPaid) {
    await prisma.loan.update({
      where: { id: schedule.loanId },
      data: { status: "CLOSED" }
    });
  }

  revalidatePath("/loans");
  revalidatePath("/people");
  revalidatePath("/");

  return { success: true };
}

export async function deleteLoan(loanId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");
  const userId = session.user.id;

  const loan = await prisma.loan.findUnique({
    where: { id: loanId, userId },
    include: { schedules: true }
  });

  if (!loan) throw new Error("Empréstimo não encontrado");

  const paidSchedules = loan.schedules.filter(s => s.status === "PAID" && s.transactionId);
  for (const schedule of paidSchedules) {
    if (schedule.transactionId) {
      await prisma.transaction.deleteMany({
        where: { parentTransactionId: schedule.transactionId }
      });
      await prisma.transaction.delete({
        where: { id: schedule.transactionId }
      });
    }
  }

  const disbursementTx = await prisma.transaction.findFirst({
    where: {
      userId,
      personId: loan.personId,
      type: "LOAN_DISBURSEMENT",
      amount: loan.principalAmount,
      accountId: loan.originAccountId,
    },
    orderBy: { transactionDate: "desc" }
  });

  if (disbursementTx) {
    await prisma.transaction.delete({ where: { id: disbursementTx.id } });
  }

  await prisma.loan.delete({ where: { id: loanId } });

  revalidatePath("/loans");
  revalidatePath("/people");
  revalidatePath("/");

  return { success: true };
}

export async function revertInstallment(scheduleId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");
  const userId = session.user.id;

  const schedule = await prisma.loanSchedule.findUnique({
    where: { id: scheduleId, loan: { userId } },
    include: { loan: true }
  });

  if (!schedule) throw new Error("Parcela não encontrada");
  if (schedule.status !== "PAID" || !schedule.transactionId) {
    throw new Error("Parcela não está paga ou não tem transação vinculada");
  }

  // Deletar a transação pai e filhas (INTEREST)
  await prisma.transaction.deleteMany({
    where: { parentTransactionId: schedule.transactionId }
  });
  
  await prisma.transaction.delete({
    where: { id: schedule.transactionId }
  });

  // Atualizar para PENDING
  await prisma.loanSchedule.update({
    where: { id: scheduleId },
    data: {
      status: "PENDING",
      transactionId: null,
    }
  });

  // Se o empréstimo estava fechado, reabra-o
  if (schedule.loan.status === "CLOSED") {
    await prisma.loan.update({
      where: { id: schedule.loanId },
      data: { status: "OPEN" }
    });
  }

  revalidatePath("/loans");
  revalidatePath("/people");
  revalidatePath("/");

  return { success: true };
}
