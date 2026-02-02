# Conta Azul + Supabase – Guia claro

Este documento explica como configurar **Conta Azul** e **Supabase** no projeto de forma objetiva.

---

## O que cada um faz

| Recurso | Função |
|--------|--------|
| **Conta Azul** | API que fornece dados financeiros (categorias, contas, resumo, fluxo de caixa, vendas). O dashboard em `/gestao/contaazul` consome essa API. |
| **Supabase** | Banco de dados onde a aplicação **guarda** dados: (1) registros diários (sync da planilha) e (2) **cache dos dados do Conta Azul**. Quando a API do Conta Azul está indisponível ou sem credenciais, o dashboard pode usar o último dado sincronizado no Supabase. |

---

## Passo 1: Variáveis de ambiente (Vercel)

No **Vercel** → projeto → **Settings** → **Environment Variables**, configure:

### Conta Azul (obrigatório para buscar dados da API)

| Nome | Valor | Onde obter |
|------|--------|------------|
| `CONTA_AZUL_CLIENT_ID` | `7ckuct0640c8g0uan8ptqdm70` | Já definido para o app de desenvolvimento |
| `CONTA_AZUL_CLIENT_SECRET` | `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u` | Idem |
| `CONTA_AZUL_REFRESH_TOKEN` | *(obtido uma vez pelo OAuth)* | Ver [Como obter o refresh_token](#como-obter-o-conta_azul_refresh_token) abaixo |

**Opcional** (evita recalcular o Basic no código):

| Nome | Valor |
|------|--------|
| `CONTA_AZUL_BASIC_AUTH` | `Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1` |

**Alternativa ao refresh_token** (se sua aplicação Conta Azul permitir password grant):

| Nome | Valor |
|------|--------|
| `CONTA_AZUL_USERNAME` | `a948e6e2-47da-410e-9646-0019c66f1503@devportal.com` |
| `CONTA_AZUL_PASSWORD` | `a948e6e2-47da-410e-9646-0019c66f1503` |

Detalhes: **[VARIAVEIS_CONTA_AZUL.md](./VARIAVEIS_CONTA_AZUL.md)**.

### Supabase (obrigatório para sync e cache)

| Nome | Valor | Onde obter |
|------|--------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(anon key)* | Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | *(service_role key)* | Project Settings → API → service_role (segredo) |

Sem essas variáveis, o sync da planilha para `registros_diarios` e o **sync dos dados do Conta Azul** para as tabelas `conta_azul_*` não funcionam.

---

## Passo 2: Criar tabelas no Supabase

No **Supabase** → **SQL Editor** → New query:

1. **Registros diários** (se ainda não criou):  
   Copie e execute o conteúdo de **[supabase/registros_diarios.sql](./supabase/registros_diarios.sql)**.

2. **Conta Azul (cache):**  
   Copie e execute o conteúdo de **[supabase/conta_azul.sql](./supabase/conta_azul.sql)**.

Isso cria as tabelas: `conta_azul_categories`, `conta_azul_accounts`, `conta_azul_summary`, `conta_azul_cashflow`, `conta_azul_sales`.

---

## Como obter o CONTA_AZUL_REFRESH_TOKEN

1. Abra no navegador (faça login na conta teste do ERP se pedido):
   ```
   https://auth.contaazul.com/oauth2/authorize?client_id=7ckuct0640c8g0uan8ptqdm70&redirect_uri=https://contaazul.com&response_type=code&scope=sales%20financial
   ```
2. Após autorizar, você será redirecionado para algo como `https://contaazul.com?code=XXXXXXXX`. Copie o valor de `code`.
3. No terminal (substitua `CODIGO_DA_URL` pelo code copiado):
   ```bash
   curl -X POST https://auth.contaazul.com/oauth2/token \
     -H "Authorization: Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code" \
     -d "code=CODIGO_DA_URL" \
     -d "redirect_uri=https://contaazul.com"
   ```
4. Na resposta JSON, copie o valor de **`refresh_token`** e use como valor da variável `CONTA_AZUL_REFRESH_TOKEN` no Vercel.

Guia completo: **[VARIAVEIS_CONTA_AZUL.md](./VARIAVEIS_CONTA_AZUL.md)**.

---

## Fluxo: API → Supabase

- Sempre que o dashboard (ou qualquer chamada a `/api/contaazul`) **busca dados na API do Conta Azul com sucesso**, a aplicação **grava esses dados no Supabase** (tabelas `conta_azul_*`). Não é preciso fazer nada manual para isso.
- Se a API falhar (401, 500 ou indisponível), a própria API e o dashboard tentam **ler do cache no Supabase** (`?source=cache`). Assim, o usuário pode continuar vendo o último dado sincronizado.
- Para ter cache útil, basta **uma vez** ter credenciais Conta Azul corretas e abrir o dashboard para que a primeira carga preencha o Supabase.

---

## Resumo rápido

1. **Vercel:** Configure `CONTA_AZUL_CLIENT_ID`, `CONTA_AZUL_CLIENT_SECRET`, `CONTA_AZUL_REFRESH_TOKEN` (ou USERNAME/PASSWORD) e as 3 variáveis do Supabase.
2. **Supabase:** Execute os SQLs `registros_diarios.sql` e `conta_azul.sql`.
3. **Deploy:** Faça redeploy no Vercel após alterar variáveis.
4. Acesse `/gestao/contaazul`; os dados serão buscados da API e, em seguida, sincronizados ao Supabase. Em falhas da API, o cache do Supabase será usado automaticamente quando houver dados.

Dúvidas sobre apenas Conta Azul: **[VARIAVEIS_CONTA_AZUL.md](./VARIAVEIS_CONTA_AZUL.md)**.
