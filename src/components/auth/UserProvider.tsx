/**
 * @fileoverview User provider component for authentication context
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from '@/types/user';
import { useAuth } from './AuthContext';

interface UserContextType {
  user: User | null;
  checkCredits: (amount: number) => boolean;
  availableCredits: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user } = useAuth();

  const availableCredits = user?.admin?.availableCredits || 0;

  const checkCredits = (amount: number) => {
    return availableCredits >= amount;
  };

  const value: UserContextType = {
    user,
    checkCredits,
    availableCredits,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
