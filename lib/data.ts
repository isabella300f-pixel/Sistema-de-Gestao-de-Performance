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

// Inicializar dados de exemplo baseados na planilha
export function initializeRegistrosDiarios() {
  if (registrosDiarios.length > 0) return; // Já inicializado
  
  // Dados baseados na planilha do Google Sheets
  const dadosPlanilha = [
    { data: '2025-07-16', diaSemana: 'Quarta', vendedor: 'JOSE MARTINS', ligacoes: 197, atendidas: 18, aberturas: 1, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-07-17', diaSemana: 'Quinta', vendedor: 'KAUAN SILVA', ligacoes: 111, atendidas: 8, aberturas: 0, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-07-18', diaSemana: 'Sexta', vendedor: 'FELIPE CARLO', ligacoes: 150, atendidas: 6, aberturas: 1, desqualificados: 1, formularios: 0, onlines: 0 },
    { data: '2025-07-19', diaSemana: 'Sábado', vendedor: 'FELIPE BAEZI', ligacoes: 128, atendidas: 18, aberturas: 0, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-07-20', diaSemana: 'Domingo', vendedor: 'DANILO MIRAN', ligacoes: 90, atendidas: 14, aberturas: 5, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-07-21', diaSemana: 'Segunda', vendedor: 'DAIANE MOREI', ligacoes: 102, atendidas: 6, aberturas: 1, desqualificados: 1, formularios: 0, onlines: 0 },
    { data: '2025-07-22', diaSemana: 'Terça', vendedor: 'LUIZ RIBEIRO', ligacoes: 130, atendidas: 9, aberturas: 2, desqualificados: 2, formularios: 1, onlines: 1 },
    { data: '2025-07-23', diaSemana: 'Quarta', vendedor: 'ENNIO BARROSO', ligacoes: 186, atendidas: 9, aberturas: 4, desqualificados: 4, formularios: 4, onlines: 4 },
    { data: '2025-07-24', diaSemana: 'Quinta', vendedor: 'THIAGO CASTRO', ligacoes: 49, atendidas: 9, aberturas: 4, desqualificados: 3, formularios: 3, onlines: 0 },
    { data: '2025-07-25', diaSemana: 'Sexta', vendedor: 'GUILHERME MACHADO', ligacoes: 135, atendidas: 5, aberturas: 1, desqualificados: 1, formularios: 1, onlines: 2 },
    { data: '2025-07-26', diaSemana: 'Sábado', vendedor: 'GABRIEL CUNHA', ligacoes: 146, atendidas: 10, aberturas: 0, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-07-27', diaSemana: 'Domingo', vendedor: 'RICHARD MICHAEL', ligacoes: 97, atendidas: 20, aberturas: 2, desqualificados: 2, formularios: 2, onlines: 0 },
    { data: '2025-07-28', diaSemana: 'Segunda', vendedor: 'JOSE MARTINS', ligacoes: 250, atendidas: 12, aberturas: 1, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-07-29', diaSemana: 'Terça', vendedor: 'ENNIO BARROSO', ligacoes: 191, atendidas: 11, aberturas: 3, desqualificados: 2, formularios: 2, onlines: 1 },
    { data: '2025-07-30', diaSemana: 'Quarta', vendedor: 'FELIPE CARLO', ligacoes: 119, atendidas: 3, aberturas: 1, desqualificados: 1, formularios: 1, onlines: 1 },
    { data: '2025-07-31', diaSemana: 'Quinta', vendedor: 'KAUAN SILVA', ligacoes: 150, atendidas: 7, aberturas: 0, desqualificados: 0, formularios: 0, onlines: 0 },
    { data: '2025-08-01', diaSemana: 'Sexta', vendedor: 'THIAGO CASTRO', ligacoes: 73, atendidas: 7, aberturas: 4, desqualificados: 2, formularios: 2, onlines: 2 },
    { data: '2025-08-02', diaSemana: 'Sábado', vendedor: 'GUILHERME MACHADO', ligacoes: 103, atendidas: 11, aberturas: 4, desqualificados: 4, formularios: 2, onlines: 2 },
  ];

  let registroIndex = 1;
  dadosPlanilha.forEach((item) => {
    const colaboradorId = getColaboradorIdByName(item.vendedor);
    // Ignorar registros sem colaborador correspondente
    if (colaboradorId) {
      registrosDiarios.push({
        id: `registro-${registroIndex++}`,
        colaboradorId,
        data: item.data,
        diaSemana: item.diaSemana,
        numeroLigacoes: item.ligacoes,
        ligacoesAtendidas: item.atendidas,
        numeroAberturas: item.aberturas,
        desqualificados: item.desqualificados > 0,
        numeroFormularios: item.formularios,
        numeroOnlines: item.onlines,
        callsAgendadas: 0,
        callsRealizadas: 0,
        testesVocacionais: 0,
        diagnosticos: 0,
      });
    }
  });
}

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

export function getAllRegistrosDiarios(): RegistroDiario[] {
  return registrosDiarios.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getRegistrosDiariosByDateRange(dataInicio: string, dataFim: string): RegistroDiario[] {
  return registrosDiarios
    .filter(r => {
      const dataRegistro = new Date(r.data);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      return dataRegistro >= inicio && dataRegistro <= fim;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getRegistrosDiariosByVendedor(vendedorNome: string): RegistroDiario[] {
  // Buscar colaborador pelo nome
  const colaborador = colaboradores.find(c => 
    c.name.toUpperCase().includes(vendedorNome.toUpperCase()) || 
    vendedorNome.toUpperCase().includes(c.name.toUpperCase())
  );
  
  if (!colaborador) return [];
  
  return registrosDiarios
    .filter(r => r.colaboradorId === colaborador.id)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export interface FiltroRegistrosDiarios {
  colaboradorId?: string;
  dataInicio?: string;
  dataFim?: string;
  diaSemana?: string;
  termoBusca?: string;
  colaboradorIds?: string[]; // para gestor: apenas IDs da equipe
}

/** Pesquisa na planilha (registros) e retorna apenas os registros que correspondem aos filtros. */
export function pesquisarRegistrosDiarios(filtros: FiltroRegistrosDiarios): RegistroDiario[] {
  let resultado = [...registrosDiarios];

  if (filtros.colaboradorIds && filtros.colaboradorIds.length > 0) {
    resultado = resultado.filter(r => filtros.colaboradorIds!.includes(r.colaboradorId));
  }

  if (filtros.colaboradorId) {
    resultado = resultado.filter(r => r.colaboradorId === filtros.colaboradorId);
  }

  if (filtros.dataInicio) {
    const inicio = new Date(filtros.dataInicio);
    resultado = resultado.filter(r => new Date(r.data) >= inicio);
  }

  if (filtros.dataFim) {
    const fim = new Date(filtros.dataFim);
    resultado = resultado.filter(r => new Date(r.data) <= fim);
  }

  if (filtros.diaSemana) {
    resultado = resultado.filter(r => r.diaSemana === filtros.diaSemana);
  }

  if (filtros.termoBusca && filtros.termoBusca.trim()) {
    const termo = filtros.termoBusca.toUpperCase().trim();
    resultado = resultado.filter(r => {
      const colab = colaboradores.find(c => c.id === r.colaboradorId);
      const nome = colab?.name?.toUpperCase() ?? '';
      return (
        nome.includes(termo) ||
        r.diaSemana.toUpperCase().includes(termo) ||
        String(r.numeroLigacoes).includes(filtros.termoBusca!.trim()) ||
        String(r.ligacoesAtendidas).includes(filtros.termoBusca!.trim()) ||
        String(r.numeroAberturas).includes(filtros.termoBusca!.trim()) ||
        String(r.numeroFormularios).includes(filtros.termoBusca!.trim()) ||
        String(r.numeroOnlines).includes(filtros.termoBusca!.trim())
      );
    });
  }

  return resultado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function createRegistroDiario(registro: Omit<RegistroDiario, 'id'>): RegistroDiario {
  const novo: RegistroDiario = {
    ...registro,
    id: `registro-${Date.now()}`,
  };
  registrosDiarios.push(novo);
  return novo;
}

// Função auxiliar para mapear nome do vendedor para ID do colaborador
function getColaboradorIdByName(nome: string): string | null {
  // Normalizar nomes para comparação
  const nomeNormalizado = nome.toUpperCase().trim();
  
  // Mapeamento direto baseado nos dados da planilha
  const mapeamento: Record<string, string> = {
    'JOSE MARTINS': 'colab-8',
    'JOSE ROBERTO MARTINS': 'colab-8',
    'KAUAN SILVA': 'colab-15',
    'KAUAN ALEIXO DA SILVA': 'colab-15',
    'FELIPE CARLO': 'colab-11',
    'FELIPE CARLO DO CARMO': 'colab-11',
    'FELIPE BAEZI': 'colab-5',
    'FELIPE JOSE BAEZI LAGES': 'colab-5',
    // 'DANILO MIRAN' e 'DANILO MIRANDA' não são colaboradores - serão ignorados
    'DAIANE MOREI': 'colab-9',
    'DAIANE DA SILVA MOREIRA': 'colab-9',
    'LUIZ RIBEIRO': 'colab-13',
    'LUIZ HENRIQUE RIBEIRO DA SILVA': 'colab-13',
    'ENNIO BARROSO': 'colab-10',
    'ENNIO MIRANDA BARROSO': 'colab-10',
    'THIAGO CASTRO': 'colab-14',
    'THIAGO DE FELIPE CASTRO': 'colab-14',
    'GUILHERME MACHADO': 'colab-7',
    'GUILHERME MACHADO DA SILVA': 'colab-7',
    'GABRIEL CUNHA': 'colab-6',
    'GABRIEL CUNHA BAEZI CARDOSO': 'colab-6',
    'RICHARD MICHAEL': 'colab-3',
    'RICHARD MICHAEL DA SILVA CASTRO': 'colab-3',
    'JAMILE RIBEIRO': 'colab-1',
    'RENATO FERREIRA': 'colab-2',
    'RENATO DE ALMEIDA FERREIRA': 'colab-2',
    'JOÃO CARRARO': 'colab-12',
    'JOÃO VICTOR RODRIGUES CARRARO': 'colab-12',
    'BARBARA SANTOS': 'colab-4',
    'BARBARA STEFANY DOS SANTOS MOREIRA': 'colab-4',
  };
  
  // Tentar mapeamento direto
  if (mapeamento[nomeNormalizado]) {
    return mapeamento[nomeNormalizado];
  }
  
  // Tentar busca parcial
  for (const [key, value] of Object.entries(mapeamento)) {
    if (nomeNormalizado.includes(key) || key.includes(nomeNormalizado)) {
      return value;
    }
  }
  
  // Buscar no array de colaboradores
  const colaborador = colaboradores.find(c => 
    c.name.toUpperCase().includes(nomeNormalizado) || 
    nomeNormalizado.includes(c.name.toUpperCase())
  );
  
  return colaborador?.id || null;
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

