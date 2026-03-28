"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import { validatePasswordStrength } from "@/lib/password";

export async function updateUserProfile(data: { name: string; email: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const userId = session.user.id;
  
  if (!data.name || !data.email) {
     throw new Error("Nome e E-mail são obrigatórios.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser && existingUser.id !== userId) {
    throw new Error("Este e-mail já está em uso por outro usuário.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: data.name, email: data.email },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserPassword(data: { currentPass: string; newPass: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new Error("Usuário não encontrado.");

  const isValidPass = await compare(data.currentPass, user.passwordHash);
  if (!isValidPass) {
    throw new Error("A senha atual fornecida está incorreta.");
  }

  const strength = validatePasswordStrength(data.newPass);
  if (!strength.isValid) {
    throw new Error(strength.errors[0] || "Nova senha é muito fraca.");
  }

  const hashedPassword = await hash(data.newPass, 12);
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  revalidatePath("/profile");
  return { success: true };
}
