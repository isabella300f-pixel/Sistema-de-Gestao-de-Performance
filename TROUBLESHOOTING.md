# 🔧 Guia de Solução de Problemas

## Erro: "Application error: a client-side exception has occurred"

### Passos para Diagnosticar:

1. **Abra o Console do Navegador**
   - Pressione `F12` ou `Ctrl+Shift+I`
   - Vá na aba "Console"
   - Procure por erros em vermelho
   - Copie a mensagem de erro completa

2. **Limpe o Cache e Reinstale**
   ```bash
   # Parar o servidor (Ctrl+C)
   
   # Deletar cache
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules
   
   # Reinstalar dependências
   npm install
   
   # Executar novamente
   npm run dev
   ```

3. **Verifique se todas as dependências estão instaladas**
   ```bash
   npm list react react-dom next recharts lucide-react react-hook-form
   ```

### Correções Aplicadas:

✅ **useSearchParams com Suspense**: Corrigido em `app/(gestor)/registrar/page.tsx`
✅ **Layout usando Link do Next.js**: Corrigido em `components/Layout.tsx`
✅ **Error Boundary**: Criado em `app/error.tsx`
✅ **Storage seguro**: Criado utilitário em `lib/storage.ts`

### Avisos do Webpack (NÃO são erros):

Os avisos sobre `PackFileCacheStrategy` são comuns no Windows e **não impedem** a aplicação de funcionar. Eles são relacionados a:
- Case sensitivity no Windows
- Cache do webpack
- Resolução de módulos

**Você pode ignorá-los** - eles não causam erros funcionais.

### Se o Erro Persistir:

1. Verifique o console do navegador e me envie a mensagem de erro completa
2. Verifique se está acessando a URL correta: `http://localhost:3000`
3. Tente acessar em modo anônimo/privado do navegador
4. Verifique se há extensões do navegador interferindo

### Comandos Úteis:

```bash
# Verificar versões
node --version
npm --version

# Limpar tudo e reinstalar
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run dev

# Verificar erros de TypeScript
npx tsc --noEmit
```


