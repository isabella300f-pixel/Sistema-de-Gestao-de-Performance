# 🚀 Software de 1:1 - Sistema de Gestão de Performance

Sistema completo para gestão de reuniões 1:1, avaliação de colaboradores e análise de performance.

## 🔗 Integração com Conta Azul

O sistema possui integração completa com a API do Conta Azul para importação de dados financeiros.

### 📚 Documentação da Integração

- **[Guia Completo](./GUIA_API_CONTA_AZUL.md)** - Passo a passo para configurar a API do zero
- **[Guia de Testes](./TESTE_API_CONTA_AZUL.md)** - Como testar a integração
- **[Exemplo de Integração](./EXEMPLO_INTEGRACAO.md)** - Fluxo de dados da API para a aplicação
- **[Checklist](./CHECKLIST_API_CONTA_AZUL.md)** - Checklist prático de configuração
- **[Configuração Token Manual](./CONFIGURACAO_TOKEN_MANUAL.md)** - Como usar token manual para testes
- **[Deploy no Vercel](./DEPLOY_VERCEL.md)** - Como fazer deploy e configurar variáveis no Vercel
- **[Guia Vercel Passo a Passo](./GUIA_VERCEL_PASSO_A_PASSO.md)** - ⭐ Guia visual detalhado para configurar variáveis
- **[Checklist Vercel](./CHECKLIST_VERCEL.md)** - Checklist prático para não esquecer nada

### 🚀 Início Rápido

1. Configure as credenciais no portal do Conta Azul
2. Adicione as variáveis de ambiente em `.env.local`
3. Teste a autenticação: `npm run test:contaazul`
4. Acesse `/gestao/contaazul` para ver os dados

### 🌐 Deploy no Vercel

**Sim!** O push para `main` atualiza automaticamente no Vercel, mas você precisa:

1. **Configurar variáveis de ambiente no Vercel** (Settings > Environment Variables)
2. **Adicionar `CONTA_AZUL_ACCESS_TOKEN`** (token manual) ou credenciais OAuth
3. **Fazer push**: `git push origin main`
4. **Aguardar deploy** e testar em produção

📖 **Veja o guia completo**: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

## 📋 Funcionalidades

### Portal do Gestor
- **Dashboard**: Lista de colaboradores com status dos 1:1 (pendentes, em dia, atrasados)
- **Registro de 1:1**: Formulário completo baseado no Google Forms com todos os campos:
  - Leads trabalhados
  - Qualidade das atividades no CRM
  - Conversão no funil
  - Motivos de perda
  - Pontos fortes e de melhoria
  - Estratégia e ações
  - KPI de foco
- **Histórico**: Visualização de todas as avaliações realizadas
- **Detalhes do Colaborador**: Histórico individual com gráfico de evolução

### Portal do RH
- **Painel Geral**: Lista de todos os colaboradores com filtros por área e gestor
- **Avaliação Individual**: Página detalhada por colaborador com:
  - Histórico de avaliações 1:1
  - Gráfico de evolução
  - Avaliações do RH
  - Registro de intervenções
- **Comparativo**: Comparação de até 3 colaboradores simultaneamente
- **Relatórios**: Exportação de dados em CSV

### Portal de Gestão de Pessoas
- **Dashboard Executivo**: 
  - Top 5 melhor evolução
  - Top 5 pior evolução
  - Colaboradores com alto risco
  - Distribuição de risco (gráfico)
- **Melhores**: Ranking completo de colaboradores com melhor performance
- **Piores**: Lista de colaboradores que precisam de atenção imediata
- **Turnover**: 
  - KPIs de turnover (total, voluntário, involuntário)
  - Turnover por área e por gestor (gráficos)
  - Tempo médio de permanência
  - Lista de colaboradores desligados
- **Tendências**: 
  - Evolução geral da empresa
  - Áreas com maior melhoria

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Hook Form** - Gerenciamento de formulários
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

## 🚀 Como executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar no navegador
# http://localhost:3000

# Build para produção
npm run build

