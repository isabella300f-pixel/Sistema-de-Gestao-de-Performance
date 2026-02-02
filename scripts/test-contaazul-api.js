/**
 * Script de teste para API do Conta Azul
 * 
 * Uso:
 * node scripts/test-contaazul-api.js
 * 
 * Ou com variáveis de ambiente:
 * CONTA_AZUL_CLIENT_ID=xxx CONTA_AZUL_CLIENT_SECRET=yyy node scripts/test-contaazul-api.js
 */

const CONTA_AZUL_AUTH_URL = 'https://auth.contaazul.com/oauth2/token';
const CONTA_AZUL_BASE_URL = 'https://api.contaazul.com/v1';

// Credenciais (use variáveis de ambiente ou substitua aqui)
const CLIENT_ID = process.env.CONTA_AZUL_CLIENT_ID || '13i92mrduirpqcdctqp9q1vr9c';
const CLIENT_SECRET = process.env.CONTA_AZUL_CLIENT_SECRET || '3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep';
const USERNAME = process.env.CONTA_AZUL_USERNAME || 'a948e6e2-47da-410e-9646-0019c66f1503@devportal.com';
const PASSWORD = process.env.CONTA_AZUL_PASSWORD || 'a948e6e2-47da-410e-9646-0019c66f1503';

async function testPasswordGrant() {
  console.log('\n🔐 Testando Password Grant...');
  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: USERNAME,
      password: PASSWORD,
    });

    const response = await fetch(CONTA_AZUL_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password Grant: SUCESSO');
      console.log(`   Token: ${data.access_token.substring(0, 20)}...`);
      return data.access_token;
    } else {
      console.log('❌ Password Grant: FALHOU');
      console.log(`   Status: ${response.status}`);
      console.log(`   Erro:`, data);
      return null;
    }
  } catch (error) {
    console.log('❌ Password Grant: ERRO');
    console.log(`   ${error.message}`);
    return null;
  }
}

async function testClientCredentials() {
  console.log('\n🔐 Testando Client Credentials...');
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const response = await fetch(CONTA_AZUL_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Client Credentials: SUCESSO');
      console.log(`   Token: ${data.access_token.substring(0, 20)}...`);
      return data.access_token;
    } else {
      console.log('❌ Client Credentials: FALHOU');
      console.log(`   Status: ${response.status}`);
      console.log(`   Erro:`, data);
      return null;
    }
  } catch (error) {
    console.log('❌ Client Credentials: ERRO');
    console.log(`   ${error.message}`);
    return null;
  }
}

async function testGetAccounts(accessToken) {
  console.log('\n📊 Testando busca de contas...');
  try {
    const response = await fetch(`${CONTA_AZUL_BASE_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Busca de contas: SUCESSO');
      console.log(`   Contas encontradas: ${Array.isArray(data.accounts) ? data.accounts.length : 'N/A'}`);
      if (Array.isArray(data.accounts) && data.accounts.length > 0) {
        console.log(`   Primeira conta: ${data.accounts[0].name} - R$ ${data.accounts[0].balance}`);
      }
      return data;
    } else {
      console.log('❌ Busca de contas: FALHOU');
      console.log(`   Status: ${response.status}`);
      console.log(`   Erro:`, data);
      return null;
    }
  } catch (error) {
    console.log('❌ Busca de contas: ERRO');
    console.log(`   ${error.message}`);
    return null;
  }
}

async function testGetTransactions(accessToken) {
  console.log('\n💰 Testando busca de transações...');
  try {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const url = `${CONTA_AZUL_BASE_URL}/transactions?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Busca de transações: SUCESSO');
      console.log(`   Transações encontradas: ${Array.isArray(data.transactions) ? data.transactions.length : 'N/A'}`);
      return data;
    } else {
      console.log('❌ Busca de transações: FALHOU');
      console.log(`   Status: ${response.status}`);
      console.log(`   Erro:`, data);
      return null;
    }
  } catch (error) {
    console.log('❌ Busca de transações: ERRO');
    console.log(`   ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Teste da API Conta Azul');
  console.log('=' .repeat(50));
  console.log(`Client ID: ${CLIENT_ID.substring(0, 20)}...`);
  console.log(`Username: ${USERNAME}`);
  
  // Testar Password Grant primeiro
  let token = await testPasswordGrant();
  
  // Se falhar, tentar Client Credentials
  if (!token) {
    token = await testClientCredentials();
  }
  
  // Se conseguiu token, testar endpoints
  if (token) {
    await testGetAccounts(token);
    await testGetTransactions(token);
    
    console.log('\n✅ Testes concluídos!');
    console.log('=' .repeat(50));
  } else {
    console.log('\n❌ Não foi possível obter token. Verifique as credenciais.');
    console.log('=' .repeat(50));
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPasswordGrant, testClientCredentials, testGetAccounts, testGetTransactions };

