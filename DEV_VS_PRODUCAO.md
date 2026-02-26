# Por que em dev carrega e em produção não?

## O que acontece

- **Em dev** (localhost): o Next.js lê o arquivo **`.env.local`** na sua máquina. As variáveis (`GOOGLE_SHEETS_API_KEY`, `SPREADSHEET_ID`, `PUBLISHED_CSV_URL`, etc.) existem e a API da planilha consegue buscar os dados. As telas funcionam.
- **Em produção** (Vercel): o **`.env.local` não vai para a Vercel** (ele fica no `.gitignore`). Na Vercel só existem as variáveis que você configurou em **Settings → Environment Variables**. Se essas variáveis da planilha **não** estiverem lá, a API em produção não tem como acessar a planilha (ou usa só a URL fixa do código, que pode falhar ou dar timeout a partir dos servidores da Vercel).

Resumindo: **em dev você usa variáveis do `.env.local`; em produção a Vercel só usa o que está nas Environment Variables do projeto.**

---

## O que fazer para a planilha carregar em produção

1. Abra o projeto na **Vercel** → **Settings** → **Environment Variables**.
2. Adicione **as mesmas variáveis** que você usa no `.env.local` para a planilha, por exemplo:
   - **`PUBLISHED_CSV_URL`** — URL pública do CSV da planilha (se você usa isso em dev), **ou**
   - **`GOOGLE_SHEETS_API_KEY`** e **`SPREADSHEET_ID`** (e, se usar, **`SHEET_RANGE`**).
3. Marque para **Production** (e, se quiser, Preview).
4. Salve e faça um **novo deploy** (Redeploy no último deploy ou um novo push na branch que a Vercel usa).

Depois disso, a API em produção passa a ter as mesmas informações que em dev e a planilha pode carregar normalmente.

---

## Como conferir o que você usa em dev

Abra o **`.env.local`** (na raiz do projeto) e veja quais destes nomes existem:

- `PUBLISHED_CSV_URL`
- `SHEET_CSV_URL`
- `GOOGLE_SHEETS_API_KEY`
- `SPREADSHEET_ID`
- `SHEET_RANGE`

Copie **nome e valor** de cada uma que estiver definida e crie as mesmas variáveis na Vercel (sem commitar o `.env.local` no Git).

---

## E as telas que “não funcionam” em produção?

Se além da planilha as **telas** em produção parecem erradas ou não carregam:

1. **Login**  
   Em produção o login é pelo **Supabase** (`NEXT_PUBLIC_DEV_LOGIN` deve ser `false` ou não existir). As variáveis do Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) também precisam estar configuradas na Vercel.

2. **Usuário após o login**  
   O app grava o usuário no `localStorage` depois do login com Supabase. Se as variáveis do Supabase estiverem erradas ou faltando, o login pode falhar e as telas protegidas não vão carregar direito.

3. **Navegação**  
   Já foram feitos ajustes (key por pathname, `prefetch={false}` nos links) para evitar que todas as telas pareçam a mesma em produção. Se ainda acontecer, pode ser cache do navegador: testar em aba anônima ou outro navegador.

---

## Resumo

| Onde      | Variáveis vêm de                    | Planilha e telas |
|----------|--------------------------------------|-------------------|
| **Dev**  | `.env.local` na sua máquina         | Funcionam         |
| **Prod** | Só o que está na Vercel (Env Vars)   | Só funcionam se você configurar as mesmas variáveis na Vercel e redeployar |

**Conclusão:** para produção se comportar como em dev, configure na Vercel as **mesmas** variáveis que você usa no `.env.local` (planilha + Supabase) e faça um novo deploy.
