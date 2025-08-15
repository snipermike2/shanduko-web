import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Running in demo mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Auth helpers
export const getUser = async () => {
  if (!supabase) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const signInWithEmail = async (email: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Storage helpers
export const uploadImage = async (file: File, path: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(path, file);
  
  if (error) throw error;
  return data;
};

export const getImageUrl = (path: string) => {
  if (!supabase) return '';
  
  const { data } = supabase.storage
    .from('reports')
    .getPublicUrl(path);
  
  return data.publicUrl;
};