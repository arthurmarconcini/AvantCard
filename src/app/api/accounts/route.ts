import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validators/account";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = accountSchema.parse(body);

    const isCreditCard = parsedData.type === "CREDIT_CARD";

    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name: parsedData.name,
        type: parsedData.type,
        institutionName: parsedData.institutionName || null,
        last4: parsedData.last4 || null,
        creditLimit:
          isCreditCard && parsedData.creditLimit
            ? Number(parsedData.creditLimit)
            : null,
        billingDay: isCreditCard ? parsedData.billingDay : null,
        dueDay: isCreditCard ? parsedData.dueDay : null,
        initialBalance:
          !isCreditCard && parsedData.initialBalance
            ? Number(parsedData.initialBalance)
            : null,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor" },
      { status: 500 }
    );
  }
}
