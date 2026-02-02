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

---

## 📊 Dashboard zerado / Tabela Supabase vazia

Se o dashboard mostra **métricas em 0** e a tabela **registros_diarios** no Supabase está **vazia**, a aplicação não está conseguindo ler a planilha "Form_Responses". O número "Vendedores: 16" vem da lista de colaboradores (cadastro), não da planilha.

### O que configurar no Vercel

**1. Planilha (uma das opções):**

- **Opção A – API Google Sheets**  
  - `GOOGLE_SHEETS_API_KEY` = sua API Key (Google Cloud Console, Sheets API ativada)  
  - `SPREADSHEET_ID` = ID da planilha (da URL ao editar: `docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`)  
  - Opcional: `SHEET_RANGE=A:Z`

- **Opção B – URL publicada (sem API Key)**  
  - Veja o passo a passo abaixo: **"Como obter a URL publicada (Opção B)"**.

**2. Supabase (para sync e preencher a tabela):**

- `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto (Supabase → Project Settings → API)  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key  
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key  

**3. Depois:**  
- **Redeploy** no Vercel  
- Abrir a página **Gestão de Pessoas** (ou Registros Diários); a API vai buscar a planilha, sincronizar com o Supabase e os dados devem aparecer no dashboard e na tabela.

---

## Como obter a URL publicada (Opção B)

A aplicação já usa uma URL de planilha por padrão (está em `lib/sheet.ts`). Se a **sua** planilha "Form_Responses" for essa mesma, basta colar essa URL no Vercel.

### Se for a MESMA planilha que já está no código

No Vercel, crie a variável:

- **Nome:** `PUBLISHED_CSV_URL`  
- **Valor:**  
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vSzxCdngLexHYSEYbB1nsKqdYMzRmAAj0uamu1m92Ah--O-KfG53y1fD421oxroXYWeGbOJ23zBrXtw/pub?output=csv&gid=57736896`

Assim a produção usa explicitamente essa URL. Depois faça **Redeploy**.

### Se for OUTRA planilha (a sua "Form_Responses" é em outro arquivo/aba)

1. Abra a planilha no Google Sheets (a que tem os dados "Form_Responses").
2. **Arquivo** → **Compartilhar** → **Publicar na Web**.
3. Na janela que abrir:
   - Em **"Link"**, deixe em "Documento inteiro" ou escolha a **aba** onde estão os dados (ex.: "Form_Responses").
   - O formato que a aplicação usa é CSV. O Google não mostra "CSV" nessa tela; ele gera o link de publicação. Clique em **"Publicar"**.
4. Para obter a **URL em CSV**, use um destes jeitos:
   - **Jeito 1:** A URL que o Google mostra após publicar é algo como:  
     `https://docs.google.com/spreadsheets/d/e/XXXXX/pubhtml`  
     Troque **`pubhtml`** por **`pub?output=csv`** e, se precisar de uma aba específica, adicione **`&gid=ID_DA_ABA`**. O `gid` aparece na URL quando você clica na aba (ex.: `...edit#gid=123456789` → use `gid=123456789`).  
     **Exemplo de URL final:**  
     `https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv&gid=123456789`
   - **Jeito 2:** **Arquivo** → **Compartilhar** → **Publicar na Web** → em "Formato", se aparecer "Página da Web", mude para **"Valores separados por vírgula (.csv)"** (em algumas contas aparece). Copie a URL que o Google mostrar.
5. No Vercel, crie a variável:
   - **Nome:** `PUBLISHED_CSV_URL`  
   - **Valor:** a URL completa (ex.: `https://docs.google.com/.../pub?output=csv&gid=XXXXX`)
6. Faça **Redeploy** e teste de novo a página de Gestão de Pessoas.

**Resumo:** Se a planilha que você usa é a que já estava no código, use a URL que está em `lib/sheet.ts` no `PUBLISHED_CSV_URL`. Se for outra planilha, publique na web e monte a URL com `pub?output=csv` (e `&gid=...` se for uma aba específica).

