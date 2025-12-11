import { User, Colaborador, Avaliacao11, RegistroDiario, AvaliacaoRH } from '@/types';

// Armazenamento de usuários (simulando banco de dados)
// Inicializa com dados padrão e permite modificação em runtime
let usuarios: User[] = [
  {
    id: 'gestor-1',
    name: 'DANILO LOURENÇO TEIXEIRA DE MIRANDA',
    email: 'danilo@empresa.com',
    password: '1234',
    role: 'gestor',
    area: 'Vendas',
    managedUsers: ['colab-1', 'colab-2', 'colab-3'],
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'gestor-2',
    name: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    email: 'ricardo@empresa.com',
    password: '1234',
    role: 'gestor',
    area: 'Vendas',
    managedUsers: ['colab-10', 'colab-11', 'colab-12', 'colab-13', 'colab-14', 'colab-15'],
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'gestor-3',
    name: 'LEANDRO VIEIRA MARTINS',
    email: 'leandro@empresa.com',
    password: '1234',
    role: 'gestor',
    area: 'Vendas',
    managedUsers: ['colab-4', 'colab-5', 'colab-6', 'colab-7', 'colab-8', 'colab-9'],
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'gestor-4',
    name: 'VINICIUS BARRETO SILVA',
    email: 'vinicius@empresa.com',
    password: '1234',
    role: 'gestor',
    area: 'Vendas',
    managedUsers: ['colab-16'],
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'rh-1',
    name: 'Adriana',
    email: 'adriana@empresa.com',
    password: '1234',
    role: 'rh',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'rh-2',
    name: 'Beatriz',
    email: 'beatriz@empresa.com',
    password: '1234',
    role: 'rh',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'gestao-1',
    name: 'Diretoria',
    email: 'gestao@empresa.com',
    password: '1234',
    role: 'gestao',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-1',
    name: 'JAMILE RIBEIRO',
    email: 'jamile@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-2',
    name: 'RENATO DE ALMEIDA FERREIRA',
    email: 'renato@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-3',
    name: 'RICHARD MICHAEL DA SILVA CASTRO',
    email: 'richard@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-4',
    name: 'BARBARA STEFANY DOS SANTOS MOREIRA',
    email: 'barbara@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-5',
    name: 'FELIPE JOSE BAEZI LAGES',
    email: 'felipe.lages@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-6',
    name: 'GABRIEL CUNHA BAEZI CARDOSO',
    email: 'gabriel@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-7',
    name: 'GUILHERME MACHADO DA SILVA',
    email: 'guilherme@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-8',
    name: 'JOSE ROBERTO MARTINS',
    email: 'jose.martins@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-9',
    name: 'DAIANE DA SILVA MOREIRA',
    email: 'daiane@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-10',
    name: 'ENNIO MIRANDA BARROSO',
    email: 'ennio@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-11',
    name: 'FELIPE CARLO DO CARMO',
    email: 'felipe.carlo@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-12',
    name: 'JOÃO VICTOR RODRIGUES CARRARO',
    email: 'joao.victor@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-13',
    name: 'LUIZ HENRIQUE RIBEIRO DA SILVA',
    email: 'luiz.henrique@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-14',
    name: 'THIAGO DE FELIPE CASTRO',
    email: 'thiago@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-15',
    name: 'KAUAN ALEIXO DA SILVA',
    email: 'kauan@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'colab-16',
    name: 'ISSRAEL ANDRADE DE ALMEIDA',
    email: 'issrael@empresa.com',
    password: '1234',
    role: 'colaborador',
    area: 'Vendas',
    ativo: true,
    criadoEm: new Date().toISOString(),
  },
];

// Exportar array de usuários
export { usuarios };

