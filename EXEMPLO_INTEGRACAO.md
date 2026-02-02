# 📖 Exemplo Prático: Como os Dados Fluem da API para a Aplicação

## 🔄 Fluxo Completo de Dados

```
┌─────────────────┐
│  Conta Azul     │
│  (ERP/Servidor) │
└────────┬────────┘
         │
         │ HTTPS Request
         ▼
┌─────────────────┐
│  API Conta Azul │
│  (auth.contaazul│
│   .com)         │
└────────┬────────┘
         │
         │ OAuth Token
         ▼
┌─────────────────┐
│  lib/contaazul  │
│  .ts            │
│  (Autenticação) │
└────────┬────────┘
         │
         │ Access Token
         ▼
┌─────────────────┐
│  API Conta Azul │
│  (api.contaazul │
│   .com/v1)      │
└────────┬────────┘
         │
         │ JSON Data
         ▼
┌─────────────────┐
│  app/api/       │
│  contaazul/     │
│  route.ts       │
│  (API Route)    │
└────────┬────────┘
         │
         │ JSON Response
         ▼
┌─────────────────┐
│  app/gestao/    │
│  contaazul/     │
│  page.tsx       │
│  (Frontend)     │
└─────────────────┘
```

## 📝 Exemplo Passo a Passo

### Passo 1: Usuário Acessa o Dashboard

```typescript
// app/gestao/contaazul/page.tsx
useEffect(() => {
  carregarDados(); // Chama a função de carregamento
}, []);
```

### Passo 2: Frontend Faz Requisição para API Route

```typescript
// app/gestao/contaazul/page.tsx
const accountsRes = await fetch(`/api/contaazul?type=accounts&_=${Date.now()}`, {
  cache: 'no-store',
  headers: { 'Cache-Control': 'no-store' },
});
```

### Passo 3: API Route Processa a Requisição

```typescript
// app/api/contaazul/route.ts
export async function GET(request: Request) {
  // 1. Obter credenciais
  const clientId = process.env.CONTA_AZUL_CLIENT_ID;
  const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET;
  
  // 2. Obter token
  const accessToken = await getContaAzulAccessToken(clientId, clientSecret, username, password);
  
  // 3. Buscar dados
  const data = await getContaAzulAccounts(accessToken);
  
  // 4. Retornar dados
  return NextResponse.json({ data, ok: true });
}
```

### Passo 4: Biblioteca Faz Autenticação

```typescript
// lib/contaazul.ts
export async function getContaAzulAccessToken(...) {
  // Tenta Password Grant
  const response = await fetch(CONTA_AZUL_AUTH_URL, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username: username,
      password: password,
    }),
  });
  
  const data = await response.json();
  return data.access_token; // Retorna o token
}
```

### Passo 5: Biblioteca Busca Dados

```typescript
// lib/contaazul.ts
export async function getContaAzulAccounts(accessToken: string) {
  const response = await fetch(`${CONTA_AZUL_BASE_URL}/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.accounts || []; // Retorna os dados
}
```

### Passo 6: Frontend Recebe e Exibe Dados

```typescript
// app/gestao/contaazul/page.tsx
const accountsData = await accountsRes.json();
if (accountsData.ok) {
  setAccounts(accountsData.data || []); // Atualiza o estado
  // React re-renderiza automaticamente com os novos dados
}
```

## 🎯 Exemplo Completo de Uso

### 1. Configurar Variáveis de Ambiente

Crie `.env.local`:

```env
CONTA_AZUL_CLIENT_ID=seu_client_id
CONTA_AZUL_CLIENT_SECRET=seu_client_secret
CONTA_AZUL_USERNAME=seu_usuario@devportal.com
CONTA_AZUL_PASSWORD=sua_senha
```

### 2. Testar a API

```bash
# Testar autenticação
npm run test:contaazul

# Ou manualmente
curl http://localhost:3000/api/contaazul?type=accounts
```

### 3. Acessar no Navegador

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/gestao/contaazul`
3. Os dados devem aparecer automaticamente

## 🔍 Debugging

### Ver Logs no Console

Abra o console do navegador (F12) e verifique:

```javascript
// Logs esperados:
✅ Token obtido via password grant
✅ Dados carregados: X contas
📊 Registros filtrados: X de Y total
```

### Ver Logs no Servidor

No terminal onde o servidor está rodando:

```bash
# Logs esperados:
✅ parseSheetValuesFromApi: X linhas processadas
✅ mapSheetRowsToRegistros: X registros mapeados
```

## 🛠️ Personalização

### Adicionar Novo Endpoint

1. Adicione a função em `lib/contaazul.ts`:

```typescript
export async function getContaAzulCustomers(accessToken: string) {
  const response = await fetch(`${CONTA_AZUL_BASE_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}
```

2. Adicione o caso na rota `app/api/contaazul/route.ts`:

```typescript
case 'customers':
  data = await getContaAzulCustomers(accessToken);
  break;
```

3. Use no frontend:

```typescript
const res = await fetch('/api/contaazul?type=customers');
const data = await res.json();
```

## 📚 Recursos Adicionais

- **Documentação Oficial**: https://developers.contaazul.com/
- **Guia Completo**: Veja `GUIA_API_CONTA_AZUL.md`
- **Testes**: Veja `TESTE_API_CONTA_AZUL.md`

