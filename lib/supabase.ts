import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = supabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createClient("https://placeholder.supabase.co", "placeholder") as SupabaseClient);

export type DbStudyRecord = {
  id?: string;
  user_id: string;
  heritage_id: number;
  wrong_count: number;
  correct_count: number;
  correct_streak: number;
  last_studied_at: string | null;
  is_weak: boolean;
  is_manual_review: boolean;
  is_learned: boolean;
  created_at?: string;
  updated_at?: string;
};
