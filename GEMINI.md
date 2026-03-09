# Projeto: ThinkCard (Avantech)

**Identidade Visual:** Lança interceptando um cartão. Dark Mode nativo (Zinc 900), com Verde Neon e Azul Elétrico para saldos e tipografia de alto contraste.

## Stack Tecnológica Obrigatória

- **Framework:** Next.js 16 (App Router, usar diretório `src/app`).
- **Otimização:** React Compiler (ATIVADO no `next.config.ts`). NUNCA usar `useMemo` ou `useCallback`.
- **Banco de Dados & ORM:** PostgreSQL (Neon/Supabase/Prisma) + Prisma ORM.
- **Estilos & UI:** Tailwind CSS + Shadcn/ui.
- **Tipagem de Moeda:** TODOS os valores financeiros (`amount`, `creditLimit`, `principalAmount`) devem ser inteiros (centavos). NUNCA usar `Float`.

## Permission-First Workflow (Regras de Execução do Agente)

O agente Gemini 3.1 Pro DEVE seguir este ciclo antes de executar comandos destrutivos ou alterar o banco de dados:

1. **PLAN:** Explicar o que fará e listar os comandos no terminal.
2. Aguardar a resposta: `PLAN APPROVED`.
3. **IMPLEMENT:** Escrever/alterar o código.
4. Aguardar a resposta: `IMPLEMENTATION APPROVED`.
5. **PROCEED:** Executar comandos de build, migração ou commit.
