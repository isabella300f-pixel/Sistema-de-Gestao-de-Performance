# ✅ Checklist: Configurar Variáveis no Vercel

Use este checklist para não esquecer nenhum passo!

## 📋 Antes de Começar

- [ ] Tenho acesso ao painel do Vercel
- [ ] Sei qual projeto preciso configurar
- [ ] Tenho o token do Conta Azul ou credenciais OAuth

## 🚀 Passo a Passo

### Acesso

- [ ] Acessei https://vercel.com/dashboard
- [ ] Fiz login com minha conta
- [ ] Encontrei meu projeto na lista
- [ ] Cliquei no nome do projeto

### Navegação

- [ ] Cliquei em **Settings** (no menu superior)
- [ ] Cliquei em **Environment Variables** (no menu lateral)

### Configuração

- [ ] Decidi qual opção usar:
  - [ ] Opção A: Token Manual (CONTA_AZUL_ACCESS_TOKEN)
  - [ ] Opção B: Refresh Token (CONTA_AZUL_BASIC_AUTH + CONTA_AZUL_REFRESH_TOKEN)
  - [ ] Opção C: OAuth Completo (4 variáveis)

### Adicionar Variáveis

- [ ] Cliquei em **Add New**
- [ ] Preenchi o **Key** (nome da variável)
- [ ] Colei o **Value** (valor)
- [ ] Marquei ☑ **Production**
- [ ] Marquei ☑ **Preview**
- [ ] Marquei ☑ **Development**
- [ ] Cliquei em **Save**
- [ ] Repeti para todas as variáveis necessárias

### Verificação

- [ ] Verifiquei que as variáveis aparecem na lista
- [ ] Confirmei que estão marcadas para Production, Preview e Development
- [ ] Anotei quais variáveis foram adicionadas

### Redeploy

- [ ] Fiz redeploy manual OU
- [ ] Fiz push de uma mudança no código
- [ ] Aguardei o deploy completar (2-5 minutos)

### Teste

- [ ] Acessei a aplicação em produção
- [ ] Abri o console do navegador (F12)
- [ ] Verifiquei os logs:
  - [ ] ✅ Token obtido com sucesso
  - [ ] ✅ Dados carregados
  - [ ] ❌ Sem erros 401

## 🎯 Variáveis Adicionadas

Anote aqui quais variáveis você adicionou:

```
[ ] CONTA_AZUL_ACCESS_TOKEN
[ ] CONTA_AZUL_BASIC_AUTH
[ ] CONTA_AZUL_REFRESH_TOKEN
[ ] CONTA_AZUL_CLIENT_ID
[ ] CONTA_AZUL_CLIENT_SECRET
[ ] CONTA_AZUL_USERNAME
[ ] CONTA_AZUL_PASSWORD
```

## ✅ Resultado Final

- [ ] API funcionando corretamente
- [ ] Dashboard carregando dados
- [ ] Sem erros no console
- [ ] Tudo funcionando em produção!

## 📝 Notas

**Data de configuração**: `____/____/____`

**Problemas encontrados**:
```
_________________________________________________
_________________________________________________
```

**Soluções aplicadas**:
```
_________________________________________________
_________________________________________________
```

---

**Tudo certo?** 🎉 Agora sua API está funcionando!

