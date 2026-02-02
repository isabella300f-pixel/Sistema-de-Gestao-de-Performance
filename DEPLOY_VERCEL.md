# 🚀 Deploy no Vercel - Guia Rápido

## ✅ Sim! O push atualiza automaticamente

Quando você faz `git push origin main`, o Vercel:
1. Detecta o push automaticamente
2. Faz build do projeto
3. Faz deploy da nova versão
4. A aplicação fica atualizada! 🎉

## ⚠️ MAS: Você precisa configurar as variáveis de ambiente

O código vai funcionar, mas **sem as variáveis de ambiente configuradas no Vercel, a API não vai conseguir autenticar**.

## 📋 Passo a Passo Completo

### Passo 1: Configurar Variáveis de Ambiente no Vercel

1. **Acesse o painel do Vercel**
   - Vá para: https://vercel.com/dashboard
   - Faça login

2. **Selecione seu projeto**
   - Clique no projeto "Perforemance 11" (ou o nome do seu projeto)

3. **Vá em Settings**
   - No menu lateral, clique em **Settings**

4. **Vá em Environment Variables**
   - No menu lateral dentro de Settings, clique em **Environment Variables**

5. **Adicione as variáveis**

   #### Opção A: Token Manual (Mais Rápido para Testes)
   
   Clique em **Add New** e adicione:
   
   ```
   Name: CONTA_AZUL_ACCESS_TOKEN
   Value: [cole o token gerado no painel do Conta Azul]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```
   
   Clique em **Save**

   #### Opção B: OAuth Completo (Para Produção)
   
   Adicione todas essas variáveis:
   
   ```
   Name: CONTA_AZUL_CLIENT_ID
   Value: [seu client id]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```
   
   ```
   Name: CONTA_AZUL_CLIENT_SECRET
   Value: [seu client secret]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```
   
   ```
   Name: CONTA_AZUL_USERNAME
   Value: [seu username]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```
   
   ```
   Name: CONTA_AZUL_PASSWORD
   Value: [sua senha]
   Environment: ☑ Production ☑ Preview ☑ Development
   ```

### Passo 2: Fazer Push do Código

```bash
# Adicione as mudanças
git add .

# Commit
git commit -m "feat: integração com API Conta Azul com token manual"

# Push para main
git push origin main
```

### Passo 3: Aguardar Deploy

1. O Vercel vai detectar o push automaticamente
2. Você verá o deploy iniciando no painel do Vercel
3. Aguarde o build completar (geralmente 2-5 minutos)
4. Quando terminar, você verá: ✅ **Ready**

### Passo 4: Testar em Produção

1. Acesse a URL do seu projeto no Vercel
2. Vá para: `https://seu-projeto.vercel.app/gestao/contaazul`
3. Abra o console do navegador (F12)
4. Verifique os logs:
   - ✅ `Usando token manual fornecido`
   - ✅ `Categorias carregadas: X`

## 🔍 Verificar se Funcionou

### No Painel do Vercel

1. Vá em **Deployments**
2. Clique no último deployment
3. Veja os logs do build
4. Se houver erros, eles aparecerão aqui

### No Navegador

1. Acesse a aplicação
2. Abra o console (F12)
3. Vá para a aba **Network**
4. Procure por requisições para `/api/contaazul`
5. Veja se retornam status 200 (sucesso) ou 401 (erro de autenticação)

## 🐛 Troubleshooting

### Erro 401 após deploy

**Causa**: Variáveis de ambiente não configuradas ou token inválido

**Solução**:
1. Verifique se `CONTA_AZUL_ACCESS_TOKEN` está configurada no Vercel
2. Verifique se o token não expirou
3. Gere um novo token se necessário
4. Faça um novo deploy (ou aguarde o redeploy automático)

### Build falha no Vercel

**Causa**: Erro de TypeScript ou dependências

**Solução**:
1. Teste localmente primeiro: `npm run build`
2. Se funcionar local, o problema pode ser nas variáveis de ambiente
3. Verifique os logs do build no Vercel

### Variáveis não aparecem

**Causa**: Variáveis configuradas mas não aplicadas

**Solução**:
1. Após adicionar variáveis, faça um novo deploy
2. Ou vá em **Settings** > **Environment Variables** e clique em **Redeploy** para cada variável

## 📝 Checklist Rápido

Antes de fazer push, verifique:

- [ ] Código testado localmente (`npm run dev`)
- [ ] Build funciona localmente (`npm run build`)
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Token do Conta Azul válido (se usando token manual)
- [ ] Credenciais OAuth corretas (se usando OAuth)

Depois do push:

- [ ] Deploy completou com sucesso no Vercel
- [ ] Aplicação acessível na URL do Vercel
- [ ] Dashboard do Conta Azul carrega dados
- [ ] Console do navegador não mostra erros 401

## 🎯 Resumo

✅ **Sim, o push atualiza automaticamente!**

Mas você precisa:
1. ✅ Configurar variáveis de ambiente no Vercel
2. ✅ Fazer push do código
3. ✅ Aguardar deploy
4. ✅ Testar em produção

## 💡 Dica Pro

Para facilitar, você pode usar o mesmo token manual tanto localmente quanto no Vercel. Só configure a variável `CONTA_AZUL_ACCESS_TOKEN` nos dois lugares:

- **Local**: `.env.local`
- **Vercel**: Environment Variables no painel

Assim funciona igual nos dois ambientes! 🚀

