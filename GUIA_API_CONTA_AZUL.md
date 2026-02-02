# 🚀 Guia Completo: Integração com API Conta Azul

Este guia mostra passo a passo como criar e configurar a integração com a API do Conta Azul do zero.

## 📋 Pré-requisitos

1. Conta no Conta Azul (ERP)
2. Acesso ao Portal de Desenvolvedores do Conta Azul
3. Credenciais da aplicação (Client ID e Client Secret)
4. Credenciais de teste (Username e Password) - opcional

## 🔐 Passo 1: Criar Aplicação no Portal do Conta Azul

### 1.1 Acessar o Portal de Desenvolvedores

1. Acesse: https://developers.contaazul.com/
2. Faça login com sua conta do Conta Azul
3. Vá para "Minhas Aplicações" ou "Aplicações"

### 1.2 Criar Nova Aplicação

1. Clique em "Nova Aplicação" ou "Criar Aplicação"
2. Preencha os dados:
   - **Nome da Aplicação**: Ex: "Sistema de Gestão de Performance"
   - **URL de Redirecionamento**: `https://contaazul.com` (ou sua URL de produção)
   - **Descrição**: Descrição da aplicação
3. Salve e anote:
   - **Client ID**: Ex: `13i92mrduirpqcdctqp9q1vr9c`
   - **Client Secret**: Ex: `3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep`

### 1.3 Obter Credenciais de Teste (Opcional)

1. No portal, procure por "Conta Teste" ou "Informações da conta teste"
2. Anote:
   - **Username**: Ex: `a948e6e2-47da-410e-9646-0019c66f1503@devportal.com`
   - **Password**: Ex: `a948e6e2-47da-410e-9646-0019c66f1503`

## 🔧 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Criar arquivo `.env.local`

No diretório raiz do projeto, crie o arquivo `.env.local`:

```env
# Credenciais do Conta Azul
CONTA_AZUL_CLIENT_ID=13i92mrduirpqcdctqp9q1vr9c
CONTA_AZUL_CLIENT_SECRET=3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep

# Credenciais de Teste (Opcional)
CONTA_AZUL_USERNAME=a948e6e2-47da-410e-9646-0019c66f1503@devportal.com
CONTA_AZUL_PASSWORD=a948e6e2-47da-410e-9646-0019c66f1503
```

### 2.2 Configurar no Vercel (Produção)

1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis:
   - `CONTA_AZUL_CLIENT_ID`
   - `CONTA_AZUL_CLIENT_SECRET`
   - `CONTA_AZUL_USERNAME` (opcional)
   - `CONTA_AZUL_PASSWORD` (opcional)

## 📚 Passo 3: Entender a Estrutura da API

### 3.1 Endpoints Principais

A API do Conta Azul usa os seguintes endpoints:

- **Autenticação**: `https://auth.contaazul.com/oauth2/token`
- **API Base**: `https://api.contaazul.com/v1`

### 3.2 Fluxos de Autenticação

A API suporta 3 tipos de autenticação:

1. **Password Grant** (para contas de teste):
   ```
   grant_type=password
   username=seu_usuario
   password=sua_senha
   ```

2. **Client Credentials** (para aplicações):
   ```
   grant_type=client_credentials
   client_id=seu_client_id
   client_secret=seu_client_secret
   ```

3. **Authorization Code** (para OAuth completo):
   ```
   grant_type=authorization_code
   code=codigo_de_autorizacao
   redirect_uri=sua_url
   ```

## 🔄 Passo 4: Implementar Autenticação

### 4.1 Estrutura do Código

O código já está implementado em `lib/contaazul.ts`. A função `getContaAzulAccessToken` tenta os 3 métodos automaticamente.

### 4.2 Testar Autenticação

Para testar manualmente, você pode usar cURL:

```bash
# Teste com Password Grant
curl -X POST https://auth.contaazul.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET" \
  -d "username=SEU_USERNAME" \
  -d "password=SUA_SENHA"

# Teste com Client Credentials
curl -X POST https://auth.contaazul.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET"
```

## 📊 Passo 5: Buscar Dados da API

### 5.1 Endpoints Disponíveis

Após obter o token, você pode acessar:

- **Contas**: `GET /v1/accounts`
- **Transações**: `GET /v1/transactions`
- **Vendas**: `GET /v1/sales`
- **Clientes**: `GET /v1/customers`

### 5.2 Exemplo de Requisição

```javascript
const accessToken = await getContaAzulAccessToken(clientId, clientSecret);

const response = await fetch('https://api.contaazul.com/v1/accounts', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## 🛠️ Passo 6: Integrar na Aplicação

### 6.1 A Rota API já está criada

A rota `/api/contaazul` já está implementada em `app/api/contaazul/route.ts`.

### 6.2 Usar na Interface

A página do dashboard já está criada em `app/gestao/contaazul/page.tsx`.

### 6.3 Testar a Integração

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/gestao/contaazul`
3. Verifique o console do navegador para logs
4. Verifique se os dados aparecem

## 🐛 Passo 7: Resolver Problemas Comuns

### Problema 1: Erro 401 (Unauthorized)

**Causas possíveis:**
- Credenciais incorretas
- Token expirado
- Tipo de autenticação não suportado

**Solução:**
1. Verifique se as credenciais estão corretas
2. Verifique se a aplicação está configurada no portal
3. Tente usar Password Grant se Client Credentials não funcionar

### Problema 2: Token Expirado

**Solução:**
O token expira em 1 hora. Implemente renovação automática:

```javascript
// Armazenar token e refresh_token
let cachedToken = null;
let tokenExpiry = null;

async function getValidToken() {
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }
  
  // Renovar token
  const newToken = await getContaAzulAccessToken(...);
  cachedToken = newToken;
  tokenExpiry = Date.now() + (55 * 60 * 1000); // 55 minutos
  return newToken;
}
```

### Problema 3: CORS ou Erros de Rede

**Solução:**
- As requisições devem ser feitas do servidor (API routes), não do cliente
- Use as rotas `/api/contaazul` que já estão implementadas

## 📝 Passo 8: Documentação Adicional

### 8.1 Recursos Úteis

- **Documentação Oficial**: https://developers.contaazul.com/
- **Quick Start**: https://developers.contaazul.com/quick-start
- **Autenticação**: https://developers.contaazul.com/auth
- **Fazendo Chamadas**: https://developers.contaazul.com/makingcalls

### 8.2 Estrutura de Dados

Os dados retornados pela API seguem esta estrutura:

```typescript
interface ContaAzulAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface ContaAzulTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}
```

## ✅ Checklist de Verificação

- [ ] Aplicação criada no portal do Conta Azul
- [ ] Credenciais (Client ID e Secret) obtidas
- [ ] Variáveis de ambiente configuradas
- [ ] Autenticação funcionando (testar com cURL)
- [ ] Rota API `/api/contaazul` respondendo
- [ ] Dashboard `/gestao/contaazul` exibindo dados
- [ ] Logs no console mostrando dados carregados

## 🎯 Próximos Passos

1. **Testar cada endpoint** individualmente
2. **Implementar cache** para melhorar performance
3. **Adicionar tratamento de erros** mais robusto
4. **Implementar renovação automática** de tokens
5. **Adicionar mais endpoints** conforme necessário

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Verifique os logs do servidor (Vercel)
3. Consulte a documentação oficial do Conta Azul
4. Teste a autenticação manualmente com cURL

