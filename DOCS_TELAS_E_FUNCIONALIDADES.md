# Documentação: Telas e Funcionalidades do Sistema

## 1. Resumo executivo

### O que está funcionando
- **Login**: Tela inicial com seleção de usuário (modo dev) ou email/senha ou magic link (Supabase).
- **Navegação por perfil**: Após login, redirecionamento para o portal correto (colaborador, rh, gestor, gestao).
- **Telas que usam apenas dados locais/mock**: Funcionam em qualquer ambiente (dev ou produção) quando o usuário está logado no “modo demonstração” (localStorage): autoatendimento/FAQ, comunicados, documentos (lista mock), perfil, dashboards gestor/gestão com dados de `lib/data`, registros diários (planilha/CSV), recrutamento/clima/treinamentos/financeiro/comunicação (mock), etc.
- **Com login Supabase (sessão real)**: APIs de **solicitações**, **ponto** e **disponibilidade** respondem normalmente; listagens, criação e atualização passam a usar o banco.

### O que NÃO está funcionando (e por quê)

| Funcionalidade | Sintoma | Causa |
|----------------|--------|--------|
| **Ponto (colaborador)** | "Registro de ponto indisponível" / 401 ao registrar ou ao carregar mês | APIs `/api/ponto` e `/api/solicitacoes` usam **sessão Supabase no servidor** (cookies). No “modo dev” o login é só no navegador (localStorage); não existe sessão Supabase no servidor → `getUser()` retorna null → 401. |
| **Solicitações (colaborador e RH)** | 401 ao listar/criar/abrir solicitações | Mesma causa: sem sessão Supabase no servidor. |
| **Disponibilidade** | 401 ao listar/criar (quando chama API) | Idem. |

**Conclusão**: Os 401 em `/api/ponto`, `/api/solicitacoes` e `/api/disponibilidade` são **esperados** quando:
- O usuário entrou com **modo demonstração** (NEXT_PUBLIC_DEV_LOGIN=true e seleção de usuário na tela), **ou**
- Está em produção e não fez login por **Supabase** (email/senha ou magic link).

Para essas funcionalidades funcionarem em produção é necessário **login real pelo Supabase** (usuários criados no Auth + `profiles`/`colaboradores` no banco).

---

## 2. Portal do Colaborador (`/colaborador`)

| Tela | Rota | Funcionando? | Observações |
|------|------|--------------|-------------|
| **Solicitações** | `/colaborador/solicitacoes` | ✅ Navegação e mock / ❌ API em prod com dev login | Lista: com API (Supabase) ou fallback mock. Criar/ver detalhe/mensagens depende de API → 401 sem sessão. |
| **Nova solicitação** | `/colaborador/solicitacoes/nova` | ✅ Formulário / ❌ Criação real sem sessão | Formulário completo; submit chama API; sem sessão retorna 401 e pode mostrar “modo demonstração”. |
| **Detalhe solicitação** | `/colaborador/solicitacoes/[id]` | ✅ Mock / ❌ API sem sessão | Exibe detalhe + mensagens; envia mensagem via API (401 sem sessão). |
| **Ponto** | `/colaborador/ponto` | ❌ 401 com dev login | Botões Entrada/Saída/Almoço; GET e POST `/api/ponto` → 401 sem sessão Supabase; mensagem “Registro de ponto indisponível...”. |
| **Disponibilidade** | `/colaborador/disponibilidade` | ✅ Mock / ❌ API sem sessão | Lista e formulário “Nova solicitação”; API retorna 401 sem sessão; fallback para mock. |
| **Chat** | `/colaborador/chat` | ✅ Redirecionamento | Só redireciona para `/colaborador/solicitacoes` ou detalhe (`?solicitacao=id`). Não é mais tela de chat. |
| **Meus Documentos** | `/colaborador/documentos` | ✅ Mock | Lista e visualização com dados simulados. |
| **Comunicados** | `/colaborador/comunicados` | ✅ Mock | Lista de comunicados simulados. |
| **Autoatendimento** | `/colaborador/autoatendimento` | ✅ Sim | FAQ (busca, expandir) e modelos de documento em mock. |
| **Meu Perfil** | `/colaborador/perfil` | ✅ Mock | Dados do usuário a partir de `currentUser` (localStorage). |

---

## 3. Portal do RH (`/rh`)

