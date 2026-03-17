---
name: UI Guidelines & Identity
description: Padrão visual do projeto ThinkCard para manter consistência em todas as páginas (cores, sombras, bordas, tipografia e componentes).
---

# Padrão Visual - ThinkCard

Este documento serve como a **Fonte da Verdade** para o estilo visual de todas as interfaces criadas no projeto ThinkCard. Sempre que criar ou refatorar uma página, siga estritamente estas regras para manter a aparência de painel financeiro moderno, premium e dark.

## 1. Identidade Principal

- **Tema:** Dark Mode Nativo (baseado na paleta Zinc do Tailwind `zinc-950` a `zinc-800`).
- **Cores de Destaque:**
  - **Primary (Verde Neon):** `#39FF14` (Classe Tailwind: `bg-primary`, `text-primary`).
  - **Accent (Azul Elétrico/Cyan):** Para links secundários e destaques de ações alternativas (`text-[#00FFFF]`).
- **Contrastes e Fundos:**
  - Fundo geral da aplicação: `bg-background` (que mapeia para `zinc-950`).
  - Fundo de Cards/Containers: `bg-card` (que mapeia para `zinc-900`) ou `bg-zinc-900`.

## 2. Layouts de Formulários e Auth (Páginas de Entrada)

- **Backgrounds Modernos:** Use efeitos de "Glow" ou "Glassmorphism" sutil para evitar telas pretas vazias e simples.
  - Exemplo de glow: `<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />`
- **Containers Centrais:** Devem ser envoltos em bordas muito sutis para dar volume.
  - Padrão: `w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl`.

## 3. Elementos Globais

- **Inputs:**
  - Fundo escuro levemente contrastante com o card (`bg-zinc-950` ou `bg-black/20`).
  - Borda sutil (`border-white/10`).
  - **Foco:** Sempre usar anel da cor primária (`focus-visible:ring-primary` ou `focus-visible:ring-[#39FF14]`). NUNCA use as cores padrão do browser.
- **Botões:**
  - Botão principal: `bg-primary text-zinc-950 hover:bg-primary/90 font-semibold h-11 rounded-xl`.
  - Botão secundário: Fundo transparente com borda sutil, ex: `border border-white/10 hover:bg-white/5`.
- **Bordas e Arredondamento:**
  - Usar bordas generosas (`rounded-xl` para componentes menores, `rounded-2xl` ou `rounded-3xl` para cards e modais).
  - Linhas separadoras devem ser ultra sutis (`border-border/40` ou `border-white/5`).

## 4. Tipografia

- Títulos (`h1`, `h2`): `font-extrabold` ou `font-bold` com `tracking-tight` (High contrast, cor clara sólida).
- Textos descritivos/subtítulos: `text-muted-foreground` (zinco-400) com tamanho menor (`text-sm`).
- Elementos com status financeiro (ex: R$ 42.850,00) precisam estar visíveis, limpos e contrastantes.

## 5. Micro-interações

- Todos os elementos clicáveis (botões, links, cards interativos) DEVEM possuir transições (`transition-all duration-200` ou `duration-300`).
- Adicione efeitos de _hover_ suaves: aumentar brilho da cor primária, esmaecer borda ou leve elevação (quando fizer sentido no design dark).

NUNCA crie uma página sem aplicar esses padrões estéticos detalhados. NUNCA use um design genérico e vazio.

## 6. Padronização Estrita de Espaçamentos e Cards
Para garantir coesão em listas e grids de todo o sistema:
- **Grids e Gaps:** Sempre use `gap-4` ou `gap-6` em grids de cartões `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- **Anatomia do Card Base (Item de Lista):**
  - **Container:** `bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-white/20 hover:bg-zinc-900/60 rounded-3xl p-6 transition-all duration-300 group`
  - **Layout Interno do Card:** 
    - Flex column com `justify-between`.
    - **Header:** Ícone em um container circular (`w-10 h-10 rounded-full flex items-center justify-center bg-white/5`), Título e Subtítulo.
    - **Body:** Valores financeiros com alta hierarquia (`text-3xl font-bold tracking-tight text-white`). Identificadores (`text-[11px] font-semibold text-muted-foreground uppercase tracking-widest`).
  - **Estado Selecionado/Ativo:** Quando um card é estritamente selecionado via estado, injete glow primário: `bg-zinc-900 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)] ring-1 ring-primary/20`. Nunca use `bg-primary` em fundo de card completo.

Aderência a essas regras de espaçamento e containerização é OBRIGATÓRIA.
