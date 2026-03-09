# Skill: Shadcn Manager

**Descrição:** Use esta skill quando o usuário pedir para criar ou adicionar elementos de interface (botões, tabelas, modais) usando Shadcn/ui.

## Procedimento

1. Verifique se o componente solicitado já existe em `src/components/ui/`.
2. Se não existir, rode o comando silenciosamente: `npx shadcn@latest add [nome-do-componente]`.
3. Ao implementar o componente em uma página, aplique o design system do ThinkCard:
   - Bordas arredondadas e sombras suaves.
   - Use cores condicionais para finanças (ex: `text-green-500` para entradas, `text-red-500` para saídas).
   - Garanta que a interface seja "Data-Dense" (ideal para extratos e ledgers).
