import React, { createContext, useState, useEffect } from 'react';
import { User } from '@/types';

import { getCurrentUser, signOut, signIn, signUp, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; 
  signup: (email: string, password: string, name: string) => Promise<void>; 
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kullanıcı bilgilerini ve GRUPLARINI alan yardımcı fonksiyon
  const mapCognitoUserToSystemUser = async (cognitoUser: any) => {
    try {
      const attributes = await fetchUserAttributes();
      
      
      const session = await fetchAuthSession();
      const groups = session.tokens?.idToken?.payload['cognito:groups'] as string[] | undefined;
      
      const isAdmin = groups?.includes('Admins');
      

      const userEmail = attributes.email ?? cognitoUser.signInDetails?.loginId ?? '';
      
      return {
        id: cognitoUser.userId,
        email: userEmail,
        name: attributes.name ?? userEmail.split('@')[0] ?? cognitoUser.username,
        
        role: (isAdmin ? 'admin' : 'user') as 'admin' | 'user', 
        createdAt: new Date().toISOString(),
      };
    } catch {
      return {
        id: cognitoUser.userId,
        email: cognitoUser.signInDetails?.loginId ?? '',
        name: cognitoUser.signInDetails?.loginId?.split('@')[0] ?? 'Kullanıcı',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cognitoUser = await getCurrentUser();
        const mappedUser = await mapCognitoUserToSystemUser(cognitoUser);
        setUser(mappedUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn } = await signIn({ username: email, password });
      if (isSignedIn) {
        const cognitoUser = await getCurrentUser();
        const mappedUser = await mapCognitoUserToSystemUser(cognitoUser);
        setUser(mappedUser);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  
  const signup = async (email: string, password: string, name: string) => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login, 
        signup, 
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}