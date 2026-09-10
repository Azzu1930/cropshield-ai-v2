'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface FarmerUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  preferred_language?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: FarmerUser | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    language?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      // 1. Check if Supabase session exists
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const sbUser = data.session.user;
            setUser({
              id: sbUser.id,
              name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Farmer',
              email: sbUser.email,
              phone: sbUser.phone || sbUser.user_metadata?.phone,
              preferred_language: sbUser.user_metadata?.preferred_language || 'en',
            });
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase getSession error:', err);
        }
      }

      // 2. Check localStorage for local/demo user session
      try {
        const saved = localStorage.getItem('cropshield_active_user');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch {
        // Ignore
      }

      setIsLoading(false);
    }

    initAuth();

    // Listen to Supabase auth changes if configured
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            const sbUser = session.user;
            const updatedUser: FarmerUser = {
              id: sbUser.id,
              name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Farmer',
              email: sbUser.email,
              phone: sbUser.phone || sbUser.user_metadata?.phone,
              preferred_language: sbUser.user_metadata?.preferred_language || 'en',
            };
            setUser(updatedUser);
            localStorage.setItem('cropshield_active_user', JSON.stringify(updatedUser));
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('cropshield_active_user');
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Login with Email or Mobile Phone
  const login = async (identifier: string, password = 'password123') => {
    setIsLoading(true);
    const cleanId = identifier.trim();

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const isEmail = cleanId.includes('@');
        let authResult;

        if (isEmail) {
          authResult = await supabase.auth.signInWithPassword({
            email: cleanId,
            password,
          });
        } else {
          // If phone number entered, format with country code or use as email alias if SMS not enabled
          const phoneFormatted = cleanId.startsWith('+') ? cleanId : `+91${cleanId}`;
          authResult = await supabase.auth.signInWithPassword({
            phone: phoneFormatted,
            password,
          });

          // Fallback if SMS provider isn't enabled in Supabase: try phone email alias
          if (authResult.error) {
            authResult = await supabase.auth.signInWithPassword({
              email: `${cleanId.replace(/\D/g, '')}@cropshield.farm`,
              password,
            });
          }
        }

        if (authResult.data?.user) {
          const sbUser = authResult.data.user;
          const loggedUser: FarmerUser = {
            id: sbUser.id,
            name: sbUser.user_metadata?.full_name || 'Farmer',
            email: sbUser.email,
            phone: sbUser.phone || sbUser.user_metadata?.phone,
            preferred_language: sbUser.user_metadata?.preferred_language || 'en',
          };
          setUser(loggedUser);
          localStorage.setItem('cropshield_active_user', JSON.stringify(loggedUser));
          setIsLoading(false);
          return { success: true };
        }

        if (authResult.error) {
          // If Supabase credentials failed, check if it's a locally registered user
          const localUsersRaw = localStorage.getItem('cropshield_registered_users');
          if (localUsersRaw) {
            const localUsers: any[] = JSON.parse(localUsersRaw);
            const found = localUsers.find(
              (u) => (u.email === cleanId || u.phone === cleanId) && u.password === password
            );
            if (found) {
              const localFarmer: FarmerUser = {
                id: found.id,
                name: found.name,
                email: found.email,
                phone: found.phone,
                preferred_language: found.language,
              };
              setUser(localFarmer);
              localStorage.setItem('cropshield_active_user', JSON.stringify(localFarmer));
              setIsLoading(false);
              return { success: true };
            }
          }

          setIsLoading(false);
          return { success: false, error: authResult.error.message };
        }
      } catch (err: any) {
        console.warn('Supabase login error, checking local fallback:', err);
      }
    }

    // 2. Offline / Local fallback login
    try {
      const localUsersRaw = localStorage.getItem('cropshield_registered_users');
      const localUsers: any[] = localUsersRaw ? JSON.parse(localUsersRaw) : [];
      const found = localUsers.find(
        (u) => (u.email === cleanId || u.phone === cleanId)
      );

      if (found) {
        const localFarmer: FarmerUser = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          preferred_language: found.language,
        };
        setUser(localFarmer);
        localStorage.setItem('cropshield_active_user', JSON.stringify(localFarmer));
        setIsLoading(false);
        return { success: true };
      }

      // Default fallback acceptance for demo convenience
      const newFarmer: FarmerUser = {
        id: `farmer-${Date.now()}`,
        name: cleanId.includes('@') ? cleanId.split('@')[0] : `Farmer (${cleanId})`,
        email: cleanId.includes('@') ? cleanId : null,
        phone: !cleanId.includes('@') ? cleanId : null,
      };
      setUser(newFarmer);
      localStorage.setItem('cropshield_active_user', JSON.stringify(newFarmer));
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please check credentials.' };
    }
  };

  // Register with Email or Phone Number
  const register = async (params: {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    language?: string;
  }) => {
    setIsLoading(true);
    const { name, email, phone, password = 'password123', language = 'en' } = params;

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        let signUpResult;

        if (email) {
          signUpResult = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name,
                phone: phone || '',
                preferred_language: language,
              },
            },
          });
        } else if (phone) {
          // If registering with phone, also create email alias so it works even if SMS gateway is off
          const phoneFormatted = phone.startsWith('+') ? phone : `+91${phone}`;
          signUpResult = await supabase.auth.signUp({
            email: `${phone.replace(/\D/g, '')}@cropshield.farm`,
            password,
            options: {
              data: {
                full_name: name,
                phone: phoneFormatted,
                preferred_language: language,
              },
            },
          });
        }

        if (signUpResult?.data?.user) {
          const sbUser = signUpResult.data.user;
          const newUser: FarmerUser = {
            id: sbUser.id,
            name,
            email: sbUser.email,
            phone: phone || sbUser.user_metadata?.phone,
            preferred_language: language,
          };
          setUser(newUser);
          localStorage.setItem('cropshield_active_user', JSON.stringify(newUser));

          // Also save to local registered users list
          saveToLocalUsers({ id: sbUser.id, name, email, phone, password, language });
          setIsLoading(false);
          return { success: true };
        }

        if (signUpResult?.error) {
          console.warn('Supabase sign up notice:', signUpResult.error);
        }
      } catch (err) {
        console.warn('Supabase signup error:', err);
      }
    }

    // 2. Offline / Local fallback registration
    const newId = `farmer-${Date.now()}`;
    const newUser: FarmerUser = {
      id: newId,
      name,
      email: email || null,
      phone: phone || null,
      preferred_language: language,
    };

    saveToLocalUsers({ id: newId, name, email, phone, password, language });
    setUser(newUser);
    localStorage.setItem('cropshield_active_user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const saveToLocalUsers = (record: any) => {
    try {
      const existingRaw = localStorage.getItem('cropshield_registered_users');
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      list.push(record);
      localStorage.setItem('cropshield_registered_users', JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  // Instant Demo Login
  const loginDemo = () => {
    const demoUser: FarmerUser = {
      id: 'demo-farmer-ramesh',
      name: 'Ramesh Patel',
      email: 'ramesh.patel@cropshield.org',
      phone: '9876543210',
      preferred_language: 'te',
      isDemo: true,
    };
    setUser(demoUser);
    localStorage.setItem('cropshield_active_user', JSON.stringify(demoUser));
  };

  // Log Out
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('cropshield_active_user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('farmChanged'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      loginDemo: () => {},
      logout: async () => {},
    };
  }
  return context;
}
