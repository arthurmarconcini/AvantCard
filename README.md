# ThinkCard 💳

**ThinkCard** é um sistema unificado de gestão financeira pessoal e familiar, desenvolvido com a identidade visual da **Avantech**. O projeto foca em uma experiência fluida, segura e com alto contraste, utilizando o padrão Dark Mode nativo.

## 🎨 Identidade Visual (Avantech)
- **Tema:** Dark Mode Nativo (Zinc 900).
- **Cores de Destaque:** Verde Neon e Azul Elétrico para saldos e tipografia de alto contraste.
- **Conceito:** Uma lança interceptando um cartão, simbolizando precisão e controle financeiro.

## 🛠️ Stack Tecnológica Obrigatória

Este projeto segue rigorosamente as seguintes tecnologias e convenções:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, usando o diretório `src/app`).
- **Otimização:** **React Compiler ATIVADO** (`next.config.ts`).
  - ⚠️ *Regra estrita:* O uso de `useMemo` ou `useCallback` é expressamente proibido no código-fonte.
- **Banco de Dados & ORM:** PostgreSQL (Neon / Supabase) gerenciado perfeitamente via [Prisma ORM](https://www.prisma.io/).
- **Estilos & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/).
- **Ícones:** Lucide-React e Hugeicons.
- **Tipagem de Moeda Sensível:** 
  - ⚠️ *Regra estrita:* TODOS os valores financeiros (`amount`, `creditLimit`, `principalAmount`, etc.) devem ser manipulados como inteiros (centavos) nas lógicas e banco de dados. Nunca utilize `Float` para evitar imprecisões de ponto flutuante.

## 🚀 O que já foi implementado (Core)

- **Autenticação & Segurança:** Fluxos completos de Login, Registro e Recuperação de Senha utilizando `Next-Auth` (Credentials) e tokens seguros.
- **Dashboard Financeiro (`page.tsx`):**
  - Resumo de Limite Disponível de Cartões de Crédito.
  - Acompanhamento de Faturas Abertas no ciclo atual.
  - Controle de Limite Emprestado ("Na Rua") via sistema P2P.
  - Gráfico visual de Fluxo de Caixa (Receitas vs Despesas).
- **Modelo de Dados Robusto:**
  - `User`, `Account` (Cartões, Contas Bancárias, Carteiras).
  - `Person` (Gerenciamento de contatos para empréstimos).
  - `Category`, `Transaction` (Pilar central de movimentações).
  - `Loan` & `LoanSchedule` (Gestão de empréstimos P2P detalhados).
  - `Bill` (Gestão de faturas e contas a pagar).

## 🔮 Roadmap / O que desejamos para o futuro

- **Gráficos Avançados:** Integração profunda com `Recharts` para análises preditivas de gastos.
- **Simulação de Empréstimos Avançada:** Sistema com amortizações e cálculo de juros compostos reais semanais/mensais para operações P2P.
- **Sincronização Bancária:** Suporte a múltiplas moedas e integração com Open Finance / PIX via QRCode.
- **Metas Financeiras (Potes):** Sistema inteligente de poupança automatizada para objetivos específicos (ex: Viagem, Carro Novo, Reserva de Emergência).

## 💻 Como rodar o projeto localmente

1. **Clone o repositório e instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as credenciais do seu banco PostgreSQL e Next-Auth:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/thinkcard?schema=public"
   NEXTAUTH_SECRET="seu-secret-seguro"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Gere os artefatos do Prisma e sincronize o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

---
*Desenvolvido com padrão e qualidade Avantech.*
