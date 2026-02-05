# Software de 1:1 – Gestão de Performance

Sistema para gestão de reuniões 1:1, avaliação de colaboradores e análise de performance.

## Instalação

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

Para produção: `npm run build` e `npm start`.

Configure as variáveis de ambiente conforme o `.env.example` (não versionado).

## Funcionalidades

- **Portal do Gestor**: dashboard, registro de 1:1, histórico, detalhes por colaborador.
- **Portal do RH**: painel geral, avaliação individual, comparativo, relatórios e exportação.
- **Portal de Gestão**: dashboard executivo, melhores/piores, turnover, tendências.
- **Portal do Colaborador**: autoatendimento, chat, comunicados, documentos, solicitações.

Formulário 1:1 com leads trabalhados, qualidade CRM, conversão no funil, motivos de perda, pontos fortes/melhoria, estratégia, ações e KPI de foco. Score de performance calculado automaticamente.

## Tecnologias

Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hook Form, Recharts, Lucide React.

## Estrutura

- `app/` – rotas por portal (gestor, rh, gestao, colaborador) e APIs
- `components/` – layout, proteção de rotas
- `lib/` – integrações, dados, utilitários
- `types/` – definições TypeScript

Autenticação: fluxo simples por seleção de usuário (localStorage). Em produção, use autenticação robusta (JWT/OAuth).