// Colaboradores baseados na planilha
export const colaboradores: Colaborador[] = [
  // Gestor: DANILO LOURENÇO TEIXEIRA DE MIRANDA
  {
    id: 'colab-1',
    name: 'JAMILE RIBEIRO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-1',
    gestorNome: 'DANILO LOURENÇO TEIXEIRA DE MIRANDA',
    dataAdmissao: '2024-01-15',
    status: 'ativo',
  },
  {
    id: 'colab-2',
    name: 'RENATO DE ALMEIDA FERREIRA',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-1',
    gestorNome: 'DANILO LOURENÇO TEIXEIRA DE MIRANDA',
    dataAdmissao: '2024-02-01',
    status: 'ativo',
  },
  {
    id: 'colab-3',
    name: 'RICHARD MICHAEL DA SILVA CASTRO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-1',
    gestorNome: 'DANILO LOURENÇO TEIXEIRA DE MIRANDA',
    dataAdmissao: '2024-01-20',
    status: 'ativo',
  },
  // Gestor: LEANDRO VIEIRA MARTINS
  {
    id: 'colab-4',
    name: 'BARBARA STEFANY DOS SANTOS MOREIRA',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-3',
    gestorNome: 'LEANDRO VIEIRA MARTINS',
    dataAdmissao: '2024-02-10',
    status: 'ativo',
  },
  {
    id: 'colab-5',
    name: 'FELIPE JOSE BAEZI LAGES',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-3',
    gestorNome: 'LEANDRO VIEIRA MARTINS',
    dataAdmissao: '2024-01-05',
    status: 'ativo',
  },
  {
    id: 'colab-6',
    name: 'GABRIEL CUNHA BAEZI CARDOSO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-3',
    gestorNome: 'LEANDRO VIEIRA MARTINS',
    dataAdmissao: '2024-02-15',
    status: 'ativo',
  },
  {
    id: 'colab-7',
    name: 'GUILHERME MACHADO DA SILVA',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-3',
    gestorNome: 'LEANDRO VIEIRA MARTINS',
    dataAdmissao: '2024-01-10',
    status: 'ativo',
  },
  {
    id: 'colab-8',
    name: 'JOSE ROBERTO MARTINS',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-3',
    gestorNome: 'LEANDRO VIEIRA MARTINS',
    dataAdmissao: '2024-02-20',
    status: 'ativo',
  },
  {
    id: 'colab-9',
    name: 'DAIANE DA SILVA MOREIRA',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-3',
    gestorNome: 'LEANDRO VIEIRA MARTINS',
    dataAdmissao: '2024-01-25',
    status: 'ativo',
  },
  // Gestor: RICARDO SANGUINETE DE OLIVEIRA JUNIOR
  {
    id: 'colab-10',
    name: 'ENNIO MIRANDA BARROSO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-2',
    gestorNome: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    dataAdmissao: '2024-02-05',
    status: 'ativo',
  },
  {
    id: 'colab-11',
    name: 'FELIPE CARLO DO CARMO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-2',
    gestorNome: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    dataAdmissao: '2024-02-12',
    status: 'ativo',
  },
  {
    id: 'colab-12',
    name: 'JOÃO VICTOR RODRIGUES CARRARO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-2',
    gestorNome: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    dataAdmissao: '2024-01-30',
    status: 'ativo',
  },
  {
    id: 'colab-13',
    name: 'LUIZ HENRIQUE RIBEIRO DA SILVA',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-2',
    gestorNome: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    dataAdmissao: '2024-01-18',
    status: 'ativo',
  },
  {
    id: 'colab-14',
    name: 'THIAGO DE FELIPE CASTRO',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-2',
    gestorNome: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    dataAdmissao: '2024-02-08',
    status: 'ativo',
  },
  {
    id: 'colab-15',
    name: 'KAUAN ALEIXO DA SILVA',
    cargo: 'Vendedor de Franquia',
    area: 'Vendas',
    gestorId: 'gestor-2',
    gestorNome: 'RICARDO SANGUINETE DE OLIVEIRA JUNIOR',
    dataAdmissao: '2024-01-22',
    status: 'ativo',
  },
  // Gestor: VINICIUS BARRETO SILVA
  {
    id: 'colab-16',
    name: 'ISSRAEL ANDRADE DE ALMEIDA',
    cargo: 'Vendedor de Formatação',
    area: 'Vendas',
    gestorId: 'gestor-4',
    gestorNome: 'VINICIUS BARRETO SILVA',
    dataAdmissao: '2024-01-12',
    status: 'ativo',
  },
];

// Funções para acessar dados (simulando API)
export function getColaboradoresByGestor(gestorId: string): Colaborador[] {
  return colaboradores.filter(c => c.gestorId === gestorId && c.status === 'ativo');
}

export function getColaboradorById(id: string): Colaborador | undefined {
  return colaboradores.find(c => c.id === id);
}

export function getUserById(id: string): User | undefined {
  return usuarios.find(u => u.id === id);
}

