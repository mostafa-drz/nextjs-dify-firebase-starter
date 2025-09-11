'use client';

import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

/**
 * UserProvider - Legacy wrapper for backward compatibility
 * Now delegates to the new AuthProvider for cleaner separation
 */

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

/**
 * useUser - Legacy hook for backward compatibility
 * Now delegates to the new useAuth hook
 */
export const useUser = useAuth;
