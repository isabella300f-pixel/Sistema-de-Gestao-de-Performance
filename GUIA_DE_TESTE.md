# 🧪 Guia de Teste - Sistema de Gestão de Performance

## 🚀 Como Rodar o Projeto

### 1. Iniciar o Servidor
```powershell
# No diretório do projeto
npm run dev
```

### 2. Acessar o Sistema
Abra o navegador em: **http://localhost:3000**

---

## 👥 Credenciais de Teste - Todos os Usuários

### 🔴 **RH (Recursos Humanos)**
Acesso completo ao sistema, pode gerenciar usuários, colaboradores, etc.

| Nome | Email | Senha | Funcionalidades |
|------|-------|-------|-----------------|
| **Adriana** | `adriana@empresa.com` | `1234` | Painel RH, Gestão de Usuários, Gestão de Pessoas |
| **Beatriz** | `beatriz@empresa.com` | `1234` | Painel RH, Gestão de Usuários, Gestão de Pessoas |

**O que pode fazer:**
- ✅ Gerenciar usuários (criar, editar, desativar)
- ✅ Ver todos os colaboradores
- ✅ Controle de ponto
- ✅ Recrutamento
- ✅ Treinamentos
- ✅ Documentos
- ✅ Clima organizacional
- ✅ Financeiro
- ✅ Comunicação interna

---

### 👔 **Gestores**
Gerenciam seus colaboradores, fazem avaliações 1:1, etc.

| Nome | Email | Senha | Colaboradores Gerenciados |
|------|-------|-------|---------------------------|
| **DANILO LOURENÇO TEIXEIRA DE MIRANDA** | `danilo@empresa.com` | `1234` | 3 colaboradores |
| **RICARDO SANGUINETE DE OLIVEIRA JUNIOR** | `ricardo@empresa.com` | `1234` | 6 colaboradores |
| **LEANDRO VIEIRA MARTINS** | `leandro@empresa.com` | `1234` | 6 colaboradores |
| **VINICIUS BARRETO SILVA** | `vinicius@empresa.com` | `1234` | 1 colaborador |

**O que pode fazer:**
- ✅ Ver dashboard com métricas dos colaboradores
- ✅ Ver lista de colaboradores sob sua gestão
- ✅ Registrar avaliações 1:1
- ✅ Ver histórico de avaliações
- ✅ Acompanhar status dos 1:1 (em dia, atrasado, pendente)

---

### 📊 **Gestão (Diretoria)**
Visão estratégica e gerencial do sistema.

| Nome | Email | Senha | Funcionalidades |
|------|-------|-------|-----------------|
| **Diretoria** | `gestao@empresa.com` | `1234` | Dashboard executivo |

**O que pode fazer:**
- ✅ Dashboard com visão geral
- ✅ Melhores performers
- ✅ Piores performers
- ✅ Análise de turnover
- ✅ Tendências
- ✅ Métricas gerais

---

### 👤 **Colaboradores**
Acesso ao portal do colaborador.

| Nome | Email | Senha |
|------|-------|-------|
| **JAMILE RIBEIRO** | `jamile@empresa.com` | `1234` |
| **RENATO DE ALMEIDA FERREIRA** | `renato@empresa.com` | `1234` |
| **RICHARD MICHAEL DA SILVA CASTRO** | `richard@empresa.com` | `1234` |
| **BARBARA STEFANY DOS SANTOS MOREIRA** | `barbara@empresa.com` | `1234` |
| **FELIPE JOSE BAEZI LAGES** | `felipe.lages@empresa.com` | `1234` |
| **GABRIEL CUNHA BAEZI CARDOSO** | `gabriel@empresa.com` | `1234` |
| **GUILHERME MACHADO DA SILVA** | `guilherme@empresa.com` | `1234` |
| **JOSE ROBERTO MARTINS** | `jose.martins@empresa.com` | `1234` |
| **DAIANE DA SILVA MOREIRA** | `daiane@empresa.com` | `1234` |
| **ENNIO MIRANDA BARROSO** | `ennio@empresa.com` | `1234` |
| **FELIPE CARLO DO CARMO** | `felipe.carlo@empresa.com` | `1234` |
| **JOÃO VICTOR RODRIGUES CARRARO** | `joao.victor@empresa.com` | `1234` |
| **LUIZ HENRIQUE RIBEIRO DA SILVA** | `luiz.henrique@empresa.com` | `1234` |
| **THIAGO DE FELIPE CASTRO** | `thiago@empresa.com` | `1234` |
| **KAUAN ALEIXO DA SILVA** | `kauan@empresa.com` | `1234` |
| **ISSRAEL ANDRADE DE ALMEIDA** | `issrael@empresa.com` | `1234` |

**O que pode fazer:**
- ✅ Ver solicitações ao RH
- ✅ Criar novas solicitações
- ✅ Chat com RH
- ✅ Enviar documentos
- ✅ Ver comunicados
- ✅ Informar disponibilidade
- ✅ Ver perfil pessoal

---

## 🧪 Como Testar Cada Tipo de Usuário

### 1️⃣ **Testar Login**

1. Acesse: http://localhost:3000
2. Digite o **email** do usuário
3. Digite a **senha** (4 dígitos): `1234`
4. Clique em **Entrar**

### 2️⃣ **Testar Perfil RH**

**Login:** `adriana@empresa.com` / `1234`

