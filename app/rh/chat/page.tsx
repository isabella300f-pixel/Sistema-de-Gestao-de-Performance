'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redireciona para Solicitações. O antigo Chat foi substituído pelo fluxo de Solicitações. */
export default function RHChatPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/rh/solicitacoes');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-gray-500">Redirecionando para Solicitações...</p>
    </div>
  );
}
