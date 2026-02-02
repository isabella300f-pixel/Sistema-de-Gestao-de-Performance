# 🔄 Configuração com Refresh Token (Recomendado)

## 🎯 Método Recomendado para Aplicações de Desenvolvimento

O Conta Azul recomenda usar **Authorization Basic + Refresh Token** para aplicações de desenvolvimento.

## 📋 Passo a Passo

### Passo 1: Obter Authorization Basic Header

No painel do Conta Azul, você verá um campo **"authorization"** com um valor como:
```
N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1
```

Este é o **Authorization Basic header** (base64 de `client_id:client_secret`).

### Passo 2: Obter Refresh Token

1. Faça login no Conta Azul usando OAuth 2.0
2. Na resposta, você receberá um `refresh_token`
3. Copie esse token

### Passo 3: Configurar Variáveis de Ambiente

#### Local (.env.local)

```env
# Authorization Basic Header (do painel)
CONTA_AZUL_BASIC_AUTH=Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1

# Refresh Token (obtido após primeiro login)
CONTA_AZUL_REFRESH_TOKEN=seu_refresh_token_aqui
```

#### Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Seu projeto → Settings → Environment Variables
3. Adicione:
   - `CONTA_AZUL_BASIC_AUTH` = `Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1`
   - `CONTA_AZUL_REFRESH_TOKEN` = `seu_refresh_token`
4. Marque: Production, Preview, Development
5. Salve

## 🔄 Como Funciona

1. **Primeira vez**: Você faz login e recebe `access_token` + `refresh_token`
2. **Próximas vezes**: Use o `refresh_token` para obter novo `access_token`
3. **Renovação automática**: O sistema renova automaticamente quando o token expira

## 🧪 Testar com cURL

```bash
curl --request POST \
  --url https://auth.contaazul.com/oauth2/token \
  --header 'Authorization: Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data grant_type=refresh_token \
  --data refresh_token=SEU_REFRESH_TOKEN_AQUI
```

## ✅ Vantagens

- ✅ Renovação automática de tokens
- ✅ Mais seguro que token manual
- ✅ Ideal para produção
- ✅ Não precisa fazer login toda vez

## ⚠️ Importante

- O `refresh_token` também pode expirar (geralmente após muito tempo sem uso)
- Se o refresh_token expirar, você precisará fazer login novamente
- Guarde o refresh_token em local seguro (variável de ambiente, não no código)

## 🔍 Troubleshooting

### Erro 401 ao usar refresh_token

**Causa**: Refresh token expirado ou inválido

**Solução**:
1. Obtenha um novo refresh_token fazendo login novamente
2. Atualize a variável `CONTA_AZUL_REFRESH_TOKEN`

### Authorization Basic inválido

**Causa**: Header incorreto ou credenciais mudaram

**Solução**:
1. Verifique o valor no painel do Conta Azul
2. Certifique-se de incluir "Basic " antes do valor base64
3. Atualize `CONTA_AZUL_BASIC_AUTH`

