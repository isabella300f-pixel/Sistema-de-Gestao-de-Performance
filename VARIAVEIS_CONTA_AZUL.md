# Variáveis de ambiente – Conta Azul

Para o Dashboard Conta Azul gerar dados corretamente, configure as variáveis no **Vercel** (ou no `.env.local` em desenvolvimento) exatamente como abaixo.

---

## Opção recomendada: Refresh Token (aplicação de desenvolvimento)

Na documentação do Conta Azul, para a aplicação de **desenvolvimento** é indicado usar apenas a etapa de **Refresh Token**. Ou seja: você precisa **obter um refresh_token uma vez** e depois usar só ele.

### Variáveis obrigatórias no Vercel

| Nome | Valor | Observação |
|------|--------|------------|
| `CONTA_AZUL_CLIENT_ID` | `7ckuct0640c8g0uan8ptqdm70` | client_id do app (já configurado) |
| `CONTA_AZUL_CLIENT_SECRET` | `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u` | client_secret do app (já configurado) |
| `CONTA_AZUL_REFRESH_TOKEN` | *(obtido no passo abaixo)* | **Você ainda precisa gerar este valor** |

### Como obter o `CONTA_AZUL_REFRESH_TOKEN` (uma vez)

1. **Abrir a URL de autorização no navegador** (faça login com a conta teste do ERP):
   ```
   https://auth.contaazul.com/oauth2/authorize?client_id=7ckuct0640c8g0uan8ptqdm70&redirect_uri=https://contaazul.com&response_type=code&scope=sales%20financial
   ```
   - Usuário: `a948e6e2-47da-410e-9646-0019c66f1503@devportal.com`
   - Senha: `a948e6e2-47da-410e-9646-0019c66f1503`

2. **Após autorizar**, você será redirecionado para algo como:
   ```
   https://contaazul.com?code=XXXXXXXX
   ```
   Copie o valor de `code` da URL (só o código, sem `code=`).

3. **Trocar o código por tokens** (no terminal, substitua `CODIGO_DA_URL` pelo code copiado):
   ```bash
   curl --request POST \
     --url https://auth.contaazul.com/oauth2/token \
     --header 'Authorization: Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1' \
     --header 'Content-Type: application/x-www-form-urlencoded' \
     --data grant_type=authorization_code \
     --data code=CODIGO_DA_URL \
     --data redirect_uri=https://contaazul.com
   ```

4. **Na resposta JSON** você receberá algo como:
   ```json
   {
     "access_token": "eyJ...",
     "refresh_token": "XXXXXXXX",
     "expires_in": 3600,
     ...
   }
   ```
   Copie o valor de **`refresh_token`**.

5. **No Vercel**: em **Settings → Environment Variables**, crie:
   - **Key:** `CONTA_AZUL_REFRESH_TOKEN`
   - **Value:** o valor de `refresh_token` que você colou no passo 4
   - Marque **Production**, **Preview** e **Development**
   - Salve e faça um novo deploy (ou “Redeploy”) da aplicação.

Depois disso, a aplicação usará `CONTA_AZUL_REFRESH_TOKEN` + `CONTA_AZUL_CLIENT_ID` + `CONTA_AZUL_CLIENT_SECRET` para obter o `access_token` e carregar os dados do Conta Azul.

---

## Opção alternativa: usuário e senha (Password Grant)

Se a sua aplicação no portal Conta Azul permitir **password grant**, você pode usar as 4 variáveis abaixo (sem precisar gerar refresh_token manualmente):

| Nome | Valor |
|------|--------|
| `CONTA_AZUL_CLIENT_ID` | `7ckuct0640c8g0uan8ptqdm70` |
| `CONTA_AZUL_CLIENT_SECRET` | `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u` |
| `CONTA_AZUL_USERNAME` | `a948e6e2-47da-410e-9646-0019c66f1503@devportal.com` |
| `CONTA_AZUL_PASSWORD` | `a948e6e2-47da-410e-9646-0019c66f1503` |

**Observação:** para a aplicação de desenvolvimento (DEV-Isabella), a documentação indica usar **Refresh Token**. Se der 401 com essas 4 variáveis, use a opção com `CONTA_AZUL_REFRESH_TOKEN` acima.

---

## Resumo – como deve estar no Vercel

**Método recomendado (Refresh Token):**

1. `CONTA_AZUL_CLIENT_ID` = `7ckuct0640c8g0uan8ptqdm70`
2. `CONTA_AZUL_CLIENT_SECRET` = `1h2btu9k06lefqmu8ql47fdskjfqrldup0u2bjep2akrbal4ea5u`
3. `CONTA_AZUL_REFRESH_TOKEN` = *(valor obtido pelo fluxo OAuth acima)*

**Opcional (evitar recalcular o Basic):**

4. `CONTA_AZUL_BASIC_AUTH` = `Basic N2NrdWN0MDY0MGM4ZzB1YW44cHRxZG03MDoxaDJidHU5azA2bGVmcW11OHFsNDdmZHNramZxcmxkdXAwdTJiamVwMmFrcmJhbDRlYTV1`

**Não é necessário** configurar `CONTA_AZUL_ACCESS_TOKEN` para uso normal; ele só é usado se você quiser colar um token manual (por exemplo para teste).

Depois de salvar as variáveis no Vercel, faça um **Redeploy** para que elas passem a valer na próxima execução.
