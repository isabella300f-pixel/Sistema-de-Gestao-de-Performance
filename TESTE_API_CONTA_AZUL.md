# 🧪 Guia de Teste da API Conta Azul

## Teste Manual com cURL

### 1. Testar Autenticação (Password Grant)

```bash
curl -X POST https://auth.contaazul.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=13i92mrduirpqcdctqp9q1vr9c" \
  -d "client_secret=3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep" \
  -d "username=a948e6e2-47da-410e-9646-0019c66f1503@devportal.com" \
  -d "password=a948e6e2-47da-410e-9646-0019c66f1503"
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "..."
}
```

### 2. Testar Autenticação (Client Credentials)

```bash
curl -X POST https://auth.contaazul.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=13i92mrduirpqcdctqp9q1vr9c" \
  -d "client_secret=3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep"
```

### 3. Buscar Contas (usando o token obtido)

```bash
# Substitua ACCESS_TOKEN pelo token obtido no passo 1 ou 2
curl -X GET https://api.contaazul.com/v1/accounts \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Buscar Transações

```bash
curl -X GET "https://api.contaazul.com/v1/transactions?start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Teste na Aplicação

### 1. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` existe e contém:

```env
CONTA_AZUL_CLIENT_ID=13i92mrduirpqcdctqp9q1vr9c
CONTA_AZUL_CLIENT_SECRET=3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep
CONTA_AZUL_USERNAME=a948e6e2-47da-410e-9646-0019c66f1503@devportal.com
CONTA_AZUL_PASSWORD=a948e6e2-47da-410e-9646-0019c66f1503
```

### 2. Testar Rota API Localmente

```bash
# Iniciar servidor
npm run dev

# Em outro terminal, testar a rota
curl http://localhost:3000/api/contaazul?type=accounts
```

### 3. Verificar Logs

Abra o console do navegador (F12) e verifique:
- ✅ Token obtido com sucesso
- ✅ Dados retornados da API
- ❌ Erros de autenticação
- ❌ Erros de requisição

## Troubleshooting

### Erro: "invalid_client"

**Causa**: Client ID ou Secret incorretos

**Solução**: 
1. Verifique as credenciais no portal do Conta Azul
2. Certifique-se de que copiou corretamente (sem espaços)

### Erro: "invalid_grant"

**Causa**: Tipo de autenticação não suportado ou credenciais inválidas

**Solução**:
1. Tente usar Password Grant primeiro (conta de teste)
2. Se não funcionar, verifique se a aplicação está configurada corretamente

### Erro: 401 em todas as requisições

**Causa**: Token inválido ou expirado

**Solução**:
1. Obtenha um novo token
2. Verifique se o token está sendo enviado no header `Authorization: Bearer TOKEN`

### Nenhum dado retornado

**Causa**: Pode não haver dados no período ou conta de teste vazia

**Solução**:
1. Verifique se há dados na conta do Conta Azul
2. Tente um período maior
3. Verifique os logs para ver o que a API está retornando

