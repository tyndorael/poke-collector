'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

import api from './api';
import { User, RegisterData } from '../types';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromCookies = async () => {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (accessToken) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error: unknown) {
          console.error('Error fetching profile with access token:', error);
          // Try to refresh token if access token is invalid
          if (refreshToken) {
            try {
              const res = await api.post('/auth/refresh', { refreshToken });
              Cookies.set('accessToken', res.data.accessToken, {
                expires: 1 / 24,
                secure: process.env.NODE_ENV === 'production',
              });
              Cookies.set('refreshToken', res.data.refreshToken, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
              });
              const profileRes = await api.get('/auth/profile');
              setUser(profileRes.data);
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              Cookies.remove('accessToken');
              Cookies.remove('refreshToken');
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            Cookies.remove('accessToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else if (refreshToken) {
        // If only refresh token exists, try to get a new access token
        try {
          const res = await api.post('/auth/refresh', { refreshToken });
          Cookies.set('accessToken', res.data.accessToken, {
            expires: 1 / 24,
            secure: process.env.NODE_ENV === 'production',
          });
          Cookies.set('refreshToken', res.data.refreshToken, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
          });
          const profileRes = await api.get('/auth/profile');
          setUser(profileRes.data);
          setIsAuthenticated(true);
        } catch (refreshError) {
          console.error('Error refreshing token on initial load:', refreshError);
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    loadUserFromCookies();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      Cookies.set('accessToken', accessToken, { expires: 1 / 24, secure: process.env.NODE_ENV === 'production' }); // 1 hour
      Cookies.set('refreshToken', refreshToken, { expires: 7, secure: process.env.NODE_ENV === 'production' }); // 7 days
      setUser(user);
      setIsAuthenticated(true);
      toast('Successfully logged in!');
      router.push('/dashboard');
    } catch (error: unknown) {
      let message = 'Error logging in';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast(message);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { accessToken, refreshToken, user } = response.data;
      Cookies.set('accessToken', accessToken, { expires: 1 / 24, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('refreshToken', refreshToken, { expires: 7, secure: process.env.NODE_ENV === 'production' });
      setUser(user);
      setIsAuthenticated(true);
      toast('Registration successful!');
      router.push('/dashboard');
    } catch (error: unknown) {
      let message = 'Error registering';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast(message);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      toast('Successfully logged out!');
      router.push('/login');
    } catch (error: unknown) {
      let message = 'Error logging out';
      if (error instanceof AxiosError && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
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
