# 🔍 Diagnóstico de Problemas

## ⚠️ Avisos do Webpack (NÃO são erros)

Os avisos que você está vendo são **normais no Windows** e **não impedem** a aplicação de funcionar. Eles ocorrem porque:

- O Windows não diferencia maiúsculas/minúsculas em caminhos
- O webpack espera caminhos com letras minúsculas (`E:\lanza\projetos\`)
- Mas encontra com maiúsculas (`E:\Lanza\Projetos\`)

**Você pode ignorá-los completamente** - eles não causam problemas funcionais.

## ❌ Erro Real: "Application error: a client-side exception has occurred"

Este é o erro que precisa ser resolvido. Para diagnosticar:

### 1. Abra o Console do Navegador
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá na aba **Console**
- Procure por erros em **vermelho**
- **Copie a mensagem de erro completa**

### 2. Limpe Tudo e Reinstale

```powershell
# Parar o servidor (Ctrl+C)

# Deletar cache e node_modules
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Reinstalar
npm install

# Executar novamente
npm run dev
```

### 3. Verifique se o Servidor Está Rodando

Acesse: `http://localhost:3000`

Se não abrir, verifique:
- O servidor está rodando?
- A porta 3000 está livre?
- Há algum erro no terminal?

### 4. Erros Comuns e Soluções

#### Erro: "Cannot find module"
```bash
npm install
```

#### Erro: "localStorage is not defined"
✅ Já corrigido - todos os componentes usam `'use client'`

#### Erro: "useSearchParams must be wrapped in Suspense"
✅ Já corrigido em `app/(gestor)/registrar/page.tsx`

#### Erro: "Hydration failed"
- Limpe o cache do navegador
- Tente em modo anônimo

### 5. Se Nada Funcionar

Envie:
1. **Mensagem de erro completa** do console do navegador
2. **URL** que você está acessando
3. **Qual página** está causando o erro
4. **Versão do Node.js**: `node --version`
5. **Versão do npm**: `npm --version`

## 🛠️ Comandos Úteis

```powershell
# Verificar versões
node --version
npm --version

# Limpar tudo
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run dev

# Verificar erros de TypeScript
npx tsc --noEmit

# Verificar se há processos usando a porta 3000
netstat -ano | findstr :3000
```


