---
name: UI Guidelines & Identity
description: Padrão visual do projeto ThinkCard para manter consistência em todas as páginas (cores, sombras, bordas, tipografia e componentes).
---

# Padrão Visual - ThinkCard

Fonte da Verdade para o estilo visual de todas as interfaces. Siga estritamente para manter aparência de painel financeiro moderno, premium e dark.

## 1. Identidade Principal

- **Tema:** Dark Mode Nativo (`zinc-950` a `zinc-800`).
- **Cores de Destaque:**
  - **Primary (Verde Neon):** `#39FF14` (`bg-primary`, `text-primary`).
  - **Accent (Azul Elétrico/Cyan):** Links e destaques secundários (`text-[#00FFFF]`, `text-cyan-400`).
- **Contrastes e Fundos:**
  - Fundo geral: `bg-background` (zinc-950).
  - Cards/Containers: `bg-card` (zinc-900) ou `bg-zinc-900`.

## 2. Layouts de Formulários e Auth

- **Backgrounds:** Efeitos de "Glow" ou "Glassmorphism" sutil.
  - Glow: `<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />`
- **Containers Centrais:** `w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl`.

## 3. Elementos Globais

- **Inputs:** `bg-zinc-950` ou `bg-black/20`, `border-white/10`, foco com `focus-visible:ring-primary`.
- **Botões:**
  - Principal: `bg-primary text-zinc-950 hover:bg-primary/90 font-semibold h-11 rounded-xl`.
  - Secundário: `border border-white/10 hover:bg-white/5`.
- **Bordas:** `rounded-xl` (menores), `rounded-2xl`/`rounded-3xl` (cards/modais). Separadores: `border-border/40`.

## 4. Tipografia

- Títulos: `font-extrabold`/`font-bold` + `tracking-tight`.
- Subtítulos: `text-muted-foreground text-sm`.
- Valores financeiros: `whitespace-nowrap` para garantir que não quebrem linha. Usar `text-3xl font-bold tracking-tight`.

## 5. Micro-interações

- Clicáveis DEVEM ter `transition-all duration-200` ou `duration-300`.
- Hover: aumentar brilho, esmaecer borda ou glow sutil.

## 6. Cards

- **Container Padrão:** `bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-white/20 hover:bg-zinc-900/60 rounded-3xl p-6 transition-all duration-300 group`
- **Layout Interno:** Flex column, `justify-between`.
  - Header: Ícone (`w-10 h-10 rounded-full bg-white/5`), Título e Subtítulo.
  - Body: Valores (`text-3xl font-bold tracking-tight text-white`). Labels (`text-[11px] font-semibold text-muted-foreground uppercase tracking-widest`).
  - Quando há ícone decorativo absoluto no canto, o conteúdo de texto deve usar `pr-16` para evitar sobreposição.
- **Estado Selecionado:** `bg-zinc-900 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)] ring-1 ring-primary/20`.

## 7. Componentização Visual

- Componentes devem receber dados via **props** e não fazer queries internas (Server Components exceção).
- Separe lógica visual (componente) de lógica de dados (page/action).
- Cada componente visual deve ser auto-contido: seus estilos não devem depender do contexto pai.

NUNCA crie uma página sem aplicar esses padrões. NUNCA use um design genérico e vazio.
