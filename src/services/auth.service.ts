import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { localDb } from '../lib/supabase/mock-store';

const SESSION_STORAGE_KEY = 'us_barber_session_user';

export const authService = {
  getCurrentSessionUser(): UserProfile | null {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
      const data = localStorage.getItem(SESSION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSessionUser(profile: UserProfile | null) {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      if (profile) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Session storage error:', err);
    }
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as UserProfile;
    }
    const profile = localDb.getProfiles().find((p) => p.id === userId);
    return profile || null;
  },

  async login(email: string, password: string): Promise<{ user: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real Supabase auth if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { user: null as any, error: error.message };
        }

        if (data.user) {
          let profile = await this.getProfile(data.user.id);
          if (!profile) {
            // Profile fallback
            profile = {
              id: data.user.id,
              email: cleanEmail,
              full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              role: (data.user.user_metadata?.role as UserRole) || 'customer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          this.setSessionUser(profile);
          return { user: profile };
        }
      } catch (err: any) {
        console.warn('Supabase login failed, trying local fallback:', err);
      }
    }

    // 2. Database/Local store role check
    const existing = localDb.getProfiles().find((p) => p.email.toLowerCase() === cleanEmail);
    if (!existing) {
      // In local mode: allow password check or create standard customer
      return { user: null as any, error: 'Invalid email or password. Please check your credentials.' };
    }

    // Passwords in local development: standard check (e.g. at least 6 characters)
    if (!password || password.length < 6) {
      return { user: null as any, error: 'Password must be at least 6 characters.' };
    }

    this.setSessionUser(existing);
    return { user: existing };
  },

  async register(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ user: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName || !password) {
      return { user: null as any, error: 'Please fill in all required fields.' };
    }

    if (password.length < 6) {
      return { user: null as any, error: 'Password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: phone?.trim() || '',
              role: 'customer',
            },
          },
        });

        if (error) {
          return { user: null as any, error: error.message };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: cleanName,
            phone: phone?.trim(),
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          localDb.saveProfile(profile);
          this.setSessionUser(profile);
          return { user: profile };
        }
      } catch (err: any) {
        console.warn('Supabase sign up failed:', err);
      }
    }

    // Local DB register
    const existing = localDb.getProfiles().find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { user: null as any, error: 'An account with this email already exists.' };
    }

    const newProfile: UserProfile = {
      id: 'usr-' + Date.now(),
      email: cleanEmail,
      full_name: cleanName,
      phone: phone?.trim(),
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localDb.saveProfile(newProfile);
    this.setSessionUser(newProfile);
    return { user: newProfile };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    this.setSessionUser(null);
  },

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  },

  isAdminSlotAvailable(): boolean {
    const admin = localDb.getSingleAdmin();
    return !admin || !admin.email;
  },

  getAdminSlotInfo(): { available: boolean; emailMasked?: string; fullName?: string } {
    const admin = localDb.getSingleAdmin();
    if (!admin || !admin.email) {
      return { available: true };
    }
    const [name, domain] = admin.email.split('@');
    const masked =
      name.length > 2
        ? `${name[0]}***${name[name.length - 1]}@${domain}`
        : `${name[0]}***@${domain}`;
    return {
      available: false,
      emailMasked: masked,
      fullName: admin.full_name,
    };
  },

  async registerSingleAdmin(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ user: UserProfile; error?: string }> {
    if (!this.isAdminSlotAvailable()) {
      return {
        user: null as any,
        error:
          'The single administrator account slot has already been claimed. Additional admin accounts cannot be created.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName || !password) {
      return { user: null as any, error: 'Please provide full name, email, and password.' };
    }

    if (password.length < 6) {
      return { user: null as any, error: 'Password must be at least 6 characters long.' };
    }

    let supabaseUserId: string | null = null;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: phone?.trim() || '',
              role: 'admin',
            },
          },
        });
        if (data?.user) {
          supabaseUserId = data.user.id;
        }
      } catch (err) {
        console.warn('Supabase admin signup notice:', err);
      }
    }

    const adminProfile: UserProfile = {
      id: supabaseUserId || 'admin-' + Date.now(),
      email: cleanEmail,
      full_name: cleanName,
      phone: phone?.trim() || '+1 (410) 788-5156',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localDb.saveSingleAdmin({
      ...adminProfile,
      password_plain: password,
    });

    this.setSessionUser(adminProfile);
    return { user: adminProfile };
  },

  async loginAdmin(email: string, password: string): Promise<{ user: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const admin = localDb.getSingleAdmin();

    if (!admin || !admin.email) {
      return {
        user: null as any,
        error:
          'No administrator account has been set up yet. Please create the primary administrator account first.',
      };
    }

    if (admin.email.toLowerCase() !== cleanEmail) {
      return {
        user: null as any,
        error: 'Invalid administrator email. Please enter the registered administrator email.',
      };
    }

    // Try Supabase auth first if available
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!error && data?.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: admin.full_name || data.user.user_metadata?.full_name || 'Administrator',
            role: 'admin',
            phone: admin.phone || data.user.user_metadata?.phone,
            created_at: admin.created_at,
            updated_at: new Date().toISOString(),
          };
          this.setSessionUser(profile);
          return { user: profile };
        }
      } catch (err) {
        console.warn('Supabase admin sign-in notice:', err);
      }
    }

    // Check stored password
    if (admin.password_plain && admin.password_plain !== password) {
      return { user: null as any, error: 'Incorrect administrator password.' };
    }

    const profile: UserProfile = {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      phone: admin.phone,
      role: 'admin',
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };

    this.setSessionUser(profile);
    return { user: profile };
  },
};
