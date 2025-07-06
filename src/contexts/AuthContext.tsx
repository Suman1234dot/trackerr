import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { DatabaseService } from '../services/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    // Initialize default users if not exists
    DatabaseService.initializeDefaultUsers();
    
    // Check for remembered user
    const rememberedToken = localStorage.getItem('syncink_remember_token');
    if (rememberedToken) {
      const userData = localStorage.getItem('syncink_user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    }
    
    setIsLoading(false);
  };

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = DatabaseService.authenticateUser(credentials.email, credentials.password);
    
    if (foundUser) {
      // Update last login
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      DatabaseService.updateUser(updatedUser);
      
      setUser(updatedUser);
      
      if (credentials.rememberMe) {
        const token = btoa(`${foundUser.id}:${Date.now()}`);
        localStorage.setItem('syncink_remember_token', token);
        localStorage.setItem('syncink_user_data', JSON.stringify(updatedUser));
      }
      
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('syncink_remember_token');
    localStorage.removeItem('syncink_user_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};