'use client';

import { useEffect, useState } from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ChartWrapper({ children, fallback }: ChartWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback || (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}


