// Supabase Configuration - Free Alternative to Firebase
// إعداد Supabase - بديل مجاني لـ Firebase

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Bulgarian configuration for Supabase
export const BULGARIAN_SUPABASE_CONFIG = {
  locale: 'bg-BG',
  currency: 'EUR',
  timezone: 'Europe/Sofia',
  region: 'Bulgaria',
  phonePrefix: '+359',
  defaultLanguage: 'bg' as const,
  supportedLanguages: ['bg', 'en'] as const
};

// Authentication helpers
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign in with Facebook
  signInWithFacebook: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const dbHelpers = {
  // Get cars collection
  getCars: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .range(offset, offset + limit - 1);
    return { data, error };
  },

  // Add new car
  addCar: async (carData: any) => {
    const { data, error } = await supabase
      .from('cars')
      .insert([carData])
      .select();
    return { data, error };
  },

  // Update car
  updateCar: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete car
  deleteCar: async (id: string) => {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Storage helpers
export const storageHelpers = {
  // Upload file
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Download file
  downloadFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket: string, paths: string[]) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    return { error };
  }
};

// Real-time subscriptions
export const realtimeHelpers = {
  // Subscribe to cars changes
  subscribeToCars: (callback: (payload: any) => void) => {
    return supabase
      .channel('cars_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cars' },
        callback
      )
      .subscribe();
  },

  // Subscribe to messages
  subscribeToMessages: (carId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`messages_${carId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `car_id=eq.${carId}`
        },
        callback
      )
      .subscribe();
  }
};

export default supabase;