// Armazenamento local (simulando banco de dados)
let avaliacoes11: Avaliacao11[] = [];
let registrosDiarios: RegistroDiario[] = [];
let avaliacoesRH: AvaliacaoRH[] = [];

export function getAvaliacoes11ByColaborador(colaboradorId: string): Avaliacao11[] {
  return avaliacoes11
    .filter(a => a.colaboradorId === colaboradorId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getAvaliacoes11ByGestor(gestorId: string): Avaliacao11[] {
  return avaliacoes11
    .filter(a => a.gestorId === gestorId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function createAvaliacao11(avaliacao: Omit<Avaliacao11, 'id' | 'createdAt' | 'updatedAt'>): Avaliacao11 {
  const nova: Avaliacao11 = {
    ...avaliacao,
    id: `avaliacao-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  avaliacoes11.push(nova);
  return nova;
}

export function updateAvaliacao11(id: string, updates: Partial<Avaliacao11>): Avaliacao11 | null {
  const index = avaliacoes11.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  avaliacoes11[index] = {
    ...avaliacoes11[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return avaliacoes11[index];
}

export function getAllAvaliacoes11(): Avaliacao11[] {
  return avaliacoes11.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getRegistrosDiariosByColaborador(colaboradorId: string): RegistroDiario[] {
  return registrosDiarios
    .filter(r => r.colaboradorId === colaboradorId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function createRegistroDiario(registro: Omit<RegistroDiario, 'id'>): RegistroDiario {
  const novo: RegistroDiario = {
    ...registro,
    id: `registro-${Date.now()}`,
  };
  registrosDiarios.push(novo);
  return novo;
}

export function getAvaliacoesRHByColaborador(colaboradorId: string): AvaliacaoRH[] {
  return avaliacoesRH
    .filter(a => a.colaboradorId === colaboradorId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function createAvaliacaoRH(avaliacao: Omit<AvaliacaoRH, 'id' | 'createdAt'>): AvaliacaoRH {
  const nova: AvaliacaoRH = {
    ...avaliacao,
    id: `rh-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  avaliacoesRH.push(nova);
  return nova;
}

export function getAllColaboradores(): Colaborador[] {
  return colaboradores;
}

// ========== FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ==========

// Buscar usuário por email e senha
export function authenticateUser(email: string, password: string): User | null {
  const user = usuarios.find(
    u => u.email === email && u.password === password && u.ativo !== false
  );
  return user || null;
}

// Buscar usuário por ID
export function getUserByEmail(email: string): User | undefined {
  return usuarios.find(u => u.email === email);
}

// Listar todos os usuários (para RH)
export function getAllUsers(): User[] {
  return usuarios.filter(u => u.ativo !== false);
}

// Criar novo usuário
export function createUser(userData: Omit<User, 'id' | 'criadoEm'>, criadoPor: string): User {
  const novoId = userData.role === 'gestor' 
    ? `gestor-${Date.now()}`
    : userData.role === 'rh'
    ? `rh-${Date.now()}`
    : userData.role === 'gestao'
    ? `gestao-${Date.now()}`
    : `colab-${Date.now()}`;

  const novoUsuario: User = {
    ...userData,
    id: novoId,
    password: userData.password || '1234', // Senha padrão se não fornecida
    ativo: userData.ativo !== false,
    criadoEm: new Date().toISOString(),
    criadoPor,
  };

  usuarios.push(novoUsuario);
  return novoUsuario;
}

// Atualizar usuário
export function updateUser(userId: string, updates: Partial<User>): User | null {
  const index = usuarios.findIndex(u => u.id === userId);
  if (index === -1) return null;

  usuarios[index] = {
    ...usuarios[index],
    ...updates,
  };

  return usuarios[index];
}

// Desativar/Ativar usuário
export function toggleUserStatus(userId: string): User | null {
  const user = usuarios.find(u => u.id === userId);
  if (!user) return null;

  user.ativo = !user.ativo;
  return user;
}

// Deletar usuário (soft delete - apenas desativa)
export function deleteUser(userId: string): boolean {
  const user = usuarios.find(u => u.id === userId);
  if (!user) return false;

  user.ativo = false;
  return true;
}

// Validar senha (4 dígitos)
export function isValidPassword(password: string): boolean {
  return /^\d{4}$/.test(password);
}

// Gerar senha aleatória de 4 dígitos
export function generateRandomPassword(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

