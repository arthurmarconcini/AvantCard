# Skill: Prisma Ledger Sync

**Descrição:** Use esta skill sempre que houver alterações no arquivo `prisma/schema.prisma` ou necessidade de interagir com o Prisma Postgres via Prisma ORM para manipular o ledger do ThinkCard.

## Diretrizes de Banco de Dados

- **Infraestrutura:** O projeto utiliza **Prisma Postgres** em conjunto com o **Prisma ORM**. Otimize as consultas aproveitando os recursos nativos desse ecossistema.
- **Tipagem Financeira:** TODOS os valores monetários (`amount`, `creditLimit`, `principalAmount`, etc.) DEVEM usar o tipo `Decimal` (ex: `@db.Decimal(12, 2)`). NUNCA utilize `Int` (centavos) ou `Float`. Ao manipular esses dados no TypeScript, utilize os métodos seguros da biblioteca `Decimal.js` fornecida pelo Prisma.

## Procedimento de Migração Segura

1. Valide se a alteração mantém a integridade referencial rigorosa (`onDelete: Cascade` vs `onDelete: Restrict`).
2. Garanta que todas as novas colunas de dinheiro estejam mapeadas corretamente com `@db.Decimal`.
3. Apresente o plano de alteração e solicite aprovação (PLAN APPROVED) do usuário.
4. Após aprovação, execute `npx prisma format` seguido de `npx prisma db push` (ou `migrate dev`, dependendo do estágio do projeto).
5. Ao criar Server Actions financeiras, SEMPRE agrupe inserções dependentes em um `prisma.$transaction` para garantir a integridade ACID (ex: criar o empréstimo e registrar as parcelas previstas simultaneamente).
