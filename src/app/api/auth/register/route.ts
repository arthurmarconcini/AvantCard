import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação com Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar se email já existe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = await (prisma as any).user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 }
      );
    }

    // Hash da senha
    const passwordHash = await hash(password, 12);

    // Criar usuário
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: "Erro interno do servidor.", debug: { message, stack } },
      { status: 500 }
    );
  }
}
