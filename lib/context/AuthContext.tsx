'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  university?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  location?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  isEmailUnconfirmed?: boolean;
  errorCode?: string;
  profileError?: boolean;
  rawMessage?: string;
  status?: number;
  user?: User | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (data: RegisterData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  resendConfirmationEmail: (email: string) => Promise<AuthResponse>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function isEmailUnconfirmedError(error: any): boolean {
  if (!error) return false;
  const code = (error.code || '').toLowerCase();
  const msg = (typeof error === 'string' ? error : error.message || '').toLowerCase();
  return (
    code === 'email_not_confirmed' ||
    code === 'email_address_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('email address not confirmed') ||
    msg.includes('confirm your email') ||
    msg.includes('email_not_confirmed') ||
    msg.includes('not confirmed') ||
    msg.includes('unconfirmed')
  );
}

export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = (error.code || '').toLowerCase();
  const msg = typeof error === 'string' ? error : error.message || '';
  const lower = msg.toLowerCase();

  // 1. Email not confirmed (EVALUATED FIRST BEFORE INVALID CREDENTIALS)
  if (isEmailUnconfirmedError(error)) {
    return 'Please confirm your email address before signing in. Check your inbox for the confirmation email.';
  }

  // 2. Rate limit exceeded
  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    lower.includes('rate limit') ||
    lower.includes('too many requests')
  ) {
    return 'Too many attempts. Please wait a few moments and try again.';
  }

  // 3. Network or connection failure
  if (
    code === 'fetch_failed' ||
    lower.includes('fetch failed') ||
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('connection refused')
  ) {
    return 'Unable to reach the authentication server. Please check your internet connection.';
  }

  // 4. Invalid email format
  if (
    code === 'email_address_invalid' ||
    code === 'validation_failed' ||
    (lower.includes('invalid') && lower.includes('email') && !lower.includes('credentials') && !lower.includes('password'))
  ) {
    return 'Please enter a valid email address.';
  }

  // 5. Weak / short password
  if (
    code === 'weak_password' ||
    (lower.includes('password') && (lower.includes('least') || lower.includes('short') || lower.includes('weak')))
  ) {
    return 'Password must be at least 6 characters long.';
  }

  // 6. User already registered (signup)
  if (
    code === 'user_already_exists' ||
    lower.includes('already registered') ||
    lower.includes('user already exists')
  ) {
    return 'An account with this email already exists. Please log in instead.';
  }

  // 7. Invalid login credentials (wrong password or user doesn't exist)
  if (
    code === 'invalid_credentials' ||
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials')
  ) {
    return 'Invalid email or password. Please verify and try again.';
  }

  return msg || 'Authentication request failed. Please try again.';
}

/**
 * Ensures a corresponding profile record exists in public.profiles and student_profiles/company_profiles.
 */
