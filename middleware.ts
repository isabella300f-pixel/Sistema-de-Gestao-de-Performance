import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const DEV_LOGIN = process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Em dev com seleção de usuário, não usar Supabase session para redirecionar
  if (DEV_LOGIN) {
    const rolePaths: Record<string, string> = {
      gestor: '/gestor/dashboard',
      rh: '/rh/painel',
      gestao: '/gestao/dashboard',
      colaborador: '/colaborador/solicitacoes',
    };
    const roleByPath = (p: string) => {
      if (p.startsWith('/gestor')) return 'gestor';
      if (p.startsWith('/rh')) return 'rh';
      if (p.startsWith('/gestao')) return 'gestao';
      if (p.startsWith('/colaborador')) return 'colaborador';
      return null;
    };
    if (path === '/' || path.startsWith('/auth')) return response;
    const needRole = roleByPath(path);
    if (needRole) {
      // Proteção por role em dev é feita no layout de cada portal (localStorage)
      return response;
    }
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session && path !== '/' && !path.startsWith('/auth')) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (session && path === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    const role = profile?.role ?? 'colaborador';
    const redirects: Record<string, string> = {
      gestor: '/gestor/dashboard',
      rh: '/rh/painel',
      gestao: '/gestao/dashboard',
      colaborador: '/colaborador/solicitacoes',
    };
    url.pathname = redirects[role] ?? '/colaborador/solicitacoes';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
