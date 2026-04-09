'use client';

import React from 'react';

import { getUserProfile } from '@/apis/user';
import { IUserProfile } from '@/interfaces/user';
import { useQuery, useQueryClient } from 'react-query';

//-----------------------------------------------------------------------------------------------

interface UserProfileContextType {
  userProfile: IUserProfile | null;
  setUserProfile: (profile: IUserProfile) => void;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = React.createContext<
  UserProfileContextType | undefined
>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: userProfile = null, isLoading: loading, error, refetch } = useQuery(
    ['userProfile'],
    () => getUserProfile().then((r) => r.data),
    {
      retry: 1,
      staleTime: 60_000,
    }
  );

  const setUserProfile = (profile: IUserProfile) => {
    queryClient.setQueryData(['userProfile'], profile);
  };

  const refreshProfile = async () => {
    await refetch();
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        loading,
        error: error as Error | null,
        setUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = React.useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