# Executar produção
npm start
```

## 📁 Estrutura do Projeto

```
/
├── app/                    # App Router do Next.js
│   ├── (gestor)/          # Portal do Gestor
│   │   ├── dashboard/     # Dashboard do gestor
│   │   ├── colaboradores/ # Lista e histórico de colaboradores
│   │   ├── registrar/     # Formulário de registro 1:1
│   │   ├── historico/     # Histórico de avaliações
│   │   └── avaliacoes/    # Detalhes de avaliações
│   ├── (rh)/              # Portal do RH
│   │   ├── painel/        # Painel geral
│   │   ├── colaboradores/ # Avaliação individual
│   │   ├── comparativo/   # Comparativo entre colaboradores
│   │   └── relatorios/    # Relatórios e exportação
│   ├── (gestao)/          # Portal de Gestão
│   │   ├── dashboard/     # Dashboard executivo
│   │   ├── melhores/      # Ranking de melhores
│   │   ├── piores/        # Colaboradores com baixa performance
│   │   ├── turnover/      # Análise de turnover
│   │   └── tendencias/    # Tendências e evolução
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página de login
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── Layout.tsx         # Layout com sidebar e header
│   └── ProtectedRoute.tsx # Proteção de rotas
├── lib/                   # Utilitários e helpers
│   ├── data.ts            # Gerenciamento de dados (simulando API)
│   └── utils.ts           # Funções utilitárias
├── types/                 # Tipos TypeScript
│   └── index.ts           # Definições de tipos
└── data/                  # Dados e modelos
    └── sample.json        # Estrutura de dados de exemplo
```

## 👥 Usuários Padrão

### Gerentes
- **Danilo** (gestor-1) - Gerencia: JOSE MARTINS, KAUAN SILVA, FELIPE CARLO, RAIANI SANTOS
- **Ricardo** (gestor-2) - Gerencia: FELIPE BAEZI, DANILO MIRANDA, DAIANE MOREIRA, Lucas Aleixo
- **Leandro** (gestor-3) - Gerencia: LUIZ RIBEIRO, WILSON SILVA, ENNIO BARROSO, JOÃO CARRARO

### RH
- **Adriana** (rh-1)
- **Beatriz** (rh-2)

### Gestão
- **Diretoria** (gestao-1)

## 🔐 Autenticação

O sistema utiliza autenticação simples via localStorage. Na página inicial, selecione um usuário para fazer login.

**Nota**: Em produção, implemente autenticação adequada (JWT, OAuth, etc.)

## 📊 Campos do Formulário 1:1

O formulário é baseado no Google Forms fornecido e inclui:

- **Leads Trabalhados**: Excelente, Bom, Regular, Ruim
- **Qualidade CRM**: Excelente, Boa, Regular, Ruim
- **Conversão no Funil**: Acima da média, Dentro da média, Abaixo da média, Muito abaixo da média
- **Motivos de Perda**: Múltipla escolha
- **Pontos Fortes**: Múltipla escolha
- **Pontos de Melhoria**: Múltipla escolha
- **Estratégia**: Seleção única
- **Ações do Vendedor**: Texto livre
- **Ações do Gerente**: Texto livre
- **KPI de Foco**: Texto livre
- **Próxima Data do 1:1**: Data

## 🎯 Score de Performance

O sistema calcula automaticamente um score (0-100) baseado em:
- Leads Trabalhados
- Qualidade CRM
- Conversão no Funil

O score é usado para:
- Classificação de risco de desligamento
- Rankings de melhores e piores
- Análise de tendências

## 📈 Funcionalidades de Análise

- **Tendência**: Calculada comparando a última avaliação com a anterior
- **Risco de Desligamento**: Baseado no score geral (Alto < 50, Médio < 70, Baixo >= 70)
- **Evolução**: Gráficos de linha mostrando progresso ao longo do tempo
- **Comparativos**: Visualização lado a lado de múltiplos colaboradores

## 🔄 Próximos Passos

Para produção, considere:
- Implementar banco de dados real (PostgreSQL, MongoDB, etc.)
- Adicionar autenticação robusta
- Implementar notificações por email
- Adicionar permissões mais granulares
- Integração com sistemas externos (CRM, etc.)
- Backup automático de dados
- Logs de auditoria

