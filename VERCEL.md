# Deploy no Vercel

## Variáveis de ambiente

Em **Settings → Environment Variables** do projeto Vercel, configure:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_DEV_LOGIN` | Não | `true` = login por seleção (dev); `false` ou omitido = Supabase Auth (produção) |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim (prod) | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim (prod) | Chave anon (pública) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim (prod) | Chave service_role (somente servidor; nunca expor no client) |

Opcionais (planilha; se não configurado, o Dashboard Executivo mostra "Planilha indisponível" em até ~8s):
- `PUBLISHED_CSV_URL` — URL pública do CSV da planilha (ex.: `.../pub?output=csv&gid=...`)
- ou `GOOGLE_SHEETS_API_KEY` + `SPREADSHEET_ID` (+ opcional `SHEET_RANGE`, padrão `A:Z`)

## Build

- **Build Command**: `npm run build` (padrão)
- **Output**: Next.js (App Router)
- **Node**: 18.x ou superior

Push para a branch `main` dispara o deploy automático.

## Supabase

1. Execute no SQL Editor do Supabase o arquivo **`supabase/ADD_NOVAS_BASES.sql`** (tabelas, RLS e Storage em um único script).
2. (Opcional) Execute `supabase/seed.sql` para dados de exemplo.
3. Veja `supabase/LEIA-ME_NOVAS_BASES.md` para detalhes.
3. Em Authentication → URL Configuration, adicione em **Redirect URLs**:  
   `https://seu-dominio.vercel.app/auth/callback`

## RLS

Nunca use `SUPABASE_SERVICE_ROLE_KEY` no browser. Use apenas em Route Handlers (ex.: criar usuário pelo RH). O client usa apenas `NEXT_PUBLIC_SUPABASE_ANON_KEY` com RLS ativo.
