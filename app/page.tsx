'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateUser, getAllUsers } from '@/lib/data';
import Logo300F from '@/components/Logo300F';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    if (!email || !password || !mounted || typeof window === 'undefined') {
      setError('Preencha todos os campos');
      return;
    }

    // Validar senha de 4 dígitos
    if (!/^\d{4}$/.test(password)) {
      setError('A senha deve conter exatamente 4 dígitos');
      return;
    }

    const user = authenticateUser(email, password);
    
    if (!user) {
      setError('Email ou senha incorretos');
      return;
    }

    if (user.ativo === false) {
      setError('Usuário inativo. Entre em contato com o RH.');
      return;
    }

    try {
      // Não salvar senha no localStorage
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      setError('');
      setTimeout(() => {
        if (user.role === 'gestor') {
          router.replace('/gestor/dashboard');
        } else if (user.role === 'rh') {
          router.replace('/rh/painel');
        } else if (user.role === 'gestao') {
          router.replace('/gestao/dashboard');
        } else if (user.role === 'colaborador') {
          router.replace('/colaborador/solicitacoes');
        }
      }, 50);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    if (value.length <= 4) {
      setPassword(value);
      setError('');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Logo300F variant="dark" />
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header Simples */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 min-h-[64px]">
          <div className="w-10 h-10 bg-ecosystem-red flex items-center justify-center">
            <span className="text-white font-bold text-lg">300</span>
          </div>
          <Logo300F variant="light" size="small" />
        </div>
      </div>

      {/* Hero Section - Centralizado */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Logo and Content */}
            <div className="text-white space-y-6">
              <Logo300F className="mb-6" variant="dark" />
              
              <div>
                <p className="text-2xl lg:text-3xl text-gray-300 font-light">
                  Sistema de Gestão de Performance
                </p>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-gray-900 rounded-lg shadow-2xl p-8 lg:p-10 border border-blue-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Acesso ao Sistema</h2>
                <p className="text-gray-400">Digite seu email e senha para continuar</p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin();
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Senha (4 dígitos):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="0000"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-center text-2xl tracking-widest"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLogin();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Digite apenas números (4 dígitos)</p>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={!email || !password || password.length !== 4}
                  className="w-full bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:bg-ecosystem-red-dark disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  Entrar
                  <ChevronRight size={20} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Sutil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-ecosystem-red opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-ecosystem-red opacity-5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
