# 🔍 Diagnóstico do Erro "Application error"

## ⚠️ O Erro que Você Está Vendo

O erro "Application error: a client-side exception has occurred" indica que há um erro JavaScript no navegador. Para resolver, preciso ver o **erro real** do console.

## 📋 Passos para Diagnosticar

### 1. Abra o Console do Navegador

1. Pressione **F12** (ou **Ctrl+Shift+I**)
2. Vá na aba **Console**
3. Procure por erros em **vermelho**
4. **Clique com o botão direito** no erro → **Copy** → Cole aqui

### 2. Verifique se o Servidor Está Rodando

No terminal, você deve ver algo como:
```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
```

Se não estiver rodando, execute:
```powershell
npm run dev
```

### 3. Limpe o Cache do Navegador

1. Pressione **Ctrl + Shift + Delete**
2. Selecione "Cache" e "Cookies"
3. Limpe tudo
4. Tente novamente

### 4. Tente em Modo Anônimo

1. Abra uma janela anônima/privada (Ctrl+Shift+N)
2. Acesse: `http://localhost:3000`
3. Veja se o erro persiste

## 🛠️ Comandos para Limpar Manualmente

Se o script não funcionou, execute estes comandos **um por vez**:

```powershell
# Parar processos do Node.js
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpar cache do Next.js
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Limpar node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Limpar package-lock.json
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Limpar cache do npm
npm cache clean --force

# Reinstalar
npm install

# Executar
npm run dev
```

## 📝 O Que Preciso Ver

Para resolver o problema, preciso que você me envie:

1. **Erro completo do console do navegador** (F12 → Console → Copiar erro em vermelho)
2. **URL** que você está acessando
3. **Versão do Node.js**: `node --version`
4. **Versão do npm**: `npm --version`

## 🔍 Erros Comuns

### Erro: "Cannot find module"
```powershell
npm install
```

### Erro: "localStorage is not defined"
✅ Já corrigido - todos os componentes usam `'use client'`

### Erro: "useSearchParams must be wrapped in Suspense"
✅ Já corrigido em `app/(gestor)/registrar/page.tsx`

### Erro: "Hydration failed"
- Limpe o cache do navegador
- Tente em modo anônimo

## ⚡ Solução Rápida

Execute estes comandos na ordem:

```powershell
# 1. Parar servidor (Ctrl+C se estiver rodando)

# 2. Limpar tudo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 3. Reinstalar
npm install

# 4. Executar
npm run dev
```

Depois, abra o console do navegador (F12) e me envie o erro completo.


