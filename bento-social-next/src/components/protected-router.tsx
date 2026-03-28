'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { SplashScreen } from '@/components/loading-screen';
import { useAuth } from '@/context/auth-context';

//-----------------------------------------------------------------------------------------------

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      setIsCheckingAuth(false);
      return;
    }

    setIsCheckingAuth(false);
  }, [isAuthenticated, router]);

  if (isCheckingAuth || !isAuthenticated) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
