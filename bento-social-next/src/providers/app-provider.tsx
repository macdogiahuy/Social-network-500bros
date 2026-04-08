import { AuthProvider } from '@/context/auth-context';
import QueryProvider from '@/providers/query-provider/query-provider';
import { SocketProvider } from '@/providers/socket-provider';
import React from 'react';

//-------------------------------------------------------------------------------------------

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
