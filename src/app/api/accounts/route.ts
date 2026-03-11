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

    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name: parsedData.name,
        type: parsedData.type,
        institutionName: parsedData.institutionName || null,
        last4: parsedData.last4 || null,
        creditLimit:
          parsedData.type === "CREDIT_CARD" && parsedData.creditLimit
            ? Number(parsedData.creditLimit) // Converte para o Decimal (sempre centavos no payload cliente)
            : null,
        billingDay: parsedData.type === "CREDIT_CARD" ? parsedData.billingDay : null,
        dueDay: parsedData.type === "CREDIT_CARD" ? parsedData.dueDay : null,
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
