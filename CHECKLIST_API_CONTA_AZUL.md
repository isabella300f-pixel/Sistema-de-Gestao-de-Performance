# ✅ Checklist: Configuração da API Conta Azul

Use este checklist para configurar a integração passo a passo.

## 📋 Fase 1: Preparação (Portal do Conta Azul)

- [ ] **1.1** Acessar https://developers.contaazul.com/
- [ ] **1.2** Fazer login com conta do Conta Azul
- [ ] **1.3** Criar nova aplicação no portal
- [ ] **1.4** Anotar **Client ID**: `________________________`
- [ ] **1.5** Anotar **Client Secret**: `________________________`
- [ ] **1.6** Obter credenciais de teste (se disponível)
- [ ] **1.7** Anotar **Username**: `________________________`
- [ ] **1.8** Anotar **Password**: `________________________`

## 🔧 Fase 2: Configuração Local

- [ ] **2.1** Criar arquivo `.env.local` na raiz do projeto
- [ ] **2.2** Adicionar variável `CONTA_AZUL_CLIENT_ID`
- [ ] **2.3** Adicionar variável `CONTA_AZUL_CLIENT_SECRET`
- [ ] **2.4** Adicionar variável `CONTA_AZUL_USERNAME` (se tiver)
- [ ] **2.5** Adicionar variável `CONTA_AZUL_PASSWORD` (se tiver)
- [ ] **2.6** Verificar que `.env.local` está no `.gitignore`

## 🧪 Fase 3: Teste de Autenticação

- [ ] **3.1** Executar script de teste: `npm run test:contaazul`
- [ ] **3.2** Verificar se Password Grant funciona
- [ ] **3.3** Se não funcionar, verificar Client Credentials
- [ ] **3.4** Confirmar que token é obtido com sucesso
- [ ] **3.5** Verificar que busca de contas funciona
- [ ] **3.6** Verificar que busca de transações funciona

### Teste Manual (Alternativa)

- [ ] **3.7** Testar com cURL (ver `TESTE_API_CONTA_AZUL.md`)
- [ ] **3.8** Confirmar resposta JSON válida

## 🚀 Fase 4: Teste na Aplicação

- [ ] **4.1** Iniciar servidor: `npm run dev`
- [ ] **4.2** Acessar: `http://localhost:3000/gestao/contaazul`
- [ ] **4.3** Abrir console do navegador (F12)
- [ ] **4.4** Verificar logs de carregamento
- [ ] **4.5** Confirmar que dados aparecem na tela
- [ ] **4.6** Testar filtros de data (se aplicável)
- [ ] **4.7** Verificar que não há erros no console

## 🌐 Fase 5: Deploy (Vercel)

- [ ] **5.1** Acessar painel do Vercel
- [ ] **5.2** Ir em Settings > Environment Variables
- [ ] **5.3** Adicionar `CONTA_AZUL_CLIENT_ID`
- [ ] **5.4** Adicionar `CONTA_AZUL_CLIENT_SECRET`
- [ ] **5.5** Adicionar `CONTA_AZUL_USERNAME` (se tiver)
- [ ] **5.6** Adicionar `CONTA_AZUL_PASSWORD` (se tiver)
- [ ] **5.7** Fazer deploy: `git push origin main`
- [ ] **5.8** Verificar build no Vercel
- [ ] **5.9** Testar aplicação em produção
- [ ] **5.10** Verificar logs do Vercel (se houver erros)

## 🔍 Fase 6: Validação Final

- [ ] **6.1** Dados de contas aparecem corretamente
- [ ] **6.2** Dados de transações aparecem corretamente
- [ ] **6.3** Filtros funcionam (se aplicável)
- [ ] **6.4** Não há erros no console
- [ ] **6.5** Performance está adequada
- [ ] **6.6** Token é renovado automaticamente (se implementado)

## 🐛 Troubleshooting

Se algo não funcionar:

- [ ] Verificar credenciais no portal do Conta Azul
- [ ] Verificar variáveis de ambiente (local e Vercel)
- [ ] Verificar logs do console do navegador
- [ ] Verificar logs do servidor/Vercel
- [ ] Testar autenticação manualmente com cURL
- [ ] Consultar documentação: https://developers.contaazul.com/
- [ ] Verificar se a aplicação está ativa no portal

## 📝 Notas

**Data de conclusão**: `____/____/____`

**Problemas encontrados**:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Soluções aplicadas**:
```
_________________________________________________
_________________________________________________
_________________________________________________
```

## 📚 Documentação de Referência

- ✅ `GUIA_API_CONTA_AZUL.md` - Guia completo passo a passo
- ✅ `TESTE_API_CONTA_AZUL.md` - Comandos de teste
- ✅ `EXEMPLO_INTEGRACAO.md` - Exemplo de fluxo de dados
- ✅ `scripts/test-contaazul-api.js` - Script de teste automatizado

