# 🔑 Configuração do Token Manual do Conta Azul

## ⚡ Configuração Rápida (Para Testes)

### Passo 1: Gerar Token no Painel

1. Acesse o portal do Conta Azul: https://developers.contaazul.com/
2. Vá para sua aplicação
3. Gere um Access Token manual no painel
4. **Copie o token** (ele só aparece uma vez!)

### Passo 2: Configurar no Projeto

#### Opção A: Arquivo `.env.local` (Local)

Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
# Token manual (para testes)
CONTA_AZUL_ACCESS_TOKEN=seu_token_aqui

# OU use OAuth (produção)
CONTA_AZUL_CLIENT_ID=seu_client_id
CONTA_AZUL_CLIENT_SECRET=seu_client_secret
CONTA_AZUL_USERNAME=seu_usuario@devportal.com
CONTA_AZUL_PASSWORD=sua_senha
```

#### Opção B: Vercel (Produção)

1. Acesse o painel do Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   - **Key**: `CONTA_AZUL_ACCESS_TOKEN`
   - **Value**: Cole o token gerado
   - **Environment**: Production, Preview, Development (marque todos)
4. Clique em **Save**
5. Faça um novo deploy: `git push origin main`

### Passo 3: Testar

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/gestao/contaazul`
3. Abra o console do navegador (F12)
4. Verifique os logs:
   - ✅ `Usando token manual fornecido`
   - ✅ `Categorias carregadas: X`
   - ✅ `Contas carregadas: X`

## 🎯 Como Funciona

O sistema tenta usar o token manual primeiro. Se não encontrar, tenta OAuth:

1. **Token Manual** (`CONTA_AZUL_ACCESS_TOKEN`) - Prioridade 1
2. **Password Grant** (username/password) - Prioridade 2
3. **Client Credentials** - Prioridade 3
4. **Authorization Code** - Prioridade 4

## ⚠️ Importante

### Token Manual (Para Testes)

- ✅ Funciona imediatamente
- ✅ Não precisa configurar OAuth
- ❌ Expira rápido
- ❌ Não renova automaticamente
- ❌ Não é ideal para produção

### OAuth (Para Produção)

- ✅ Renovação automática
- ✅ Mais seguro
- ✅ Ideal para produção
- ❌ Requer configuração mais complexa

## 🧪 Testar Endpoint Manualmente

```bash
# Substitua SEU_TOKEN pelo token gerado
curl -i -X GET 'https://api-v2.contaazul.com/v1/categorias' \
  -H 'Authorization: Bearer SEU_TOKEN'
```

## 📊 Endpoints Disponíveis

Com o token configurado, você pode acessar:

- `/api/contaazul?type=categories` - Categorias financeiras
- `/api/contaazul?type=accounts` - Contas financeiras
- `/api/contaazul?type=summary` - Resumo financeiro
- `/api/contaazul?type=cashflow&startDate=2026-01-01&endDate=2026-01-31` - Fluxo de caixa
- `/api/contaazul?type=sales&startDate=2026-01-01&endDate=2026-01-31` - Vendas

## 🐛 Troubleshooting

### Erro 401 (Unauthorized)

**Causa**: Token inválido ou expirado

**Solução**:
1. Gere um novo token no painel
2. Atualize a variável `CONTA_AZUL_ACCESS_TOKEN`
3. Reinicie o servidor

### Nenhum dado aparece

**Causa**: Token válido mas sem dados na conta

**Solução**:
1. Verifique se há dados na conta do Conta Azul
2. Verifique os logs no console do navegador
3. Teste o endpoint manualmente com cURL

### Token expira muito rápido

**Causa**: Tokens manuais expiram rapidamente

**Solução**:
- Para produção, implemente OAuth completo
- Para testes, gere um novo token quando necessário

## 📝 Exemplo Completo

```env
# .env.local
CONTA_AZUL_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Depois de configurar, acesse o dashboard e veja os dados aparecerem! 🎉

