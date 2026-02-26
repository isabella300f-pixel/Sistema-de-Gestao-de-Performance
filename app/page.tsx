'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authenticateUser, getAllUsers } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import Logo300F from '@/components/Logo300F';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';

const DEV_LOGIN = process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';

function LoginPageContent() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkingSession, setCheckingSession] = useState(!DEV_LOGIN);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const err = searchParams.get('error');
    if (err === 'auth') setError('Falha na autenticação. Tente novamente.');
  }, [searchParams]);

  // Em produção: ao carregar /, verificar sessão Supabase e preencher localStorage + redirecionar
  useEffect(() => {
    if (!mounted || DEV_LOGIN) {
      if (DEV_LOGIN) setCheckingSession(false);
      return;
    }
    let cancelled = false;
    getCurrentUser()
      .then((u) => {
        if (cancelled || !u) {
          if (!cancelled) setCheckingSession(false);
          return;
        }
        try {
          localStorage.setItem('currentUser', JSON.stringify({ id: u.id, name: u.name, email: u.email, role: u.role }));
          const routes: Record<string, string> = {
            gestor: '/gestor/dashboard',
            rh: '/rh/painel',
            gestao: '/gestao/dashboard',
            colaborador: '/colaborador/solicitacoes',
          };
          router.replace(routes[u.role] ?? '/colaborador/solicitacoes');
        } catch {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
    return () => { cancelled = true; };
  }, [mounted, router]);

  const redirectByRole = (role: string) => {
    const routes: Record<string, string> = {
      gestor: '/gestor/dashboard',
      rh: '/rh/painel',
      gestao: '/gestao/dashboard',
      colaborador: '/colaborador/solicitacoes',
    };
    router.replace(routes[role] ?? '/colaborador/solicitacoes');
  };

  const handleLoginDev = () => {
    if (!email || !password || !mounted || typeof window === 'undefined') {
      setError('Preencha todos os campos');
      return;
    }
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
      const { password: _, ...rest } = user;
      localStorage.setItem('currentUser', JSON.stringify(rest));
      document.cookie = `devUser=${encodeURIComponent(JSON.stringify({ id: user.id, role: user.role, name: user.name }))}; path=/; max-age=86400; SameSite=Lax`;
      setError('');
      setTimeout(() => redirectByRole(user.role), 50);
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleLoginSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Informe o email');
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setError('Sistema não configurado. Use modo dev (NEXT_PUBLIC_DEV_LOGIN=true).');
      return;
    }
    setLoading(true);
    setError('');
    setMagicLinkSent(false);

    if (password.trim()) {
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signError) {
        const msg = signError.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos.'
          : signError.message.toLowerCase().includes('database error') || signError.message.toLowerCase().includes('querying schema')
          ? 'Erro no servidor de autenticação (Supabase). Verifique os logs em Supabase → Logs → Auth ou crie o usuário pelo Dashboard (Authentication → Add user).'
          : signError.message;
        setError(msg);
        setLoading(false);
        return;
      }
      setLoading(false);
      window.location.href = '/';
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setMagicLinkSent(true);
  };

  const handleSelectUserDev = (u: { email: string; password: string; role: string; name: string; ativo?: boolean }) => {
    if (u.ativo === false) {
      setError('Usuário inativo.');
      return;
    }
    setEmail(u.email);
    setPassword(u.password);
    setError('');
  };

  if (!mounted || checkingSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Logo300F variant="dark" />
          <div className="mt-8 animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 min-h-[64px]">
          <div className="w-10 h-10 bg-ecosystem-red flex items-center justify-center rounded">
            <span className="text-white font-bold text-lg">300</span>
          </div>
          <Logo300F variant="light" size="small" />
        </div>
      </div>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <Logo300F className="mb-6" variant="dark" />
              <p className="text-2xl lg:text-3xl text-gray-300 font-light">
                Sistema de Gestão de Performance
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-2xl p-8 lg:p-10 border border-blue-500/50">
              <h2 className="text-2xl font-bold text-white mb-2">Acesso ao Sistema</h2>
              <p className="text-gray-400 mb-6">
                {DEV_LOGIN ? 'Modo dev: email + senha 4 dígitos' : 'Email e senha ou link por email'}
              </p>

              {error && (
                <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {magicLinkSent && (
                <div className="mb-4 bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm">
                  Link enviado para {email}. Verifique sua caixa de entrada.
                </div>
              )}

              {DEV_LOGIN ? (
                <>
                  {getAllUsers().length > 0 && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Seleção rápida (dev)</p>
                      <div className="flex flex-wrap gap-2">
                        {getAllUsers().slice(0, 8).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUserDev(u)}
                            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                          >
                            {u.name.split(' ')[0]} ({u.role})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Senha (4 dígitos)</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="0000"
                          maxLength={4}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-xl tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLoginDev}
                      disabled={!email || password.length !== 4}
                      className="w-full bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                    >
                      Entrar <ChevronRight size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleLoginSupabase} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Senha (deixe em branco para link por email)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? 'Aguarde...' : 'Entrar'} <ChevronRight size={20} />
                  </button>
                  <p className="text-center text-gray-500 text-sm">
                    Deixe a senha em branco e clique em Entrar para receber um link por email.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-ecosystem-red opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-ecosystem-red opacity-5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Logo300F variant="dark" />
        <div className="mt-8 animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red mx-auto" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
