# Guia de testes e ajustes da aplicação

## Resumo do que foi ajustado

### 1. Sistema de Solicitações (substituição do “Chat com RH”)

- **APIs**
  - `GET /api/solicitacoes` – Lista solicitações (colaborador: só as suas; RH: todas).
  - `POST /api/solicitacoes` – Colaborador cria solicitação (tipo, motivo, prioridade, datas, etc.).
  - `GET /api/solicitacoes/[id]` – Detalhe da solicitação + mensagens.
  - `PATCH /api/solicitacoes/[id]` – RH altera status (aberto, em_analise, aprovado, rejeitado, aguardando_documentos).
  - `POST /api/solicitacoes/[id]/mensagens` – Colaborador ou RH envia mensagem na solicitação.

- **Front**
  - **Colaborador**
    - Lista de solicitações com busca e filtro por status; link “Ver detalhes e mensagens” (sem mais “Chat com RH”).
    - Nova solicitação com tipo, prioridade, motivo, período, impacto, reposição; envio para a API com fallback em modo dev.
    - Detalhe da solicitação com histórico de mensagens e campo para enviar nova mensagem (conversa no contexto da solicitação).
  - **RH**
    - Menu: item “Solicitações” (substitui “Chat”).
    - Lista de todas as solicitações com filtro e busca.
    - Detalhe: alterar status e responder com mensagens.

- **Menu e redirecionamento**
  - Removido “Chat com RH” do menu do colaborador.
  - `/colaborador/chat` redireciona para `/colaborador/solicitacoes` (ou para o detalhe se `?solicitacao=id`).

### 2. Módulo de Controle de Ponto

- **APIs**
  - `GET /api/ponto?mes=YYYY-MM` – Lista registros do mês (colaborador: próprio; RH: todos ou `?colaborador_id=uuid`).
  - `POST /api/ponto` – Colaborador registra `entrada`, `saida`, `entrada_almoco`, `saida_almoco` (body: `{ tipo, data? }`). Cálculo de horas no backend.
  - `PATCH /api/ponto/[id]` – RH valida registro (`aprovado`, `status`, `justificativa`).

- **Front**
  - **Colaborador**
    - Menu: “Ponto”.
    - Página de ponto: botões Entrada, Saída almoço, Retorno almoço, Saída; exibição do dia atual e histórico do mês.
  - **RH**
    - Controle de Ponto continua com espelho por colaborador e mês; dados vêm da API quando há sessão Supabase, com fallback para dados mock em dev.

- **RLS**
  - Em `migrations_extras.sql`: colaborador pode INSERT/UPDATE no próprio registro de ponto (além de RH).

### 3. Disponibilidade do Colaborador

- **APIs**
  - `GET /api/disponibilidade` – Colaborador: próprios registros; RH: todos (ou `?colaborador_id=uuid`).
  - `POST /api/disponibilidade` – Colaborador cria registro (tipo, data_inicio, data_fim, horarios, motivo).

- **Front**
  - **Colaborador**
    - Formulário “Nova Solicitação” (modal/inline): tipo, data início/fim, horários, motivo; lista de solicitações com status.
  - **RH**
    - Menu: “Disponibilidade”; página listando todas as disponibilidades com busca por nome/motivo.

### 4. Permissões

- Colaborador: vê e cria apenas seus dados (solicitações, ponto, disponibilidade). Detalhe da solicitação e mensagens restritos ao dono ou RH.
- RH: listagem e gestão de todas as solicitações, ponto e disponibilidades; alteração de status e validação de ponto via APIs.
- RLS no Supabase já cobre leitura/escrita por perfil; as APIs usam `auth.getUser()` e `profiles.role` / `colaboradores.user_id` para garantir acesso correto.

### 5. Revisão geral

- Código organizado: helpers de mapeamento (`lib/solicitacoes-api.ts`), tipos com `prioridade` em `SolicitacaoRH`.
- Fluxo único de “conversa” dentro da solicitação (sem tela de chat solta).
- Autoatendimento/FAQ e modelos de documento mantidos com dados mock e funcionais (busca, expandir FAQ, botões).
- Em ambiente **dev** sem sessão Supabase, as páginas usam fallback com dados mock para não quebrar testes.

---

## Como testar cada funcionalidade

### Login (modo dev)

1. Na tela inicial, com `NEXT_PUBLIC_DEV_LOGIN=true`, use os usuários de `lib/data` (ex.: colaborador 4 dígitos, RH conforme configurado).
2. Confirme redirecionamento para `/colaborador/...` ou `/rh/...` conforme o perfil.

### Solicitações (Colaborador)

1. **Listar**
   - Menu **Solicitações** → lista (API ou mock).
   - Filtro por status e busca por protocolo/tipo.
2. **Criar**
   - **Nova Solicitação** → preencher tipo, prioridade, motivo, período (se aplicável) → Enviar.
   - Deve exibir sucesso e voltar à lista (em dev sem Supabase pode aparecer “modo demonstração”).
3. **Detalhe e mensagens**
   - Em uma solicitação, **Ver detalhes e mensagens** → visualizar dados e histórico de mensagens.
   - Digitar texto e **Enviar** (com sessão Supabase a mensagem é gravada; sem sessão pode falhar silenciosamente ou exibir mock).

### Solicitações (RH)

