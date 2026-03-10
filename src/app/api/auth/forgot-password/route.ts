import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "O campo email é obrigatório." },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (prisma as any).user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json({
        message: "Se o email estiver cadastrado, você receberá um link de redefinição.",
      });
    }

    // Invalida tokens anteriores não usados
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Cria novo token com expiração de 1 hora
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // TODO: Integrar envio de email (Resend/Nodemailer)
    // Por agora, retorna o link para fins de teste
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    return NextResponse.json({
      message: "Se o email estiver cadastrado, você receberá um link de redefinição.",
      // Remover em produção:
      _debug: { resetLink },
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
