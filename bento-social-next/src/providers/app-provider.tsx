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
<<<<<<< HEAD
      <AuthProvider>{children}</AuthProvider>
=======
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
>>>>>>> origin/refactor-post
    </QueryProvider>
  );
}
