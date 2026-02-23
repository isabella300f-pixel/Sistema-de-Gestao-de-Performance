'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/** Redireciona para o fluxo de Solicitações. O chat foi substituído pelo acompanhamento dentro de cada solicitação. */
export default function ColaboradorChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const solicitacaoId = searchParams.get('solicitacao');
    if (solicitacaoId) {
      router.replace(`/colaborador/solicitacoes/${solicitacaoId}`);
    } else {
      router.replace('/colaborador/solicitacoes');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-gray-500">Redirecionando para Solicitações...</p>
    </div>
  );
}