| Tela | Rota | Funcionando? | Observações |
|------|------|--------------|-------------|
| **Painel** | `/rh/painel` | ⚠️ Parcial | Chama `fetchRhHeadcount` (Supabase). Sem sessão, pode retornar vazio ou falhar. |
| **Usuários** | `/rh/usuarios` | ✅ Lista / ⚠️ Criação | Lista usuários; criação de usuário usa API com **service role** (funciona no servidor se env estiver configurado). |
| **Solicitações** | `/rh/solicitacoes` | ❌ 401 com dev login | Lista todas as solicitações via API; sem sessão → 401; poderia ter fallback mock. |
| **Detalhe solicitação** | `/rh/solicitacoes/[id]` | ❌ 401 com dev login | Alterar status e responder via API. |
| **Gestão de Pessoas** | `/rh/gestao-pessoas` | ✅ Mock | Lista colaboradores e dados de gestão em mock. |
| **Controle de Ponto** | `/rh/ponto` | ✅ Mock quando 401 / ⚠️ API com sessão | Lista registros por mês/colaborador; se API retorna 401, usa registros simulados; botão Validar chama PATCH (401 sem sessão). |
| **Disponibilidade** | `/rh/disponibilidade` | ❌ 401 com dev login | Lista disponibilidades via API; sem sessão → 401; sem fallback mock. |
| **Recrutamento** | `/rh/recrutamento` | ✅ Mock | Vagas, candidatos, processos com dados simulados. |
| **Treinamentos** | `/rh/treinamentos` | ✅ Mock | Lista e cards em mock. |
| **Documentos** | `/rh/documentos` | ✅ Mock | Lista e gestão em mock. |
| **Clima Organizacional** | `/rh/clima` | ✅ Mock | Pesquisas e resultados simulados. |
| **Financeiro** | `/rh/financeiro` | ✅ Mock | Cards e valores simulados. |
| **Comunicação** | `/rh/comunicacao` | ✅ Mock | Comunicados simulados. |
| **Avaliação Individual** | `/rh/avaliacao` | ✅ Mock | Avaliações por colaborador em mock. |
| **Comparativo** | `/rh/comparativo` | ✅ Mock | Comparativos simulados. |
| **Relatórios** | `/rh/relatorios` | ✅ Mock | Relatórios e exportação em mock. |
| **Chat** | `/rh/chat` | ⚠️ Redundante | Tela de chat com colaboradores em **mock**. O fluxo oficial passou a ser **Solicitações**; esta tela duplica conceito e não usa API. |

---

## 4. Telas RH “sem sentido” ou redundantes

1. **`/rh/chat`**  
   - **Problema**: Chat genérico em mock, enquanto o atendimento ao colaborador foi formalizado em **Solicitações** (com tipo, status, prioridade, mensagens por solicitação).  
   - **Recomendação**: **Remover do menu** e redirecionar `/rh/chat` para `/rh/solicitacoes`, ou exibir mensagem: “Use Solicitações para acompanhar e responder às solicitações dos colaboradores.”

2. **Excesso de itens no menu RH**  
   - Muitos módulos (Clima, Financeiro, Comunicação, Treinamentos, Recrutamento, Documentos, Comparativo, Relatórios, Avaliação Individual) ainda são **apenas mock** e não têm backend/APIs.  
   - **Recomendação**: Manter no menu como “em construção” ou agrupar em um submenu “Módulos futuros”; na própria tela exibir “Em breve” ou “Dados demonstrativos”.

3. **Painel RH (`/rh/painel`)**  
   - Depende de Supabase (headcount); com dev login pode ficar vazio.  
   - **Recomendação**: Se não houver sessão, exibir fallback com números mock ou mensagem “Faça login com Supabase para ver dados reais”.

---

## 5. Portal do Gestor (`/gestor`)

| Tela | Rota | Funcionando? | Observações |
|------|------|--------------|-------------|
| **Dashboard** | `/gestor/dashboard` | ✅ Sim | Gráficos e cards com dados de `lib/data` e registros diários (planilha/API). |
| **Colaboradores** | `/gestor/colaboradores` | ✅ Sim | Lista do time com dados locais/Supabase conforme config. |
| **Detalhe colaborador** | `/gestor/colaboradores/[id]` | ✅ Sim | Perfil e dados do colaborador. |
| **Registrar 1:1** | `/gestor/registrar` | ✅ Formulário / ⚠️ API | Formulário completo; envio pode usar API Supabase (avaliacoes-1-1). |
| **Avaliações** | `/gestor/avaliacoes/[id]` | ✅ Sim | Detalhe de avaliação 1:1. |
| **Histórico** | `/gestor/historico` | ✅ Sim | Histórico de 1:1 em mock/dados locais. |
| **Registros diários** | `/gestor/registros-diarios` | ✅ Sim | Dados da planilha/CSV ou API. |

---

## 6. Portal Gestão (`/gestao`)

| Tela | Rota | Funcionando? | Observações |
|------|------|--------------|-------------|
| **Dashboard** | `/gestao/dashboard` | ✅ Sim | Visão executiva com dados agregados (mock/planilha). |
| **Melhores** | `/gestao/melhores` | ✅ Sim | Ranking e métricas em mock. |
| **Piores** | `/gestao/piores` | ✅ Sim | Idem. |
| **Turnover** | `/gestao/turnover` | ✅ Sim | Dados simulados. |
| **Tendências** | `/gestao/tendencias` | ✅ Sim | Gráficos com dados mock. |
| **Registros diários** | `/gestao/registros-diarios` | ✅ Sim | Planilha/API conforme config. |

