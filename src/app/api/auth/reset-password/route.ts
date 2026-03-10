import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token é obrigatório." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "A nova senha é obrigatória." },
        { status: 400 }
      );
    }

    // Valida força da senha
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json(
        {
          error: "A senha não atende aos requisitos de segurança.",
          details: strength.errors,
          score: strength.score,
        },
        { status: 422 }
      );
    }

    // Usando cast para any devido a instabilidade de tipagem do Prisma 7 adapter-pg
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetToken = await (prisma as any).passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 400 }
      );
    }

    // Hash da nova senha e atualização
    const passwordHash = await hash(password, 12);

    await prisma.$transaction([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: "Senha redefinida com sucesso.",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
