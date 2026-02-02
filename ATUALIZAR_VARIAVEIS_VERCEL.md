# 🔄 Atualizar Variáveis no Vercel - Valores Corretos

## ⚠️ IMPORTANTE: Você precisa atualizar 2 variáveis!

Os valores que você colocou no Vercel estão diferentes dos valores reais da sua aplicação.

## 📋 Valores Corretos da Sua Aplicação

### ✅ Valores que estão CORRETOS (não precisa mudar):
- **CONTA_AZUL_USERNAME**: `a948e6e2-47da-410e-9646-0019c66f1503@devportal.com` ✅
- **CONTA_AZUL_PASSWORD**: `a948e6e2-47da-410e-9646-0019c66f1503` ✅

### ❌ Valores que precisam ser ATUALIZADOS:

1. **CONTA_AZUL_CLIENT_ID**
   - ❌ Valor atual (errado): `13i92mrduirpqcdctqp9q1vr9c`
   - ✅ Valor correto: `7ckuct0640c8g0uan8ptqdm70`

2. **CONTA_AZUL_CLIENT_SECRET**
   - ❌ Valor atual (errado): `3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep`
   - ✅ Valor correto: `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u`

---

## 🚀 Como Atualizar no Vercel

### Passo 1: Acessar Environment Variables

1. Acesse: https://vercel.com/dashboard
2. Seu projeto → **Settings** → **Environment Variables**

### Passo 2: Editar CONTA_AZUL_CLIENT_ID

1. Encontre `CONTA_AZUL_CLIENT_ID` na lista
2. Clique nos **3 pontinhos** (⋯) à direita
3. Clique em **Edit** ou **Update**
4. **Substitua o valor** por: `7ckuct0640c8g0uan8ptqdm70`
5. Clique em **Save**

### Passo 3: Editar CONTA_AZUL_CLIENT_SECRET

1. Encontre `CONTA_AZUL_CLIENT_SECRET` na lista
2. Clique nos **3 pontinhos** (⋯) à direita
3. Clique em **Edit** ou **Update**
4. **Substitua o valor** por: `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u`
5. Clique em **Save**

### Passo 4: Verificar as 4 Variáveis

Confirme que todas estão assim:

```
✅ CONTA_AZUL_CLIENT_ID = 7ckuct0640c8g0uan8ptqdm70
✅ CONTA_AZUL_CLIENT_SECRET = 1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u
✅ CONTA_AZUL_USERNAME = a948e6e2-47da-410e-9646-0019c66f1503@devportal.com
✅ CONTA_AZUL_PASSWORD = a948e6e2-47da-410e-9646-0019c66f1503
```

### Passo 5: Fazer Redeploy

Após atualizar, você precisa fazer redeploy:

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** (⋯) do último deploy
3. Clique em **Redeploy**
4. Aguarde 2-5 minutos

---

## ✅ Resumo Rápido

**O que fazer:**
1. ✅ Atualizar `CONTA_AZUL_CLIENT_ID` → `7ckuct0640c8g0uan8ptqdm70`
2. ✅ Atualizar `CONTA_AZUL_CLIENT_SECRET` → `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u`
3. ✅ Verificar que username e password estão corretos
4. ✅ Fazer redeploy

**Depois disso, a API deve funcionar!** 🎉

---

## 🧪 Teste Manual (Opcional)

Se quiser testar antes, você pode usar este cURL:

```bash
curl -X POST https://auth.contaazul.com/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=7ckuct0640c8g0uan8ptqdm70" \
  -d "client_secret=1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u" \
  -d "username=a948e6e2-47da-410e-9646-0019c66f1503@devportal.com" \
  -d "password=a948e6e2-47da-410e-9646-0019c66f1503"
```

Se retornar um `access_token`, está funcionando! ✅

