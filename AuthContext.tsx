import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'student' | 'admin' | 'moderator') => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cc_token');
      if (token) {
        try {
          const u = await api.getCurrentUser();
          setUser(u);
        } catch (err) {
          console.warn('Session expired, logging in default student');
          localStorage.removeItem('cc_token');
          // Automatically initialize with demo student Alex Rivera for instant interaction!
          try {
            const res = await api.switchDemoRole('student');
            localStorage.setItem('cc_token', res.token);
            setUser(res.user);
          } catch {
            setUser(null);
          }
        }
      } else {
        // First visit: set up default student Alex Rivera session
        try {
          const res = await api.switchDemoRole('student');
          localStorage.setItem('cc_token', res.token);
          setUser(res.user);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('cc_token', res.token);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
      return true;
    } catch (err: any) {
      error(err.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await api.register(data);
      localStorage.setItem('cc_token', res.token);
      setUser(res.user);
      success(`Welcome to CampusConnect AI, ${res.user.name}!`);
      return true;
    } catch (err: any) {
      error(err.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setUser(null);
    success('You have been logged out.');
  };

  const switchRole = async (role: 'student' | 'admin' | 'moderator') => {
    try {
      const res = await api.switchDemoRole(role);
      localStorage.setItem('cc_token', res.token);
      setUser(res.user);
      success(`Switched role to ${res.user.name} (${res.user.role.toUpperCase()})`);
    } catch (err: any) {
      error('Failed to switch demo role');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const updated = await api.updateProfile(updates);
      setUser(updated);
      success('Profile updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
