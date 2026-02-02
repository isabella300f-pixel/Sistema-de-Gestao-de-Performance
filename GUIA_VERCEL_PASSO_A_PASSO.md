# 🚀 Guia Passo a Passo: Configurar Variáveis no Vercel

## 📋 Pré-requisitos

- ✅ Conta no Vercel (https://vercel.com)
- ✅ Projeto já conectado ao Vercel
- ✅ Token do Conta Azul ou credenciais OAuth

---

## 🎯 Passo 1: Acessar o Painel do Vercel

1. Abra seu navegador
2. Acesse: **https://vercel.com/dashboard**
3. Faça login com sua conta

---

## 🎯 Passo 2: Selecionar o Projeto

1. Na lista de projetos, encontre **"Perforemance 11"** (ou o nome do seu projeto)
2. **Clique no nome do projeto**

---

## 🎯 Passo 3: Acessar Settings (Configurações)

1. No menu superior do projeto, você verá várias abas:
   - Overview
   - Deployments
   - **Settings** ← Clique aqui
   - Analytics
   - etc.

2. **Clique em "Settings"**

---

## 🎯 Passo 4: Acessar Environment Variables

1. No menu lateral esquerdo dentro de Settings, você verá:
   - General
   - Domains
   - **Environment Variables** ← Clique aqui
   - Git
   - etc.

2. **Clique em "Environment Variables"**

---

## 🎯 Passo 5: Adicionar Variáveis

Agora você verá uma tela com:
- Lista de variáveis existentes (se houver)
- Botão **"Add New"** ou **"Add"** ou **"Create"**

### Opção A: Token Manual (Mais Rápido) ⚡

**Adicione esta variável:**

1. Clique em **"Add New"** (ou botão similar)
2. Preencha:
   ```
   Key (Nome): CONTA_AZUL_ACCESS_TOKEN
   Value (Valor): [cole aqui o token gerado no painel do Conta Azul]
   ```
3. Marque as caixas:
   - ☑ Production
   - ☑ Preview  
   - ☑ Development
4. Clique em **"Save"** ou **"Add"**

**Pronto!** Esta é a forma mais rápida.

---

### Opção B: Refresh Token (Recomendado) ⭐

**Adicione 2 variáveis:**

#### Variável 1: Authorization Basic

1. Clique em **"Add New"**
2. Preencha:
   ```
   Key: CONTA_AZUL_BASIC_AUTH
   Value: Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1
   ```
   *(Use o valor que aparece no painel do Conta Azul)*
3. Marque: ☑ Production ☑ Preview ☑ Development
4. Clique em **"Save"**

#### Variável 2: Refresh Token

1. Clique em **"Add New"** novamente
2. Preencha:
   ```
   Key: CONTA_AZUL_REFRESH_TOKEN
   Value: [cole aqui o refresh_token obtido]
   ```
3. Marque: ☑ Production ☑ Preview ☑ Development
4. Clique em **"Save"**

---

### Opção C: OAuth Completo 🚀

**Adicione 4 variáveis:**

1. **CONTA_AZUL_CLIENT_ID**
   - Value: `13i92mrduirpqcdctqp9q1vr9c` (ou seu client_id)

2. **CONTA_AZUL_CLIENT_SECRET**
   - Value: `3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep` (ou seu client_secret)

3. **CONTA_AZUL_USERNAME**
   - Value: `a948e6e2-47da-410e-9646-0019c66f1503@devportal.com` (ou seu username)

4. **CONTA_AZUL_PASSWORD**
   - Value: `a948e6e2-47da-410e-9646-0019c66f1503` (ou sua senha)

Para cada uma:
- Clique em "Add New"
- Preencha Key e Value
- Marque: ☑ Production ☑ Preview ☑ Development
- Clique em "Save"

---

## 🎯 Passo 6: Verificar Variáveis Adicionadas

Após adicionar, você verá uma lista com todas as variáveis:

```
✅ CONTA_AZUL_ACCESS_TOKEN        [Production, Preview, Development]
✅ CONTA_AZUL_BASIC_AUTH          [Production, Preview, Development]
✅ CONTA_AZUL_REFRESH_TOKEN       [Production, Preview, Development]
```

**Importante**: Os valores aparecem mascarados (****) por segurança.

---

## 🎯 Passo 7: Fazer Redeploy (Importante!)

As variáveis só são aplicadas em novos deploys. Você precisa:

### Opção 1: Redeploy Manual

1. Vá em **"Deployments"** (no menu superior)
2. Encontre o último deployment
3. Clique nos **3 pontinhos** (⋯) ao lado
4. Clique em **"Redeploy"**
5. Confirme

### Opção 2: Novo Push (Automático)

1. Faça qualquer mudança no código
2. Faça commit e push:
   ```bash
   git add .
   git commit -m "chore: atualizar variáveis de ambiente"
   git push origin main
   ```
3. O Vercel fará deploy automaticamente

---

## ✅ Passo 8: Verificar se Funcionou

1. Aguarde o deploy completar (2-5 minutos)
2. Acesse: `https://seu-projeto.vercel.app/gestao/contaazul`
3. Abra o console do navegador (F12)
4. Verifique os logs:
   - ✅ `Token obtido via...`
   - ✅ `Categorias carregadas: X`
   - ❌ Se aparecer erro 401, verifique as variáveis novamente

---

## 🐛 Troubleshooting

### Variável não aparece na lista

**Solução**: 
- Verifique se clicou em "Save"
- Recarregue a página
- Verifique se está na aba correta (Environment Variables)

### Deploy ainda mostra erro 401

**Solução**:
1. Verifique se as variáveis estão com os nomes corretos (case-sensitive)
2. Verifique se marcou Production, Preview e Development
3. Faça um redeploy após adicionar as variáveis
4. Verifique se o token não expirou

### Não consigo ver o valor da variável

**Normal!** Por segurança, o Vercel mascara os valores. Você só vê:
- O nome da variável
- Os ambientes onde está ativa
- Opção de editar/deletar

---

## 📸 Estrutura Visual da Tela

```
┌─────────────────────────────────────────┐
│  Vercel Dashboard                       │
├─────────────────────────────────────────┤
│  [Overview] [Deployments] [Settings] ←  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Settings                        │   │
│  ├─────────────────────────────────┤   │
│  │ General                         │   │
│  │ Domains                         │   │
│  │ Environment Variables ← CLIQUE  │   │
│  │ Git                             │   │
│  │ ...                             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Environment Variables                  │
├─────────────────────────────────────────┤
│                                         │
│  [Add New] ← CLIQUE AQUI               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Key: CONTA_AZUL_ACCESS_TOKEN    │   │
│  │ Value: [cole o token aqui]      │   │
│  │                                  │   │
│  │ ☑ Production                     │   │
│  │ ☑ Preview                        │   │
│  │ ☑ Development                    │   │
│  │                                  │   │
│  │        [Cancel]  [Save] ←        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🎯 Resumo Rápido

1. ✅ Acesse: https://vercel.com/dashboard
2. ✅ Seu projeto → Settings → Environment Variables
3. ✅ Add New → Adicione `CONTA_AZUL_ACCESS_TOKEN` = [seu token]
4. ✅ Marque: Production, Preview, Development
5. ✅ Save
6. ✅ Redeploy
7. ✅ Teste!

---

## 💡 Dica Pro

**Para testar rapidamente**, use a **Opção A (Token Manual)** primeiro. Depois, quando estiver funcionando, você pode migrar para **Opção B (Refresh Token)** que é mais robusta.

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:
1. Verifique os logs do deploy no Vercel
2. Verifique o console do navegador (F12)
3. Teste a API manualmente com cURL
4. Verifique se o token não expirou

**Tudo pronto!** 🚀

