'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { getAllUsers, createUser, updateUser, deleteUser, generateRandomPassword, isValidPassword, getAllColaboradores } from '@/lib/data';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, X } from 'lucide-react';

export default function RHUsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [colaboradores, setColaboradores] = useState(getAllColaboradores());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'colaborador' as UserRole,
    area: 'Vendas',
    colaboradorId: '',
  });

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'rh') {
        router.push('/');
        return;
      }

      loadUsers();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        area: user.area || 'Vendas',
        colaboradorId: user.id,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: generateRandomPassword(),
        role: 'colaborador',
        area: 'Vendas',
        colaboradorId: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'colaborador',
      area: 'Vendas',
      colaboradorId: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      alert('Preencha nome e email');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('A senha é obrigatória para novos usuários');
      return;
    }

    if (formData.password && !isValidPassword(formData.password)) {
      alert('A senha deve conter exatamente 4 dígitos');
      return;
    }

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    try {
      if (editingUser) {
        // Atualizar usuário
        const updates: Partial<User> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          area: formData.area,
        };

        if (formData.password) {
          updates.password = formData.password;
        }

        updateUser(editingUser.id, updates);
      } else {
        // Criar novo usuário
        createUser(
          {
            name: formData.name,
            email: formData.email,
            password: formData.password || generateRandomPassword(),
            role: formData.role,
            area: formData.area,
            managedUsers: formData.role === 'gestor' ? [] : undefined,
          },
          currentUser?.id || 'rh-1'
        );
      }

      loadUsers();
      handleCloseModal();
      alert(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Verifique o console.');
    }
  };

  const handleDelete = (userId: string) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;

    try {
      deleteUser(userId);
      loadUsers();
      alert('Usuário desativado com sucesso!');
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      alert('Erro ao desativar usuário.');
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'gestor': return 'Gestor';
      case 'rh': return 'RH';
      case 'gestao': return 'Gestão';
      case 'colaborador': return 'Colaborador';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red mx-auto mb-4"></div>
          <p className="text-gray-300 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
          <p className="mt-2 text-gray-300">Crie e gerencie usuários do sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-ecosystem-red text-white px-6 py-3 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Perfil</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="all" className="bg-gray-800">Todos</option>
              <option value="gestor" className="bg-gray-800">Gestor</option>
              <option value="rh" className="bg-gray-800">RH</option>
              <option value="gestao" className="bg-gray-800">Gestão</option>
              <option value="colaborador" className="bg-gray-800">Colaborador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="card-white">
        <div className="card-white-header">
          <h2 className="text-lg font-semibold text-white">Usuários ({filteredUsers.length})</h2>
        </div>
        <div className="divide-y divide-blue-500/30">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-white">{user.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        user.role === 'gestor'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : user.role === 'rh'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                          : user.role === 'gestao'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {user.ativo === false && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/50">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-300">{user.email}</p>
                    {user.area && (
                      <p className="mt-1 text-xs text-gray-400">Área: {user.area}</p>
                    )}
                    {user.criadoEm && (
                      <p className="mt-1 text-xs text-gray-400">
                        Criado em: {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type={showPassword[user.id] ? 'text' : 'password'}
                        value={user.password}
                        readOnly
                        className="w-20 px-2 py-1 bg-gray-800 border border-blue-500/50 rounded text-white text-center text-sm"
                      />
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-md border border-blue-500/50"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md border border-red-500/50"
                      title="Desativar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="email@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Perfil *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="colaborador" className="bg-gray-800">Colaborador</option>
                  <option value="gestor" className="bg-gray-800">Gestor</option>
                  <option value="rh" className="bg-gray-800">RH</option>
                  <option value="gestao" className="bg-gray-800">Gestão</option>
                </select>
              </div>

              {formData.role === 'gestor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Área
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Ex: Vendas"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha (4 dígitos) {!editingUser && '*'}
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                      className="ml-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Gerar aleatória
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setFormData({ ...formData, password: value });
                    }
                  }}
                  maxLength={4}
                  placeholder={editingUser ? 'Deixe em branco para não alterar' : '0000'}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white text-center text-xl tracking-widest"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {editingUser ? 'Deixe em branco para manter a senha atual' : 'Digite apenas números (4 dígitos)'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold"
                >
                  {editingUser ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