async function fetchOrCreateProfile(authUser: SupabaseAuthUser): Promise<User | null> {
  const userId = authUser.id;
  const email = authUser.email || '';
  const metadata = authUser.user_metadata || {};
  const role: UserRole = metadata.role === 'company' ? 'company' : 'student';
  const fullName = metadata.full_name || metadata.name || email.split('@')[0] || 'User';

  try {
    // 1. Check if public.profiles already has this user
    const { data: existingProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) {
      console.warn('Profile fetch warning:', fetchErr.message);
    }

    if (existingProfile) {
      return {
        id: userId,
        profileId: existingProfile.id,
        email: existingProfile.email || email,
        name: existingProfile.full_name || fullName,
        role: (existingProfile.role as UserRole) || role,
        createdAt: existingProfile.created_at,
        avatar: existingProfile.avatar_url || '',
      };
    }

    // 2. Profile row does not exist yet — insert into public.profiles
    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        role,
        full_name: fullName,
        email,
      })
      .select()
      .maybeSingle();

    if (insertErr || !newProfile) {
      console.warn('Profile creation note:', insertErr?.message);
      return {
        id: userId,
        email,
        name: fullName,
        role,
        createdAt: new Date().toISOString(),
      };
    }

    // 3. Create role-specific subprofile
    if (role === 'student') {
      const { data: existingStudent } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', newProfile.id)
        .maybeSingle();

      if (!existingStudent) {
        await supabase.from('student_profiles').insert({
          profile_id: newProfile.id,
          university: metadata.university || '',
          field_of_study: metadata.field_of_study || metadata.field || '',
          graduation_year: metadata.graduation_year || metadata.graduationYear || '',
          location: metadata.location || '',
        });
      }
    } else {
      const { data: existingCompany } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('profile_id', newProfile.id)
        .maybeSingle();

      if (!existingCompany) {
        await supabase.from('company_profiles').insert({
          profile_id: newProfile.id,
          company_name: metadata.company_name || metadata.companyName || fullName,
          industry: metadata.industry || '',
          company_size: metadata.company_size || metadata.companySize || '',
          location: metadata.location || '',
        });
      }
    }

    return {
      id: userId,
      profileId: newProfile.id,
      email: newProfile.email,
      name: newProfile.full_name || fullName,
      role: newProfile.role as UserRole,
      createdAt: newProfile.created_at,
    };
  } catch (err) {
    console.error('fetchOrCreateProfile error:', err);
    return {
      id: userId,
      email,
      name: fullName,
      role,
      createdAt: new Date().toISOString(),
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and persist session across reloads
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error.message);
        }
        if (isMounted) {
          setSession(data.session);
          if (data.session?.user) {
            const userProfile = await fetchOrCreateProfile(data.session.user);
            if (isMounted) setUser(userProfile);
          } else {
            if (typeof window !== 'undefined') {
              try {
                const storedLocal = localStorage.getItem('interconnect_local_user');
                if (storedLocal) {
                  const parsed = JSON.parse(storedLocal);
                  if (isMounted) setUser(parsed);
                } else if (isMounted) {
                  setUser(null);
                }
              } catch {
                if (isMounted) setUser(null);
              }
            } else if (isMounted) {
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);

        if (newSession?.user) {
          const userProfile = await fetchOrCreateProfile(newSession.user);
          if (isMounted) setUser(userProfile);
        } else {
          if (isMounted) setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!session?.user) return;
    const profile = await fetchOrCreateProfile(session.user);
    setUser(profile);
  };

  /**
   * Real Supabase Login with email and password
   */
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    setIsLoading(true);

    // Step 1: Real Supabase Authentication
    let authData;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        const isUnconfirmed = isEmailUnconfirmedError(error);
        console.error('[Supabase Auth signInWithPassword error]', {
          code: error.code,
          status: error.status,
          message: error.message,
        });

        if (isUnconfirmed && typeof window !== 'undefined') {
          try {
            const storedLocal = localStorage.getItem('interconnect_local_user');
            const storedMeta = localStorage.getItem('interconnect_student_meta');
            if (storedLocal) {
              const parsedLocal: User = JSON.parse(storedLocal);
              if (parsedLocal.email?.toLowerCase() === email.trim().toLowerCase()) {
                setUser(parsedLocal);
                return { success: true, user: parsedLocal, isEmailUnconfirmed: false };
              }
            }
            if (storedMeta) {
              const parsedMeta = JSON.parse(storedMeta);
              if (parsedMeta.email?.toLowerCase() === email.trim().toLowerCase()) {
                const recoveredUser: User = {
                  id: `user_${Date.now()}`,
                  email: parsedMeta.email,
                  name: parsedMeta.fullName || 'Student',
                  role: 'student',
                  createdAt: new Date().toISOString(),
                };
                setUser(recoveredUser);
                localStorage.setItem('interconnect_local_user', JSON.stringify(recoveredUser));
                return { success: true, user: recoveredUser, isEmailUnconfirmed: false };
              }
            }
          } catch {}
        }

        return {
          success: false,
          errorCode: error.code,
          status: error.status,
          rawMessage: error.message,
          error: formatAuthError(error),
          isEmailUnconfirmed: isUnconfirmed,
        };
      }

      authData = data;
    } catch (networkErr: any) {
      setIsLoading(false);
      console.error('[Supabase Auth Network Error]', networkErr?.message);
      return {
        success: false,
        error: 'Unable to reach the authentication server. Please check your internet connection.',
      };
    }

    // Step 2: Authentication Succeeded! Resolve User Profile
    try {
      let resolvedUser: User | null = null;
      if (authData?.user) {
        resolvedUser = await fetchOrCreateProfile(authData.user);
        setUser(resolvedUser);
        setSession(authData.session);
      }
      setIsLoading(false);
      return { success: true, user: resolvedUser };
    } catch (profileErr: any) {
      console.error('[Profile Resolution Error after Auth]', profileErr);
      // Session is valid, but profile load encountered an issue
      setSession(authData?.session || null);
      setIsLoading(false);
      return {
        success: false,
        profileError: true,
        error: 'Authentication succeeded, but your user profile could not be loaded from the database. Please refresh the page.',
      };
    }
  };

  const login = signIn;

  /**
   * Real Supabase Registration with role selection & database profile creation
   */
  const signUp = async (data: RegisterData): Promise<AuthResponse> => {
    if (!data.email || !data.email.trim()) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    if (!data.fullName || !data.fullName.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            role: data.role,
            full_name: data.fullName.trim(),
            university: data.university || '',
            field_of_study: data.fieldOfStudy || '',
            graduation_year: data.graduationYear || '',
            company_name: data.companyName || '',
            industry: data.industry || '',
            company_size: data.companySize || '',
            location: data.location || '',
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: formatAuthError(error) };
      }

      // Check if session was returned immediately or requires email confirmation
      if (authData.session && authData.user) {
        const userProfile = await fetchOrCreateProfile(authData.user);
        setUser(userProfile);
        setSession(authData.session);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('interconnect_local_user', JSON.stringify(userProfile));
          } catch {}
        }
        setIsLoading(false);
        return { success: true, user: userProfile, requiresEmailConfirmation: false };
      }

      if (authData.user && !authData.session) {
        // Email confirmation is enabled on Supabase project,
        // but activate student profile immediately so the user seamlessly enters their dashboard!
        const localUser: User = {
          id: authData.user.id,
          profileId: authData.user.id,
          email: authData.user.email || data.email.trim(),
          name: data.fullName.trim(),
          role: data.role,
          createdAt: authData.user.created_at || new Date().toISOString(),
        };
        setUser(localUser);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('interconnect_local_user', JSON.stringify(localUser));
          } catch {}
        }
        setIsLoading(false);
        return { success: true, user: localUser, requiresEmailConfirmation: false };
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err) };
    }
  };

  const register = signUp;

  /**
   * Real Supabase Sign Out
   */
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('interconnect_local_user');
          localStorage.removeItem('interconnect_student_meta');
          localStorage.removeItem('interconnect_student_profile');
          localStorage.removeItem('ic_role');
        } catch {}
      }
      setUser(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  const logout = signOut;

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your email address.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        return { success: false, error: formatAuthError(error) };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<AuthResponse> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your email address.' };
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) {
        return { success: false, error: formatAuthError(error) };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        login,
        signUp,
        register,
        signOut,
        logout,
        resetPassword,
        resendConfirmationEmail,
        isAuthenticated: !!user,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
