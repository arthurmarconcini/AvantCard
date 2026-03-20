# Projeto: ThinkCard (Avantech)

**Identidade Visual:** Lança interceptando um cartão. Dark Mode nativo (Zinc 900), com Verde Neon e Azul Elétrico para saldos e tipografia de alto contraste.

## Stack Tecnológica Obrigatória

- **Framework:** Next.js 16 (App Router, diretório `src/app`).
- **Otimização:** React Compiler (ATIVADO no `next.config.ts`). NUNCA usar `useMemo` ou `useCallback`.
- **Banco de Dados & ORM:** PostgreSQL + Prisma ORM. Valores financeiros usam `Decimal(12, 2)` no schema (ver skill `prisma-ledger-sync`).
- **Estilos & UI:** Tailwind CSS + Shadcn/ui (ver skill `ui-guidelines`).

## Arquitetura de Componentes

### Organização de Diretórios

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── _components/       ← componentes exclusivos da dashboard
│   ├── cards/
│   │   └── _components/       ← componentes exclusivos de /cards
│   └── ...
├── components/
│   ├── ui/                    ← Shadcn/ui (globais)
│   ├── layout/                ← Sidebar, Topbar, etc. (globais)
│   └── *.tsx                  ← modais e componentes globais reutilizáveis
├── lib/                       ← utilitários, helpers, configuração
│   ├── format.ts              ← formatadores de moeda/data
│   ├── billing.ts             ← lógica de faturamento
│   └── ...
└── actions/                   ← Server Actions (mutações)
```

### Regras de Componentização

1. **Componentes de página** ficam em `src/app/<rota>/_components/`. O prefixo `_` garante que o Next.js não os exponha como rotas.
2. **Componentes globais** ficam em `src/components/`. Só promova um componente para global quando for reutilizado em 2+ páginas.
3. **Lógica reutilizável** fica em `src/lib/`. NUNCA duplique funções utilitárias entre arquivos de componentes.
4. **Server Components por padrão**. Use `"use client"` somente quando houver hooks ou interatividade. A `page.tsx` de cada rota deve ser um Server Component fino (data fetching + composição).
5. **Props tipadas via interface**. Todo componente exportado deve ter uma interface explícita para suas props.

## Qualidade de Código

1. **Comentários:** Apenas comentários que explicam o *porquê*, não o *o quê*. Remova comentários óbvios como `// Buscar dados` ou `// Renderizar lista`. Comentários em português são permitidos.
2. **Tamanho de arquivo:** Páginas (`page.tsx`) devem ter no máximo ~120 linhas. Se passar disso, extraia componentes.
3. **DRY (Don't Repeat Yourself):** Ao encontrar lógica duplicada entre componentes ou páginas, extraia para `src/lib/`.
4. **Queries Prisma:** Use `Promise.all` para queries independentes. Use `groupBy` e `_sum` para agregações em vez de carregar registros e somar no JS.

## Permission-First Workflow

O agente DEVE seguir este ciclo antes de executar comandos destrutivos ou alterar o banco de dados:

1. **PLAN:** Explicar o que fará e listar os comandos no terminal.
2. Aguardar a resposta: `PLAN APPROVED`.
3. **IMPLEMENT:** Escrever/alterar o código.
4. Aguardar a resposta: `IMPLEMENTATION APPROVED`.
5. **PROCEED:** Executar comandos de build, migração ou commit.
