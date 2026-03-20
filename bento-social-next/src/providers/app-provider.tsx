import { AuthProvider } from '@/context/auth-context';
import { SocketProvider } from '@/context/socket-context';
import { ThemeProvider } from '@/context/theme-context';
import QueryProvider from '@/providers/query-provider/query-provider';
import React from 'react';

//-------------------------------------------------------------------------------------------

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>{children}</SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