**Testar:**
- ✅ Acessar "Usuários" no menu → Criar novo usuário
- ✅ Acessar "Painel Geral" → Ver todos os colaboradores
- ✅ Acessar "Gestão de Pessoas" → Ver detalhes dos colaboradores
- ✅ Testar filtros e buscas

### 3️⃣ **Testar Perfil Gestor**

**Login:** `danilo@empresa.com` / `1234`

**Testar:**
- ✅ Ver dashboard com métricas
- ✅ Acessar "Meus Colaboradores" → Ver lista
- ✅ Clicar em "Ver Histórico" de um colaborador
- ✅ Clicar em "Registrar 1:1" → Preencher formulário
- ✅ Ver "Histórico" de avaliações

### 4️⃣ **Testar Perfil Gestão**

**Login:** `gestao@empresa.com` / `1234`

**Testar:**
- ✅ Ver dashboard executivo
- ✅ Acessar "Melhores Performers"
- ✅ Acessar "Piores Performers"
- ✅ Ver análise de "Turnover"
- ✅ Ver "Tendências"

### 5️⃣ **Testar Perfil Colaborador**

**Login:** `jamile@empresa.com` / `1234`

**Testar:**
- ✅ Ver "Solicitações ao RH"
- ✅ Criar nova solicitação
- ✅ Acessar "Chat com RH"
- ✅ Ver "Documentos"
- ✅ Ver "Comunicados"
- ✅ Acessar "Meu Perfil"

---

## 🔄 Fluxo de Teste Completo

### Cenário 1: RH cria um novo usuário
1. Login como RH: `adriana@empresa.com` / `1234`
2. Ir em "Usuários" no menu
3. Clicar em "Novo Usuário"
4. Preencher:
   - Nome: "Teste Usuário"
   - Email: "teste@empresa.com"
   - Perfil: "Colaborador"
   - Senha: Gerar aleatória ou digitar 4 dígitos
5. Clicar em "Criar"
6. Verificar se aparece na lista

### Cenário 2: Gestor registra avaliação 1:1
1. Login como Gestor: `danilo@empresa.com` / `1234`
2. Ir em "Meus Colaboradores"
3. Clicar em "Registrar 1:1" de um colaborador
4. Preencher o formulário de avaliação
5. Salvar
6. Verificar se aparece no histórico

### Cenário 3: Colaborador cria solicitação
1. Login como Colaborador: `jamile@empresa.com` / `1234`
2. Ir em "Solicitações ao RH"
3. Clicar em "Nova Solicitação"
4. Preencher os dados
5. Enviar
6. Verificar se aparece na lista

---

## 🎯 Páginas Principais por Perfil

### RH
- `/rh/painel` - Painel geral
- `/rh/usuarios` - Gerenciamento de usuários ⭐ **NOVO**
- `/rh/gestao-pessoas` - Gestão de pessoas
- `/rh/ponto` - Controle de ponto
- `/rh/recrutamento` - Recrutamento
- `/rh/treinamentos` - Treinamentos
- `/rh/documentos` - Documentos
- `/rh/clima` - Clima organizacional
- `/rh/financeiro` - Financeiro
- `/rh/comunicacao` - Comunicação
- `/rh/avaliacao` - Avaliação individual
- `/rh/comparativo` - Comparativo
- `/rh/relatorios` - Relatórios

### Gestor
- `/gestor/dashboard` - Dashboard
- `/gestor/colaboradores` - Meus colaboradores
- `/gestor/registrar` - Registrar 1:1
- `/gestor/historico` - Histórico

### Gestão
- `/gestao/dashboard` - Dashboard executivo
- `/gestao/melhores` - Melhores performers
- `/gestao/piores` - Piores performers
- `/gestao/turnover` - Turnover
- `/gestao/tendencias` - Tendências

### Colaborador
- `/colaborador/solicitacoes` - Solicitações ao RH
- `/colaborador/chat` - Chat com RH
- `/colaborador/documentos` - Documentos
- `/colaborador/comunicados` - Comunicados
- `/colaborador/disponibilidade` - Disponibilidade
- `/colaborador/perfil` - Meu perfil

---

## ⚠️ Dicas de Teste

1. **Limpar localStorage**: Se quiser testar login novamente, limpe o localStorage:
   ```javascript
   // No console do navegador (F12)
   localStorage.clear()
   ```

2. **Senha padrão**: Todos os usuários têm senha `1234` por padrão

3. **Criar novos usuários**: Use o perfil RH para criar novos usuários com senhas diferentes

4. **Testar validações**: 
   - Tente login com senha errada
   - Tente login com email inexistente
   - Tente criar usuário sem preencher campos obrigatórios

5. **Testar responsividade**: Redimensione a janela do navegador para testar mobile

---

## 🐛 Problemas Comuns

### Erro de login
- Verifique se o email está correto
- Verifique se a senha tem exatamente 4 dígitos
- Limpe o localStorage e tente novamente

### Página não carrega
- Verifique se o servidor está rodando (`npm run dev`)
- Verifique o console do navegador (F12) para erros
- Limpe o cache do navegador

### Usuário não aparece
- Verifique se o usuário está ativo
- Verifique se está logado com perfil correto
- Recarregue a página (F5)

---

## 📝 Notas

- **Senha padrão**: Todos os usuários têm senha `1234`
- **Dados em memória**: Os dados são salvos apenas em memória (não persistem após reiniciar o servidor)
- **Criar usuários**: Use o perfil RH para criar novos usuários
- **Layout**: Todos os cards seguem o padrão escuro com borda azul

---

**Bom teste! 🚀**

