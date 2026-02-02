# ⚡ Configuração Rápida - API Conta Azul

## 🎯 3 Formas de Configurar (Escolha uma)

### Opção 1: Token Manual (Mais Rápido) ⚡

```env
CONTA_AZUL_ACCESS_TOKEN=seu_token_gerado_no_painel
```

**Vantagem**: Funciona imediatamente  
**Desvantagem**: Expira rápido, precisa renovar manualmente

---

### Opção 2: Refresh Token (Recomendado) ⭐

```env
CONTA_AZUL_BASIC_AUTH=Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1
CONTA_AZUL_REFRESH_TOKEN=seu_refresh_token_aqui
```

**Vantagem**: Renovação automática, ideal para produção  
**Desvantagem**: Precisa obter refresh_token primeiro

---

### Opção 3: OAuth Completo (Produção) 🚀

```env
CONTA_AZUL_CLIENT_ID=seu_client_id
CONTA_AZUL_CLIENT_SECRET=seu_client_secret
CONTA_AZUL_USERNAME=seu_usuario@devportal.com
CONTA_AZUL_PASSWORD=sua_senha
```

**Vantagem**: Fluxo completo OAuth  
**Desvantagem**: Mais complexo de configurar

---

## 📝 Onde Configurar

### Local (Desenvolvimento)
Crie/edite `.env.local` na raiz do projeto

### Vercel (Produção)
1. Acesse: https://vercel.com/dashboard
2. Seu projeto → Settings → Environment Variables
3. Adicione as variáveis
4. Marque: Production, Preview, Development
5. Salve e faça redeploy

## ✅ Testar

1. Configure uma das opções acima
2. Reinicie o servidor: `npm run dev`
3. Acesse: `http://localhost:3000/gestao/contaazul`
4. Abra o console (F12) e verifique:
   - ✅ `Token obtido via...`
   - ✅ `Categorias carregadas: X`

## 🐛 Erro 401?

1. Verifique se a variável está configurada corretamente
2. Verifique se o token não expirou
3. Verifique os logs no console do navegador
4. Teste manualmente com cURL (veja guias específicos)

## 📚 Guias Detalhados

- **[Token Manual](./CONFIGURACAO_TOKEN_MANUAL.md)** - Configuração passo a passo
- **[Refresh Token](./CONFIGURACAO_REFRESH_TOKEN.md)** - Método recomendado
- **[Deploy Vercel](./DEPLOY_VERCEL.md)** - Como fazer deploy