1. Menu **Solicitações** → lista de todas as solicitações.
2. Filtro por status e busca.
3. **Ver detalhes e responder** → alterar status (select + Aplicar) e enviar mensagem no formulário.
4. Confirmar que apenas usuário RH acessa e que as alterações são refletidas (com Supabase).

### Ponto (Colaborador)

1. Menu **Ponto** → página com data de hoje.
2. Clicar em **Entrada** (e, se quiser, **Saída almoço**, **Retorno almoço**, **Saída**).
3. Verificar que os horários aparecem e que o histórico do mês é listado (tabela).
4. Em dev sem Supabase, pode aparecer aviso de “modo demonstração” ao registrar.

### Ponto (RH)

1. Menu **Controle de Ponto** → abas Espelho / Escalas / Banco de horas / Inconsistências.
2. Selecionar **mês** e **colaborador** (se aplicável).
3. Verificar tabela de registros (dados da API ou mock).
4. (Opcional) Usar `PATCH /api/ponto/[id]` com body `{ "aprovado": true }` para validar registro (ex.: Postman ou front futuramente).

### Disponibilidade (Colaborador)

1. Menu **Disponibilidade** → cards e lista.
2. **Nova Solicitação** → preencher tipo, data início/fim, horários, motivo → Salvar.
3. Verificar se o novo item aparece na lista (com API); em dev sem sessão pode não persistir.

### Disponibilidade (RH)

1. Menu **Disponibilidade** → tabela com todas as disponibilidades.
2. Buscar por nome ou motivo.
3. Verificar colunas: colaborador, tipo, período, horários, motivo, status.

### Autoatendimento

1. Menu **Autoatendimento** → FAQ e modelos.
2. Buscar texto no FAQ e abrir/fechar perguntas.
3. Verificar links/botões dos modelos de documento (podem ser placeholders).

### Redirecionamento do Chat

1. Acessar `/colaborador/chat` → deve redirecionar para `/colaborador/solicitacoes`.
2. Acessar `/colaborador/chat?solicitacao=ID` → deve redirecionar para `/colaborador/solicitacoes/ID`.

---

## Melhorias futuras sugeridas

- **Solicitações**
  - Anexos em solicitações e mensagens (upload para Storage + link na tabela).
  - Notificações (e-mail ou in-app) quando o RH alterar status ou responder.
  - Filtros avançados no RH (data, tipo, prioridade).

- **Ponto**
  - Tela no RH para “Aprovar”/“Rejeitar” em lote com um clique a partir do espelho.
  - Regras de atraso (ex.: considerar atraso se entrada > 08:05) e exibição de inconsistências a partir dos dados reais.
  - Exportação do espelho (PDF/Excel) via API.

- **Disponibilidade**
  - Aprovação/rejeição pelo RH com um clique na lista (já existe política de UPDATE para RH).
  - Calendário visual (colaborador e RH) com períodos de disponibilidade/indisponibilidade.

- **Autoatendimento**
  - Tabelas `faq` e `modelo_documento` no Supabase e APIs para listar/editar (RH), mantendo fallback mock.
  - Categorias clicáveis e ordenação configurável.

- **Geral**
  - Sincronizar usuários de `lib/data` com Supabase (Auth + `profiles` + `colaboradores`) para testes completos com sessão real.
  - Testes E2E (Playwright/Cypress) para fluxos de solicitação, ponto e disponibilidade.

---

## Login real e usuários de teste (Supabase)

Para testar **Ponto**, **Solicitações** e **Disponibilidade** com login real (sem modo demonstração):

1. Crie os usuários no **Supabase** (Authentication → Users) e rode o SQL de seed.
2. Use os **e-mails e senhas de exemplo** descritos no guia.

**Guia completo:** [USUARIOS_TESTE_SUPABASE.md](./USUARIOS_TESTE_SUPABASE.md)  
**SQL de seed:** [supabase/seed_usuarios_teste.sql](./supabase/seed_usuarios_teste.sql)

---

## Arquivos criados ou alterados (referência)

- **Novos:**  
  `app/api/solicitacoes/route.ts`, `app/api/solicitacoes/[id]/route.ts`, `app/api/solicitacoes/[id]/mensagens/route.ts`,  
  `app/api/ponto/route.ts`, `app/api/ponto/[id]/route.ts`,  
  `app/api/disponibilidade/route.ts`,  
  `app/rh/solicitacoes/page.tsx`, `app/rh/solicitacoes/[id]/page.tsx`,  
  `app/rh/disponibilidade/page.tsx`,  
  `app/colaborador/ponto/page.tsx`,  
  `lib/solicitacoes-api.ts`,  
  `GUIA_TESTES_APLICACAO.md`

- **Alterados:**  
  `types/index.ts` (prioridade em SolicitacaoRH),  
  `app/colaborador/solicitacoes/page.tsx`, `app/colaborador/solicitacoes/nova/page.tsx`, `app/colaborador/solicitacoes/[id]/page.tsx`,  
  `app/colaborador/chat/page.tsx` (redirecionamento),  
  `app/colaborador/disponibilidade/page.tsx`,  
  `app/colaborador/layout.tsx`, `app/rh/layout.tsx`,  
  `app/rh/ponto/page.tsx`,  
  `supabase/migrations_extras.sql` (políticas de ponto para colaborador).

- **Mantidos sem remoção de funcionalidade:**  
  Autoatendimento, FAQ, modelos, Comunicados, Documentos, Perfil, demais telas de RH e gestor.