---

## 7. APIs e autenticação

| API | Método | Autenticação | Comportamento com dev login (sem cookie Supabase) |
|-----|--------|--------------|---------------------------------------------------|
| `/api/solicitacoes` | GET, POST | `supabase.auth.getUser()` no servidor | 401 Não autenticado |
| `/api/solicitacoes/[id]` | GET, PATCH | Idem | 401 |
| `/api/solicitacoes/[id]/mensagens` | POST | Idem | 401 |
| `/api/ponto` | GET, POST | Idem | 401 |
| `/api/ponto/[id]` | PATCH | Idem | 401 |
| `/api/disponibilidade` | GET, POST | Idem | 401 |

O servidor usa `createClient()` de `@/lib/supabase/server`, que lê **cookies** da sessão Supabase. No modo dev, o login é apenas `localStorage` no cliente; nenhum cookie de sessão é enviado → 401.

---

## 8. Recomendações para “fechar” o sistema

### 8.1. Imediato (evitar confusão e 401 em produção)

1. **Modo demonstração em produção**  
   - **Opção A**: Se `NEXT_PUBLIC_DEV_LOGIN=true` em produção, nas telas Ponto, Solicitações e Disponibilidade **não chamar** as APIs que exigem sessão; usar só mock e exibir aviso: “Modo demonstração: dados fictícios.”  
   - **Opção B**: Desativar `NEXT_PUBLIC_DEV_LOGIN` em produção e exigir sempre login Supabase; criar usuários de teste no Auth + `profiles`/`colaboradores` para testes.

2. **RH: Chat**  
   - Remover **Chat** do menu do RH e redirecionar `/rh/chat` para `/rh/solicitacoes` (ou página única “Solicitações” com texto explicando que o antigo chat foi substituído).

3. **Mensagens claras**  
   - Na tela de Ponto (e onde fizer sentido): se `res.status === 401`, exibir mensagem única: “Faça login com email e senha (Supabase) para registrar ponto.” Evitar “modo demonstração” se em produção não houver fluxo de demonstração.

### 8.2. Melhorias de produto

1. **RH: reduzir ruído no menu**  
   - Agrupar em “Pessoas” (Gestão de Pessoas, Usuários, Colaboradores), “Operacional” (Solicitações, Ponto, Disponibilidade), “Módulos” (Recrutamento, Treinamentos, Documentos, Clima, Financeiro, Comunicação, Avaliação, Comparativo, Relatórios) ou marcar claramente “Em construção” nos que forem só mock.

2. **Fallback mock no RH**  
   - Para **Solicitações** e **Disponibilidade** no RH: se a API retornar 401, usar lista mock (como já é feito em Ponto) para o usuário conseguir navegar e entender o fluxo mesmo sem sessão.

3. **Produção e testes**  
   - Criar no Supabase (Auth + `profiles` + `colaboradores`) pelo menos um usuário de cada perfil (colaborador, rh, gestor, gestao) e testar Ponto, Solicitações e Disponibilidade com login real; documentar no README ou em DOCS como criar esses usuários.

4. **Documentação de variáveis**  
   - Manter no README ou em DOCS a lista de env vars necessárias (Supabase URL, anon key, service role para criação de usuário) e o comportamento de `NEXT_PUBLIC_DEV_LOGIN` (quando usar em dev vs produção).

---

## 9. Checklist rápido: o que funciona com “modo dev” vs login Supabase

| Área | Modo dev (localStorage) | Login Supabase |
|------|---------------------------|----------------|
| Login e redirecionamento | ✅ | ✅ |
| Navegação por portal | ✅ | ✅ |
| Colaborador: Solicitações (lista/criar/detalhe/mensagens) | Mock ou 401 | ✅ API |
| Colaborador: Ponto | 401 + aviso | ✅ API |
| Colaborador: Disponibilidade | Mock ou 401 | ✅ API |
| Colaborador: Documentos, Comunicados, Autoatendimento, Perfil | ✅ Mock | ✅ Mock |
| RH: Solicitações, Ponto (lista), Disponibilidade | 401 ou mock parcial | ✅ API |
| RH: Demais telas | ✅ Mock | ✅ Mock |
| RH: Chat | ✅ Mock (redundante) | ✅ Mock |
| Gestor / Gestão | ✅ Dados locais e planilha | ✅ Idem |

Com isso, você tem um documento único que descreve todas as telas, o que está funcionando, o que não está (e por quê, incluindo os 401), telas sem sentido ou redundantes e recomendações para fechar o sistema.
