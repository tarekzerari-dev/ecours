"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { teachersStore } from './store';

export type UserRole = 'superadmin' | 'manager' | 'teacher' | null;

interface AuthContextType {
  role: UserRole;
  isSuperAdmin: boolean;
  isManager: boolean;
  isTeacher: boolean;
  selectedTeacherId: string | null;
  setSelectedTeacherId: (id: string | null) => void;
  loggedTeacherId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loggedTeacherId, setLoggedTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setRole(null);
          return;
        }

        // Fetch real profile from DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, teacher_profiles(*), schools(*)')
          .eq('id', user.id)
          .single();

        if (profile) {
          setRole(profile.role as UserRole);
          
          if (profile.role === 'teacher' && profile.teacher_profiles?.[0]) {
            setLoggedTeacherId(profile.teacher_profiles[0].id);
          }
        } else {
          setRole(null);
        }
      } catch (err) {
        console.warn("Supabase auth error:", err);
        setRole(null);
      }
    };
    checkAuth();
  }, []);

  const isSuperAdmin = role === 'superadmin';
  const isManager = role === 'manager';
  const isTeacher = role === 'teacher';

  return (
    <AuthContext.Provider value={{ role, isSuperAdmin, isManager, isTeacher, selectedTeacherId, setSelectedTeacherId, loggedTeacherId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

